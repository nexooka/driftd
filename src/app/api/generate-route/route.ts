import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const SYSTEM_PROMPT = `You are a route generator for driftd, an anti-tourist city exploration app. Your job is to generate walking routes that feel like a local friend showing someone around — not a travel brochure.

KNOWLEDGE BASE RULES:
1. Use the KNOWLEDGE BASE as your PRIMARY source. Every named business (café, bar, restaurant, shop, gallery, museum) MUST either be in the knowledge base, or be a well-established institution you are 100% certain exists at the location you state.
2. NEVER invent business names. If a café or bar is not in the knowledge base and you have any doubt it exists, replace it with one that IS in the knowledge base. Wrong business names destroy trust and embarrass the product.
3. You MAY supplement with spots from your training knowledge ONLY for: outdoor public spaces (squares, parks, bridges, viewpoints), architecture (buildings, facades, courtyards), street art/murals, and monuments. For these, only include if you are certain they exist. Do not invent addresses.
4. When using training knowledge for any private business, apply maximum scrutiny. If there is even a 10% chance the name is wrong or the place closed, skip it and use the knowledge base instead.

STOP COUNT & TIME:
4. Generate ENOUGH stops to fill the time — but NEVER too many:
   - 20–35 min: 3–4 stops
   - 35–60 min: 4–6 stops
   - 60–90 min: 6–9 stops
   - 90–180 min: 9–14 stops
   Include a mix of MAIN STOPS (8–15 min) and MICRO-STOPS (2–4 min — a mural, a courtyard, an interesting facade). Micro-stops are walk-past-and-pause, not sit-down.
5. GEOGRAPHIC DISTANCE IS CRITICAL. Your walk_to_next_minutes estimates will be REPLACED by real haversine calculations (at 83m/min walking pace). What matters is actual geographic distance between stop coordinates:
   - 300m apart = ~5 min walk ✓ good
   - 500m apart = ~8 min walk ✓ acceptable
   - 800m apart = ~13 min walk ⚠ use only if the walk itself is interesting
   - 1000m+ apart = ~20+ min walk ✗ too far for a tight route
   For a 50-min route: all stops must cluster within a ~600m radius. For a 90-min route: ~1km radius. Do not scatter stops across a neighborhood — keep them walkable from each other.
6. TIME BUDGET: sum of all (time_at_stop + walk_to_next) must equal total_minutes ± 5 min. Do the math: if you have 5 stops averaging 6 min at each and 5-min walks between, that's (5×6) + (4×5) = 50 min. Calculate before finalizing.

LOWKEY BIAS:
7. Actively avoid the top tourist attractions. If a place appears in every "top 10" listicle, skip it UNLESS the user explicitly asked for 'historic' AND it's genuinely unmissable. Prefer: independent cafés nobody's heard of, local bars, lesser-known street art, residential courtyards, neighborhood squares, canal/riverside spots, bookshops, vinyl shops, anything that makes the user feel like an insider.
8. When the user says a short time (e.g. 24 or 45 min), pick a TIGHT GEOGRAPHIC AREA — one or two adjacent neighborhoods. Don't spread the route across the whole city.

ROUTE GEOMETRY — TIGHT CLUSTER, NO BACKTRACKING:
9. All stops must be geographically clustered — they will be reordered server-side using a nearest-neighbor algorithm. Your job is to pick stops that are ALL CLOSE TO EACH OTHER, not to order them perfectly. Focus on geographic density, not sequence.
10. CLUSTER TEST: Draw a bounding box around all your stops. For a 60-min route it should be no bigger than ~1km × 1km. For 120 min, ~1.5km × 1.5km. If any stop falls outside that box, replace it with something closer.
11. NEVER place a stop far away just because it's interesting — if it's more than 15 min walk from the cluster, skip it. The walk to and from kills the time budget.
12. Stop #2 onward can be in any order — they'll be optimally sorted server-side.
13. If they specified an end point, route toward it as a straight shot. If they gave constraints in notes, follow them strictly.
14. Match vibe tags. If they said "artsy + chill" — no loud bars, lots of cafés and street art.
15. For regeneration requests: pick a completely different neighborhood or angle. Never repeat previous stops.

STARTING POINT — THIS IS NON-NEGOTIABLE:
16. Stop #1 MUST be the user's EXACT starting address — not a café near it, not an attraction nearby, not somewhere "close". The literal address or location the user typed. If they typed their home address, stop #1 IS their home. If they typed a street corner, stop #1 IS that corner.
   - name: use the address as-is, or a clean label like "Balbinowa 39" or "Warschauer Str. / Revaler Str."
   - address: copy the user's starting address exactly
   - lat/lng: use the geocoded coordinates provided below EXACTLY — copy-paste them, do not round or adjust
   - tagline: "your starting point"
   - description: one sentence — where the drift kicks off from, what the immediate surroundings feel like
   - time_at_stop_minutes: 0
   The interesting stops begin at stop #2. Stop #1 is purely the departure point.

COORDINATES & ADDRESSES:
17. Provide accurate latitude and longitude for each stop. These will be plotted on a real map. Be precise — wrong coordinates will put stops in the wrong location.
18. Include a real street address for each stop. Format: "ul. Ząbkowska 6" (Warsaw), "Eisenbahnstraße 42" (Berlin), "Mánesova 13" (Prague). If you're not confident in the exact house number, give the street name and neighborhood.

WALK NOTES:
19. When a walk between stops is longer (roughly 7+ minutes), add a "walk_note" field: one casual sentence describing what the walk is like and why it's worth it. Make it feel like a tip from a friend: what to notice, what the street feels like, anything interesting along the way. Example: "the walk takes you along the canal past a row of old boat sheds — it's a nice transition." For short walks, leave walk_note as null.

NICHE FIRST:
19. Always prefer the most niche, least-known version of a neighborhood. Don't default to the famous streets — pick the streets one block over that only locals know. Think: the back entrance, the adjacent courtyard, the street that runs parallel to the obvious one.

WRITING STYLE:
20. TAGLINE: 3–6 words, no filler, purely descriptive of what the place IS. Think: how you'd describe it to a friend in a text message. "pre-war milk bar, communist-era" / "converted factory, natural wine" / "rooftop garden, panoramic views" / "19th-century cemetery, atmospheric". Not a sentence — a label.
21. Casual, warm, opinionated. Like texting a friend who grew up there. Use lowercase. Include specific tips (what to order, what time of day, what to look for). Absolutely banned words: "vibrant," "charming," "must-see," "iconic," "hidden gem," "nestled," "quaint," "picturesque." Instead: "this place goes hard," "locals come here to escape," "get the [specific item]," "most people walk straight past this."
21. Output MUST be valid JSON in exactly the format below. No prose outside the JSON. No markdown code fences. No commentary.

OUTPUT FORMAT — return exactly this JSON, nothing else:
{
  "city": "Warsaw",
  "intro": "2–3 sentence personal intro. mention the specific neighborhood(s) and why this angle works for their vibe and time. NEVER reference specific stop numbers or stop names — the route may be adjusted after generation.",
  "total_minutes": 45,
  "vibes": ["artsy", "chill"],
  "stops": [
    {
      "number": 1,
      "name": "exact place name",
      "neighborhood": "neighborhood name",
      "address": "ul. Ząbkowska 6",
      "lat": 52.2345,
      "lng": 21.0123,
      "tagline": "3–6 words. what type of place it is. punchy, factual. e.g. 'pre-war milk bar, communist-era' or 'rooftop bar, panoramic views' or 'natural wine warehouse, locals only'",
      "description": "2–4 sentences. what it is, what to do, specific tips.",
      "why_this_spot": "one line — how it fits the vibe",
      "walk_to_next_minutes": 5,
      "walk_note": null,
      "time_at_stop_minutes": 8
    }
  ],
  "time_warning": null
}

time_warning rules: set to null in most cases. Only use it when the route genuinely cannot fit within the time limit even after trimming — and if so, write ONE casual sentence max (e.g. "this one runs slightly long — if you're short on time, cut the visit at the park"). NO math, NO stop numbers, NO lists.`

