import { AuthPanel } from "@/components/AuthPanel"

const FEATURES = [
  {
    emoji: "🧾",
    grad: "linear-gradient(135deg,#10b981,#0d9488)",
    glow: "rgba(16,185,129,.2)",
    title: "AI Receipt Scanning",
    desc: "Claude Vision reads your receipt photo — merchant, amount, date, and category auto-fill instantly.",
    tag: "Claude Vision OCR",
    tagBg: "#ecfdf5",
    tagColor: "#065f46",
  },
  {
    emoji: "💱",
    grad: "linear-gradient(135deg,#0ea5e9,#0284c7)",
    glow: "rgba(14,165,233,.2)",
    title: "Live Multi-Currency",
    desc: "Submit in any of 150+ currencies. Real-time exchange rates convert to your company base currency.",
    tag: "150+ currencies",
    tagBg: "#eff6ff",
    tagColor: "#1e40af",
  },
  {
    emoji: "✅",
    grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    glow: "rgba(139,92,246,.2)",
    title: "Smart Approval Chains",
    desc: "Admins configure up to 3 sequential steps. Each approver acts only when previous steps are done.",
    tag: "Up to 3 steps",
    tagBg: "#f5f3ff",
    tagColor: "#5b21b6",
  },
  {
    emoji: "🏢",
    grad: "linear-gradient(135deg,#f59e0b,#d97706)",
    glow: "rgba(245,158,11,.2)",
    title: "Company Workspace",
    desc: "One admin sets base currency, invites managers and employees, and controls the full workspace.",
    tag: "RBAC driven",
    tagBg: "#fffbeb",
    tagColor: "#92400e",
  },
  {
    emoji: "🔒",
    grad: "linear-gradient(135deg,#ef4444,#dc2626)",
    glow: "rgba(239,68,68,.2)",
    title: "Role-Based Access",
    desc: "JWT sessions. Employees see their claims, managers see their queue, admins see everything.",
    tag: "JWT secured",
    tagBg: "#fef2f2",
    tagColor: "#991b1b",
  },
  {
    emoji: "📋",
    grad: "linear-gradient(135deg,#06b6d4,#0891b2)",
    glow: "rgba(6,182,212,.2)",
    title: "Full Audit Trail",
    desc: "Every action is logged. Approved, rejected, resubmitted — complete reimbursement history forever.",
    tag: "100% traceable",
    tagBg: "#ecfeff",
    tagColor: "#164e63",
  },
]

const STEPS = [
  { n: "1", color: "#7c3aed", bg: "linear-gradient(135deg,#8b5cf6,#7c3aed)", who: "Admin", title: "Create your workspace", body: "Sign up as Admin, name your company, choose country & base currency, then configure your approval chain." },
  { n: "2", color: "#059669", bg: "linear-gradient(135deg,#10b981,#059669)", who: "Employee", title: "Upload a receipt", body: "Take a photo, AI extracts all details. Select currency, confirm the auto-filled fields, and hit Submit." },
  { n: "3", color: "#0284c7", bg: "linear-gradient(135deg,#0ea5e9,#0284c7)", who: "Manager", title: "Approve or reject", body: "Your pending queue shows up instantly. One click to approve — or type a reason to send it back." },
  { n: "4", color: "#059669", bg: "linear-gradient(135deg,#10b981,#059669)", who: "Employee", title: "Get reimbursed", body: "Approved claims are recorded with converted amounts. Rejected ones return with comments to fix and resubmit." },
]

