import { NextRequest, NextResponse } from 'next/server'

// Storage is disabled for now — swap in Supabase or Resend when ready.
// See git history for the local JSON file implementation.

export async function POST(req: NextRequest) {
  const body = await req.json()
  const email = (body.email ?? '').trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  // TODO: save email to Supabase / Resend / etc.

  return NextResponse.json({ ok: true })
}
