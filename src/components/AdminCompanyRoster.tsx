"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteCompanyUser, updateCompanyUser } from "@/lib/actions/company-user"
import type { Team, User } from "@/types/db"

type CompanyUserRole = "MANAGER" | "EMPLOYEE"
type RosterUser = User & { teamName?: string | null }
type AdminCompanyRosterProps = { users: RosterUser[], teams: Team[] }

/* Inline RoleBadge */
function RoleBadge({ role }: { role: string }) {
  const isManager = role === "MANAGER"
  return (
    <span style={{
      display: "inline-block", padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
      background: isManager ? "#f0f9ff" : "#f8fafb",
      color: isManager ? "#0284c7" : "#64748b",
      border: `1px solid ${isManager ? "#bae6fd" : "#e2e8f0"}`
    }}>
      {isManager ? "MANAGER" : "EMPLOYEE"}
    </span>
  )
}

export default function AdminCompanyRoster({ users, teams }: AdminCompanyRosterProps) {
  const router = useRouter()
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  
  const [draft, setDraft] = useState({
    userId: "", name: "", email: "", role: "EMPLOYEE" as CompanyUserRole, teamId: teams[0]?.id ?? "", password: "",
  })

  const [focusedField, setFocusedField] = useState<string | null>(null)

  function startEditing(user: RosterUser) {
    setFeedback(null)
    setEditingUserId(user.id)
    setDraft({
      userId: user.id, name: user.name || "", email: user.email || "",
      role: user.role === "MANAGER" ? "MANAGER" : "EMPLOYEE",
      teamId: user.team_id || teams[0]?.id || "", password: "",
    })
  }

  function stopEditing() {
    setEditingUserId(null)
    setDraft({ userId: "", name: "", email: "", role: "EMPLOYEE", teamId: teams[0]?.id ?? "", password: "" })
  }

  function updateDraft(field: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function saveUser() {
    setFeedback(null)
    startTransition(async () => {
      try {
        await updateCompanyUser(draft)
        setFeedback({ type: "success", message: "User updated successfully." })
        stopEditing()
        router.refresh()
      } catch (error: any) {
        setFeedback({ type: "error", message: error?.message ?? "Unable to update this user right now." })
      }
    })
  }

  function removeUser(userId: string) {
    setFeedback(null)
    startTransition(async () => {
      try {
        await deleteCompanyUser(userId)
        setFeedback({ type: "success", message: "User deleted successfully." })
        if (editingUserId === userId) stopEditing()
        router.refresh()
      } catch (error: any) {
        setFeedback({ type: "error", message: error?.message ?? "Unable to delete this user right now." })
      }
    })
  }

  const inputStyle = (id: string) => ({
    width: "100%", height: 32, padding: "0 8px", fontSize: 13,
    border: "1px solid", borderColor: focusedField === id ? "#10b981" : "#e2e8f0",
    borderRadius: 6, outline: "none", boxSizing: "border-box" as const,
    boxShadow: focusedField === id ? "0 0 0 2px rgba(16,185,129,.15)" : "none",
    transition: "all .15s", fontFamily: "inherit"
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: "Inter, system-ui, sans-serif" }}>
      {feedback && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
          background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
          border: "1px solid", borderColor: feedback.type === "success" ? "#a7f3d0" : "#fecaca",
          borderRadius: 10, color: feedback.type === "success" ? "#065f46" : "#991b1b",
          fontSize: 12, fontWeight: 500
        }}>
          <span>{feedback.type === "success" ? "✅" : "⚠️"}</span> {feedback.message}
        </div>
      )}

      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
          <thead style={{ background: "#f8fafb", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              {["Name", "Email", "Role", "Team", "Actions"].map((h, i) => (
                <th key={h} style={{ padding: "12px 16px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11, textAlign: i === 4 ? "right" : "left" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isEditing = editingUserId === user.id
              return (
                <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9", background: isEditing ? "#effdf5" : "#fff" }}>
                  <td style={{ padding: "12px 16px" }}>
                    {isEditing ? (
                      <input value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} onFocus={() => setFocusedField(`name-${user.id}`)} onBlur={() => setFocusedField(null)} style={inputStyle(`name-${user.id}`)} />
                    ) : (
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>{user.name || "Unnamed"}</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>
                    {isEditing ? (
                      <input type="email" value={draft.email} onChange={(e) => updateDraft("email", e.target.value)} onFocus={() => setFocusedField(`email-${user.id}`)} onBlur={() => setFocusedField(null)} style={inputStyle(`email-${user.id}`)} />
                    ) : user.email}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {isEditing ? (
                      <select value={draft.role} onChange={(e) => updateDraft("role", e.target.value as CompanyUserRole)} onFocus={() => setFocusedField(`role-${user.id}`)} onBlur={() => setFocusedField(null)} style={inputStyle(`role-${user.id}`)}>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                    ) : <RoleBadge role={user.role} />}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {isEditing ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <select value={draft.teamId} onChange={(e) => updateDraft("teamId", e.target.value)} onFocus={() => setFocusedField(`team-${user.id}`)} onBlur={() => setFocusedField(null)} style={inputStyle(`team-${user.id}`)}>
                          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <input type="password" value={draft.password} onChange={(e) => updateDraft("password", e.target.value)} onFocus={() => setFocusedField(`pass-${user.id}`)} onBlur={() => setFocusedField(null)} placeholder="New pass (opt)" style={inputStyle(`pass-${user.id}`)} />
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#64748b" }}>{user.teamName || "Unassigned"}</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      {isEditing ? (
                        <>
                          <button onClick={saveUser} disabled={isPending} style={{ padding: "6px 12px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: isPending ? 0.6 : 1 }}>💾 Save</button>
                          <button onClick={stopEditing} disabled={isPending} style={{ padding: "6px 12px", background: "#f8fafb", border: "1px solid #e2e8f0", color: "#475569", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>❌ Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(user)} disabled={isPending || teams.length === 0} style={{ padding: 6, background: "transparent", border: "none", cursor: "pointer", fontSize: 14, opacity: (isPending || teams.length === 0) ? 0.4 : 1 }} title="Edit">✎</button>
                          <button onClick={() => removeUser(user.id)} disabled={isPending} style={{ padding: 6, background: "transparent", border: "none", cursor: "pointer", fontSize: 14, opacity: isPending ? 0.4 : 1 }} title="Delete">🗑️</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>👥</div>
                  No managers or employees added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>Users with submitted expenses cannot be deleted to preserve audit history.</p>
    </div>
  )
}