function parseRoute(text: string) {
  let s = text.trim()
  s = s.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '')
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON found in response')
  return JSON.parse(s.slice(start, end + 1))
}

const CITY_COUNTRY: Record<string, string> = { Warsaw: 'pl', Berlin: 'de', Prague: 'cz' }

/* ── Nominatim lookup (shared helper) ───────────────────────────────── */
async function nominatim(q: string, countryCode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1${countryCode ? `&countrycodes=${countryCode}` : ''}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'driftd/1.0 (route generator)' },
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    if (!data?.[0]) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

/* ── Geocode each stop to fix AI-hallucinated coordinates ───────────── */
// Fire all stops in parallel, cap the entire operation at 4s so it can
// never block the response even if Nominatim is slow or rate-limiting.
async function geocodeStops(stops: any[], city: string): Promise<void> {
  const cc = CITY_COUNTRY[city] ?? ''

  const work = Promise.allSettled(stops.map(async (stop, idx) => {
    await new Promise(r => setTimeout(r, idx * 60)) // gentle stagger
    try {
      let result = await nominatim(`${stop.name}, ${city}`, cc)
      if (!result && stop.address) result = await nominatim(`${stop.address}, ${city}`, cc)
      if (!result) return
      if (stop.lat && stop.lng) {
        const dist = haversineMeters(stop.lat, stop.lng, result.lat, result.lng)
        if (dist > 3000) return // reject wrong-city match
      }
      stop.lat = result.lat
      stop.lng = result.lng
    } catch { /* keep existing coords */ }
  }))

  // Hard cap — never block longer than 4s regardless of Nominatim
  await Promise.race([work, new Promise(r => setTimeout(r, 4000))])
}

