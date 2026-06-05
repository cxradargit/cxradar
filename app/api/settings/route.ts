import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { empresaId, empresaNome, usuarioNome } = body

  if (empresaId && empresaNome?.trim()) {
    const { error } = await supabase
      .from('empresas')
      .update({ nome: empresaNome.trim() })
      .eq('id', empresaId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (usuarioNome?.trim()) {
    const { error } = await supabase
      .from('usuarios')
      .update({ nome: usuarioNome.trim() })
      .eq('id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
