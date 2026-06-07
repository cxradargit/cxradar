import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'
import { logAudit } from '@/lib/admin-audit'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createAdminClient()

  // Get the first ADMIN user of this empresa
  const { data: usuarios } = await admin
    .from('usuarios')
    .select('id, email, role')
    .eq('empresaId', id)
    .order('criadoEm')
    .limit(5)

  const adminUser = usuarios?.find(u => u.role === 'ADMIN') ?? usuarios?.[0]
  if (!adminUser) return NextResponse.json({ error: 'Nenhum usuário encontrado nesta empresa.' }, { status: 404 })

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: adminUser.email,
  })
  if (error) return NextResponse.json({ error: 'Erro ao gerar link de impersonação.' }, { status: 500 })

  await logAudit({ acao: 'IMPERSONACAO', entidadeTipo: 'empresa', entidadeId: id, realizadoPor: user.email!, metadata: { targetEmail: adminUser.email, targetId: adminUser.id } })

  return NextResponse.json({ link: data.properties?.action_link, email: adminUser.email })
}