/* ── Geocode starting address via Nominatim ──────────────────────────── */
async function geocodeStart(address: string, city: string): Promise<{ lat: number; lng: number } | null> {
  return nominatim(`${address}, ${city}`, CITY_COUNTRY[city] ?? '')
}

/* ── Haversine distance ──────────────────────────────────────────────── */
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/* ── Replace AI walking estimates with haversine, trim stops, fix totals ─ */
function enrichAndAdjust(stops: any[], targetMinutes: number) {
  if (stops.length < 2) return { totalWalkingMinutes: 0, totalWalkingMeters: 0 }

  // ── Step 1: compute real walking times via haversine ──
  const computeWalking = () => {
    let totalWalkingMinutes = 0
    let totalWalkingMeters = 0
    stops.slice(0, -1).forEach((stop, i) => {
      const next = stops[i + 1]
      if (stop.lat && stop.lng && next.lat && next.lng) {
        const meters = Math.round(haversineMeters(stop.lat, stop.lng, next.lat, next.lng) * 1.35)
        const minutes = Math.max(1, Math.round(meters / 83))
        stops[i].walk_to_next_minutes = minutes
        stops[i].walk_to_next_meters = meters
        totalWalkingMinutes += minutes
        totalWalkingMeters += meters
      } else {
        totalWalkingMinutes += stops[i].walk_to_next_minutes ?? 0
      }
    })
    stops[stops.length - 1].walk_to_next_minutes = null
    stops[stops.length - 1].walk_to_next_meters = null
    return { totalWalkingMinutes, totalWalkingMeters }
  }

  let { totalWalkingMinutes, totalWalkingMeters } = computeWalking()

  // ── Step 2: trim stops from the end until walking fits ──
  // Each stop needs at least 3 min. If walking alone leaves < 3 min/stop, trim.
  while (stops.length > 3) {
    const minNeededForStops = stops.length * 3
    if (totalWalkingMinutes + minNeededForStops <= targetMinutes + 10) break
    // Remove last stop and the walk leading to it
    const trimmedWalk = stops[stops.length - 2].walk_to_next_minutes ?? 0
    const trimmedMeters = stops[stops.length - 2].walk_to_next_meters ?? 0
    stops.pop()
    stops[stops.length - 1].walk_to_next_minutes = null
    stops[stops.length - 1].walk_to_next_meters = null
    totalWalkingMinutes -= trimmedWalk
    totalWalkingMeters -= trimmedMeters
  }

  // ── Step 3: scale time_at_stop_minutes to fill remaining time ──
  const totalAtStops = stops.reduce((s, st) => s + (st.time_at_stop_minutes ?? 8), 0)
  const remaining = Math.max(stops.length * 3, targetMinutes - totalWalkingMinutes)
  if (Math.abs(totalAtStops - remaining) > 5) {
    const scale = remaining / totalAtStops
    stops.forEach(st => {
      st.time_at_stop_minutes = Math.max(3, Math.round((st.time_at_stop_minutes ?? 8) * scale))
    })
  }

  return { totalWalkingMinutes, totalWalkingMeters }
}

