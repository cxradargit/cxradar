import { createClient } from '@/lib/supabase/server'
import CompanySettings from '@/components/settings/company-settings'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('nome, email, role, empresaId, empresa:empresas(id, nome, slug)')
    .eq('id', user!.id)
    .single()

  const empresa = Array.isArray(usuario?.empresa) ? (usuario.empresa[0] ?? null) : (usuario?.empresa ?? null)

  return <CompanySettings usuario={{ nome: usuario?.nome, email: usuario?.email, role: usuario?.role }} empresa={empresa} />
}
