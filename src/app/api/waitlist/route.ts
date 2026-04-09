import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const email = (body.email ?? '').trim().toLowerCase()
  const city = (body.city ?? '').trim().slice(0, 100)

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email address.' }, { status: 400 })
  }

  const supabase = getSupabase()

  if (supabase) {
    const { error } = await supabase
      .from('waitlist')
      .insert({ email, city: city || null })

    if (error) {
      // Duplicate email → treat as success (don't expose internal errors)
      if (error.code !== '23505') {
        console.error('Supabase error:', error)
        return NextResponse.json({ error: 'something went wrong. try again.' }, { status: 500 })
      }
    }
  } else {
    // Supabase not configured — log locally so signups aren't silently lost in dev
    console.log('[waitlist]', { email, city, at: new Date().toISOString() })
  }

  return NextResponse.json({ ok: true })
}
