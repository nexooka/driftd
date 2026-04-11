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
  const totalMin = route.total_minutes ?? ''
  const stopsCount = route.stops?.length ?? 0

  const vibesHtml = (route.vibes ?? []).map((v: string) =>
    `<span style="display:inline-block;background:#1e1e1e;border:1px solid #2e2e2e;color:#999;font-size:11px;padding:3px 10px;border-radius:100px;margin:2px 3px 2px 0;font-family:'DM Sans',Arial,sans-serif;">${v}</span>`
  ).join('')

  const stopsHtml = route.stops.map((stop: any, i: number) => {
    const isLast = i === route.stops.length - 1
    const walkHtml = !isLast && stop.walk_to_next_minutes
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0;">
           <tr>
             <td style="padding:10px 16px;color:#666;font-size:12px;font-family:'DM Sans',Arial,sans-serif;line-height:1.5;">
               &#8595;&nbsp; ${stop.walk_to_next_minutes} min walk${stop.walk_to_next_meters ? ' &middot; ' + fmtDist(stop.walk_to_next_meters) : ''}
               ${stop.walk_note ? `<br/><span style="color:#555;font-style:italic;">${stop.walk_note}</span>` : ''}
             </td>
           </tr>
         </table>`
      : ''

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
        <tr>
          <td style="background:#161616;border:1px solid #242424;border-radius:12px;padding:20px 22px;">

            <!-- Stop number + name row -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="32" valign="top" style="padding-right:14px;">
                  <div style="width:28px;height:28px;background:#fbbf24;border-radius:50%;text-align:center;line-height:28px;font-size:12px;font-weight:800;color:#0a0a0a;font-family:'DM Sans',Arial,sans-serif;">${stop.number}</div>
                </td>
                <td valign="top">
                  <div style="font-family:'Playfair Display',Georgia,serif;font-size:17px;font-weight:700;color:#f0ece4;margin-bottom:2px;">${stop.name}</div>
                  ${stop.tagline ? `<div style="color:#c8922a;font-size:11px;font-family:'DM Sans',Arial,sans-serif;letter-spacing:0.04em;margin-bottom:6px;">${stop.tagline}</div>` : ''}
                  ${stop.address && stop.time_at_stop_minutes !== 0 ? `<div style="color:#4a4a4a;font-size:11px;font-family:'DM Sans',Arial,sans-serif;margin-bottom:10px;">&#128205; ${stop.address}</div>` : ''}
                  ${stop.time_at_stop_minutes > 0 ? `<div style="color:#aaa;font-size:13px;font-family:'DM Sans',Arial,sans-serif;line-height:1.65;margin-bottom:8px;">${stop.description}</div>` : ''}
                  ${stop.time_at_stop_minutes > 0 && stop.why_this_spot ? `<div style="color:#666;font-size:12px;font-style:italic;font-family:'DM Sans',Arial,sans-serif;">${stop.why_this_spot}</div>` : ''}
                  ${stop.time_at_stop_minutes > 0 ? `<div style="color:#3a3a3a;font-size:10px;font-family:'DM Sans',Arial,sans-serif;margin-top:8px;">~${stop.time_at_stop_minutes} min here</div>` : ''}
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
      ${walkHtml}
    `
  }).join('')

  const mapsButton = googleMapsUrl
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
         <tr>
           <td align="center">
             <a href="${googleMapsUrl}" target="_blank"
                style="display:inline-block;background:#fbbf24;color:#0a0a0a;font-weight:700;font-size:13px;padding:13px 28px;border-radius:100px;text-decoration:none;letter-spacing:0.03em;font-family:'DM Sans',Arial,sans-serif;">
               open in google maps &#8594;
             </a>
           </td>
         </tr>
       </table>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;padding:40px 24px;">

        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom:8px;">
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:36px;font-weight:900;font-style:italic;color:#fbbf24;letter-spacing:-0.02em;">driftd</div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <div style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#444;">your drift through ${route.city?.toLowerCase() ?? ''}</div>
          </td>
        </tr>

        <!-- Vibes + stats -->
        <tr>
          <td style="padding-bottom:16px;">
            ${vibesHtml}
            <span style="display:inline-block;background:#1e1e1e;border:1px solid #2e2e2e;color:#999;font-size:11px;padding:3px 10px;border-radius:100px;margin:2px 3px 2px 0;font-family:'DM Sans',Arial,sans-serif;">${totalMin} min</span>
            <span style="display:inline-block;background:#1e1e1e;border:1px solid #2e2e2e;color:#999;font-size:11px;padding:3px 10px;border-radius:100px;margin:2px 0;font-family:'DM Sans',Arial,sans-serif;">${stopsCount} stops</span>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding-bottom:24px;">
            <div style="background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:20px 22px;color:#bbb;font-size:14px;line-height:1.75;font-family:'DM Sans',Arial,sans-serif;font-weight:300;">
              ${route.intro ?? ''}
            </div>
          </td>
        </tr>

        <!-- Maps button -->
        <tr><td>${mapsButton}</td></tr>

        <!-- Stops -->
        <tr>
          <td style="padding-bottom:8px;">
            ${stopsHtml}
          </td>
        </tr>

        <!-- Maps button (repeat at bottom) -->
        <tr><td>${mapsButton}</td></tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:32px;border-top:1px solid #1a1a1a;">
            <div style="color:#3a3a3a;font-size:12px;line-height:1.7;font-family:'DM Sans',Arial,sans-serif;">
              anti-tourist city exploration &mdash;
              <a href="https://driftd.world" style="color:#fbbf24;text-decoration:none;">driftd.world</a>
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
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
