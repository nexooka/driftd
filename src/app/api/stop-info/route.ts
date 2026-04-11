import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { name, city, address, tagline, description } = await req.json()
  if (!name || !city) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const client = new Anthropic()

  const prompt = `You are a local expert on ${city}. A user is standing outside "${name}" (${tagline}) at ${address}.

They already know: "${description}"

Give them 4–6 bullet points of genuinely interesting additional context. Draw from:
- History of the place or the building it's in
- What to order / what's worth trying (cafés, bars, restaurants)
- Best time to visit, what changes at different hours
- A local tip most visitors miss
- A specific detail to notice (architectural, artistic, cultural)
- Any notable connection to the city's broader story or people

Rules:
- Specific and factual. If uncertain, say "reportedly" or "supposedly" — never invent.
- Never repeat what's already in the description.
- Casual tone, like a friend who grew up there. Lowercase.
- Each bullet: one tight sentence, max two. No filler.
- Return ONLY the bullet points, one per line, each starting with •`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
  return NextResponse.json({ info: text })
}
