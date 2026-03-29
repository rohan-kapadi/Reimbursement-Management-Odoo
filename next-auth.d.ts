import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"
import { Role } from "@/types/db"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      companyId?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: Role
    companyId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: Role
    companyId?: string
  }
}
