import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: surveyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('survey_respondents')
    .select('*')
    .eq('surveyId', surveyId)
    .order('criadoEm', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id: surveyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, email, telefone, cpf } = await request.json()
  if (!nome?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'nome e email são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('survey_respondents')
    .insert({ id: randomUUID(), token: randomUUID(), surveyId, nome: nome.trim(), email: email.trim().toLowerCase(), telefone: telefone || null, cpf: cpf || null })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Esse e-mail já está cadastrado nesta pesquisa' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
