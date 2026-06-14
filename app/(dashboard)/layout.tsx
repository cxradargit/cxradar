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
    .select('nome, email, role, empresa:empresas(nome, slug, saldo)')
    .eq('id', user.id)
    .single()

  const empresa = raw
    ? (Array.isArray(raw.empresa) ? (raw.empresa[0] ?? null) : (raw.empresa ?? null))
    : null

  const usuario = raw ? {
    nome: raw.nome as string,
    email: raw.email as string,
    role: raw.role as string,
    empresa: empresa ? { nome: empresa.nome as string, slug: empresa.slug as string } : null,
  } : null

  const saldo: number = (empresa as { saldo?: number } | null)?.saldo ?? 0

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fff' }}>
      <Sidebar usuario={usuario} saldo={saldo} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar nome={usuario?.nome} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
