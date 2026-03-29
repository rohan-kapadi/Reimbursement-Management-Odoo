"use client"

import { useState, useTransition } from "react"
import { saveApprovalRules } from "@/lib/actions/approval"

type ApprovalRule = { step: number; role: "MANAGER" | "ADMIN" }
type ApprovalRuleBuilderProps = { initialRules?: ApprovalRule[]; managerNames?: string[] }

function normalizeRules(initialRules: ApprovalRule[]) {
  if (initialRules.length === 0) return [{ step: 1, role: "MANAGER" as const }]
  const filtered = initialRules.filter((r) => r.role === "MANAGER" || r.role === "ADMIN").slice(0, 3)
  if (filtered[0]?.role !== "MANAGER") {
    return [{ step: 1, role: "MANAGER" as const }, ...filtered.slice(0, 2)].map((rule, idx) => ({ ...rule, step: idx + 1 }))
  }
  return filtered.map((rule, index) => ({ ...rule, step: index + 1 }))
}

export default function ApprovalRuleBuilder({ initialRules = [], managerNames = [] }: ApprovalRuleBuilderProps) {
  const [rules, setRules] = useState<ApprovalRule[]>(normalizeRules(initialRules))
  const [isPending, startTransition] = useTransition()
  const [focusedId, setFocusedId] = useState<number | null>(null)

  const managerLabel = managerNames.length === 0
    ? "No manager added yet" : managerNames.length === 1
    ? managerNames[0] : `${managerNames[0]} + ${managerNames.length - 1} more`

  function addStep() { if (rules.length < 3) setRules([...rules, { step: rules.length + 1, role: "ADMIN" }]) }
  function removeStep(index: number) {
    if (index > 0) setRules(rules.filter((_, i) => i !== index).map((r, i) => ({ ...r, step: i + 1 })))
  }
  function updateRole(index: number, role: ApprovalRule["role"]) {
    if (index > 0) { const req = [...rules]; req[index].role = role; setRules(req) }
  }
  function handleSave() {
    startTransition(async () => {
      try { await saveApprovalRules(rules); alert("✅ Rules saved!") } catch (err: any) { alert("❌ " + err.message) }
    })
  }

  const stepColors = {
    MANAGER: { bg: "#ecfdf5", border: "#a7f3d0", icon: "#d1fae5", text: "#059669", line: "#6ee7b7" },
    ADMIN: { bg: "#f5f3ff", border: "#ddd6fe", icon: "#ede9fe", text: "#7c3aed", line: "#a78bfa" },
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rules.map((rule, idx) => {
          const colors = stepColors[rule.role]
          const isLast = idx === rules.length - 1

          return (
            <div key={idx} style={{ position: "relative" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                background: colors.bg, border: `1px solid ${colors.border}`,
                borderRadius: 16, padding: "16px 20px", transition: "all .2s"
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", background: colors.icon,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, color: colors.text, fontSize: 15
                  }}>{rule.step}</div>
                </div>

                <div style={{ flex: 1 }}>
                  {idx === 0 ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>👔</span>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#065f46" }}>Company Manager</p>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#059669" }}>{managerLabel}</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                        <span style={{ fontSize: 16 }}>{rule.role === "ADMIN" ? "🛡️" : "👔"}</span>
                        <select
                          value={rule.role} onChange={(e) => updateRole(idx, e.target.value as ApprovalRule["role"])}
                          onFocus={() => setFocusedId(idx)} onBlur={() => setFocusedId(null)}
                          style={{
                            height: 34, borderRadius: 8, border: "1px solid",
                            borderColor: focusedId === idx ? "#10b981" : "#e2e8f0",
                            background: "#fff", padding: "0 12px", fontSize: 13, fontWeight: 600,
                            outline: "none", boxShadow: focusedId === idx ? "0 0 0 3px rgba(16,185,129,.15)" : "none", transition: "all .15s"
                          }}
                        >
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                      <button onClick={() => removeStep(idx)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, padding: 4 }} title="Remove">❌</button>
                    </div>
                  )}
                </div>
              </div>

              {!isLast && (
                <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                  <div style={{ width: 3, height: 20, background: colors.line, borderRadius: 999 }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <button
          onClick={addStep} disabled={rules.length >= 3 || isPending}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#fff", border: "1.5px dashed #cbd5e1", borderRadius: 10,
            padding: "8px 16px", fontSize: 12, fontWeight: 600, color: "#475569",
            cursor: rules.length >= 3 || isPending ? "not-allowed" : "pointer",
            opacity: rules.length >= 3 ? 0.5 : 1
          }}
        >
          ➕ Add Step
        </button>
        <button
          onClick={handleSave} disabled={isPending}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#059669", border: "none", borderRadius: 10,
            padding: "10px 20px", fontSize: 13, fontWeight: 700, color: "#fff",
            cursor: isPending ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(5,150,105,.3)",
            opacity: isPending ? 0.7 : 1
          }}
        >
          💾 {isPending ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      {rules.length >= 3 && <p style={{ margin: 0, fontSize: 11, color: "#b45309", fontWeight: 600 }}>⚠️ Max 3 steps reached.</p>}
      {managerNames.length === 0 && <p style={{ margin: 0, fontSize: 11, color: "#b45309", fontWeight: 600 }}>⚠️ Add a manager to roster to activate.</p>}
    </div>
  )
}
