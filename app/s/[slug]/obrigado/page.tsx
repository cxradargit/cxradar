import { createAdminClient } from '@/lib/supabase/admin'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ nome?: string; suporte?: string }>
}

export default async function ObrigadoPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { nome, suporte } = await searchParams
  const showSupporte = suporte === '1'

  const admin = createAdminClient()
  const { data: survey } = await admin
    .from('surveys')
    .select('nome, mensagemFinal, suporteTitulo, suporteMensagem, suporteUrl, corPrimaria')
    .eq('slug', slug)
    .single()

  const accent = survey?.corPrimaria ?? '#000000'

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        {/* Main message */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl"
            style={{ backgroundColor: `${accent}20` }}>
            ✓
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {nome ? `Obrigado, ${nome}!` : 'Obrigado!'}
            </h1>
            <p className="text-gray-500 leading-relaxed">
              {survey?.mensagemFinal ?? 'Sua resposta foi registrada com sucesso. Agradecemos sua participação!'}
            </p>
          </div>
        </div>

        {/* Support section */}
        {showSupporte && survey?.suporteMensagem && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">
              {survey.suporteTitulo ?? 'Precisa de ajuda?'}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {survey.suporteMensagem}
            </p>
            {survey.suporteUrl && (
              <a
                href={survey.suporteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: accent }}
              >
                Entrar em contato →
              </a>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-300">Powered by CXRadar</p>
      </div>
    </div>
  )
}
