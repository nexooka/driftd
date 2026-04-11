import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 15

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')
  const lat  = searchParams.get('lat')
  const lng  = searchParams.get('lng')

  const key = process.env.NEXT_PUBLIC_GOOGLE_STREET_VIEW_KEY
  if (!key || !name || !lat || !lng) return new NextResponse(null, { status: 400 })

  try {
    // ── Step 1: find the place via Places API (New) text search ──────────
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.photos',
      },
      body: JSON.stringify({
        textQuery: name,
        maxResultCount: 1,
        locationBias: {
          circle: {
            center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
            radius: 300,
          },
        },
      }),
    })

    const searchData = await searchRes.json()
    const photoName = searchData?.places?.[0]?.photos?.[0]?.name
    if (!photoName) return new NextResponse(null, { status: 404 })

    // ── Step 2: get the photo URI ─────────────────────────────────────────
    const mediaRes = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${key}`
    )
    const mediaData = await mediaRes.json()
    const photoUri = mediaData?.photoUri
    if (!photoUri) return new NextResponse(null, { status: 404 })

    // ── Step 3: proxy the actual image bytes ──────────────────────────────
    const imgRes = await fetch(photoUri)
    if (!imgRes.ok) return new NextResponse(null, { status: 404 })

    const buffer = await imgRes.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': imgRes.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}
