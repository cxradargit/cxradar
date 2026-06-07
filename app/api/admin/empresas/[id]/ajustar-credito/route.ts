import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id: empresaId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { valor, descricao } = await request.json() as { valor: number; descricao: string }

  if (typeof valor !== 'number' || valor === 0) {
    return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
  }
  if (!descricao?.trim()) {
    return NextResponse.json({ error: 'Descrição obrigatória' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { error: rpcError } = await admin.rpc('incrementar_saldo', {
    p_empresa_id: empresaId,
    p_valor: valor,
  })

  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 })

  await admin.from('credit_transactions').insert({
    empresaId,
    tipo: valor > 0 ? 'RECARGA' : 'CONSUMO',
    valor,
    descricao: descricao.trim(),
  })

  return NextResponse.json({ ok: true })
}
