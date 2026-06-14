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

  const [empresaRes, transacoesRes, subsRes] = await Promise.all([
    admin.from('empresas')
      .select('saldo, custoWhatsapp, custoSMS, custoEmail')
      .eq('id', usuario.empresaId)
      .single(),
    admin.from('credit_transactions')
      .select('id, tipo, canal, valor, descricao, criadoEm')
      .eq('empresaId', usuario.empresaId)
      .order('criadoEm', { ascending: false })
      .limit(50),
    admin.from('empresa_credit_subscriptions')
      .select('id, stripeSubscriptionId, valorMensais, status, criadoEm')
      .eq('empresaId', usuario.empresaId)
      .neq('status', 'canceled')
      .order('criadoEm', { ascending: true }),
  ])

  const empresa      = empresaRes.data
  const assinaturas  = subsRes.data ?? []
  const totalMensais = assinaturas
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + Number(s.valorMensais), 0)

  return NextResponse.json({
    saldo:         empresa?.saldo ?? 0,
    custoWhatsapp: empresa?.custoWhatsapp ?? 0,
    custoSMS:      empresa?.custoSMS ?? 0,
    custoEmail:    empresa?.custoEmail ?? 0,
    assinaturas,
    totalMensais,
    transacoes:    transacoesRes.data ?? [],
  })
}
