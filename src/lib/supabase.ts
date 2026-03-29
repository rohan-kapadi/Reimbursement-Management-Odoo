import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy"

// Admin client bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// For any future client-side public access (if RLS is used and public access needed)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy"
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)
