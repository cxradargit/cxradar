import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()

  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId')
    .eq('id', user.id)
    .single()

  if (!usuario?.empresaId) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const { empresaId } = usuario

  const [canaisRes, empresaRes, overridesRes] = await Promise.all([
    admin.from('canais').select('id, nome, ativo'),
    admin.from('empresas').select('evolutionGoConnected').eq('id', empresaId).single(),
    admin.from('empresa_canais').select('canal, ativo').eq('empresaId', empresaId),
  ])

  const globais   = canaisRes.data ?? []
  const overrides = Object.fromEntries((overridesRes.data ?? []).map(o => [o.canal, o.ativo]))
  const conectado = empresaRes.data?.evolutionGoConnected ?? false

  const canais = globais.map(c => {
    const override = overrides[c.id]
    const ativoEfetivo = override !== undefined && override !== null ? override : c.ativo

    // WhatsApp: ativo na plataforma E chip conectado
    const disponivel = c.id === 'WHATSAPP'
      ? ativoEfetivo && conectado
      : ativoEfetivo

    return {
      id:         c.id,
      nome:       c.nome,
      disponivel,
      detalhes: c.id === 'WHATSAPP' ? (
        !c.ativo         ? 'Canal desativado pela plataforma'
        : !conectado     ? 'Chip não conectado — contate o suporte'
        : 'Pronto para envio'
      ) : (
        !ativoEfetivo ? 'Canal em breve' : 'Pronto para envio'
      ),
    }
  })

  return NextResponse.json({ canais })
}
