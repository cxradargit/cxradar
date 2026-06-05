import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/shared/sidebar'
import Topbar from '@/components/shared/topbar'

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
    <div style={{ display: 'flex', height: '100vh', background: '#fff' }}>
      <Sidebar usuario={usuario} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar nome={usuario?.nome} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
