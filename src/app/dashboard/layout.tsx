import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import DashboardShell from "@/components/DashboardShell"
import Providers from "@/components/Providers"
import { ToastProvider } from "@/components/ui/toast"

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email ? email.slice(0, 2).toUpperCase() : "U"
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/")
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    initials: getInitials(session.user.name, session.user.email),
  }

  return (
    <Providers>
      <ToastProvider>
        <DashboardShell user={user}>
          {children}
        </DashboardShell>
      </ToastProvider>
    </Providers>
  )
}
