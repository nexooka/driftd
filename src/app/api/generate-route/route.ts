import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const SYSTEM_PROMPT = `You are a route generator for driftd, an anti-tourist city exploration app. Your job is to generate walking routes that feel like a local friend showing someone around — not a travel brochure.

CRITICAL RULES:
1. You can ONLY use spots from the KNOWLEDGE BASE provided. Never invent places. Never include spots not in the knowledge base.
2. Match the user's time budget PRECISELY. If they say 45 minutes, the total walking time + stop time should be 40–50 minutes. Walking between stops in a European city is roughly 80 meters per minute. Factor in 3–15 minutes per stop depending on type (quick photo = 3 min, sit-down café = 15 min).
3. If the user's time is very short but something excellent is just slightly further, suggest they add a few minutes and explain why — keep it conversational and specific.
4. Match their vibe tags. Prioritize spots tagged with those vibes in the knowledge base.
5. Respect their starting point. Start nearby and build a coherent walking path.
6. If they specified an end point, end the route near there.
7. If they specified constraints in notes (e.g. "no churches"), respect them strictly.
8. Keep stops in logical walking order — no zigzagging back and forth.
9. Writing style: casual, warm, like texting a knowledgeable friend. Use lowercase. Include personality and opinions. Avoid these words entirely: "vibrant," "charming," "must-see," "iconic," "hidden gem," "nestled," "quaint." Instead: "this place goes hard," "locals come here to escape," "skip X, go to Y instead," "you'll want to stay longer than you planned."
10. Include specific details from the knowledge base: street names, what to order, best time of day, insider tips.
11. Make every route UNIQUE. If this is a regeneration (the user will list previous stops to avoid), choose different spots or a different neighborhood angle entirely.
12. Output MUST be valid JSON in exactly the format below. No prose outside the JSON. No markdown code fences. No commentary before or after.

OUTPUT FORMAT — return exactly this JSON, no other text:
{
  "city": "Warsaw",
  "intro": "2–3 sentence personal intro explaining why this specific route works for their specific inputs. mention the neighborhood or angle you chose and why.",
  "total_minutes": 60,
  "vibes": ["artsy", "historic"],
  "stops": [
    {
      "number": 1,
      "name": "exact stop name from knowledge base",
      "neighborhood": "neighborhood name",
      "description": "2–4 sentences in casual friend tone. what it is, what to do there, what makes it worth stopping.",
      "why_this_spot": "one-line reason it fits their vibe",
      "walk_to_next_minutes": 8,
      "time_at_stop_minutes": 10
    }
  ],
  "time_warning": null
}`

function parseRoute(text: string) {
  let s = text.trim()
  s = s.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '')
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in response')
  return JSON.parse(s.slice(start, end + 1))
}

export async function POST(req: NextRequest) {
  const { city, vibes, minutes, start, end, notes, previousStops = [] } = await req.json()

  // Validate
  if (!city || !['Warsaw', 'Berlin', 'Prague'].includes(city)) {
    return NextResponse.json({ error: 'invalid city.' }, { status: 400 })
  }
  if (!vibes?.length) return NextResponse.json({ error: 'pick at least one vibe.' }, { status: 400 })
  if (!start?.trim()) return NextResponse.json({ error: 'starting point required.' }, { status: 400 })

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
    ? `\n\nREGENERATION: The user has already seen this route and wants something different. AVOID these stops entirely: ${previousStops.join(', ')}. Pick different spots and/or a different neighborhood angle.`
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

Generate a walking route following all your rules. Output ONLY the JSON object, nothing else.`

  const client = new Anthropic()

  let attempt = 0
  while (attempt < 2) {
    try {
      const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const route = parseRoute(text)
      return NextResponse.json(route)
    } catch (err) {
      attempt++
      console.error(`Route generation attempt ${attempt} failed:`, err)
      if (attempt >= 2) {
        const msg = err instanceof Error ? err.message : String(err)
        return NextResponse.json(
          { error: 'the drift isn\'t working right now. try again in a moment.', _debug: msg },
          { status: 500 }
        )
      }
    }
  }
}
