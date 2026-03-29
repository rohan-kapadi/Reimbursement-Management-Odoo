import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getCompanyConfigByCountry } from "@/lib/company-config"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : ""
    const companyName = typeof body.companyName === "string" ? body.companyName.trim() : ""
    const country = typeof body.country === "string" ? body.country.trim().toUpperCase() : ""

    if (!name || !email || !companyName || password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Name, email, company name, and a password with at least 8 characters are required.",
        },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password and confirm password must match." },
        { status: 400 }
      )
    }

    const companyConfig = getCompanyConfigByCountry(country)

    if (!companyConfig) {
      return NextResponse.json(
        { error: "Please choose a supported country." },
        { status: 400 }
      )
    }

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      )
    }

    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name: companyName,
        country: companyConfig.code,
        base_currency: companyConfig.currency,
      })
      .select("id, name, country, base_currency")
      .single()

    if (companyError || !company) {
      throw companyError || new Error("Failed to create company")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        company_id: company.id,
      })
      .select("id, email, name, role, company_id")
      .single()

    if (error || !user) {
      throw error || new Error("Failed to create user")
    }

    return NextResponse.json({ user, company }, { status: 201 })
  } catch (error: any) {
    console.error("Register Error:", error)
    return NextResponse.json(
      { error: "Unable to create account.", details: error.message },
      { status: 500 }
    )
  }
}
