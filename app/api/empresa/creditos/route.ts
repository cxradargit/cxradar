import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId')
    .eq('id', user.id)
    .single()

  if (!usuario?.empresaId) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const [empresaRes, transacoesRes] = await Promise.all([
    admin.from('empresas').select('saldo, custoWhatsapp, custoSMS, custoEmail').eq('id', usuario.empresaId).single(),
    admin.from('credit_transactions')
      .select('id, tipo, canal, valor, descricao, criadoEm')
      .eq('empresaId', usuario.empresaId)
      .order('criadoEm', { ascending: false })
      .limit(50),
  ])

  return NextResponse.json({
    saldo:         empresaRes.data?.saldo ?? 0,
    custoWhatsapp: empresaRes.data?.custoWhatsapp ?? 0,
    custoSMS:      empresaRes.data?.custoSMS ?? 0,
    custoEmail:    empresaRes.data?.custoEmail ?? 0,
    transacoes:    transacoesRes.data ?? [],
  })
}
