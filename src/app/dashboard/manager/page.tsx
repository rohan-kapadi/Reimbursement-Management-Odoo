import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase"
import ExpenseActionCell from "@/components/ExpenseActionCell"

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

function StatusBadge({ status }: { status: string }) {
  let bg = "#f1f5f9"
  let color = "#475569"
  let label = "Unknown"

  if (status === "PENDING") { bg = "#fffbeb"; color = "#b45309"; label = "Pending" }
  else if (status === "APPROVED") { bg = "#ecfdf5"; color = "#059669"; label = "Approved" }
  else if (status === "REJECTED") { bg = "#fef2f2"; color = "#dc2626"; label = "Rejected" }

  return (
    <span style={{
      display: "inline-block", background: bg, color: color,
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
      letterSpacing: "0.05em", textTransform: "uppercase"
    }}>
      {label}
    </span>
  )
}

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    redirect("/api/auth/signin")
  }

  // Fetch pending expenses
  const { data: expenses } = await supabaseAdmin
    .from("expenses")
    .select(`*, users!inner(name, email), companies(approval_chain)`)
    .eq("status", "PENDING")
    .eq("company_id", session.user.companyId)
    .order("submitted_at", { ascending: false })

  const pendingExpenses = expenses?.filter(exp => {
    const chain = exp.companies?.approval_chain || []
    if (chain.length === 0 && session.user.role === "ADMIN") return true
    return chain[exp.current_approval_step]?.role === session.user.role
  }) || []

  const totalPendingAmount = pendingExpenses.reduce((sum: number, e: any) => sum + (e.converted_amount || e.amount), 0)

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", gap: 36 }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          {session.user.role === "ADMIN" ? "Admin Approvals" : "Manager Dashboard"}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#64748b", maxWidth: 540, lineHeight: 1.6 }}>
          Review and action expenses in your current approval queue.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard title="Pending Claims" value={pendingExpenses.length} subtitle="Awaiting your review" emoji="📋" colorHint="amber" />
        <StatCard title="Total Pending" value={totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} subtitle="Combined claim value" emoji="💵" colorHint="emerald" />
        <StatCard title="Queue Status" value={pendingExpenses.length === 0 ? "Clear" : "Active"} subtitle={pendingExpenses.length === 0 ? "No items need attention" : `${pendingExpenses.length} item${pendingExpenses.length > 1 ? "s" : ""} to review`} emoji="⏳" colorHint={pendingExpenses.length === 0 ? "emerald" : "amber"} />
      </div>

      {/* Expenses Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, boxShadow: "0 2px 12px rgba(0,0,0,.03)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ minWidth: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead style={{ background: "#f8fafb", borderBottom: "1px solid #e2e8f0" }}>
              <tr>
                {["Employee", "Amount", "Details", "Date", "Status", "Action"].map((h, i) => (
                  <th key={h} style={{ padding: "14px 24px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11, textAlign: i === 5 ? "right" : "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingExpenses.map((exp: any) => (
                <tr key={exp.id} style={{ borderBottom: "1px solid #f1f5f9", background: "#fff", transition: "background .2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafb" }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fff" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg,#34d399,#14b8a6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>
                        {(exp.users?.name || exp.users?.email || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{exp.users?.name || "Unknown"}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{exp.users?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 800, color: "#0f172a", fontSize: 14 }}>{exp.amount.toFixed(2)} <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>{exp.currency}</span></p>
                    {exp.converted_amount && exp.currency !== exp.companies?.base_currency && (
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#059669" }}>≈ {exp.converted_amount.toFixed(2)}</p>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 500, color: "#334155", fontSize: 13 }}>{exp.merchant}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{exp.category}</p>
                  </td>
                  <td style={{ padding: "16px 24px", color: "#64748b", fontSize: 12 }}>
                    {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <StatusBadge status={exp.status} />
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <ExpenseActionCell expenseId={exp.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {pendingExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "64px 24px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px 16px", borderRadius: 16, fontSize: 32 }}>
                        📥
                      </div>
                      <div>
                        <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>All caught up!</p>
                        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>No pending approvals in your queue.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
