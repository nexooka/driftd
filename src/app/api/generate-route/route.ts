import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

export const maxDuration = 60 // Vercel Hobby max

const SYSTEM_PROMPT = `You are a route generator for driftd, an anti-tourist city exploration app. Your job is to generate walking routes that feel like a local friend showing someone around — not a travel brochure.

KNOWLEDGE BASE RULES — READ CAREFULLY, THESE ARE HARD RULES:
1. For ALL named private businesses (cafés, bars, restaurants, shops, galleries, museums, clubs): they MUST appear in the KNOWLEDGE BASE by name. No exceptions.
2. NEVER invent, guess, or extrapolate a business name. If you're thinking of a place that "probably exists" or "sounds right" — it doesn't count. If it's not in the knowledge base, do not include it.
3. The penalty for a fake business is catastrophic — users show up and it doesn't exist. One bad stop destroys the whole product. It is ALWAYS better to have one fewer stop than one invented stop.
4. If you run short of knowledge-base businesses for the area, fill with: public squares, parks, bridges, canal/riverside walks, specific murals (from knowledge base), courtyards, architectural facades, viewpoints, monuments. These are your fallback — they don't need to be in the knowledge base if you are certain they exist.
5. For murals and street art: only name them if they are described in the knowledge base OR if you are certain of the exact wall/location. "Street art on [street]" is fine. Inventing a mural name is not.
6. Zero tolerance for: invented café names, made-up bar names, closed venues presented as open, businesses moved to wrong neighborhoods.

STOP COUNT & TIME:
4. Generate ENOUGH stops to fill the time. More stops = better drift. Use micro-stops aggressively to pack the route. These are MINIMUM counts — going over is always better than going under:
   - 10–35 min: 4–5 stops minimum
   - 35–60 min: 6–8 stops minimum
   - 60–90 min: 9–12 stops minimum
   - 90–120 min: 11–14 stops minimum
   - 120–180 min: 14–18 stops minimum
   - 180–240 min: 18–22 stops minimum
   MAIN STOPS (8–20 min): cafés, bars, galleries, markets — places to linger.
   MICRO-STOPS (2–5 min): murals, courtyards, facades, viewpoints, canal banks, interesting corners — walk past and pause. A micro-stop adds almost no time but makes the route feel rich. Use them liberally between main stops.
   CRITICAL: a 100-minute route with 5 stops is a failure. That's 20 minutes per stop with long boring walks. A 100-minute route should have 11–14 stops — a mix of main stops and micro-stops, each adding texture without eating the whole time budget.
5. WALKING TIME IS DEAD TIME. Every minute walking is a minute not exploring. Target 4–6 min walks between stops. Keep stops close — straight-line distances between adjacent stops:
   - 250m = ~4 min ✓ ideal
   - 400m = ~6 min ✓ good
   - 550m = ~9 min ⚠ max acceptable
   - 750m+ = ~13+ min ✗ too far — add a micro-stop between them
   - 1000m+ = 18+ min ✗✗ unacceptable — kill the stop entirely
6. TIME BUDGET: walking times are recalculated server-side using OSRM real street routing — your walk_to_next_minutes numbers are completely ignored and overwritten. Real routes are often 40–80% longer than straight line due to bridges, parks, and dead ends. So the ONLY thing that matters is that your stops are CLOSE TOGETHER on the map. Any stop whose OSRM leg exceeds 13 minutes will be automatically cut. Keep adjacent stops under 550m straight-line to guarantee they survive.
7. ROUTE SHAPE — forward momentum is everything: the route should draw a clean arc or loop through the neighborhood, not zigzag back and forth. Imagine the path on a map — a viewer should be able to trace it without backtracking. Group stops that are in the same block or pocket. If you find yourself placing stop 8 near where stop 3 was, you have a zigzag problem — replace that stop with something further along the natural flow.

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
14. Stop #2 onward can be in any order — they'll be optimally sorted server-side. However: think spatially. Group stops that are on the same block or in the same pocket. A route that zigzags back and forth across the same 200m stretch looks terrible. Imagine drawing the route on a map — it should have forward momentum, moving through a neighborhood, not bouncing around it.
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

WALK NOTES — MANDATORY RULE:
19. Any walk of 6 minutes or longer MUST have a walk_note. No exceptions. One casual sentence: what the walk feels like, what to notice on the way, why it's worth it. Make it feel like a tip from a friend — not a navigation instruction. "the walk takes you along the canal past a row of old boat sheds — it's a nice transition." For walks under 6 minutes, leave walk_note as null. Failing to include a walk_note on a long walk is a content error.

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

const CITY_COUNTRY: Record<string, string> = { Warsaw: 'pl', Berlin: 'de', Prague: 'cz', 'New York': 'us' }

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
        'New York': [40.7128, -74.0060],
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

/* ── Haversine walking leg estimate (fallback) ───────────────────────── */
// 1.4 = straight-line → road-distance correction (urban grid + detours).
// 75 m/min = 4.5 km/h — realistic walking pace including crossings/lights.
function walkLeg(s: any, n: any): { meters: number; minutes: number } {
  const meters = Math.round(haversineMeters(s.lat, s.lng, n.lat, n.lng) * 1.4)
  return { meters, minutes: Math.max(1, Math.round(meters / 75)) }
}

/* ── Remove stops that cause excessively long walks ─────────────────── */
// Never removes stop #0 (user's start). Keeps at least minutes/10 stops.
function removeOutlierStops(stops: any[], targetMinutes: number): any[] {
  const MAX_WALK_MIN = 22
  const MIN_STOPS = Math.max(5, Math.floor(targetMinutes / 10))

  const walkMin = (i: number) => {
    const s = stops[i], n = stops[i + 1]
    if (!s?.lat || !s?.lng || !n?.lat || !n?.lng) return 0
    return walkLeg(s, n).minutes
  }

  let changed = true
  while (changed && stops.length > MIN_STOPS) {
    changed = false
    let worstMin = 0, worstIdx = -1
    for (let i = 0; i < stops.length - 1; i++) {
      const w = walkMin(i)
      if (w > worstMin) { worstMin = w; worstIdx = i }
    }
    if (worstMin > MAX_WALK_MIN && worstIdx + 1 < stops.length && worstIdx + 1 > 0) {
      stops.splice(worstIdx + 1, 1)
      stops.forEach((s, i) => { s.number = i + 1 })
      changed = true
    }
  }
  return stops
}

/* ── Replace AI walking guesses with haversine, trim stops, fix totals ─ */
function enrichAndAdjust(stops: any[], targetMinutes: number) {
  if (stops.length < 2) return { totalWalkingMinutes: 0, totalWalkingMeters: 0 }

  // ── Step 1: compute walking times — haversine, always consistent ──
  let totalWalkingMinutes = 0
  let totalWalkingMeters = 0
  stops.slice(0, -1).forEach((stop, i) => {
    const next = stops[i + 1]
    if (stop.lat && stop.lng && next.lat && next.lng) {
      const leg = walkLeg(stop, next)
      stops[i].walk_to_next_minutes = leg.minutes
      stops[i].walk_to_next_meters = leg.meters
      totalWalkingMinutes += leg.minutes
      totalWalkingMeters += leg.meters
    } else {
      stops[i].walk_to_next_minutes = stops[i].walk_to_next_minutes ?? 5
      stops[i].walk_to_next_meters = null
      totalWalkingMinutes += stops[i].walk_to_next_minutes
    }
  })
  stops[stops.length - 1].walk_to_next_minutes = null
  stops[stops.length - 1].walk_to_next_meters = null

  // ── Step 2: if walking blows the budget, trim stops from the end ──
  const minStops = Math.max(4, Math.floor(targetMinutes / 12))
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

/* ── 2-opt improvement pass ──────────────────────────────────────────── */
// After nearest-neighbor, crossing paths often remain. 2-opt iteratively
// reverses segments to remove crossings until no improvement is possible.
// Stop[0] stays fixed (user's starting location).
function twoOptImprove(stops: any[]): any[] {
  if (stops.length <= 3) return stops

  const dist = (a: any, b: any): number =>
    a?.lat && a?.lng && b?.lat && b?.lng
      ? haversineMeters(a.lat, a.lng, b.lat, b.lng) : 0

  let route = [...stops]
  let improved = true
  while (improved) {
    improved = false
    for (let i = 1; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const prev = route[i - 1]
        const nextJ = j + 1 < route.length ? route[j + 1] : null
        const oldDist = dist(prev, route[i]) + (nextJ ? dist(route[j], nextJ) : 0)
        const newDist = dist(prev, route[j]) + (nextJ ? dist(route[i], nextJ) : 0)
        if (newDist < oldDist - 1) {
          route = [...route.slice(0, i), ...route.slice(i, j + 1).reverse(), ...route.slice(j + 1)]
          improved = true
          break
        }
      }
      if (improved) break
    }
  }

  route.forEach((s, i) => { s.number = i + 1 })
  return route
}

/* ── Google Maps walking times — one Directions call for the full route ─ */
// The public OSRM demo server uses car-speed routing for its /foot profile,
// giving absurd results (13 km shown as 20 min). Google Maps is authoritative
// for real pedestrian routing including bridges, parks, and one-way streets.
// Falls back gracefully to haversine if the key is absent or the call fails.
async function applyGoogleWalkTimes(stops: any[]): Promise<boolean> {
  if (stops.length < 2) return false
  if (!stops.every(s => s.lat && s.lng)) return false

  const key = process.env.NEXT_PUBLIC_GOOGLE_STREET_VIEW_KEY
  if (!key) return false

  try {
    const origin      = `${stops[0].lat},${stops[0].lng}`
    const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`
    const waypoints   = stops.slice(1, -1).map(s => `${s.lat},${s.lng}`).join('|')

    const params = new URLSearchParams({ origin, destination, mode: 'walking', key })
    if (waypoints) params.set('waypoints', waypoints)

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params}`,
      { signal: AbortSignal.timeout(6000) }
    )
    if (!res.ok) return false
    const data = await res.json()
    if (data.status !== 'OK' || !data.routes?.[0]?.legs) return false

    const legs: any[] = data.routes[0].legs
    if (legs.length !== stops.length - 1) return false

    for (let i = 0; i < stops.length - 1; i++) {
      stops[i].walk_to_next_minutes = Math.max(1, Math.round(legs[i].duration.value / 60))
      stops[i].walk_to_next_meters  = Math.round(legs[i].distance.value)
    }
    stops[stops.length - 1].walk_to_next_minutes = null
    stops[stops.length - 1].walk_to_next_meters  = null
    return true
  } catch {
    return false  /* keep haversine values */
  }
}

/* ── Remove stops whose walk leg exceeds the budget ─────────────────── */
// Runs after applyGoogleWalkTimes so it uses real routing durations.
// When a leg is too long, removes the destination stop and patches the
// new adjacent leg with haversine.
function removeExcessiveLegStops(stops: any[], targetMinutes: number): any[] {
  const MAX_WALK  = 13
  const MIN_STOPS = Math.max(4, Math.floor(targetMinutes / 12))

  let changed = true
  while (changed && stops.length > MIN_STOPS) {
    changed = false
    let worstWalk = 0, worstIdx = -1
    for (let i = 0; i < stops.length - 1; i++) {
      const w = stops[i].walk_to_next_minutes ?? 0
      if (w > worstWalk) { worstWalk = w; worstIdx = i }
    }
    if (worstWalk > MAX_WALK && worstIdx >= 0) {
      const removeIdx = worstIdx + 1
      if (removeIdx === 0 || removeIdx >= stops.length) break
      stops.splice(removeIdx, 1)
      // Patch newly adjacent leg with haversine as placeholder
      if (worstIdx < stops.length - 1 && stops[worstIdx].lat && stops[worstIdx + 1]?.lat) {
        const leg = walkLeg(stops[worstIdx], stops[worstIdx + 1])
        stops[worstIdx].walk_to_next_minutes = leg.minutes
        stops[worstIdx].walk_to_next_meters  = leg.meters
      } else {
        stops[worstIdx].walk_to_next_minutes = null
        stops[worstIdx].walk_to_next_meters  = null
      }
      stops.forEach((s, i) => { s.number = i + 1 })
      changed = true
    }
  }
  return stops
}

/* ── Fill missing walk notes for long legs ───────────────────────────── */
// Claude sometimes skips walk_note even when instructed. This runs after
// enrichAndAdjust and generates notes for any leg ≥8 min that still has none.
// lang: write notes in the same language as the rest of the route.
async function fillMissingWalkNotes(stops: any[], city: string, lang = 'en'): Promise<void> {
  const missing = stops
    .slice(0, -1)
    .map((stop, i) => ({ i, from: stop.name, to: stops[i + 1].name, minutes: stop.walk_to_next_minutes }))
    .filter(({ minutes, i }) => minutes >= 8 && !stops[i].walk_note)

  if (!missing.length) return

  const langInstruction = lang === 'pl'
    ? 'Write in Polish (casual, lowercase). '
    : ''

  const prompt = `Walking route in ${city}. ${langInstruction}Write one casual sentence per walk — what the walk feels like, what to notice, why it's worth it. Like a tip from a friend, not a navigation instruction. Lowercase. Return ONLY a JSON array of strings, same order as the list.

