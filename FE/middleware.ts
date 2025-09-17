// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const config = {
  // log everything except static assets and Next internals
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)'],
}

export function middleware(req: NextRequest) {
  const now = new Date().toISOString() // current date/time in ISO format
  console.log(`[${now}] Request: ${req.method} ${req.nextUrl.pathname}${req.nextUrl.search}`)
  return NextResponse.next()
}
