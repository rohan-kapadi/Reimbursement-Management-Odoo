"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

type UserInfo = {
  name?: string | null
  email?: string | null
  role: string
  initials: string
}

type NavItem = { label: string; href: string; emoji: string }

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", emoji: "📊" },
    { label: "Approvals", href: "/dashboard/manager", emoji: "✅" },
  ],
  MANAGER: [
    { label: "Approvals", href: "/dashboard/manager", emoji: "✅" },
  ],
  EMPLOYEE: [
    { label: "My Expenses", href: "/dashboard/employee", emoji: "🧾" },
  ],
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  MANAGER: "Approver",
  EMPLOYEE: "Employee",
}

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: UserInfo
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const navItems = NAV_BY_ROLE[user.role] ?? NAV_BY_ROLE.EMPLOYEE
  const sidebarW = collapsed ? 68 : 240

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f8fafb", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarW,
        minWidth: sidebarW,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRight: "1px solid #e2e8f0",
        transition: "width .25s ease",
        overflow: "hidden",
        zIndex: 30,
      }}>

        {/* Brand */}
        <div style={{
          height: 60, display: "flex", alignItems: "center",
          gap: 10, padding: "0 14px",
          borderBottom: "1px solid #f1f5f9",
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#059669,#0d9488)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
            boxShadow: "0 4px 12px rgba(5,150,105,.3)",
          }}>
            💰
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>ReimburseX</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>Odoo × VIT</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: collapsed ? "10px" : "10px 12px",
                  borderRadius: 10,
                  textDecoration: "none",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: active ? "#ecfdf5" : "transparent",
                  color: active ? "#059669" : "#475569",
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  transition: "all .15s",
                  border: active ? "1px solid #a7f3d0" : "1px solid transparent",
                }}
              >
                <span style={{ fontSize: 17, flexShrink: 0 }}>{item.emoji}</span>
                {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
                {active && !collapsed && (
                  <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#059669", flexShrink: 0 }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            margin: "0 8px 8px",
            padding: "8px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "#f8fafb",
            cursor: "pointer",
            fontSize: 16,
            color: "#94a3b8",
            textAlign: "center",
            transition: "all .15s",
            flexShrink: 0,
          }}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "→" : "←"}
        </button>

        {/* User area */}
        <div style={{
          borderTop: "1px solid #f1f5f9",
          padding: 10,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg,#10b981,#0d9488)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 800,
              flexShrink: 0,
            }}>
              {user.initials}
            </div>

            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name || "User"}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{ROLE_LABELS[user.role] || user.role}</div>
              </div>
            )}

            {!collapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  border: "none", background: "transparent",
                  cursor: "pointer", padding: 6, borderRadius: 6,
                  fontSize: 16, flexShrink: 0,
                  color: "#94a3b8",
                }}
                title="Sign out"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <header style={{
          height: 60, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "0 28px",
          background: "rgba(255,255,255,.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          gap: 12,
        }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{user.name || user.email || "User"}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{ROLE_LABELS[user.role]}</div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg,#10b981,#0d9488)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 800,
          }}>
            {user.initials}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              border: "1px solid #e2e8f0", background: "#fff",
              cursor: "pointer", padding: "6px 12px", borderRadius: 8,
              fontSize: 12, fontWeight: 600, color: "#64748b",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            🚪 Sign out
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
