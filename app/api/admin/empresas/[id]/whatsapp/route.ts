import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'

type Params = { params: Promise<{ id: string }> }

const EVO_URL     = process.env.EVOLUTION_GO_URL      ?? 'http://localhost:4000'
const EVO_GLOBAL_KEY = process.env.EVOLUTION_GO_GLOBAL_KEY ?? 'cxradar-local-key'

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email ?? '')) return null
  return user
}

// GET — status da instância + QR code atual
export async function GET(_req: NextRequest, { params }: Params) {
  const { id: empresaId } = await params
  if (!await assertSuperAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: empresa } = await admin
    .from('empresas')
    .select('evolutionGoInstanceId, evolutionGoInstanceToken, evolutionGoConnected')
    .eq('id', empresaId)
    .single()

  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  if (!empresa.evolutionGoInstanceId) {
    return NextResponse.json({ status: 'NAO_CONFIGURADO' })
  }

  // Busca status em tempo real no Evolution Go
  try {
    const res = await fetch(`${EVO_URL}/instance/all`, {
      headers: { apikey: EVO_GLOBAL_KEY },
    })
    const data = await res.json()
    const instances: Array<{ id: string; connected: boolean; jid: string; qrcode: string }> =
      data.data ?? []
    const instance = instances.find(i => i.id === empresa.evolutionGoInstanceId)

    if (!instance) {
      return NextResponse.json({ status: 'NAO_CONFIGURADO' })
    }

    // Atualiza o DB se o status mudou
    if (instance.connected !== empresa.evolutionGoConnected) {
      await admin
        .from('empresas')
        .update({ evolutionGoConnected: instance.connected })
        .eq('id', empresaId)
    }

    return NextResponse.json({
      status:      instance.connected ? 'CONECTADO' : 'AGUARDANDO',
      instanceId:  instance.id,
      jid:         instance.jid,
      qrcode:      instance.qrcode ?? null,
    })
  } catch {
    return NextResponse.json({ status: 'ERRO', error: 'Evolution Go inacessível' }, { status: 502 })
  }
}

// POST — cria instância + inicia conexão (retorna QR e código de pareamento)
export async function POST(req: NextRequest, { params }: Params) {
  const { id: empresaId } = await params
  if (!await assertSuperAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: empresa } = await admin
    .from('empresas')
    .select('nome, slug, evolutionGoInstanceId')
    .eq('id', empresaId)
    .single()

  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const phone: string | undefined = body.phone // número para código de pareamento

  // Se já tem instância, apenas reinicia conexão
  let instanceId   = empresa.evolutionGoInstanceId
  let instanceToken = ''

  if (!instanceId) {
    // Cria instância nova
    const slug  = empresa.slug ?? empresaId
    const token = `evo-${slug}-${Date.now()}`

    const createRes = await fetch(`${EVO_URL}/instance/create`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', apikey: EVO_GLOBAL_KEY },
      body:    JSON.stringify({ name: slug, token }),
    })
    const created = await createRes.json()
    if (created.message !== 'success') {
      return NextResponse.json({ error: 'Falha ao criar instância', detail: created }, { status: 500 })
    }

    instanceId    = created.data.id
    instanceToken = created.data.token

    await admin
      .from('empresas')
      .update({
        evolutionGoInstanceId:    instanceId,
        evolutionGoInstanceToken: instanceToken,
        evolutionGoConnected:     false,
      })
      .eq('id', empresaId)
  } else {
    // Recupera token existente
    const { data: emp } = await admin
      .from('empresas')
      .select('evolutionGoInstanceToken')
      .eq('id', empresaId)
      .single()
    instanceToken = emp?.evolutionGoInstanceToken ?? ''
  }

  // Código de pareamento (se phone informado)
  if (phone) {
    const pairRes = await fetch(`${EVO_URL}/instance/pair`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', apikey: instanceToken },
      body:    JSON.stringify({ phone }),
    })
    const pairData = await pairRes.json()
    return NextResponse.json({
      type:        'PAIR_CODE',
      pairingCode: pairData.data?.PairingCode ?? null,
      instanceId,
    })
  }

  // QR code — conecta e aguarda QR
  const connectRes = await fetch(`${EVO_URL}/instance/connect`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', apikey: instanceToken },
    body:    JSON.stringify({ phone: instanceId, immediate: true }),
  })
  await connectRes.json()

  // Aguarda um momento para o QR ser gerado
  await new Promise(r => setTimeout(r, 2000))

  const allRes = await fetch(`${EVO_URL}/instance/all`, {
    headers: { apikey: EVO_GLOBAL_KEY },
  })
  const allData = await allRes.json()
  const instance = (allData.data ?? []).find((i: { id: string }) => i.id === instanceId)

  return NextResponse.json({
    type:      'QR_CODE',
    qrcode:    instance?.qrcode ?? null,
    instanceId,
  })
}

// DELETE — desconecta e remove instância
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: empresaId } = await params
  if (!await assertSuperAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: empresa } = await admin
    .from('empresas')
    .select('evolutionGoInstanceId, evolutionGoInstanceToken')
    .eq('id', empresaId)
    .single()

  if (!empresa?.evolutionGoInstanceId) {
    return NextResponse.json({ error: 'Nenhuma instância configurada' }, { status: 400 })
  }

  // Logout no Evolution Go
  await fetch(`${EVO_URL}/instance/logout`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', apikey: empresa.evolutionGoInstanceToken ?? EVO_GLOBAL_KEY },
    body:    JSON.stringify({ id: empresa.evolutionGoInstanceId }),
  }).catch(() => null)

  await admin
    .from('empresas')
    .update({
      evolutionGoInstanceId:    null,
      evolutionGoInstanceToken: null,
      evolutionGoConnected:     false,
    })
    .eq('id', empresaId)

  return NextResponse.json({ success: true })
}
