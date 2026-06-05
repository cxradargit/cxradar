import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/shared/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: raw } = await supabase
    .from('usuarios')
    .select('nome, email, role, empresa:empresas(nome, slug)')
    .eq('id', user.id)
    .single()

  const usuario = raw ? {
    nome: raw.nome as string,
    email: raw.email as string,
    role: raw.role as string,
    empresa: Array.isArray(raw.empresa) ? (raw.empresa[0] ?? null) : (raw.empresa ?? null),
  } : null

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--cx-bg)' }}>
      <Sidebar usuario={usuario} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
