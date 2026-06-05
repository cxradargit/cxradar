import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, empresa } = await request.json()

    if (!nome || !email || !senha || !empresa) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      if (authError?.message.includes('already registered')) {
        return NextResponse.json({ error: 'Email já cadastrado.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Erro ao criar conta.' }, { status: 500 })
    }

    const userId = authData.user.id

    // 2. Criar Empresa
    const baseSlug = slugify(empresa)
    const slug = `${baseSlug}-${userId.slice(0, 8)}`

    const { data: empresaData, error: empresaError } = await admin
      .from('empresas')
      .insert({ nome: empresa, slug })
      .select()
      .single()

    if (empresaError || !empresaData) {
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Erro ao criar empresa.' }, { status: 500 })
    }

    // 3. Criar Usuario com role ADMIN
    const { error: usuarioError } = await admin.from('usuarios').insert({
      id: userId,
      empresaId: empresaData.id,
      nome,
      email,
      role: 'ADMIN',
    })

    if (usuarioError) {
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Erro ao configurar usuário.' }, { status: 500 })
    }

    // 4. Fazer login automático com as credenciais do usuário
    const supabase = await createClient()
    await supabase.auth.signInWithPassword({ email, password: senha })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
