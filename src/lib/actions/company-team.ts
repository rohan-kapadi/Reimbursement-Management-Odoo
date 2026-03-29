"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

async function requireAdminCompanyAccess() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN" || !session.user.companyId) {
    throw new Error("Only admins with a company can manage teams.")
  }

  return session
}

export async function createCompanyTeam(name: string) {
  const session = await requireAdminCompanyAccess()
  const trimmedName = name.trim()
  const companyId = session.user.companyId

  if (!companyId) {
    throw new Error("Admin company context is missing.")
  }

  if (!trimmedName) {
    throw new Error("Team name is required.")
  }

  const { data: existingTeam } = await supabaseAdmin
    .from("teams")
    .select("id")
    .eq("company_id", companyId)
    .ilike("name", trimmedName)
    .maybeSingle()

  if (existingTeam) {
    throw new Error("A team with this name already exists.")
  }

  const { error } = await supabaseAdmin
    .from("teams")
    .insert({
      company_id: companyId,
      name: trimmedName,
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/admin")
}

export async function deleteCompanyTeam(teamId: string) {
  const session = await requireAdminCompanyAccess()
  const trimmedTeamId = teamId.trim()
  const companyId = session.user.companyId

  if (!companyId) {
    throw new Error("Admin company context is missing.")
  }

  if (!trimmedTeamId) {
    throw new Error("Team id is required.")
  }

  const { data: linkedUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("company_id", companyId)
    .eq("team_id", trimmedTeamId)
    .limit(1)
    .maybeSingle()

  if (linkedUser) {
    throw new Error("This team still has users assigned to it. Reassign them before deleting the team.")
  }

  const { error } = await supabaseAdmin
    .from("teams")
    .delete()
    .eq("id", trimmedTeamId)
    .eq("company_id", companyId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/admin")
}
