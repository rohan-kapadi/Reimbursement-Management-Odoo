"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export async function saveApprovalRules(rules: { step: number; role: string }[]) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized restriction. Admin privileges required.")
  }

  // Step 1 is always the company manager. Additional steps can be configured after that.
  const extraRules = rules
    .filter((rule, index) => !(index === 0 && rule.role === "MANAGER"))
    .filter((rule) => rule.role === "MANAGER" || rule.role === "ADMIN")
    .slice(0, 2)

  const validatedRules = [{ step: 1, role: "MANAGER" }, ...extraRules].map((rule, index) => ({
    step: index + 1,
    role: rule.role,
  }))

  const { error } = await supabaseAdmin
    .from("companies")
    .update({ approval_chain: validatedRules })
    .eq("id", session.user.companyId)

  if (error) throw new Error("Database validation failed: " + error.message)
    
  revalidatePath("/dashboard/admin")
}

export async function approveExpense(expenseId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized bounds.")
  }

  const { data: expense, error: expError } = await supabaseAdmin
    .from("expenses")
    .select("*, companies(approval_chain)")
    .eq("id", expenseId)
    .single()

  if (expError || !expense) throw new Error("Entity mapping failed entirely.")
  if (expense.status !== "PENDING") throw new Error("Only PENDING rows validate.")

  // Safely index the active bounds tracking array limits securely
  const chain = expense.companies?.approval_chain || []
  const nextStepRaw = expense.current_approval_step + 1

  // Finality check bounds seamlessly
  const isFinalStep = nextStepRaw > chain.length

  if (isFinalStep) {
    const { error } = await supabaseAdmin
      .from("expenses")
      .update({ status: 'APPROVED' })
      .eq("id", expenseId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabaseAdmin
      .from("expenses")
      .update({ current_approval_step: nextStepRaw })
      .eq("id", expenseId)
    if (error) throw new Error(error.message)
  }

  revalidatePath("/dashboard/manager")
}

export async function rejectExpense(expenseId: string, comment: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized rejection bounds.")
  }

  if (!comment.trim()) throw new Error("Contextual Rejection Comment required physically.")

  const { error } = await supabaseAdmin
    .from("expenses")
    .update({ 
      status: 'REJECTED',
      rejection_comment: comment
    })
    .eq("id", expenseId)

  if (error) throw new Error(error.message)

  revalidatePath("/dashboard/manager")
}
