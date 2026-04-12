import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

export const maxDuration = 60 // Vercel: allow up to 60s for this route

const SYSTEM_PROMPT = `You are a route generator for driftd, an anti-tourist city exploration app. Your job is to generate walking routes that feel like a local friend showing someone around — not a travel brochure.

KNOWLEDGE BASE RULES — READ CAREFULLY, THESE ARE HARD RULES:
1. For ALL named private businesses (cafés, bars, restaurants, shops, galleries, museums, clubs): they MUST appear in the KNOWLEDGE BASE by name. No exceptions.
2. NEVER invent, guess, or extrapolate a business name. If you're thinking of a place that "probably exists" or "sounds right" — it doesn't count. If it's not in the knowledge base, do not include it.
3. The penalty for a fake business is catastrophic — users show up and it doesn't exist. One bad stop destroys the whole product. It is ALWAYS better to have one fewer stop than one invented stop.
4. If you run short of knowledge-base businesses for the area, fill with: public squares, parks, bridges, canal/riverside walks, specific murals (from knowledge base), courtyards, architectural facades, viewpoints, monuments. These are your fallback — they don't need to be in the knowledge base if you are certain they exist.
5. For murals and street art: only name them if they are described in the knowledge base OR if you are certain of the exact wall/location. "Street art on [street]" is fine. Inventing a mural name is not.
6. Zero tolerance for: invented café names, made-up bar names, closed venues presented as open, businesses moved to wrong neighborhoods.

STOP COUNT & TIME:
4. Generate ENOUGH stops to fill the time. More stops = better drift. Use micro-stops aggressively to pack the route:
   - 10–35 min: 3–4 stops
   - 35–60 min: 5–7 stops
   - 60–90 min: 7–10 stops
   - 90–180 min: 10–15 stops
   - 180–240 min: 15–20 stops
   MAIN STOPS (8–20 min): cafés, bars, galleries, markets — places to linger.
   MICRO-STOPS (2–5 min): murals, courtyards, facades, viewpoints, canal banks — walk past and pause. Use these to fill gaps without long walks.
5. WALKING TIME IS DEAD TIME. Every minute walking is a minute not exploring. Target 4–7 min walks between stops. If a walk is longer than 10 min, you need either a micro-stop in between OR a different stop choice. Walking distances at 83m/min:
   - 300m = 4 min ✓ ideal
   - 500m = 6 min ✓ good
   - 700m = 8 min ⚠ acceptable if scenic
   - 900m = 11 min ✗ too far — find something in between
   - 1200m+ = 15+ min ✗✗ unacceptable — replace the stop
6. TIME BUDGET: sum of all (time_at_stop + walk_to_next) must equal total_minutes ± 5 min. Calculate before finalizing.

NICHE FIRST — THIS IS THE WHOLE POINT OF DRIFTD:
7. The ratio rule: at least 70% of stops must be niche — places most tourists have never heard of. The remaining 30% can include well-known spots if they genuinely fit the vibe, but never make a famous landmark the centrepiece of the route. It's the seasoning, not the main dish.
8. DIG DEEP into the knowledge base. The first place that comes to mind is usually the tourist answer. Read the full knowledge base and prefer entries from deeper in each section. The goal: user shows a local the route and the local says "damn, how did you find that?"
9. Anti-repeat: if the knowledge base has 8 cafés, don't default to the most famous one. Mix it up — pick the lesser-known ones most of the time.
10. When in doubt between a famous spot and a niche one — pick the niche one.

ROUTE GEOMETRY — STOPS MUST BE DENSE, WALKS MUST BE SHORT:
10. ALL stops must cluster tightly. The nearest-neighbor algorithm will reorder them but CANNOT fix stops that are genuinely far apart. If you put a stop 2km away from the cluster, it creates a 24-min walk that kills the vibe. Every stop must be within easy walking distance of every other stop.
11. HARD WALK LIMIT: No walk between adjacent stops should exceed 12 minutes (≈1km). If you can't find a stop within 12 min of the cluster — find a different cluster, not a different stop.
12. FILL TIME WITH STOPS, NOT WALKING: For a 3-hour route, the user wants to VISIT many places, not walk for 40 minutes between two stops. If your time budget has gaps, add more micro-stops (a mural, a courtyard, a canal viewpoint, an interesting facade) — NEVER fill time with long walks. A 25-min walk is a failure. A 5-min walk between two good spots is success.
13. CLUSTER TEST — mandatory before finalizing: pick your tightest stop and your furthest stop. If the straight-line distance between them exceeds 1.2km for a <90min route or 2km for a longer route, you've failed the cluster test. Replace the outlier.
14. RIVER RULE — critical for cities with rivers (Warsaw/Vistula, Prague/Vltava, Berlin/Spree): NEVER place stops on BOTH sides of a major river. Pick one bank and stay on it for the entire route. Crossing a river forces a long detour to a bridge (often 15–25 min of dead walking). If the starting point is on the left bank, every other stop must also be on the left bank. If you can't fill the time on one bank, use more micro-stops — don't cross the river.
14. Stop #2 onward can be in any order — they'll be optimally sorted server-side.
15. If they specified an end point, route toward it. If they gave constraints in notes, follow them strictly.
16. Match vibe tags strictly. "artsy + chill" = cafés, street art, bookshops. No loud bars, no tourist squares.
17. For regeneration: different neighborhood entirely, zero repeated stops.

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
19. Always pick the most obscure version of everything. Don't default to the first stop that comes to mind — that's the tourist answer. One block over. The back entrance. The place with no Instagram presence. If you can imagine it appearing on a travel blog, pick something else.

WRITING STYLE:
20. TAGLINE: 3–6 words, no filler, purely descriptive of what the place IS. Think: how you'd describe it to a friend in a text message. "pre-war milk bar, communist-era" / "converted factory, natural wine" / "rooftop garden, panoramic views" / "19th-century cemetery, atmospheric". Not a sentence — a label.
21. Casual, warm, opinionated. Like texting a friend who grew up there. Use lowercase. Include specific tips (what to order, what time of day, what to look for). Absolutely banned words: "vibrant," "charming," "must-see," "iconic," "hidden gem," "nestled," "quaint," "picturesque." Instead: "this place goes hard," "locals come here to escape," "get the [specific item]," "most people walk straight past this."
22. OUTPUT LENGTH DISCIPLINE — critical for long routes: Every field must be as short as possible while staying useful. Hard limits:
    - description: MAX 2 sentences for any stop, always. One punchy sentence is often better.
    - why_this_spot: MAX 8 words — a tight phrase, not a sentence.
    - walk_note: ONE sentence only. If you can't say it in one sentence, leave it null.
    - tagline: 3–5 words, no more.
    Violating these limits on a long route will cause the output to be cut off. Stay tight.
23. Output MUST be valid JSON in exactly the format below. No prose outside the JSON. No markdown code fences. No commentary.

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
  if (start === -1) throw new Error('No JSON found in response')

  // Walk from the start brace to find the matching closing brace
  // This handles truncated responses — we take the largest valid prefix
  let depth = 0
  let end = -1
  let inStr = false
  let escape = false
  for (let i = start; i < s.length; i++) {
    const c = s[i]
    if (escape) { escape = false; continue }
    if (c === '\\' && inStr) { escape = true; continue }
    if (c === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) { end = i; break } }
  }

  // If we never closed the root object, the response was cut off —
  // try to close it ourselves by trimming to the last complete stop
  if (end === -1) {
    const partial = s.slice(start)
    // Find last complete stop object (ends with "}")
    const lastStop = partial.lastIndexOf('"}')
    if (lastStop === -1) throw new Error('Response was truncated before any complete stop')
    const trimmed = partial.slice(0, lastStop + 2)
    // Close stops array and root object
    const repaired = trimmed + ']}'
    return JSON.parse(repaired)
  }

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
// Strategy: always prefer Nominatim over Claude — Claude's coords are
// unreliable. We try multiple query forms until one hits, then trust it.
// The old "reject if >3km from Claude's coords" check was backwards:
// it threw away the correct Nominatim result when Claude was the one wrong.
async function geocodeStops(stops: any[], city: string): Promise<void> {
  const cc = CITY_COUNTRY[city] ?? ''

  // Build candidate queries from most to least specific.
  // Handles names like "Grébovka (Havlíčkovy sady)" by also trying
  // just "Grébovka" and just "Havlíčkovy sady".
  function queryVariants(stop: any): string[] {
    const variants: string[] = []
    const name: string = stop.name ?? ''

    // Full name
    variants.push(`${name}, ${city}`)

    // Name before first parenthesis  e.g. "Grébovka"
    const beforeParen = name.replace(/\s*\(.*\)/, '').trim()
    if (beforeParen && beforeParen !== name) variants.push(`${beforeParen}, ${city}`)

    // Name inside parentheses  e.g. "Havlíčkovy sady"
    const parenMatch = name.match(/\(([^)]+)\)/)
    if (parenMatch) variants.push(`${parenMatch[1]}, ${city}`)

    // Address
    if (stop.address) variants.push(`${stop.address}, ${city}`)

    // Address alone without city prefix duplicated
    return [...new Set(variants)]
  }

  const work = Promise.allSettled(stops.map(async (stop, idx) => {
    await new Promise(r => setTimeout(r, idx * 80)) // gentle stagger
    try {
      let result: { lat: number; lng: number } | null = null
      for (const q of queryVariants(stop)) {
        result = await nominatim(q, cc)
        if (result) break
      }
      if (!result) return

      // Only sanity-check: reject if result is in a completely different country
      // (>50km from city centre). Never reject just because Claude was wrong.
      const CITY_CENTRES: Record<string, [number, number]> = {
        Warsaw: [52.2297, 21.0122],
        Prague: [50.0755, 14.4378],
        Berlin: [52.5200, 13.4050],
      }
      const centre = CITY_CENTRES[city]
      if (centre) {
        const distFromCity = haversineMeters(result.lat, result.lng, centre[0], centre[1])
        if (distFromCity > 50000) return // clearly wrong country — ignore
      }

      stop.lat = result.lat
      stop.lng = result.lng
    } catch { /* keep existing coords */ }
  }))

  // Hard cap — never block longer than 6s regardless of Nominatim
  await Promise.race([work, new Promise(r => setTimeout(r, 6000))])
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

type WalkLeg = { meters: number; minutes: number }

/* ── Fetch real pedestrian walking distances via OSRM (free) ─────────── */
// Same public OSRM instance used by the client map — no API key, no cost.
// One call covers all stops. Falls back to null on failure; callers then
// use haversine.
async function fetchWalkingLegs(stops: any[]): Promise<WalkLeg[] | null> {
  const pts = stops.filter((s: any) => s.lat && s.lng)
  if (pts.length < 2) return null

  try {
    const coordStr = pts.map((s: any) => `${s.lng},${s.lat}`).join(';')
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${coordStr}?overview=false&steps=false`,
      { signal: AbortSignal.timeout(8000) }
    )
    const data = await res.json()
    const legs: any[] = data?.routes?.[0]?.legs
    if (!legs?.length) return null

    return legs.map((leg: any) => ({
      meters: Math.round(leg.distance ?? 0),
      minutes: Math.max(1, Math.round((leg.duration ?? 0) / 60)),
    }))
  } catch {
    return null
  }
}

