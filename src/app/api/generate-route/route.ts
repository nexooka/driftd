import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const SYSTEM_PROMPT = `You are a route generator for driftd, an anti-tourist city exploration app. Your job is to generate walking routes that feel like a local friend showing someone around — not a travel brochure.

KNOWLEDGE BASE RULES:
1. Use the KNOWLEDGE BASE as your primary and preferred source of spots. These are curated local recommendations.
2. You MAY supplement with spots from your training knowledge — especially for micro-stops, street art, interesting buildings, local squares, canal/riverside spots, or things someone would genuinely pass on the way. But every place you name must actually exist at that location. Do not invent addresses.
3. When using training knowledge, apply extra scrutiny: only include if you're confident the spot is genuinely local and lowkey, not a tourist cliché.

STOP COUNT & TIME:
4. Generate ENOUGH stops to genuinely fill the time. Use this as a guide:
   - 20–40 min: 4–5 stops
   - 40–60 min: 5–7 stops
   - 60–90 min: 7–10 stops
   - 90–180 min: 10–14 stops
   Include a mix of MAIN STOPS (8–15 min) and MICRO-STOPS (2–4 min — a mural, a courtyard entrance, an interesting facade, a canal view). Micro-stops are things you walk past and pause at, not sit-down experiences.
5. Keep walking time between stops TIGHT. In dense European city neighborhoods, stops should be 3–10 min walk apart. Don't space them so far that walking dominates the time.
6. Match the user's total time PRECISELY: sum of all (time_at_stop + walk_to_next) should equal total_minutes ± 5 min.

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
16. CRITICAL: Stop #1 MUST be at or within a 2-minute walk (under 150m) of the user's stated starting point. The user is physically standing there — stop #1 is something interesting right where they start. Never begin the route somewhere that requires a long walk to reach.

COORDINATES & ADDRESSES:
17. Provide accurate latitude and longitude for each stop. These will be plotted on a real map. Be precise — wrong coordinates will put stops in the wrong location.
18. Include a real street address for each stop. Format: "ul. Ząbkowska 6" (Warsaw), "Eisenbahnstraße 42" (Berlin), "Mánesova 13" (Prague). If you're not confident in the exact house number, give the street name and neighborhood.

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

/* ── Haversine walking time estimate (server-side fallback) ──────────── */
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function enrichWalkingTimes(stops: any[]) {
  if (stops.length < 2) return

  let totalWalkingMinutes = 0
  let totalWalkingMeters = 0

  stops.slice(0, -1).forEach((stop, i) => {
    const next = stops[i + 1]
    if (stop.lat && stop.lng && next.lat && next.lng) {
      // straight-line × 1.35 detour factor → realistic street distance
      const meters = Math.round(haversineMeters(stop.lat, stop.lng, next.lat, next.lng) * 1.35)
      // 83 m/min ≈ avg walking pace (5 km/h)
      const minutes = Math.max(1, Math.round(meters / 83))
      stops[i].walk_to_next_minutes = minutes
      stops[i].walk_to_next_meters = meters
      totalWalkingMinutes += minutes
      totalWalkingMeters += meters
    } else {
      totalWalkingMinutes += stops[i].walk_to_next_minutes ?? 0
    }
  })

  // Clear walk fields on last stop
  stops[stops.length - 1].walk_to_next_minutes = null
  stops[stops.length - 1].walk_to_next_meters = null

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

  const isDriftAgain = previousStops.length > 0
  const avoidNote = isDriftAgain
    ? `\nREGENERATION — user has seen this route. AVOID THESE STOPS ENTIRELY: ${previousStops.join(', ')}. Choose a different neighborhood or angle.`
    : ''

  const userPrompt = `KNOWLEDGE BASE FOR ${city.toUpperCase()}:
${knowledge}

USER REQUEST:
- City: ${city}
- Vibes: ${vibes.join(', ')}
- Time available: ${minutes} minutes
- Starting from: ${start}
- Needs to end at: ${end?.trim() || 'anywhere — drift wherever'}
- Extra notes: ${notes?.trim() || 'none'}
${avoidNote}

Generate a walking route. Remember: aim for ${Math.round(minutes / 8)} stops minimum. Output ONLY the JSON.`

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

      // Replace AI-guessed walking times with haversine-based estimates
      const walking = enrichWalkingTimes(route.stops)
      if (walking) {
        route.total_walking_minutes = walking.totalWalkingMinutes
        route.total_walking_meters = walking.totalWalkingMeters
      }

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
