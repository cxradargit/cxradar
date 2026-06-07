import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { isSuperAdmin } from '@/lib/superadmin'
import { logAudit } from '@/lib/admin-audit'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const body = await request.json()
  const valorReais: number = Number(body.valor)
  const descricao: string  = body.descricao ?? 'CXRadar Consult — mensalidade'

  if (!valorReais || valorReais <= 0) return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })

  const admin = createAdminClient()
  const { data: empresa } = await admin
    .from('empresas')
    .select('id, nome, stripeCustomerId')
    .eq('id', id)
    .single()

  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  // Busca e-mail do admin da empresa para criar/reutilizar customer
  const { data: adminUser } = await admin
    .from('usuarios')
    .select('email')
    .eq('empresaId', id)
    .eq('role', 'ADMIN')
    .limit(1)
    .single()

  let customerId = empresa.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: adminUser?.email ?? undefined,
      name:  empresa.nome,
      metadata: { empresaId: empresa.id },
    })
    customerId = customer.id
    await admin.from('empresas').update({ stripeCustomerId: customerId }).eq('id', id)
  }

  // Cria invoice com item avulso
  const invoice = await stripe.invoices.create({
    customer:         customerId,
    collection_method: 'send_invoice',
    days_until_due:   7,
    metadata:         { empresaId: id, tipo: 'consult' },
  })

  await stripe.invoiceItems.create({
    customer:  customerId,
    invoice:   invoice.id,
    amount:    Math.round(valorReais * 100),
    currency:  'brl',
    description: descricao,
  })

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id)
  await stripe.invoices.sendInvoice(finalized.id)

  await logAudit({
    acao:          'INVOICE_CONSULT_CRIADA',
    entidadeTipo:  'empresa',
    entidadeId:    id,
    realizadoPor:  user.email!,
    metadata:      { valor: valorReais, descricao, invoiceId: finalized.id },
  })

  return NextResponse.json({ invoiceId: finalized.id, url: finalized.hosted_invoice_url })
}
