import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  accentColor?: "emerald" | "sky" | "amber" | "red" | "violet"
  className?: string
}

const accentMap = {
  emerald: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    ring: "ring-emerald-100",
  },
  sky: {
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    ring: "ring-sky-100",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    ring: "ring-amber-100",
  },
  red: {
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    ring: "ring-red-100",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    ring: "ring-violet-100",
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "emerald",
  className = "",
}: StatCardProps) {
  const accent = accentMap[accentColor]

  return (
    <div className={`card-elevated p-5 animate-slide-up ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-semibold ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`rounded-xl p-2.5 ring-1 ${accent.iconBg} ${accent.ring}`}>
          <Icon className={`size-5 ${accent.iconColor}`} />
        </div>
      </div>
    </div>
  )
}
