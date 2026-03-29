"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export async function submitExpense(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !session.user.companyId || session.user.role !== "EMPLOYEE") {
    throw new Error("Unauthorized access. Must be logged in as an employee.")
  }

  const amount = parseFloat(formData.get("amount") as string)
  const currency = formData.get("currency") as string
  const merchant = formData.get("merchant") as string
  const category = formData.get("category") as string
  const dateStr = formData.get("date") as string
  const description = formData.get("description") as string
  const receiptFile = formData.get("receiptFile") as File | null

  if (!amount || !currency || !merchant || !category || !dateStr || !description) {
    throw new Error("Missing required expense fields.")
  }

  // Fetch Base Currency of Company
  const { data: company, error: companyError } = await supabaseAdmin
    .from("companies")
    .select("base_currency")
    .eq("id", session.user.companyId)
    .single()
  
  if (companyError || !company) {
    throw new Error("Company not found.")
  }

  let convertedAmount = amount
  if (currency !== company.base_currency) {
    try {
      const resp = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`)
      const data = await resp.json()
      if (data && data.rates && data.rates[company.base_currency]) {
        convertedAmount = parseFloat((amount * data.rates[company.base_currency]).toFixed(2))
      } else {
        throw new Error("Currency conversion rate unavailable")
      }
    } catch(err) {
      throw new Error(`Failed to fetch exchange rates. ${(err as Error).message}`)
    }
  }

  let receiptUrl = null
  if (receiptFile && receiptFile.size > 0) {
    const fileExt = receiptFile.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    
    const arrayBuffer = await receiptFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Using supabaseAdmin to upload since RLS might block if signed in via NextAuth but not Supabase Auth
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from("receipts")
      .upload(fileName, buffer, {
        contentType: receiptFile.type,
      })

    if (uploadError) {
      throw new Error(`Failed to upload receipt: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from("receipts").getPublicUrl(fileName)
    receiptUrl = publicUrlData.publicUrl
  }

  const expenseIdToEdit = formData.get("expenseId") as string | null

  if (expenseIdToEdit) {
    const updatePayload: any = {
      amount,
      currency,
      converted_amount: convertedAmount,
      merchant,
      category,
      date: new Date(dateStr).toISOString().split('T')[0],
      description,
      status: "PENDING",
      current_approval_step: 0,
      rejection_comment: null, 
      updated_at: new Date().toISOString()
    }
    if (receiptUrl) updatePayload.receipt_url = receiptUrl

    const { error: updateError } = await supabaseAdmin.from("expenses")
      .update(updatePayload)
      .eq("id", expenseIdToEdit)
      .eq("submitted_by", session.user.id)
    if (updateError) throw new Error(`Update failed: ${updateError.message}`)

    return { success: true, expenseId: expenseIdToEdit }
  } else {
    const { data: expense, error: expenseError } = await supabaseAdmin.from("expenses").insert({
      amount,
      currency,
      converted_amount: convertedAmount,
      merchant,
      category,
      date: new Date(dateStr).toISOString().split('T')[0],
      description,
      receipt_url: receiptUrl,
      status: "PENDING",
      submitted_by: session.user.id,
      company_id: session.user.companyId
    }).select("id").single()
  
    if (expenseError || !expense) throw new Error(`Insert failed: ${expenseError?.message}`)
    return { success: true, expenseId: expense.id }
  }
}
