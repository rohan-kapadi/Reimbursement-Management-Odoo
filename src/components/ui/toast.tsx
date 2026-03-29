"use client"

import { useEffect, useState, useCallback, createContext, useContext } from "react"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const iconMap = {
    success: <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="size-5 text-red-600 shrink-0" />,
    info: <Info className="size-5 text-sky-600 shrink-0" />,
  }

  const borderMap = {
    success: "border-emerald-200 bg-emerald-50/90",
    error: "border-red-200 bg-red-50/90",
    info: "border-sky-200 bg-sky-50/90",
  }

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 min-w-[320px] max-w-[420px] ${
        borderMap[toast.type]
      } ${isExiting ? "opacity-0 translate-x-4" : "animate-slide-up"}`}
    >
      {iconMap[toast.type]}
      <p className="text-sm font-medium text-slate-800 flex-1">{toast.message}</p>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => onDismiss(toast.id), 300)
        }}
        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