/* ── Haversine leg fallback ─────────────────────────────────────────── */
function haversineLeg(s: any, n: any): WalkLeg {
  const meters = Math.round(haversineMeters(s.lat, s.lng, n.lat, n.lng) * 1.35)
  return { meters, minutes: Math.max(1, Math.round(meters / 83)) }
}

/* ── Remove stops that cause excessively long walks ─────────────────── */
// Uses real Google Maps walking times when available — catches river
// crossings and other obstacles haversine cannot see.
// Never removes stop #0 (user's start).
function removeOutlierStops(stops: any[], targetMinutes: number, walkingLegs: WalkLeg[] | null): any[] {
  const MAX_WALK_MIN = 20
  const MIN_STOPS = Math.max(5, Math.floor(targetMinutes / 14))

  // Keep a mutable copy so we can update it as stops are removed
  const legs: WalkLeg[] = walkingLegs
    ? [...walkingLegs]
    : stops.slice(0, -1).map((s, i) =>
        s.lat && s.lng && stops[i + 1]?.lat ? haversineLeg(s, stops[i + 1]) : { meters: 0, minutes: 0 }
      )

  const walkMin = (i: number) => legs[i]?.minutes ?? 0

  let changed = true
  while (changed && stops.length > MIN_STOPS) {
    changed = false
    let worstMin = 0, worstIdx = -1
    for (let i = 0; i < stops.length - 1; i++) {
      const w = walkMin(i)
      if (w > worstMin) { worstMin = w; worstIdx = i }
    }
    if (worstMin > MAX_WALK_MIN && worstIdx + 1 < stops.length && worstIdx + 1 > 0) {
      // Remove the stop and merge the two surrounding legs into one haversine estimate
      stops.splice(worstIdx + 1, 1)
      stops.forEach((s, i) => { s.number = i + 1 })
      const merged = stops[worstIdx]?.lat && stops[worstIdx + 1]?.lat
        ? haversineLeg(stops[worstIdx], stops[worstIdx + 1])
        : { meters: 0, minutes: 0 }
      legs.splice(worstIdx, 2, merged)
      changed = true
    }
  }
  return stops
}

