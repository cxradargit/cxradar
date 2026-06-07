import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSuperAdmin } from '@/lib/superadmin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '0'))
  const limit = 50
  const offset = page * limit
  const tipo = searchParams.get('tipo') ?? ''

  const admin = createAdminClient()
  let query = admin
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('criadoEm', { ascending: false })
    .range(offset, offset + limit - 1)

  if (tipo) query = query.eq('entidadeTipo', tipo)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: 'Erro ao buscar logs.' }, { status: 500 })

  return NextResponse.json({ logs: data ?? [], total: count ?? 0, page, limit })
}
