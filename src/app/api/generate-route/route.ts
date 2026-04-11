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

ROUTE GEOMETRY — NO BACKTRACKING:
9. CRITICAL: Before placing stops, mentally sketch the route on a map. Pick a clear DIRECTION OF TRAVEL (e.g. "we'll head north through Praga then loop slightly east"). Every stop must advance along that direction — never double back.
10. The route must look like a natural walking line or gentle arc, NOT a zigzag. Imagine drawing a line through all stops on a map — it should feel like a river, not a scribble. If any stop would require walking back past a previous stop, it belongs earlier in the list or should be replaced.
11. CLUSTER TEST: Your first 3 stops should be geographically close to each other. Your last 3 stops should be in a clearly different area. They should NOT overlap.
12. ORDERING RULE: Sort all candidate stops by their position along the direction of travel before numbering them. This is non-negotiable. A stop that is "further along the route" must always have a higher number.
13. If they specified an end point, route toward it as a straight shot. If they gave constraints in notes, follow them strictly.
14. Match vibe tags. If they said "artsy + chill" — no loud bars, lots of cafés and street art.
15. For regeneration requests: pick a completely different neighborhood or angle. Never repeat previous stops.

STARTING POINT:
16. CRITICAL: If geocoded coordinates are provided, Stop #1's lat/lng MUST match them exactly (copy-paste those coordinates). If no coordinates are given, stop #1 must be within 100m of the stated address. The user is physically at that location — never start the route somewhere requiring a long walk to reach.

COORDINATES & ADDRESSES:
17. Provide accurate latitude and longitude for each stop. These will be plotted on a real map. Be precise — wrong coordinates will put stops in the wrong location.
18. Include a real street address for each stop. Format: "ul. Ząbkowska 6" (Warsaw), "Eisenbahnstraße 42" (Berlin), "Mánesova 13" (Prague). If you're not confident in the exact house number, give the street name and neighborhood.

WALK NOTES:
19. When a walk between stops is longer (roughly 7+ minutes), add a "walk_note" field: one casual sentence describing what the walk is like and why it's worth it. Make it feel like a tip from a friend: what to notice, what the street feels like, anything interesting along the way. Example: "the walk takes you along the canal past a row of old boat sheds — it's a nice transition." For short walks, leave walk_note as null.

NICHE FIRST:
19. Always prefer the most niche, least-known version of a neighborhood. Don't default to the famous streets — pick the streets one block over that only locals know. Think: the back entrance, the adjacent courtyard, the street that runs parallel to the obvious one.

WRITING STYLE:
20. Casual, warm, opinionated. Like texting a friend who grew up there. Use lowercase. Include specific tips (what to order, what time of day, what to look for). Absolutely banned words: "vibrant," "charming," "must-see," "iconic," "hidden gem," "nestled," "quaint," "picturesque." Instead: "this place goes hard," "locals come here to escape," "get the [specific item]," "most people walk straight past this."
21. Output MUST be valid JSON in exactly the format below. No prose outside the JSON. No markdown code fences. No commentary.

OUTPUT FORMAT — return exactly this JSON, nothing else:
{
  "city": "Warsaw",
  "intro": "2–3 sentence personal intro. mention the specific neighborhood(s), why this angle works for their vibe and time.",
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
      "description": "2–4 sentences. what it is, what to do, specific tips.",
      "why_this_spot": "one line — how it fits the vibe",
      "walk_to_next_minutes": 5,
      "walk_note": null,
      "time_at_stop_minutes": 8
    }
  ],
  "time_warning": null
}`

function parseRoute(text: string) {
  let s = text.trim()
  s = s.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '')
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON found in response')
  return JSON.parse(s.slice(start, end + 1))
}

/* ── Geocode starting address via Nominatim ──────────────────────────── */
async function geocodeStart(address: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(`${address}, ${city}`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      {
        headers: { 'User-Agent': 'driftd/1.0 (route generator)' },
        signal: AbortSignal.timeout(5000),
      }
    )
    const data = await res.json()
    if (!data?.[0]) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
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

      // Replace AI walking guesses with haversine, then scale stop times to hit target
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
