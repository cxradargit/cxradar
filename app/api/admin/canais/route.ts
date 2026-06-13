import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data } = await admin.from('usuarios').select('role').eq('id', user.id).single()
  return data?.role === 'SUPER_ADMIN' ? admin : null
}

export async function GET() {
  const admin = await assertSuperAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await admin.from('canais').select('*').order('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Nunca expõe credenciais reais — retorna apenas quais chaves existem
  const canais = (data ?? []).map(c => ({
    id:      c.id,
    nome:    c.nome,
    ativo:   c.ativo,
    provedor: c.provedor,
    configKeys: Object.keys(c.config ?? {}),
  }))

  return NextResponse.json({ canais })
}

export async function PUT(request: NextRequest) {
  const admin = await assertSuperAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { id, ativo, provedor, config } = body as {
    id: string
    ativo?: boolean
    provedor?: string
    config?: Record<string, string>
  }

  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (ativo !== undefined) updates.ativo = ativo
  if (provedor !== undefined) updates.provedor = provedor
  if (config !== undefined) {
    // Merge com config existente para não apagar chaves não enviadas
    const { data: existing } = await admin.from('canais').select('config').eq('id', id).single()
    updates.config = { ...(existing?.config ?? {}), ...config }
  }

  const { error } = await admin.from('canais').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
