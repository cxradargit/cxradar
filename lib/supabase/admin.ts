import { createClient } from '@supabase/supabase-js'

// Usa service_role — bypassa RLS.
// Usar APENAS em Server Actions privilegiadas (ex: criação de empresa no signup).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
