"use client"

import { type FormEvent, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createCompanyUser } from "@/lib/actions/company-user"
import type { Team } from "@/types/db"

type CompanyUserRole = "MANAGER" | "EMPLOYEE"
type AdminTeamManagerProps = { teams: Team[] }

function getInitialTeamId(teams: Team[]) {
  return teams[0]?.id ?? ""
}

export default function AdminTeamManager({ teams }: AdminTeamManagerProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "EMPLOYEE" as CompanyUserRole, teamId: getInitialTeamId(teams),
  })
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    if (teams.length === 0) return
    const hasSelectedTeam = teams.some((team) => team.id === form.teamId)
    if (!hasSelectedTeam) {
      setForm((current) => ({ ...current, teamId: getInitialTeamId(teams) }))
    }
  }, [form.teamId, teams])

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    startTransition(async () => {
      try {
        await createCompanyUser(form)
        setFeedback({ type: "success", message: `${form.role === "MANAGER" ? "Manager" : "Employee"} added successfully.` })
        setForm({ name: "", email: "", password: "", role: "EMPLOYEE", teamId: getInitialTeamId(teams) })
        router.refresh()
      } catch (error: any) {
        setFeedback({ type: "error", message: error?.message ?? "Unable to add the team member right now." })
      }
    })
  }

  if (teams.length === 0) {
    return (
      <div style={{ background: "#fffbeb", border: "1px dashed #fde68a", color: "#b45309", padding: "12px 16px", borderRadius: 12, fontSize: 13, display: "flex", gap: 10 }}>
        <span>⚠️</span> Create at least one team first, then you can add managers and employees.
      </div>
    )
  }

  const inputStyle = (id: string) => ({
    width: "100%", height: 36, padding: "0 12px", fontSize: 13,
    border: "1px solid", borderColor: focusedField === id ? "#10b981" : "#e2e8f0",
    borderRadius: 8, outline: "none", boxSizing: "border-box" as const,
    boxShadow: focusedField === id ? "0 0 0 3px rgba(16,185,129,.15)" : "none",
    transition: "all .15s", fontFamily: "inherit"
  })

  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 12px" }}>
        
        <div>
          <label style={labelStyle}>Name</label>
          <input
            value={form.name} onChange={(e) => updateField("name", e.target.value)}
            onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)}
            placeholder="Ananya Sharma" required style={inputStyle("name")}
          />
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)}
            onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
            placeholder="ananya@company.com" required style={inputStyle("email")}
          />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <input
            type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)}
            onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
            placeholder="Min. 8 characters" required style={inputStyle("password")}
          />
        </div>

        <div>
          <label style={labelStyle}>Role</label>
          <select
            value={form.role} onChange={(e) => updateField("role", e.target.value as CompanyUserRole)}
            onFocus={() => setFocusedField("role")} onBlur={() => setFocusedField(null)}
            style={inputStyle("role")}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
          </select>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Team</label>
          <select
            value={form.teamId} onChange={(e) => updateField("teamId", e.target.value)}
            onFocus={() => setFocusedField("team")} onBlur={() => setFocusedField(null)}
            required style={inputStyle("team")}
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

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

      <button
        type="submit" disabled={isPending}
        style={{
          width: "100%", height: 38, borderRadius: 8, border: "none",
          background: "#059669", color: "#fff", fontSize: 13, fontWeight: 600,
          cursor: isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: isPending ? 0.7 : 1, transition: "background .2s"
        }}
      >
        👤 {isPending ? "Adding..." : `Add ${form.role === "MANAGER" ? "manager" : "employee"}`}
      </button>
    </form>
  )
}
