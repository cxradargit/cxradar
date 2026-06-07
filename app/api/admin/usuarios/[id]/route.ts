import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'
import { logAudit } from '@/lib/admin-audit'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const allowed = ['role', 'status', 'nome']
  const updateData: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updateData[key] = body[key]
  }
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.from('usuarios').update(updateData).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: 'Erro ao atualizar usuário.' }, { status: 500 })

  if ('status' in updateData) {
    await admin.auth.admin.updateUserById(id, { ban_duration: updateData.status === 'SUSPENSO' ? '876000h' : 'none' })
  }

  await logAudit({ acao: 'USUARIO_EDITADO', entidadeTipo: 'usuario', entidadeId: id, realizadoPor: user.email!, metadata: { campos: Object.keys(updateData) } })

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { data: usuarioData } = await admin.from('usuarios').select('email, empresaId').eq('id', id).single()

  await admin.from('usuarios').delete().eq('id', id)
  await admin.auth.admin.deleteUser(id)

  await logAudit({ acao: 'USUARIO_REMOVIDO', entidadeTipo: 'usuario', entidadeId: id, realizadoPor: user.email!, metadata: { email: usuarioData?.email } })

  return NextResponse.json({ ok: true })
}
