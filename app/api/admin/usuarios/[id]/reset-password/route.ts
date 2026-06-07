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
  const { data: usuario } = await admin.from('usuarios').select('email').eq('id', id).single()
  if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: usuario.email,
  })
  if (error) return NextResponse.json({ error: 'Erro ao gerar link de recuperação.' }, { status: 500 })

  await logAudit({ acao: 'RESET_SENHA_GERADO', entidadeTipo: 'usuario', entidadeId: id, realizadoPor: user.email!, metadata: { email: usuario.email } })

  return NextResponse.json({ link: data.properties?.action_link })
}
