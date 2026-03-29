"use client"
import { useState, useTransition } from "react"
import { approveExpense, rejectExpense } from "@/lib/actions/approval"

export default function ExpenseActionCell({ expenseId }: { expenseId: string }) {
  const [isPending, startTransition] = useTransition()
  const [rejecting, setRejecting] = useState(false)
  const [comment, setComment] = useState("")
  const [focused, setFocused] = useState(false)

  function handleApprove() {
    startTransition(async () => {
      try {
        await approveExpense(expenseId)
      } catch (err: any) { alert(err.message) }
    })
  }

  function handleReject() {
    if (!comment.trim()) { alert("Rejection reason is required."); return }
    startTransition(async () => {
      try {
        await rejectExpense(expenseId, comment)
        setRejecting(false)
      } catch (err: any) { alert(err.message) }
    })
  }

  if (rejecting) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 260 }}>
        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Reason for rejection..."
          disabled={isPending}
          autoFocus
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, height: 32, padding: "0 10px", borderRadius: 8,
            border: "1px solid", borderColor: focused ? "#ef4444" : "#e2e8f0",
            background: "#fff", fontSize: 13, outline: "none",
            boxShadow: focused ? "0 0 0 3px rgba(239,68,68,.15)" : "none",
            transition: "all .15s"
          }}
        />
        <button
          onClick={handleReject}
          disabled={isPending}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#dc2626", color: "#fff", border: "none", borderRadius: 8,
            padding: "0 12px", height: 32, fontSize: 13, fontWeight: 700,
            cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.6 : 1
          }}
        >
          {isPending ? "⏳" : "📤 Send"}
        </button>
        <button
          onClick={() => setRejecting(false)}
          disabled={isPending}
          style={{
            background: "transparent", border: "none", borderRadius: 8,
            padding: "0 6px", height: 32, fontSize: 14,
            cursor: isPending ? "not-allowed" : "pointer"
          }}
          title="Cancel"
        >
          ❌
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={handleApprove}
        disabled={isPending}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "#059669", color: "#fff", border: "none", borderRadius: 8,
          padding: "6px 14px", fontSize: 13, fontWeight: 700,
          cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.6 : 1,
          boxShadow: "0 2px 8px rgba(5,150,105,.25)"
        }}
      >
        {isPending ? "⏳" : "✅ Approve"}
      </button>
      <button
        onClick={() => setRejecting(true)}
        disabled={isPending}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 8,
          padding: "6px 14px", fontSize: 13, fontWeight: 600,
          cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.6 : 1
        }}
      >
        ❌ Reject
      </button>
    </div>
  )
}
