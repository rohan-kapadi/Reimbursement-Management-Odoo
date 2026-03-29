"use client"

import { type FormEvent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
  getCompanyConfigByCountry,
} from "@/lib/company-config"

type PortalMode = "admin" | "employee"
type AdminMode = "login" | "signup"

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  companyName: "",
  country: DEFAULT_COUNTRY,
}

/* ── Shared inline style tokens ── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  padding: "0 14px",
  fontSize: 14,
  color: "#0f172a",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .15s",
  fontFamily: "inherit",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 6,
}

export function AuthPanel() {
  const router = useRouter()
  const [portalMode, setPortalMode] = useState<PortalMode>("admin")
  const [adminMode, setAdminMode] = useState<AdminMode>("login")
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [focusedField, setFocusedField] = useState<string | null>(null)

  function updateField(field: keyof typeof form, value: string) {
    setForm((c) => ({ ...c, [field]: value }))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      if (portalMode === "admin" && adminMode === "signup") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => null) as { error?: string } | null
          setError(data?.error ?? "Registration failed.")
          return
        }
      }

      const loginRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (!loginRes || loginRes.error) {
        setError(loginRes?.error ?? "Login failed.")
        return
      }

      router.push("/dashboard")
      router.refresh()
    })
  }

  const isAdmin = portalMode === "admin"
  const isSignup = isAdmin && adminMode === "signup"
  const selectedCountry = getCompanyConfigByCountry(form.country)

  const fieldStyle = (id: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === id ? "#059669" : "#e2e8f0",
    boxShadow: focusedField === id ? "0 0 0 3px rgba(5,150,105,.12)" : "none",
  })

  return (
    <div style={{ width: "100%", maxWidth: 420, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Card */}
      <div style={{
        background: "#fff",
        border: "1.5px solid #e2e8f0",
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 8px 40px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04)",
      }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 20 }}>
          {/* Secure access pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#ecfdf5", border: "1px solid #a7f3d0",
            borderRadius: 999, padding: "4px 12px",
            fontSize: 10, fontWeight: 700, color: "#065f46",
            textTransform: "uppercase", letterSpacing: "0.15em",
            marginBottom: 14,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 2s infinite" }} />
            Secure Access
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.03em" }}>
            {portalMode === "employee" ? "Employee Login" : isSignup ? "Create Company" : "Admin Login"}
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, margin: 0 }}>
            {portalMode === "employee"
              ? "Sign in with credentials provided by your company admin."
              : isSignup
                ? "Set up your company workspace, country, and base currency."
                : "Sign in to manage your workspace and approval rules."}
          </p>
        </div>

        {/* ── Admin / Employee toggle ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 4, background: "#f1f5f9", borderRadius: 12, padding: 4,
          marginBottom: 14,
        }}>
          {(["admin", "employee"] as PortalMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => { setError(null); setPortalMode(mode) }}
              style={{
                padding: "9px 12px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all .15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: portalMode === mode ? "#fff" : "transparent",
                color: portalMode === mode ? "#0f172a" : "#64748b",
                boxShadow: portalMode === mode ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                fontFamily: "inherit",
              }}
            >
              {mode === "admin" ? "🛡" : "👔"} {mode === "admin" ? "Admin" : "Employee"}
            </button>
          ))}
        </div>

        {/* ── Login / Signup sub-toggle (Admin only) ── */}
        {isAdmin && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 4, background: "#f1f5f9", borderRadius: 12, padding: 4,
            marginBottom: 20,
          }}>
            {(["login", "signup"] as AdminMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => { setError(null); setAdminMode(mode) }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all .15s",
                  background: adminMode === mode ? "#fff" : "transparent",
                  color: adminMode === mode ? "#0f172a" : "#64748b",
                  boxShadow: adminMode === mode ? "0 1px 4px rgba(0,0,0,.1)" : "none",
                  fontFamily: "inherit",
                }}
              >
                {mode === "login" ? "Login" : "Sign up"}
              </button>
            ))}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Signup-only fields */}
          {isSignup && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle} htmlFor="auth-name">Full Name</label>
                  <input
                    id="auth-name"
                    style={fieldStyle("auth-name")}
                    value={form.name}
                    placeholder="Rohan Kapadi"
                    required
                    onFocus={() => setFocusedField("auth-name")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="auth-company">Company</label>
                  <input
                    id="auth-company"
                    style={fieldStyle("auth-company")}
                    value={form.companyName}
                    placeholder="Acme Finance"
                    required
                    onFocus={() => setFocusedField("auth-company")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => updateField("companyName", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="auth-country">Country</label>
                <select
                  id="auth-country"
                  style={{
                    ...fieldStyle("auth-country"),
                    paddingRight: 36,
                    appearance: "none",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: "18px",
                  }}
                  value={form.country}
                  required
                  onFocus={() => setFocusedField("auth-country")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => updateField("country", e.target.value)}
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.label} ({c.currency})</option>
                  ))}
                </select>
                {selectedCountry && (
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>
                    Base currency: <strong style={{ color: "#059669" }}>{selectedCountry.currency}</strong>
                  </p>
                )}
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: 0 }} />
            </>
          )}

          {/* Email */}
          <div>
            <label style={labelStyle} htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              style={fieldStyle("auth-email")}
              value={form.email}
              placeholder="you@example.com"
              required
              onFocus={() => setFocusedField("auth-email")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          {/* Password row */}
          <div style={{ display: isSignup ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle} htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                style={fieldStyle("auth-password")}
                value={form.password}
                placeholder="Min. 8 characters"
                required
                onFocus={() => setFocusedField("auth-password")}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => updateField("password", e.target.value)}
              />
            </div>
            {isSignup && (
              <div>
                <label style={labelStyle} htmlFor="auth-confirm">Confirm</label>
                <input
                  id="auth-confirm"
                  type="password"
                  style={fieldStyle("auth-confirm")}
                  value={form.confirmPassword}
                  placeholder="Repeat password"
                  required
                  onFocus={() => setFocusedField("auth-confirm")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Employee note */}
          {portalMode === "employee" && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: 10, padding: "10px 14px",
              fontSize: 12, color: "#92400e", lineHeight: 1.6,
            }}>
              <span style={{ fontSize: 14, marginTop: 1 }}>⚠️</span>
              Employee accounts are provisioned by your company admin. Contact them if you don&apos;t have credentials.
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 10, padding: "10px 14px",
              fontSize: 12, color: "#991b1b", lineHeight: 1.6,
            }}>
              <span style={{ fontSize: 14, marginTop: 1 }}>❌</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              height: 46,
              borderRadius: 12,
              border: "none",
              background: isPending ? "#94a3b8" : "linear-gradient(135deg,#059669,#0d9488)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              boxShadow: isPending ? "none" : "0 6px 20px rgba(5,150,105,.35)",
              transition: "all .15s",
              fontFamily: "inherit",
              letterSpacing: "-0.01em",
            }}
          >
            {isPending
              ? "⏳ Please wait..."
              : portalMode === "employee"
                ? "Sign in →"
                : isSignup
                  ? "Create workspace →"
                  : "Sign in →"}
          </button>
        </form>

        {/* Footer footnote */}
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 16, marginBottom: 0 }}>
          By continuing you agree to our{" "}
          <span style={{ color: "#059669", cursor: "pointer" }}>Terms of Service</span>
        </p>
      </div>
    </div>
  )
}
