import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ExpenseForm from "@/components/ExpenseForm"
import { supabaseAdmin } from "@/lib/supabase"
import Link from "next/link"
import type { Expense } from "@/types/db"

/* A helper component for Status badge using inline styles */
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

export default async function EmployeeDashboard({ searchParams }: { searchParams: { edit?: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "EMPLOYEE") {
    redirect("/api/auth/signin")
  }

  let baseCurrency = "USD"
  if (session.user.companyId) {
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("base_currency")
      .eq("id", session.user.companyId)
      .single()
    if (company) baseCurrency = company.base_currency
  }

  const { data: expenses } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("submitted_by", session.user.id)
    .order("updated_at", { ascending: false })

  const myExpenses = (expenses || []) as Expense[]
  const targetEdit = searchParams.edit ? myExpenses.find(e => e.id === searchParams.edit) : undefined

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", paddingBottom: 60, fontFamily: "Inter, system-ui, sans-serif" }}>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 40, alignItems: "start" }}>

        {/* ── Left Column: Form ── */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              {targetEdit ? "Fix Rejected Claim" : "Submit Expense"}
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              {targetEdit
                ? "Your manager rejected this claim. Edit the details and resubmit."
                : (
                  <>
                    Upload a receipt and let AI extract the details. All amounts convert to{" "}
                    <strong style={{ color: "#059669" }}>{baseCurrency}</strong>.
                  </>
                )}
            </p>
          </div>

          {targetEdit?.rejection_comment && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
              padding: "16px", marginBottom: 20
            }}>
              <div style={{ fontSize: 20 }}>⚠️</div>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 800, color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rejection Reason</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#b91c1c", lineHeight: 1.5 }}>
                  {targetEdit.rejection_comment}
                </p>
              </div>
            </div>
          )}

          <ExpenseForm baseCurrency={baseCurrency} initialData={targetEdit} />

          {targetEdit && (
            <Link
              href="/dashboard/employee"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 600, color: "#64748b",
                textDecoration: "none", marginTop: 20, transition: "color .15s"
              }}
            >
              ← Cancel editing
            </Link>
          )}
        </div>

        {/* ── Right Column: History ── */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
            My Expenses
            {myExpenses.length > 0 && (
              <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: 12 }}>
                {myExpenses.length} total
              </span>
            )}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {myExpenses.map((exp) => (
              <div key={exp.id} style={{
                background: exp.status === "REJECTED" ? "#fef2f2" : "#fff",
                border: "1px solid", borderColor: exp.status === "REJECTED" ? "#fecaca" : "#e2e8f0",
                borderRadius: 16, padding: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,.03)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "0 0 4px" }}>
                      {exp.merchant}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      {exp.category} • {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <StatusBadge status={exp.status} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid", borderColor: exp.status === "REJECTED" ? "#fee2e2" : "#f1f5f9", paddingTop: 16 }}>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{exp.amount.toFixed(2)}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginLeft: 4 }}>{exp.currency}</span>

                    {exp.currency !== baseCurrency && exp.converted_amount && (
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#059669", marginLeft: 12 }}>
                        ≈ {exp.converted_amount.toFixed(2)} {baseCurrency}
                      </span>
                    )}
                  </div>

                  {exp.status === "REJECTED" && (
                    <Link
                      href={`/dashboard/employee?edit=${exp.id}`}
                      style={{
                        background: "#dc2626", color: "#fff",
                        padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                        textDecoration: "none", display: "inline-block"
                      }}
                    >
                      Edit ✎
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {myExpenses.length === 0 && (
              <div style={{
                border: "2px dashed #e2e8f0", borderRadius: 20, padding: 40,
                textAlign: "center", background: "#f8fafb"
              }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🧾</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#475569", margin: "0 0 6px" }}>No expenses yet</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Use the form to upload your first receipt.</div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