${missing.map((m, idx) => `${idx + 1}. ${m.minutes} min walk: "${m.from}" → "${m.to}"`).join('\n')}`

  try {
    const client = new Anthropic()
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return
    const notes: string[] = JSON.parse(match[0])
    missing.forEach(({ i }, idx) => {
      if (notes[idx]) stops[i].walk_note = notes[idx].toLowerCase()
    })
  } catch { /* non-critical — skip silently */ }
}

export async function POST(req: NextRequest) {
  const { city, vibes, minutes, start, end, notes, previousStops = [], lang = 'en' } = await req.json()

  if (!city || !['Warsaw', 'Berlin', 'Prague', 'New York'].includes(city))
    return NextResponse.json({ error: 'invalid city.' }, { status: 400 })
  if (!vibes?.length)
    return NextResponse.json({ error: 'pick at least one vibe.' }, { status: 400 })
  if (!start?.trim())
    return NextResponse.json({ error: 'starting point required.' }, { status: 400 })

  // Load knowledge file
  const knowledgePath = path.join(process.cwd(), 'data', `${city.toLowerCase().replace(/ /g, '_')}_knowledge.md`)
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

  const langNote = lang === 'pl'
    ? `\nLANGUAGE: Write ALL text fields (intro, description, tagline, why_this_spot, walk_note) in Polish. Use natural, conversational Polish — not formal or translated-sounding. Place names and proper nouns stay as-is (e.g. "Zachęta", "ul. Ząbkowska"). Numbers, coordinates, and the JSON keys themselves stay in English.`
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
${avoidNote}${langNote}

Generate a walking route. Target ${Math.round(minutes / 9)}–${Math.round(minutes / 7)} stops — err on the side of MORE stops, not fewer. Micro-stops cost almost nothing time-wise and make the route feel alive. Output ONLY the JSON.`

  const client = new Anthropic()
  let attempt = 0
  const requestStart = Date.now()

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

      // Fix AI-hallucinated coordinates FIRST — reorder must use real coords
      // Skip stop #1 — its coordinates are already locked to the user's input
      await geocodeStops(route.stops.slice(1), city)

      // Reorder into nearest-neighbor order AFTER geocoding so the sort uses
      // accurate coordinates, not Claude's hallucinated ones
      route.stops = reorderStops(route.stops)

      // 2-opt pass: eliminate crossing paths and zigzag patterns
      route.stops = twoOptImprove(route.stops)

      // Remove stops that cause excessively long walks (haversine-based, fast pass)
      route.stops = removeOutlierStops(route.stops, minutes)

      // Haversine walk times, trim stops if over budget, scale stop times
      enrichAndAdjust(route.stops, minutes)

      // Overwrite haversine estimates with real Google Maps walking times.
      // If the key is missing or the call fails, haversine values are kept.
      await applyGoogleWalkTimes(route.stops)

      // Remove stops where OSRM reveals the walk is still too long
      route.stops = removeExcessiveLegStops(route.stops, minutes)

      // Recompute totals from OSRM-corrected times
      let totalWalkingMinutes = 0, totalWalkingMeters = 0
      route.stops.slice(0, -1).forEach((s: any) => {
        totalWalkingMinutes += s.walk_to_next_minutes ?? 0
        totalWalkingMeters  += s.walk_to_next_meters  ?? 0
      })
      route.total_walking_minutes = totalWalkingMinutes
      route.total_walking_meters  = totalWalkingMeters

      // Re-scale stop dwell times to fill whatever budget remains after OSRM walks
      const remaining   = Math.max(route.stops.length * 3, minutes - totalWalkingMinutes)
      const currentDwell = route.stops.reduce((s: number, st: any) => s + (st.time_at_stop_minutes ?? 0), 0)
      if (currentDwell > 0 && Math.abs(currentDwell - remaining) > 5) {
        const scale = remaining / currentDwell
        route.stops.forEach((st: any) => {
          st.time_at_stop_minutes = Math.max(0, Math.round((st.time_at_stop_minutes ?? 0) * scale))
        })
      }

      // Enforce walk notes — any leg ≥8 min must have one.
      // Skip if we're already past 45s to avoid hitting Vercel's 60s timeout.
      if (Date.now() - requestStart < 45000) {
        await fillMissingWalkNotes(route.stops, city, lang)
      }

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
