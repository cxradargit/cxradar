import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { empresaNome, usuarioNome } = body

  // Derive empresaId from session — never trust client-supplied value
  const admin = createAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId')
    .eq('id', user.id)
    .single()

  if (!usuario?.empresaId) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  }

  if (empresaNome?.trim()) {
    const { error } = await admin
      .from('empresas')
      .update({ nome: empresaNome.trim() })
      .eq('id', usuario.empresaId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (usuarioNome?.trim()) {
    const { error } = await admin
      .from('usuarios')
      .update({ nome: usuarioNome.trim() })
      .eq('id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
