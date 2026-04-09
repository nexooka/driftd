import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// ---------------------------------------------------------------------------
// Storage backend — swap this function when you're ready to go to production.
// ---------------------------------------------------------------------------

async function storeEmail(email: string): Promise<void> {
  // ── Option A (active): Local JSON file ─────────────────────────────────────
  // Good for local dev. Won't work on Vercel — swap before deploying.
  const filePath = path.join(process.cwd(), 'waitlist.json')
  let entries: { email: string; joinedAt: string }[] = []

  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    entries = JSON.parse(raw)
  } catch {
    // File doesn't exist yet — start fresh
  }

  if (entries.some((e) => e.email === email)) return // already on list

  entries.push({ email, joinedAt: new Date().toISOString() })
  await fs.writeFile(filePath, JSON.stringify(entries, null, 2), 'utf-8')

  // ── Option B (Supabase) ───────────────────────────────────────────────────
  // 1. npm install @supabase/supabase-js
  // 2. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local
  // 3. Uncomment:
  //
  // import { createClient } from '@supabase/supabase-js'
  // const supabase = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.SUPABASE_SERVICE_ROLE_KEY!
  // )
  // await supabase.from('waitlist').upsert({ email }, { onConflict: 'email' })

  // ── Option C (email via Resend) ───────────────────────────────────────────
  // 1. npm install resend
  // 2. Add RESEND_API_KEY to .env.local
  // 3. Uncomment:
  //
  // import { Resend } from 'resend'
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'Drift <noreply@drift.app>',
  //   to: 'you@youremail.com',
  //   subject: `New waitlist signup: ${email}`,
  //   text: `${email} joined the Drift waitlist at ${new Date().toISOString()}`,
  // })
}

// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email ?? '').trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    await storeEmail(email)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[waitlist]', err)
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
