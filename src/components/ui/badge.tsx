import { type ReactNode } from "react"

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple"

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
  purple: "bg-violet-50 text-violet-700 border-violet-200",
}

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

export function Badge({ children, variant = "default", className = "", dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${variantClasses[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`size-1.5 rounded-full ${
            variant === "success" ? "bg-emerald-500" :
            variant === "warning" ? "bg-amber-500" :
            variant === "danger" ? "bg-red-500" :
            variant === "info" ? "bg-sky-500" :
            variant === "purple" ? "bg-violet-500" :
            "bg-slate-500"
          }`}
        />
      )}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    APPROVED: { variant: "success", label: "Approved" },
    PENDING: { variant: "warning", label: "Pending" },
    REJECTED: { variant: "danger", label: "Rejected" },
  }

  const conf = map[status] ?? { variant: "default" as BadgeVariant, label: status }

  return <Badge variant={conf.variant} dot>{conf.label}</Badge>
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    ADMIN: { variant: "info", label: "Admin" },
    MANAGER: { variant: "purple", label: "Manager" },
    EMPLOYEE: { variant: "default", label: "Employee" },
  }

  const conf = map[role] ?? { variant: "default" as BadgeVariant, label: role }

  return <Badge variant={conf.variant}>{conf.label}</Badge>
}
