import { RateLimiterMemory } from 'rate-limiter-flexible'
import { NextRequest, NextResponse } from 'next/server'

// 5 cadastros por IP por hora
const cadastroLimiter = new RateLimiterMemory({ points: 5, duration: 3600 })

// 20 respostas por IP por 10 minutos
const respondLimiter = new RateLimiterMemory({ points: 20, duration: 600 })

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function limitCadastro(req: NextRequest): Promise<NextResponse | null> {
  try {
    await cadastroLimiter.consume(getIp(req))
    return null
  } catch {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em uma hora.' },
      { status: 429 }
    )
  }
}

export async function limitRespond(req: NextRequest): Promise<NextResponse | null> {
  try {
    await respondLimiter.consume(getIp(req))
    return null
  } catch {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      { status: 429 }
    )
  }
}
