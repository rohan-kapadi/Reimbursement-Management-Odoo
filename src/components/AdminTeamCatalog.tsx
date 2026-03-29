"use client"

import { type FormEvent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createCompanyTeam, deleteCompanyTeam } from "@/lib/actions/company-team"
import type { Team } from "@/types/db"

type AdminTeamCatalogProps = { teams: Team[] }

export default function AdminTeamCatalog({ teams }: AdminTeamCatalogProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [focused, setFocused] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    startTransition(async () => {
      try {
        await createCompanyTeam(name)
        setFeedback({ type: "success", message: "Team created." })
        setName("")
        router.refresh()
      } catch (error: any) {
        setFeedback({ type: "error", message: error?.message ?? "Unable to create the team right now." })
      }
    })
  }

  function onDelete(teamId: string) {
    setFeedback(null)
    startTransition(async () => {
      try {
        await deleteCompanyTeam(teamId)
        setFeedback({ type: "success", message: "Team deleted." })
        router.refresh()
      } catch (error: any) {
        setFeedback({ type: "error", message: error?.message ?? "Unable to delete the team right now." })
      }
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: "Inter, system-ui, sans-serif" }}>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="e.g. Engineering"
          required
          style={{
            flex: 1, height: 36, padding: "0 12px", fontSize: 13,
            border: "1px solid", borderColor: focused ? "#10b981" : "#e2e8f0",
            borderRadius: 8, outline: "none",
            boxShadow: focused ? "0 0 0 3px rgba(16,185,129,.15)" : "none",
            transition: "all .15s"
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{
            height: 36, padding: "0 16px", borderRadius: 8, border: "none",
            background: "#059669", color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6,
            opacity: isPending ? 0.7 : 1
          }}
        >
          ➕ {isPending ? "Adding..." : "Add"}
        </button>
      </form>

      {feedback && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
          background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
          border: "1px solid", borderColor: feedback.type === "success" ? "#a7f3d0" : "#fecaca",
          borderRadius: 8, color: feedback.type === "success" ? "#065f46" : "#991b1b",
          fontSize: 12, fontWeight: 500
        }}>
          <span>{feedback.type === "success" ? "✅" : "⚠️"}</span> {feedback.message}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {teams.map((team) => (
          <div key={team.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px",
            boxShadow: "0 1px 2px rgba(0,0,0,.02)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 6, padding: "4px 6px", fontSize: 14 }}>📁</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{team.name}</span>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onDelete(team.id)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                padding: 4, opacity: isPending ? 0.4 : 1, fontSize: 14
              }}
              title="Delete team"
            >
              🗑️
            </button>
          </div>
        ))}
        {teams.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: "32px 16px", border: "1px dashed #cbd5e1", borderRadius: 10,
            background: "#f8fafb"
          }}>
            <div style={{ fontSize: 24 }}>📁</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>No teams yet. Create one above.</div>
          </div>
        )}
      </div>
    </div>
  )
}
