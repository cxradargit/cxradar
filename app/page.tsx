import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus_Jakarta_Sans } from 'next/font/google'
import styles from './page.module.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CXRadar — Plataforma de NPS, CSAT e Alertas de Churn',
  description: 'O CXRadar transforma feedbacks de NPS, CSAT e CES em inteligência preditiva. Identifique clientes em risco de cancelamento antes que seja tarde e aja com dados reais.',
  alternates: { canonical: 'https://cxradar.com.br/' },
  openGraph: {
    title: 'CXRadar — Plataforma de NPS, CSAT e Alertas de Churn',
    description: 'Transforme feedbacks de NPS, CSAT e CES em inteligência preditiva. Identifique clientes em risco antes que cancelem.',
    url: 'https://cxradar.com.br/',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
    siteName: 'CXRadar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CXRadar — Plataforma de NPS, CSAT e Alertas de Churn',
    description: 'Transforme feedbacks de NPS, CSAT e CES em inteligência preditiva. Identifique clientes em risco antes que cancelem.',
    images: ['/og-image.png'],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CXRadar',
  url: 'https://cxradar.com.br/',
  description: 'Plataforma de NPS, CSAT, CES e alertas preditivos de churn para equipes de Customer Success.',
  inLanguage: 'pt-BR',
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CXRadar',
  url: 'https://cxradar.com.br/',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  inLanguage: 'pt-BR',
  description: 'Plataforma SaaS para coleta de NPS, CSAT e CES com radar preditivo de churn, alertas automáticos e dashboard executivo em tempo real.',
  offers: [
    {
      '@type': 'Offer',
      name: 'CXRadar Autosserviço',
      price: '690.00',
      priceCurrency: 'BRL',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '690.00', priceCurrency: 'BRL', unitText: 'MONTH' },
    },
    { '@type': 'Offer', name: 'CXRadar Consult', description: 'Proposta personalizada com equipe dedicada.' },
  ],
  featureList: ['Pesquisas NPS, CSAT e CES', 'Envio via WhatsApp, e-mail e link', 'Radar Score de risco de churn', 'Alertas automáticos de churn', 'Dashboard executivo em tempo real', 'Formulários conversacionais sem código', 'Relatórios executivos'],
  publisher: { '@type': 'Organization', name: 'CXRadar', url: 'https://cxradar.com.br/' },
}

const s = styles

