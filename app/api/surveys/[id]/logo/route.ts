import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('logo') as File | null
  if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })

  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Formato inválido. Use PNG, JPG, WebP ou SVG.' }, { status: 400 })
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Imagem deve ter no máximo 2MB.' }, { status: 400 })
  }

  const ext = file.type === 'image/svg+xml' ? 'svg' : file.type.split('/')[1]
  const path = `${id}/logo-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const admin = createAdminClient()

  const { error: uploadError } = await admin.storage
    .from('survey-logos')
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('survey-logos').getPublicUrl(path)

  const { error: dbError } = await admin
    .from('surveys')
    .update({ logoUrl: publicUrl })
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ logoUrl: publicUrl })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()

  const { data: files } = await admin.storage.from('survey-logos').list(id)
  if (files && files.length > 0) {
    await admin.storage.from('survey-logos').remove(files.map(f => `${id}/${f.name}`))
  }

  await admin.from('surveys').update({ logoUrl: null }).eq('id', id)

  return NextResponse.json({ success: true })
}
