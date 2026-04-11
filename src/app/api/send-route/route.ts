import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function fmtDist(meters: number): string {
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`
}

function buildGoogleMapsUrl(stops: any[]): string {
  const withCoords = stops.filter(s => s.lat && s.lng)
  if (withCoords.length < 2) return ''
  const waypoints = withCoords.map(s => `${s.lat},${s.lng}`).join('/')
  return `https://www.google.com/maps/dir/${waypoints}/`
}

function buildEmailHtml(route: any, googleMapsUrl: string): string {
  const stopsHtml = route.stops.map((stop: any, i: number) => {
    const isLast = i === route.stops.length - 1
    const walkLine = !isLast && stop.walk_to_next_minutes
      ? `<div style="padding:12px 0 0 48px;color:#888;font-size:13px;">
          ↓ ${stop.walk_to_next_minutes} min walk${stop.walk_to_next_meters ? ' · ' + fmtDist(stop.walk_to_next_meters) : ''}
          ${stop.walk_note ? `<br/><em style="color:#666;">${stop.walk_note}</em>` : ''}
         </div>`
      : ''
    return `
      <div style="margin-bottom:4px;padding:20px 24px;background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;">
        <div style="display:flex;align-items:flex-start;gap:14px;">
          <div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;background:#fbbf24;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#0a0a0a;text-align:center;line-height:32px;">
            ${stop.number}
          </div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:16px;color:#f5f5f0;margin-bottom:2px;">${stop.name}</div>
            ${stop.tagline ? `<div style="color:#fbbf24;font-size:12px;margin-bottom:6px;opacity:0.8;">${stop.tagline}</div>` : ''}
            ${stop.address ? `<div style="color:#555;font-size:12px;margin-bottom:8px;">📍 ${stop.address}</div>` : ''}
            <div style="color:#aaa;font-size:13px;line-height:1.6;">${stop.description}</div>
            <div style="color:#777;font-size:12px;font-style:italic;margin-top:6px;">${stop.why_this_spot}</div>
            ${stop.time_at_stop_minutes ? `<div style="color:#555;font-size:11px;margin-top:8px;">~${stop.time_at_stop_minutes} min here</div>` : ''}
          </div>
        </div>
      </div>
      ${walkLine}
    `
  }).join('')

  const mapsButton = googleMapsUrl
    ? `<div style="text-align:center;margin:28px 0;">
        <a href="${googleMapsUrl}" target="_blank"
           style="display:inline-block;background:#fbbf24;color:#0a0a0a;font-weight:700;font-size:14px;padding:14px 28px;border-radius:100px;text-decoration:none;letter-spacing:0.02em;">
          open in google maps →
        </a>
       </div>`
    : ''

  const vibesStr = route.vibes?.join(', ') ?? ''
  const totalMin = route.total_minutes ?? ''
  const stopsCount = route.stops?.length ?? 0

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:36px;">
      <div style="font-size:28px;font-weight:900;color:#fbbf24;font-style:italic;letter-spacing:-0.02em;margin-bottom:4px;">driftd</div>
      <div style="color:#555;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">your drift through ${route.city?.toLowerCase() ?? ''}</div>
    </div>

    <!-- Meta -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
      ${route.vibes?.map((v: string) => `<span style="background:#1a1a1a;border:1px solid #2a2a2a;color:#aaa;font-size:11px;padding:4px 10px;border-radius:100px;">${v}</span>`).join('') ?? ''}
      <span style="background:#1a1a1a;border:1px solid #2a2a2a;color:#aaa;font-size:11px;padding:4px 10px;border-radius:100px;">${totalMin} min</span>
      <span style="background:#1a1a1a;border:1px solid #2a2a2a;color:#aaa;font-size:11px;padding:4px 10px;border-radius:100px;">${stopsCount} stops</span>
    </div>

    <!-- Intro -->
    <div style="background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:20px 24px;margin-bottom:24px;color:#ccc;font-size:14px;line-height:1.7;">
      ${route.intro ?? ''}
    </div>

    ${mapsButton}

    <!-- Stops -->
    <div>${stopsHtml}</div>

    ${mapsButton}

    <!-- Footer -->
    <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #1a1a1a;">
      <p style="color:#444;font-size:12px;line-height:1.6;">
        sent with ♥ by <strong style="color:#666;">driftd</strong> — anti-tourist city exploration<br/>
        <a href="https://driftd.world" style="color:#fbbf24;text-decoration:none;">driftd.world</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const { email, route } = await req.json()

  if (!email || !route)
    return NextResponse.json({ error: 'email and route required.' }, { status: 400 })

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: 'invalid email.' }, { status: 400 })

  const googleMapsUrl = buildGoogleMapsUrl(route.stops ?? [])
  const html = buildEmailHtml(route, googleMapsUrl)

  try {
    await resend.emails.send({
      from: 'driftd <hello@driftd.world>',
      to: email,
      subject: `your drift through ${route.city?.toLowerCase() ?? 'the city'} 🗺`,
      html,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('send-route email error:', msg)
    return NextResponse.json({ error: 'failed to send email.' }, { status: 500 })
  }
}
