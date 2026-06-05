import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify, randomId } from '@/lib/surveys'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('surveys')
    .select('id, nome, status, tipoPrincipal, slug, criadoEm, atualizadoEm')
    .order('criadoEm', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, tipoPrincipal } = await request.json()
  if (!nome || !tipoPrincipal) return NextResponse.json({ error: 'nome e tipoPrincipal são obrigatórios' }, { status: 400 })

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('empresaId')
    .eq('id', user.id)
    .single()

  if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const slug = `${slugify(nome)}-${randomId()}`

  const { data, error } = await supabase
    .from('surveys')
    .insert({ nome, tipoPrincipal, slug, empresaId: usuario.empresaId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
