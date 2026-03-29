export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE"

export interface Company {
  id: string
  name: string
  base_currency: string
  country: string
  approval_chain?: { step: number; role: Role }[]
  created_at?: string
  updated_at?: string
}

export interface Team {
  id: string
  company_id: string
  name: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  name: string | null
  email: string | null
  password?: string | null
  role: Role
  company_id: string | null
  team?: string | null
  team_id?: string | null
  image: string | null
  created_at?: string
  updated_at?: string
}

export interface Expense {
  id: string
  amount: number
  currency: string
  converted_amount: number
  status: string
  receipt_url: string | null
  merchant: string
  category: string
  date: string
  description: string
  current_approval_step: number
  rejection_comment?: string | null
  submitted_by: string
  company_id: string
  submitted_at?: string
  updated_at?: string
}
