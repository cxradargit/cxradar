import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: usuario } = await admin.from('usuarios').select('role').eq('id', user.id).single()
  if (usuario?.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await admin
    .from('empresas')
    .select('id, nome, slug, evolutionGoConnected, evolutionGoInstanceToken')
    .order('nome')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const empresas = (data ?? []).map(e => ({
    id:         e.id,
    nome:       e.nome,
    slug:       e.slug,
    conectado:  e.evolutionGoConnected ?? false,
    temInstancia: !!e.evolutionGoInstanceToken,
  }))

  return NextResponse.json({ empresas })
}
