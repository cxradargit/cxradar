import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isSuperAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  const allowed = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return allowed.includes(email.toLowerCase())
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isAdmin = isSuperAdminEmail(user?.email)

  // Landing page — pública; redireciona autenticados para o app
  if (pathname === '/') {
    if (user) return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url))
    return supabaseResponse
  }

  // Formulário público de pesquisa
  if (pathname.startsWith('/s/')) {
    return supabaseResponse
  }

  // APIs públicas (não requerem sessão)
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/stripe/webhook') || pathname.startsWith('/api/webhooks/')) {
    return supabaseResponse
  }

  // Rotas de auth: redireciona para o destino correto se já logado
  const authRoutes = ['/login', '/cadastro', '/recuperar-senha', '/nova-senha']
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (user) {
      return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Rotas protegidas: exige sessão
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Super-admin sem empresa: manda para /admin
  if (isAdmin && pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// Next.js 16 alias
export { proxy as middleware }
