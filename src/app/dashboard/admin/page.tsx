import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import ApprovalRuleBuilder from "@/components/ApprovalRuleBuilder"
import AdminCompanyRoster from "@/components/AdminCompanyRoster"
import AdminTeamCatalog from "@/components/AdminTeamCatalog"
import AdminTeamManager from "@/components/AdminTeamManager"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"
import type { Team, User } from "@/types/db"

/* Inline StatCard component since ShadCN components are dropped in favour of inline style reliability */
function StatCard({ title, value, subtitle, emoji, colorHint }: { title: string, value: string | number, subtitle: string, emoji: string, colorHint: string }) {
  let badgeBg = "#f1f5f9"; let border = "#e2e8f0";
  if (colorHint === "sky") { badgeBg = "#e0f2fe"; border = "#bae6fd" }
  else if (colorHint === "emerald") { badgeBg = "#d1fae5"; border = "#a7f3d0" }
  else if (colorHint === "amber") { badgeBg = "#fef3c7"; border = "#fde68a" }

  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,.03)"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: badgeBg, border: `1px solid ${border}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
        }}>
          {emoji}
        </div>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>{value}</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{subtitle}</p>
      </div>
    </div>
  )
}

// ... db types
type CompanyExpenseSummaryRow = { converted_amount: number; status: string; submitted_by: string }
type RosterUser = User & { teamName?: string | null }

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/api/auth/signin")
  if (session.user.role !== "ADMIN") redirect("/dashboard/employee")

  const { data: company, error } = await supabaseAdmin.from("companies").select("name, country, base_currency, approval_chain").eq("id", session.user.companyId).single()
  if (error) console.error("Failed to load config:", error)

  const { data: companyUsers, error: usersError } = await supabaseAdmin.from("users").select("id, name, email, role, team_id, created_at").eq("company_id", session.user.companyId).order("created_at", { ascending: true })
  if (usersError) console.error("Failed to load users:", usersError)

  const { data: teamsData, error: teamsError } = await supabaseAdmin.from("teams").select("id, company_id, name, created_at, updated_at").eq("company_id", session.user.companyId).order("name", { ascending: true })
  if (teamsError) console.error("Failed to load teams:", teamsError)

  const { data: companyExpenses, error: expensesError } = await supabaseAdmin.from("expenses").select("converted_amount, status, submitted_by").eq("company_id", session.user.companyId)
  if (expensesError) console.error("Failed to load expenses:", expensesError)

  const existingRules = company?.approval_chain || []
  const teams = (teamsData || []) as Team[]
  const teamNameById = new Map(teams.map((t) => [t.id, t.name]))
  const allUsers = (companyUsers || []) as User[]
  
  const roster = allUsers.filter((u) => u.role !== "ADMIN").map((u) => ({
    ...u, teamName: u.team_id ? teamNameById.get(u.team_id) || "Unassigned" : "Unassigned",
  })) as RosterUser[]
  const managerNames = roster.filter((u) => u.role === "MANAGER").map((u) => u.name?.trim() || u.email?.trim() || "Unnamed manager")

  const userTeamByUserId = new Map(roster.map((u) => [u.id, u.teamName || "Unassigned"]))

  const allExpenses = (companyExpenses || []) as CompanyExpenseSummaryRow[]
  const totalExpenseAmount = allExpenses.reduce((sum, e) => sum + e.converted_amount, 0)
  const approvedAmount = allExpenses.filter(e => e.status === "APPROVED").reduce((sum, e) => sum + e.converted_amount, 0)
  const pendingAmount = allExpenses.filter(e => e.status === "PENDING").reduce((sum, e) => sum + e.converted_amount, 0)

  const teamOverviewMap = new Map<string, { team: string; members: number; total: number; approved: number; pending: number; rejected: number }>()

  for (const user of roster) {
    const teamName = user.teamName?.trim() || "Unassigned"
    const current = teamOverviewMap.get(teamName) ?? { team: teamName, members: 0, total: 0, approved: 0, pending: 0, rejected: 0 }
    current.members += 1
    teamOverviewMap.set(teamName, current)
  }

  for (const expense of allExpenses) {
    const teamName = userTeamByUserId.get(expense.submitted_by) || "Unassigned"
    const current = teamOverviewMap.get(teamName) ?? { team: teamName, members: 0, total: 0, approved: 0, pending: 0, rejected: 0 }
    current.total += expense.converted_amount
    if (expense.status === "APPROVED") current.approved += expense.converted_amount
    else if (expense.status === "REJECTED") current.rejected += expense.converted_amount
    else current.pending += expense.converted_amount
    teamOverviewMap.set(teamName, current)
  }

  const teamOverview = [...teamOverviewMap.values()].sort((a, b) => b.total - a.total)
  const currency = company?.base_currency || "USD"

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", gap: 36 }}>
      
      {/* Header */}
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Admin Dashboard</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, display: "flex", alignItems: "center", gap: 6 }}>
              🏢 {company?.name || "Company"}
            </span>
            <span style={{ background: "#f8fafb", border: "1px solid #cbd5e1", color: "#475569", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 999 }}>
              {company?.country || "N/A"} · {currency}
            </span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: "#64748b", maxWidth: 540, lineHeight: 1.6 }}>
          Manage your workspace, organize teams, configure approval workflows, and monitor expense activity.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard title="Total Employees" value={roster.length} subtitle={`${roster.filter(u => u.role === "MANAGER").length} managers`} emoji="👥" colorHint="sky" />
        <StatCard title="Total Submitted" value={`${totalExpenseAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`} subtitle={`${allExpenses.length} claims`} emoji="🧾" colorHint="emerald" />
        <StatCard title="Pending Review" value={`${pendingAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`} subtitle={`${allExpenses.filter(e => e.status === "PENDING").length} claims`} emoji="⏳" colorHint="amber" />
        <StatCard title="Approved" value={`${approvedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`} subtitle={`${allExpenses.filter(e => e.status === "APPROVED").length} claims`} emoji="✅" colorHint="emerald" />
      </div>

      {/* Team Cost Breakdown */}
      {teamOverview.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Team Cost Breakdown</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {teamOverview.map((team) => {
              const maxVal = Math.max(team.approved, team.pending, team.rejected, 1)
              return (
                <div key={team.team} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{team.team}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{team.members} member{team.members !== 1 ? "s" : ""}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                      {team.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8", marginLeft: 4 }}>{currency}</span>
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[{ label: "Approved", val: team.approved, color: "#34d399" }, { label: "Pending", val: team.pending, color: "#fbbf24" }, { label: "Rejected", val: team.rejected, color: "#f87171" }].map(stat => (
                      <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ width: 64, fontSize: 11, color: "#64748b" }}>{stat.label}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                          <div style={{ width: `${(stat.val / maxVal) * 100}%`, height: "100%", background: stat.color, borderRadius: 999 }} />
                        </div>
                        <span style={{ width: 44, textAlign: "right", fontSize: 11, fontWeight: 600, color: "#475569" }}>{stat.val.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Grids */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        
        {/* Roster */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 20 }}>👥</span>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>People in Company</h2>
          </div>
          <AdminCompanyRoster users={roster} teams={teams} />
        </div>

        {/* Teams & Add User */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Teams */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>📁</span>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Team Directory</h2>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: 12, color: "#64748b" }}>Create teams first, then assign people to them.</p>
            <AdminTeamCatalog teams={teams} />
          </div>

          {/* Add User */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>➕</span>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Add Team Member</h2>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: 12, color: "#64748b" }}>Create manager and employee accounts directly.</p>
            <AdminTeamManager teams={teams} />
          </div>
        </div>

      </div>

      {/* Workflow Rule Builder */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,.03)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>🔗</span>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Approval Workflow</h2>
        </div>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#64748b" }}>Configure sequential approval steps. Step 1 is always the matched manager.</p>
        <ApprovalRuleBuilder initialRules={existingRules} managerNames={managerNames} />
      </div>

    </div>
  )
}
