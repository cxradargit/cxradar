import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'
import { logAudit } from '@/lib/admin-audit'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('usuarios')
    .select('id, nome, email, role, status, criadoEm')
    .eq('empresaId', id)
    .order('criadoEm')

  if (error) return NextResponse.json({ error: 'Erro ao buscar usuários.' }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { nome, email, senha, role } = await request.json()
  if (!email || !senha || !role) {
    return NextResponse.json({ error: 'E-mail, senha e role são obrigatórios.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const { error: dbError } = await admin.from('usuarios').insert({
    id: authUser.user.id,
    empresaId: id,
    nome: nome || null,
    email,
    role: role || 'VIEWER',
    status: 'ATIVO',
  })
  if (dbError) {
    await admin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: 'Erro ao criar usuário no banco.' }, { status: 500 })
  }

  await logAudit({ acao: 'USUARIO_CRIADO', entidadeTipo: 'empresa', entidadeId: id, realizadoPor: user.email!, metadata: { email, role } })

  return NextResponse.json({ id: authUser.user.id, email, nome, role, status: 'ATIVO', criadoEm: new Date().toISOString() }, { status: 201 })
}