/* ── Nearest-neighbor reorder (greedy TSP, O(n²)) ───────────────────── */
// Keeps stop[0] fixed (user's starting location), reorders the rest so
// total walking distance is minimised — eliminates backtracking.
function reorderStops(stops: any[]): any[] {
  if (stops.length <= 2) return stops

  const withCoords = (s: any) => s.lat && s.lng

  const result: any[] = [stops[0]] // starting stop is always fixed
  const pool: any[] = stops.slice(1)

  while (pool.length > 0) {
    const cur = result[result.length - 1]
    if (!withCoords(cur)) {
      result.push(...pool.splice(0, 1))
      continue
    }

    // Find closest unvisited stop to current position
    let bestIdx = 0
    let bestDist = Infinity
    pool.forEach((s, i) => {
      if (!withCoords(s)) return
      const d = haversineMeters(cur.lat, cur.lng, s.lat, s.lng)
      if (d < bestDist) { bestDist = d; bestIdx = i }
    })

    result.push(...pool.splice(bestIdx, 1))
  }

  // Renumber (keep walk_notes — they describe area vibe, not turn-by-turn)
  result.forEach((s, i) => {
    s.number = i + 1
  })

  return result
}

export async function POST(req: NextRequest) {
  const { city, vibes, minutes, start, end, notes, previousStops = [] } = await req.json()

  if (!city || !['Warsaw', 'Berlin', 'Prague'].includes(city))
    return NextResponse.json({ error: 'invalid city.' }, { status: 400 })
  if (!vibes?.length)
    return NextResponse.json({ error: 'pick at least one vibe.' }, { status: 400 })
  if (!start?.trim())
    return NextResponse.json({ error: 'starting point required.' }, { status: 400 })

  // Load knowledge file
  const knowledgePath = path.join(process.cwd(), 'data', `${city.toLowerCase()}_knowledge.md`)
  let knowledge: string
  try {
    knowledge = fs.readFileSync(knowledgePath, 'utf-8')
  } catch {
    return NextResponse.json({ error: `knowledge file for ${city} not found.` }, { status: 500 })
  }

  // Geocode starting address for precision
  const startCoords = await geocodeStart(start, city)
  const startCoordsNote = startCoords
    ? `- Starting coordinates (geocoded): lat ${startCoords.lat.toFixed(6)}, lng ${startCoords.lng.toFixed(6)}\n  ↳ Stop #1 MUST be placed at EXACTLY these coordinates (or within 50m). This is non-negotiable.`
    : ''

  const isDriftAgain = previousStops.length > 0
  const avoidNote = isDriftAgain
    ? `\nREGENERATION — user has seen this route. AVOID THESE STOPS ENTIRELY: ${previousStops.join(', ')}. Choose a different neighborhood or angle.`
    : ''

  const userPrompt = `KNOWLEDGE BASE FOR ${city.toUpperCase()}:
${knowledge}

USER REQUEST:
- City: ${city}
- Vibes: ${vibes.join(', ')}
- Time available: ${minutes} minutes (HARD LIMIT — your route must fit within this time)
- Starting from: ${start}
${startCoordsNote}
- Needs to end at: ${end?.trim() || 'anywhere — drift wherever'}
- Extra notes: ${notes?.trim() || 'none'}
${avoidNote}

Generate a walking route. Aim for ${Math.round(minutes / 8)} stops minimum. Output ONLY the JSON.`

  const client = new Anthropic()
  let attempt = 0

  while (attempt < 2) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 6000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      })
      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const route = parseRoute(text)

      // ── ENFORCE stop #1 = user's exact starting location ──────────────
      // Claude is instructed to do this, but we enforce it server-side so
      // it is IMPOSSIBLE for stop #1 to be somewhere the user didn't type.
      if (route.stops?.length > 0) {
        const s0 = route.stops[0]
        s0.address = start
        s0.time_at_stop_minutes = 0
        if (startCoords) {
          s0.lat = startCoords.lat
          s0.lng = startCoords.lng
        }
      }

      // Reorder stops into shortest-path order (nearest-neighbor from start)
      route.stops = reorderStops(route.stops)

      // Fix AI-hallucinated coordinates with real Nominatim geocoding
      // Skip stop #1 — its coordinates are already locked to the user's input
      await geocodeStops(route.stops.slice(1), city)

      // Replace AI walking guesses with haversine, trim if needed, scale to target
      const walking = enrichAndAdjust(route.stops, minutes)
      route.total_walking_minutes = walking.totalWalkingMinutes
      route.total_walking_meters = walking.totalWalkingMeters

      return NextResponse.json(route)
    } catch (err) {
      attempt++
      console.error(`Route generation attempt ${attempt} failed:`, err)
      if (attempt >= 2) {
        const msg = err instanceof Error ? err.message : String(err)
        return NextResponse.json(
          { error: "the drift isn't working right now. try again in a moment.", _debug: msg },
          { status: 500 }
        )
      }
    }
  }
}