export default function HomePage() {
  return (
    <div className={`${jakarta.className} ${s.root}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      {/* ── NAVBAR ── */}
      <nav className={s.nav}>
        <div className={s['nav-inner']}>
          <Link href="/" className={s['nav-logo']}>
            <span className={s['nav-logo-name']}>CXRadar</span>
            <span className={s['nav-logo-tag']}>Preditividade como estratégia.</span>
          </Link>
          <div className={s['nav-links']}>
            <a href="#como-funciona">Como funciona</a>
            <a href="#recursos">Funcionalidades</a>
            <a href="#para-quem">Para quem</a>
            <a href="#planos">Planos</a>
          </div>
          <div className={s['nav-actions']}>
            <Link href="/login" className={s['btn-ghost']}>Entrar</Link>
            <Link href="/cadastro" className={s['btn-primary']}>Criar Conta →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={s.hero}>
        <div className={s['hero-aurora']} aria-hidden="true" />
        <div className={s['hero-inner']}>
          <div className={s['hero-copy']}>
            <h1 className={s['hero-h1']}>
              Pare de descobrir o churn <span className={s.grad}>pela nota de cancelamento.</span>
            </h1>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '-0.01em', marginBottom: '16px', lineHeight: 1.5 }}>
              Seus clientes estão enviando sinais. Você está captando?
            </p>
            <p className={s['hero-sub']} style={{ marginBottom: '36px' }}>
              O CXRadar transforma NPS, CSAT e CES em inteligência acionável, identificando quem está em risco de cancelar antes que seja tarde.
            </p>
            <div className={s['hero-cta']}>
              <Link href="/cadastro" className={s['btn-hero']}>Começar agora →</Link>
              <a href="#como-funciona" className={s['btn-hero-outline']}>Ver como funciona</a>
            </div>
            <div className={s['hero-trust']}>
              <div className={s['hero-trust-avatars']}>
                {['JP', 'MC', 'RS', 'AB'].map(i => <div key={i} className={s.avatar}>{i}</div>)}
              </div>
              <span className={s['hero-trust-text']}>Usado por equipes de CS e produto</span>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className={s['hero-mockup']}>
            <div className={s.browser}>
              <div className={s['browser-bar']}>
                <span className={s['browser-dot']} style={{ background: '#FF5F57' }} />
                <span className={s['browser-dot']} style={{ background: '#FEBC2E' }} />
                <span className={s['browser-dot']} style={{ background: '#28C840' }} />
                <span className={s['browser-url']}>app.cxradar.com.br/dashboard</span>
              </div>
              <div className={s.dash}>
                <div className={s['dash-sidebar']}>
                  <div className={s['dash-logo']}>CXRadar</div>
                  <div className={`${s['dash-item']} ${s['dash-active']}`}>Dashboard</div>
                  <div className={s['dash-item']}>Pesquisas</div>
                  <div className={s['dash-item']}>Respondentes</div>
                  <div className={s['dash-item']}>
                    Alertas
                    <span style={{ display: 'inline-block', background: '#EF4444', color: 'white', fontSize: '0.55rem', fontWeight: 700, borderRadius: '4px', padding: '1px 5px', marginLeft: '4px' }}>3</span>
                  </div>
                  <div className={s['dash-item']}>Créditos</div>
                </div>
                <div className={s['dash-main']}>
                  <div className={s['dash-header']}>Visão Geral — Jun 2026</div>
                  <div className={s['kpi-row']}>
                    <div className={s.kpi}><div className={s['kpi-label']}>NPS</div><div className={s['kpi-value']}>72</div><div className={s['kpi-up']}>+8 pts</div></div>
                    <div className={s.kpi}><div className={s['kpi-label']}>CSAT</div><div className={s['kpi-value']}>4.6</div><div className={s['kpi-up']}>+0.3</div></div>
                    <div className={s.kpi}><div className={s['kpi-label']}>Em risco</div><div className={s['kpi-value']}>3</div><div className={s['kpi-down']}>▲ 2</div></div>
                  </div>
                  <div className={s['dash-grid']}>
                    <div className={s['chart-card']}>
                      <div className={s['chart-title']}>NPS — últimos 7 meses</div>
                      <div className={s['chart-bars']}>
                        {['44%', '52%', '48%', '60%', '68%', '74%'].map((h, i) => <div key={i} className={s.bar} style={{ height: h }} />)}
                        <div className={`${s.bar} ${s['bar-hi']}`} style={{ height: '82%' }} />
                      </div>
                    </div>
                    <div className={s['alerts-card']}>
                      <div className={s['chart-title']}>Alertas recentes</div>
                      {[
                        { dot: 'dot-red', text: 'TechCorp — CSAT 2.1', time: '2h' },
                        { dot: 'dot-yellow', text: 'StartupXYZ — NPS caiu 15', time: '5h' },
                        { dot: 'dot-red', text: 'FinanceCo — sem resp. 14d', time: '1d' },
                        { dot: 'dot-green', text: 'MegaSaaS — NPS +22 pts', time: '2d' },
                      ].map(({ dot, text, time }) => (
                        <div key={text} className={s['alert-item']}>
                          <div className={`${s['alert-dot']} ${s[dot as keyof typeof s]}`} />
                          <div className={s['alert-text']}>{text}</div>
                          <div className={s['alert-time']}>{time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={s['float-badge']}>
              <div className={s['float-icon']}>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <div className={s['float-title']}>Alerta de churn detectado</div>
                <div className={s['float-sub']}>TechCorp — CSAT 2.1 — aja agora</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MÉTRICAS ── */}
      <div className={s.metrics}>
        <div className={s['metrics-inner']}>
          {[
            { val: '∞', label: 'Pesquisas e usuários ilimitados' },
            { val: '3', label: 'canais: WhatsApp, e-mail, link' },
            { val: 'Real', label: 'Alertas de churn em tempo real' },
            { val: 'Zero', label: 'código para configurar' },
          ].map(({ val, label }) => (
            <div key={val} className={s.metric}>
              <div className={s['metric-value']}><span className={s.grad}>{val}</span></div>
              <div className={s['metric-label']}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMO FUNCIONA ── */}
      <section className={s.section} id="como-funciona" style={{ background: 'var(--light)' }}>
        <div className={s.container}>
          <div className={s['section-center']}>
            <span className={s.label}>Como funciona</span>
            <h2 className={s['section-h2']}>Da coleta do feedback<br />ao alerta de churn em três etapas</h2>
            <p className={s['section-sub']} style={{ margin: '0 auto' }}>Tudo em uma plataforma unificada, sem integrações complexas.</p>
          </div>
          <div className={s.steps}>
            {[
              { num: '01', numCls: 'num-blue', dotCls: 'dot-blue', title: 'Coleta', desc: 'Capture feedbacks de múltiplos canais em uma plataforma unificada.', items: ['Pesquisas CSAT, NPS e CES', 'Links públicos e QR Codes', 'Envio via WhatsApp e E-mail', 'Formulários conversacionais'] },
              { num: '02', numCls: 'num-cyan', dotCls: 'dot-cyan', title: 'Análise', desc: 'A plataforma organiza os dados automaticamente e apresenta o que importa.', items: ['Evolução da satisfação', 'Clientes em risco identificados', 'Tendências e padrões', 'Feedbacks críticos priorizados'] },
              { num: '03', numCls: 'num-green', dotCls: 'dot-green2', title: 'Ação', desc: 'Insights claros para que sua equipe aja no momento certo, antes que seja tarde.', items: ['Alertas automáticos de churn', 'Radar de risco em tempo real', 'Receita em risco mapeada', 'Relatórios executivos prontos'] },
            ].map(({ num, numCls, dotCls, title, desc, items }) => (
              <div key={num} className={s.step}>
                <div className={`${s['step-num']} ${s[numCls as keyof typeof s]}`}>{num}</div>
                <div className={s['step-title']}>{title}</div>
                <p className={s['step-desc']}>{desc}</p>
                <div className={s['step-list']}>
                  {items.map(item => <div key={item} className={`${s['step-item']} ${s[dotCls as keyof typeof s]}`}>{item}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE: Radar de Risco ── */}
      <section className={s['feature-section']} id="recursos" style={{ background: 'white' }}>
        <div className={`${s['feature-split']} ${s.container}`}>
          <div className={s['feature-panel']}>
            <div className={s['panel-inner']}>
              <div className={s['panel-title']}>Radar Score — Risco de Churn</div>
              <div className={s['panel-metric']}>72 <span>/ 100</span></div>
              <div className={s['panel-trend']}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                </svg>
                +8 pontos vs mês anterior
              </div>
              <div className={s['risk-list']}>
                <div className={s['risk-label']}>Clientes em risco</div>
                {[
                  { name: 'TechCorp Ltd.', w: '88%', barCls: 'rb-red', scoreCls: 'rs-red', label: 'Alto' },
                  { name: 'StartupXYZ', w: '55%', barCls: 'rb-yellow', scoreCls: 'rs-yellow', label: 'Médio' },
                  { name: 'FinanceCo', w: '48%', barCls: 'rb-yellow', scoreCls: 'rs-yellow', label: 'Médio' },
                  { name: 'MegaSaaS', w: '18%', barCls: 'rb-green', scoreCls: 'rs-green', label: 'Baixo' },
                ].map(({ name, w, barCls, scoreCls, label }) => (
                  <div key={name} className={s['risk-row']}>
                    <div className={s['risk-name']}>{name}</div>
                    <div className={s['risk-bar-wrap']}><div className={`${s['risk-bar']} ${s[barCls as keyof typeof s]}`} style={{ width: w }} /></div>
                    <div className={s[scoreCls as keyof typeof s]}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className={s.label}>Inteligência preditiva</span>
            <h2 className={s['section-h2']}>Identifique quem vai cancelar antes que ele decida</h2>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '4px' }}>
              O CXRadar calcula um Radar Score para cada cliente com base nos feedbacks recebidos, identificando risco de churn antes que seja tarde para agir.
            </p>
            <div className={s['feature-list']}>
              <div className={s['feature-item']}>
                <div className={`${s['fi-wrap']} ${s['fi-red']}`}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                  </svg>
                </div>
                <div><div className={s['fi-title']}>Alertas automáticos</div><div className={s['fi-desc']}>Receba uma notificação imediata quando um cliente cruzar o limiar de risco configurado.</div></div>
              </div>
              <div className={s['feature-item']}>
                <div className={`${s['fi-wrap']} ${s['fi-blue']}`}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                  </svg>
                </div>
                <div><div className={s['fi-title']}>Tendências em tempo real</div><div className={s['fi-desc']}>Acompanhe a evolução do NPS, CSAT e CES com granularidade diária, semanal ou mensal.</div></div>
              </div>
              <div className={s['feature-item']}>
                <div className={`${s['fi-wrap']} ${s['fi-green']}`}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div><div className={s['fi-title']}>Receita em risco mapeada</div><div className={s['fi-desc']}>Veja exatamente quanto MRR está em jogo e priorize as ações pelo impacto financeiro.</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE: Pesquisas ── */}
      <section className={s['feature-section']} style={{ background: 'var(--light)' }}>
        <div className={`${s['feature-split-rev']} ${s.container}`}>
          <div>
            <span className={s.label}>Coleta de feedback</span>
            <h2 className={s['section-h2']}>Pesquisas que geram respostas, não ignoradas</h2>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '4px' }}>
              Formulários conversacionais com 10+ tipos de pergunta, enviados no momento certo pelo canal certo.
            </p>
            <div className={s['feature-list']}>
              <div className={s['feature-item']}>
                <div className={`${s['fi-wrap']} ${s['fi-blue']}`}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div><div className={s['fi-title']}>Builder visual sem código</div><div className={s['fi-desc']}>Crie pesquisas NPS, CSAT ou CES em minutos com o builder drag-and-drop com preview mobile.</div></div>
              </div>
              <div className={s['feature-item']}>
                <div className={`${s['fi-wrap']} ${s['fi-cyan']}`}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <div><div className={s['fi-title']}>Multi-canal nativo</div><div className={s['fi-desc']}>WhatsApp, e-mail, link público ou QR Code. Cada respondente recebe no canal que prefere.</div></div>
              </div>
              <div className={s['feature-item']}>
                <div className={`${s['fi-wrap']} ${s['fi-green']}`}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <div><div className={s['fi-title']}>Dashboard executivo</div><div className={s['fi-desc']}>KPIs, tendências, distribuição de notas e feedbacks abertos em um único painel.</div></div>
              </div>
            </div>
          </div>

          {/* NPS survey mockup */}
          <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.05)', padding: '32px', minHeight: '360px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Preview · Pesquisa NPS</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '6px', lineHeight: 1.4 }}>Em uma escala de 0 a 10, o quanto você recomendaria a empresa para um amigo?</div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '24px' }}>Sua resposta nos ajuda a melhorar continuamente.</div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
              {[
                { l: '0', bg: '#FEE2E2', color: '#DC2626' },
                { l: '1', bg: '#FEE2E2', color: '#DC2626' },
                { l: '6', bg: '#FEF3C7', color: '#D97706' },
                { l: '7', bg: '#FEF3C7', color: '#D97706' },
                { l: '8', bg: '#FEF3C7', color: '#D97706' },
                { l: '9', bg: '#F0FDF4', color: '#16A34A' },
                { l: '10', bg: '#16A34A', color: 'white', shadow: '0 4px 12px rgba(22,163,74,0.3)', fw: 800 },
              ].map(({ l, bg, color, shadow, fw }) => (
                <div key={l} className={s['nps-btn']} style={{ background: bg, color, borderRadius: '8px', width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: fw ?? 700, boxShadow: shadow }}>{l}</div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#CBD5E1', marginBottom: '28px' }}>
              <span>Improvável</span><span>Muito provável</span>
            </div>
            <button className={s['survey-submit']}>Confirmar resposta →</button>
            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.65rem', color: '#CBD5E1' }}>Seguro e anônimo · Resposta em segundos</div>
          </div>
        </div>
      </section>

      {/* ── PARA QUEM ── */}
      <section className={s.section} id="para-quem" style={{ background: 'white' }}>
        <div className={s.container}>
          <div className={s['section-center']}>
            <span className={s.label}>Para quem é</span>
            <h2 className={s['section-h2']}>Para toda empresa que quer<br />parar de perder clientes</h2>
          </div>
          <div className={s['segment-grid']}>
            {[
              { title: 'Provedores de Internet', desc: 'Reduza cancelamentos com alertas de churn antes da perda do cliente.', path: <><path d="M5 12.55a11 11 0 0114.08 0" /><path d="M1.42 9a16 16 0 0121.16 0" /><path d="M8.53 16.11a6 6 0 016.95 0" /><circle cx="12" cy="20" r="1" fill="#2563EB" stroke="none" /></> },
              { title: 'SaaS / Software', desc: 'Monitore a saúde da base e identifique contas em risco antes da renovação.', path: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></> },
              { title: 'Clínicas / Saúde', desc: 'Acompanhe a experiência dos pacientes e fidelize quem veio pela primeira vez.', path: <path d="M12 5v14M5 12h14" /> },
              { title: 'Franquias', desc: 'Padronize a qualidade da experiência do cliente em todas as unidades.', path: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></> },
              { title: 'Escolas / Educação', desc: 'Meça a satisfação de alunos e pais. Reduza evasão com dados antecipados.', path: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></> },
              { title: 'Varejo / E-commerce', desc: 'Capture feedback pós-compra e entenda por que clientes não voltam.', path: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></> },
              { title: 'Financeiro / Fintech', desc: 'Meça confiança e satisfação em cada etapa da jornada do cliente.', path: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></> },
              { title: 'Imobiliário', desc: 'Avalie a experiência de compradores e locatários em cada etapa do processo.', path: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
              { title: 'Consultoria', desc: 'Comprove o valor entregue com dados de satisfação e NPS dos seus clientes.', path: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></> },
              { title: 'Empresas de Serviços', desc: 'Transforme feedback em melhoria contínua e retenção de clientes.', path: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></> },
            ].map(({ title, desc, path }) => (
              <div key={title} className={s['segment-card']}>
                <div className={s['seg-icon']}>
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
                </div>
                <div className={s['seg-title']}>{title}</div>
                <div className={s['seg-desc']}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANTES / DEPOIS ── */}
      <section className={s.section} style={{ background: 'var(--light)' }}>
        <div className={s.container}>
          <div className={s['section-center']}>
            <span className={s.label}>Transformação</span>
            <h2 className={s['section-h2']}>Reconhece esse cenário?</h2>
          </div>
          <div className={s['split-table']}>
            <div className={s['split-before']}>
              <div className={s['split-header']}>
                <div className={s['sh-icon-red']}>
                  <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </div>
                <span className={s['sh-label-red']}>Hoje na maioria das empresas</span>
              </div>
              {['Pesquisas isoladas por ferramenta', 'Dados dispersos sem análise', 'Lançamento sem validação da base', 'Problemas descobertos tarde demais', 'Decisões por intuição, sem dados'].map(text => (
                <div key={text} className={s['split-row-before']}>
                  <div className={s['sb-bullet']}><svg aria-hidden="true" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg></div>
                  <div className={s['st-before']}>{text}</div>
                </div>
              ))}
            </div>
            <div className={s['split-after']}>
              <div className={s['split-header']}>
                <div className={s['sh-icon-green']}>
                  <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <span className={s['sh-label-green']}>Com CXRadar</span>
              </div>
              {['Monitoramento contínuo e unificado', 'Insights executivos automáticos', 'Validação com clientes antes do lançamento', 'Alertas antes dos problemas escalarem', 'Decisões baseadas em dados reais'].map(text => (
                <div key={text} className={s['split-row-after']}>
                  <div className={s['sg-bullet']}><svg aria-hidden="true" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></div>
                  <div className={s['st-after']}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GARANTIAS ── */}
      <section className={s.garantias}>
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <div className={s['garantias-grid']}>
            {[
              { iconCls: 'gi-green', stroke: '#16A34A', title: 'Sem fidelidade', desc: 'Sem contrato de longo prazo. Assine e cancele quando quiser.', svg: <path d="M20 6L9 17l-5-5" /> },
              { iconCls: 'gi-blue', stroke: '#2563EB', title: 'Suporte incluído', desc: 'Atendimento humano incluso em todos os planos, sem custo extra.', svg: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /> },
              { iconCls: 'gi-cyan', stroke: '#0891B2', title: 'Dados seguros', desc: 'Conformidade com a LGPD. Seus dados e os dos seus clientes protegidos.', svg: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></> },
              { iconCls: 'gi-orange', stroke: '#EA580C', title: 'Configuração rápida', desc: 'Primeira pesquisa criada e enviada no mesmo dia da contratação.', svg: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
            ].map(({ iconCls, stroke, title, desc, svg }) => (
              <div key={title} className={s['garantia-item']}>
                <div className={`${s['garantia-icon']} ${s[iconCls as keyof typeof s]}`}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{svg}</svg>
                </div>
                <div>
                  <div className={s['garantia-title']}>{title}</div>
                  <div className={s['garantia-desc']}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section className={s['plans-section']} id="planos">
        <div className={s['plans-aurora']} aria-hidden="true" />
        <div className={`${s.container} ${s['plans-inner']}`}>
          <div className={s['section-center']}>
            <span className={`${s.label} ${s['plans-label']}`}>Planos</span>
            <h2 className={`${s['section-h2']} ${s['plans-h2']}`}>Uma plataforma,<br />dois modelos de operação</h2>
            <p className={`${s['section-sub']} ${s['plans-sub']}`} style={{ margin: '12px auto 0' }}>
              Você opera com autonomia ou conta com nossa equipe para operar junto.
            </p>
          </div>
          <div className={s['plans-grid']}>
            {/* Autosserviço */}
            <div className={s['plan-card']}>
              <div>
                <div className={`${s['plan-chip']} ${s['chip-blue']}`}><span className={s['chip-dot']} />Autosserviço</div>
                <div className={s['plan-name']}>CXRadar Autosserviço</div>
                <div className={s['plan-desc']}>Sua equipe no controle total da experiência do cliente.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.05em', lineHeight: 1 }}>R$ 690</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>/mês · sem fidelidade</span>
              </div>
              <div className={s['plan-divider']} />
              <div className={s['plan-items']}>
                {['Pesquisas e usuários ilimitados', 'Dashboard executivo em tempo real', 'Alertas automáticos de churn', 'Suporte de até 4h/mês'].map(item => (
                  <div key={item} className={s['plan-item']}>
                    <div className={`${s['pi-check']} ${s['pic-blue']}`}><svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></div>
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/cadastro" className={s['plan-btn-outline']}>Começar agora →</Link>
            </div>

            {/* Consult */}
            <div className={s['plan-featured']}>
              <div className={s['plan-badge']}>Recomendado</div>
              <div>
                <div className={`${s['plan-chip']} ${s['chip-cyan']}`}><span className={s['chip-dot']} />Consult</div>
                <div className={s['plan-name']}>CXRadar Consult</div>
                <div className={s['plan-desc']}>Nossa equipe como extensão da sua operação, da estratégia ao resultado.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>Sob consulta</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(6,182,212,0.5)', marginTop: '4px' }}>Proposta personalizada para o seu volume</div>
              <div className={s['plan-divider']} />
              <div style={{ fontSize: '0.75rem', color: 'rgba(6,182,212,0.7)', fontWeight: 600, marginBottom: '4px' }}>Tudo do Autosserviço, mais:</div>
              <div className={s['plan-items']}>
                {['Gestão de disparos e segmentação', 'Criação e execução de campanhas', 'Relatório executivo + reunião mensal', 'Suporte de até 8h/mês'].map(item => (
                  <div key={item} className={s['plan-item']}>
                    <div className={`${s['pi-check']} ${s['pic-cyan']}`}><svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></div>
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/cadastro" className={s['plan-btn-solid']}>Solicitar proposta →</Link>
            </div>
          </div>
          <p className={s['plans-note']}>Créditos de envio cobrados separadamente conforme o volume utilizado.</p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className={s['cta-section']}>
        <div className={s['cta-inner']}>
          <div className={s['cta-eyebrow']}>Pronto para começar?</div>
          <h2 className={s['cta-h2']}>Cada mês sem dados é um<br />mês reagindo tarde.</h2>
          <p className={s['cta-sub']}>O CXRadar mostra qual cliente precisa de atenção agora, antes que a decisão de cancelar já esteja tomada.</p>
          <div className={s['cta-actions']}>
            <Link href="/cadastro" className={s['btn-cta']}>Criar conta agora →</Link>
            <a href="#como-funciona" className={s['btn-cta-sec']}>Ver como funciona</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={s.footer}>
        <div className={s['footer-grid']}>
          <div>
            <div className={s['footer-logo-name']}>CXRadar</div>
            <div className={s['footer-logo-tag']}>Preditividade como estratégia.</div>
            <p className={s['footer-tagline']}>O radar que identifica clientes em risco antes que eles cancelem.</p>
          </div>
          <div>
            <div className={s['footer-col-title']}>Plataforma</div>
            <div className={s['footer-links']}>
              <a href="#como-funciona">Como funciona</a>
              <a href="#recursos">Recursos</a>
              <a href="#para-quem">Para quem é</a>
            </div>
          </div>
          <div>
            <div className={s['footer-col-title']}>Empresa</div>
            <div className={s['footer-links']}>
              <a href="#">Sobre</a>
              <a href="#">Contato</a>
            </div>
          </div>
          <div>
            <div className={s['footer-col-title']}>Legal</div>
            <div className={s['footer-links']}>
              <a href="#">Política de Privacidade</a>
              <a href="#">Termos de Uso</a>
            </div>
          </div>
          <div>
            <div className={s['footer-col-title']}>Acesso</div>
            <div className={s['footer-links']}>
              <Link href="/login">Entrar</Link>
              <Link href="/cadastro">Criar conta</Link>
              <Link href="/cadastro">Solicitar Demo</Link>
            </div>
          </div>
        </div>
        <div className={s['footer-bottom']}>
          <span className={s['footer-copy']}>© 2026 CXRadar. Todos os direitos reservados.</span>
          <span className={s['footer-copy']}>Preditividade como estratégia.</span>
        </div>
      </footer>
    </div>
  )
}