/* ── Replace AI walking estimates with real times, trim stops, fix totals ─ */
function enrichAndAdjust(stops: any[], targetMinutes: number, walkingLegs: WalkLeg[] | null) {
  if (stops.length < 2) return { totalWalkingMinutes: 0, totalWalkingMeters: 0 }

  // ── Step 1: apply walking times (Google Maps if available, else haversine) ──
  const computeWalking = () => {
    let totalWalkingMinutes = 0
    let totalWalkingMeters = 0
    stops.slice(0, -1).forEach((stop, i) => {
      const next = stops[i + 1]
      const leg: WalkLeg = walkingLegs?.[i] ??
        (stop.lat && stop.lng && next.lat && next.lng
          ? haversineLeg(stop, next)
          : { meters: 0, minutes: stop.walk_to_next_minutes ?? 0 })
      stops[i].walk_to_next_minutes = leg.minutes
      stops[i].walk_to_next_meters = leg.meters
      totalWalkingMinutes += leg.minutes
      totalWalkingMeters += leg.meters
    })
    stops[stops.length - 1].walk_to_next_minutes = null
    stops[stops.length - 1].walk_to_next_meters = null
    return { totalWalkingMinutes, totalWalkingMeters }
  }

  let { totalWalkingMinutes, totalWalkingMeters } = computeWalking()

  // ── Step 2: if total walking blows the budget, trim from the end ──
  const minStops = Math.max(3, Math.floor(targetMinutes / 20))
  while (stops.length > minStops) {
    const minNeededForStops = stops.length * 3
    if (totalWalkingMinutes + minNeededForStops <= targetMinutes + 15) break
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

Generate a walking route. Target ${Math.round(minutes / 12)}–${Math.round(minutes / 9)} stops — pack the route, use micro-stops to fill gaps. Output ONLY the JSON.`

  const client = new Anthropic()
  let attempt = 0

  while (attempt < 2) {
    try {
      const model = minutes > 90 ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-6'
      const response = await client.messages.create({
        model,
        max_tokens: 8192,
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

      // Fetch real pedestrian walking distances from Google Maps Routes API.
      // This catches obstacles haversine can't see: rivers, motorways, dead ends.
      const legsBeforePrune = await fetchWalkingLegs(route.stops)

      // Remove outlier stops using real walking times (not straight-line guesses)
      route.stops = removeOutlierStops(route.stops, minutes, legsBeforePrune)

      // Fetch final walking distances for the pruned stop list
      const walkingLegs = await fetchWalkingLegs(route.stops)

      // Apply real walking times, trim if over budget, scale stop times to fill target
      const walking = enrichAndAdjust(route.stops, minutes, walkingLegs)
      route.total_walking_minutes = walking.totalWalkingMinutes
      route.total_walking_meters = walking.totalWalkingMeters

      // Always reflect the true computed total — never trust Claude's guess
      route.total_minutes = route.stops.reduce(
        (sum: number, s: any) => sum + (s.time_at_stop_minutes ?? 0) + (s.walk_to_next_minutes ?? 0), 0
      )

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
