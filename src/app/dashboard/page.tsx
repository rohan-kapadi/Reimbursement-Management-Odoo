import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/")
  }

  const role = session.user.role

  if (role === "ADMIN") {
    redirect("/dashboard/admin")
  } else if (role === "MANAGER") {
    redirect("/dashboard/manager")
  } else {
    redirect("/dashboard/employee")
  }
}