const ROLES = [
  {
    icon: "🛡️",
    label: "Admin",
    grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    glow: "rgba(124,58,237,.25)",
    perks: ["Creates company workspace", "Sets base currency & country", "Configures approval chains", "Manages teams & accounts"],
  },
  {
    icon: "👔",
    label: "Manager",
    grad: "linear-gradient(135deg,#0ea5e9,#0284c7)",
    glow: "rgba(2,132,199,.25)",
    perks: ["Reviews pending claims", "Acts at their specific step", "Approves with one click", "Rejects with mandatory comments"],
  },
  {
    icon: "🧑‍💼",
    label: "Employee",
    grad: "linear-gradient(135deg,#10b981,#059669)",
    glow: "rgba(5,150,105,.25)",
    perks: ["Uploads receipt photos", "AI fills all form fields", "Tracks status in real time", "Edits & resubmits rejections"],
  },
]

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafb", fontFamily: "Inter, system-ui, sans-serif", color: "#0f172a" }}>

      {/* ━━━━━━━━━━━━ STICKY NAV ━━━━━━━━━━━━ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(226,232,240,.8)",
        padding: "0 2rem",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "linear-gradient(135deg,#059669,#0d9488)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(5,150,105,.35)", fontSize: 18,
            }}>
              💰
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>ReimburseX</span>
            <span style={{ background: "#ecfdf5", color: "#065f46", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, border: "1px solid #a7f3d0", textTransform: "uppercase", letterSpacing: "0.1em" }}>Beta</span>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 28, fontSize: 14, fontWeight: 500, color: "#64748b" }}>
            <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>Features</a>
            <a href="#how-it-works" style={{ color: "inherit", textDecoration: "none" }}>How it works</a>
            <a href="#roles" style={{ color: "inherit", textDecoration: "none" }}>Roles</a>
          </div>

          <a href="#auth" style={{
            background: "linear-gradient(135deg,#059669,#0d9488)",
            color: "#fff", fontWeight: 700, fontSize: 14,
            padding: "10px 22px", borderRadius: 12,
            boxShadow: "0 4px 14px rgba(5,150,105,.3)",
            textDecoration: "none",
          }}>
            Get started →
          </a>
        </div>
      </nav>

      {/* ━━━━━━━━━━━━ HERO ━━━━━━━━━━━━ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* Background radial blobs */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <div style={{ position: "absolute", top: -100, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,.15) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", top: "30%", left: -150, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,.1) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: 0, right: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,.08) 0%, transparent 70%)" }} />
          {/* Dot grid */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "80px 2rem 80px", display: "grid", gridTemplateColumns: "1fr 420px", gap: 64, alignItems: "start" }}>

          {/* Left copy */}
          <div>
            {/* Eyebrow pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#065f46", letterSpacing: "0.05em", marginBottom: 28, textTransform: "uppercase" }}>
              ✨ Odoo × VIT Hackathon 2026
            </div>

            {/* Big headline */}
            <h1 style={{ fontSize: "clamp(2.6rem, 5vw, 3.8rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", color: "#0f172a", margin: "0 0 24px" }}>
              Expense claims,{" "}
              <br />
              <span style={{ background: "linear-gradient(135deg,#059669 0%,#0ea5e9 55%,#8b5cf6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "inline-block", paddingBottom: "4px" }}>
                reimagined.
              </span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.8, color: "#64748b", maxWidth: 500, margin: "0 0 36px" }}>
              AI reads your receipts. Live rates convert your currency. A
              configurable multi-step approval chain handles sign-off —
              automatically.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 36 }}>
              <a href="#auth" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg,#059669,#0d9488)",
                color: "#fff", fontWeight: 700, fontSize: 15,
                padding: "14px 28px", borderRadius: 14, textDecoration: "none",
                boxShadow: "0 8px 28px rgba(5,150,105,.4)",
              }}>
                ✦ Start for free
              </a>
              <a href="#how-it-works" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#fff", color: "#475569", fontWeight: 600, fontSize: 15,
                padding: "14px 28px", borderRadius: 14, textDecoration: "none",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,.05)",
              }}>
                See how it works →
              </a>
            </div>

            {/* Trust signals */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px", fontSize: 13, color: "#64748b", fontWeight: 500 }}>
              {["✅ No credit card required", "🔒 Role-based access control", "⚡ Setup in 5 minutes", "🤖 Claude Vision OCR"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>

            {/* Workflow pill trail */}
            <div style={{ marginTop: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#94a3b8", marginBottom: 12 }}>Live approval flow</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "📸 Upload receipt", bg: "#ecfdf5", border: "#a7f3d0", color: "#065f46" },
                  { label: "→", bg: "transparent", border: "transparent", color: "#cbd5e1" },
                  { label: "🤖 AI extracts data", bg: "#eff6ff", border: "#bfdbfe", color: "#1e3a8a" },
                  { label: "→", bg: "transparent", border: "transparent", color: "#cbd5e1" },
                  { label: "👔 Manager reviews", bg: "#f5f3ff", border: "#ddd6fe", color: "#4c1d95" },
                  { label: "→", bg: "transparent", border: "transparent", color: "#cbd5e1" },
                  { label: "✅ Approved!", bg: "#ecfdf5", border: "#6ee7b7", color: "#064e3b" },
                ].map((s, i) => (
                  s.label === "→"
                    ? <span key={i} style={{ color: s.color, fontSize: 18 }}>›</span>
                    : <span key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{s.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Auth */}
          <div id="auth" style={{ position: "sticky", top: 84 }}>
            <div style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(16,185,129,.08) 0%, transparent 80%)", borderRadius: 24, padding: 4 }}>
              <AuthPanel />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ STATS STRIP ━━━━━━━━━━━━ */}
      <div style={{ background: "rgba(255,255,255,.8)", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { val: "< 30s", sub: "Receipt scanned by AI" },
            { val: "150+",  sub: "Currencies supported" },
            { val: "3-step",sub: "Max approval depth" },
            { val: "100%",  sub: "Full audit trail" },
          ].map((s, i) => (
            <div key={s.val} style={{ textAlign: "center", padding: "28px 16px", borderRight: i < 3 ? "1px solid #e2e8f0" : "none" }}>
              <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", background: "linear-gradient(135deg,#059669,#0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 6 }}>
                {s.val}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━━━━━━━━━ FEATURES ━━━━━━━━━━━━ */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#059669", marginBottom: 12 }}>Features</span>
          <h2 style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Everything you need</h2>
          <p style={{ fontSize: 17, color: "#64748b", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            A focused AI-powered toolkit. No bloat — just what your team will actually use every day.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 2px 8px rgba(0,0,0,.04)",
              transition: "all .2s ease",
              cursor: "default",
            }}>
              {/* Icon circle */}
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: f.grad,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, marginBottom: 20,
                boxShadow: `0 6px 18px ${f.glow}`,
              }}>
                {f.emoji}
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: "0 0 18px" }}>{f.desc}</p>

              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, background: f.tagBg, color: f.tagColor, padding: "3px 10px", borderRadius: 999 }}>
                {f.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━━━ */}
      <section id="how-it-works" style={{ background: "linear-gradient(180deg,#fff 0%,#f0fdf4 100%)", borderTop: "1px solid #e2e8f0", padding: "96px 2rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#059669", marginBottom: 12 }}>How it works</span>
            <h2 style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Upload to approved in minutes</h2>
            <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7 }}>Each role has a clear job. No overlap—just a clean flow from receipt to reimbursement.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Circle + line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: step.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 900, fontSize: 20,
                    boxShadow: `0 6px 18px rgba(0,0,0,.18)`,
                    flexShrink: 0,
                  }}>
                    {step.n}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 2, flex: "1 0 24px", minHeight: 24, background: "linear-gradient(180deg,#a7f3d0,#bfdbfe)", borderRadius: 1, margin: "6px 0" }} />
                  )}
                </div>

                {/* Card */}
                <div style={{
                  flex: 1,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: "20px 24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                  marginBottom: i < STEPS.length - 1 ? 0 : 0,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: step.color, textTransform: "uppercase", letterSpacing: "0.12em" }}>{step.who}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "4px 0 8px", letterSpacing: "-0.02em" }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ ROLES ━━━━━━━━━━━━ */}
      <section id="roles" style={{ padding: "96px 2rem", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#059669", marginBottom: 12 }}>Roles</span>
            <h2 style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", margin: 0 }}>Three roles, one system</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {ROLES.map((r) => (
              <div key={r.label} style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: "32px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,.04)",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: r.grad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 20,
                  boxShadow: `0 6px 18px ${r.glow}`,
                }}>
                  {r.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 18px", letterSpacing: "-0.02em" }}>{r.label}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {r.perks.map((p) => (
                    <li key={p} style={{ display: "flex", gap: 10, fontSize: 14, color: "#475569", alignItems: "flex-start" }}>
                      <span style={{ color: "#10b981", flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ CTA BANNER ━━━━━━━━━━━━ */}
      <section style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg,#059669 0%,#0d9488 50%,#0ea5e9 100%)",
        padding: "88px 2rem", textAlign: "center",
      }}>
        {/* Dot texture */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(255,255,255,.7)", marginBottom: 16 }}>
            Free · No card required
          </p>
          <h2 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", margin: "0 0 20px" }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,.85)", lineHeight: 1.75, marginBottom: 36 }}>
            Set up your workspace in 5 minutes. Your team can start submitting
            and approving expense claims right away.
          </p>
          <a href="#auth" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff", color: "#059669",
            fontWeight: 800, fontSize: 15,
            padding: "16px 36px", borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,.2)",
            textDecoration: "none",
          }}>
            Create your workspace →
          </a>
        </div>
      </section>

      {/* ━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━ */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "28px 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#059669,#0d9488)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💰</div>
            <span style={{ fontWeight: 800, color: "#0f172a" }}>ReimburseX</span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <span style={{ color: "#94a3b8" }}>Odoo × VIT 2026</span>
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            Built with Next.js · Supabase · Claude Vision · ExchangeRate-API
          </p>
        </div>
      </footer>

    </div>
  )
}
