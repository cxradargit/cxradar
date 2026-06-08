import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Evolution Go envia eventos de conexão para este endpoint
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: true })

  const event      = body.event as string | undefined
  const instanceId = (body.instanceId ?? body.data?.instanceId) as string | undefined
  const connected  = body.data?.connected as boolean | undefined

  // Só processa eventos de mudança de conexão
  if (!event?.includes('connection') || !instanceId) {
    return NextResponse.json({ ok: true })
  }

  const admin = createAdminClient()

  // Verifica se o instanceId pertence a uma empresa cadastrada
  // Rejeita webhooks para instâncias desconhecidas (proteção contra abuso)
  const { data: empresa } = await admin
    .from('empresas')
    .select('id')
    .eq('evolutionGoInstanceId', instanceId)
    .single()

  if (!empresa) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const isConnected = connected === true || body.data?.state === 'open'

  await admin
    .from('empresas')
    .update({ evolutionGoConnected: isConnected })
    .eq('id', empresa.id)

  return NextResponse.json({ ok: true })
}
