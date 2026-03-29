"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

type CompanyUserRole = "MANAGER" | "EMPLOYEE"

async function requireAdminCompanyAccess() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN" || !session.user.companyId) {
    throw new Error("Only admins with a company can manage team members.")
  }

  return session
}

async function assertTeamBelongsToCompany(companyId: string, teamId: string) {
  const { data: team, error } = await supabaseAdmin
    .from("teams")
    .select("id")
    .eq("id", teamId)
    .eq("company_id", companyId)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to validate team selection: ${error.message}`)
  }

  if (!team) {
    throw new Error("Please choose a valid company team.")
  }
}

export async function createCompanyUser(input: {
  name: string
  email: string
  password: string
  role: CompanyUserRole
  teamId: string
}) {
  const session = await requireAdminCompanyAccess()
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  const password = input.password
  const role: CompanyUserRole = input.role === "MANAGER" ? "MANAGER" : "EMPLOYEE"
  const teamId = input.teamId.trim()
  const companyId = session.user.companyId

  if (!companyId) {
    throw new Error("Admin company context is missing.")
  }

  if (!name || !email || password.length < 8 || !teamId) {
    throw new Error("Name, email, password, and team are required.")
  }

  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (existingUser) {
    throw new Error("A user with this email already exists.")
  }

  await assertTeamBelongsToCompany(companyId, teamId)

  const hashedPassword = await bcrypt.hash(password, 10)

  const { error } = await supabaseAdmin
    .from("users")
    .insert({
      name,
      email,
      password: hashedPassword,
      role,
      company_id: companyId,
      team_id: teamId,
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/admin")
}

export async function updateCompanyUser(input: {
  userId: string
  name: string
  email: string
  role: CompanyUserRole
  teamId: string
  password?: string
}) {
  const session = await requireAdminCompanyAccess()
  const companyId = session.user.companyId
  const userId = input.userId.trim()
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  const role: CompanyUserRole = input.role === "MANAGER" ? "MANAGER" : "EMPLOYEE"
  const teamId = input.teamId.trim()
  const password = input.password?.trim() || ""

  if (!companyId) {
    throw new Error("Admin company context is missing.")
  }

  if (!userId || !name || !email || !teamId) {
    throw new Error("Name, email, role, and team are required.")
  }

  await assertTeamBelongsToCompany(companyId, teamId)

  const { data: targetUser } = await supabaseAdmin
    .from("users")
    .select("id, company_id, role")
    .eq("id", userId)
    .eq("company_id", companyId)
    .maybeSingle()

  if (!targetUser || targetUser.role === "ADMIN") {
    throw new Error("Only managers and employees in your company can be updated.")
  }

  const { data: duplicateUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .neq("id", userId)
    .maybeSingle()

  if (duplicateUser) {
    throw new Error("A user with this email already exists.")
  }

  const updates: {
    name: string
    email: string
    role: CompanyUserRole
    team_id: string
    password?: string
  } = {
    name,
    email,
    role,
    team_id: teamId,
  }

  if (password) {
    if (password.length < 8) {
      throw new Error("New password must be at least 8 characters.")
    }

    updates.password = await bcrypt.hash(password, 10)
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", userId)
    .eq("company_id", companyId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/admin")
}

export async function deleteCompanyUser(userId: string) {
  const session = await requireAdminCompanyAccess()
  const trimmedUserId = userId.trim()
  const companyId = session.user.companyId

  if (!companyId) {
    throw new Error("Admin company context is missing.")
  }

  if (!trimmedUserId) {
    throw new Error("User id is required.")
  }

  const { data: targetUser } = await supabaseAdmin
    .from("users")
    .select("id, role, company_id")
    .eq("id", trimmedUserId)
    .eq("company_id", companyId)
    .maybeSingle()

  if (!targetUser || targetUser.role === "ADMIN") {
    throw new Error("Only managers and employees in your company can be deleted.")
  }

  const { data: linkedExpense } = await supabaseAdmin
    .from("expenses")
    .select("id")
    .eq("submitted_by", trimmedUserId)
    .limit(1)
    .maybeSingle()

  if (linkedExpense) {
    throw new Error("This user already has submitted expenses, so deletion is blocked. Edit the user instead.")
  }

  const { error } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", trimmedUserId)
    .eq("company_id", companyId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/admin")
}
