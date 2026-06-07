import { createAdminClient } from '@/lib/supabase/admin'

export async function logAudit(params: {
  acao: string
  entidadeTipo: string
  entidadeId: string
  realizadoPor: string
  metadata?: Record<string, unknown>
}) {
  try {
    const admin = createAdminClient()
    await admin.from('audit_logs').insert(params)
  } catch {
    // Audit failures must never block main operations
  }
}
