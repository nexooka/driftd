const PHRASES = [
  'real-time AI narration',
  'no scripted tours',
  'guided narration',
  'point & ask anything',
  'ambient discovery',
  'stories you won\'t find anywhere else',
  'the city talks back',
  'three AI modes',
  'always on · always local',
  'your walk · your story',
  'AI that knows the neighborhood',
  'no tour bus required',
  'hear what the walls remember',
]

const ticker = PHRASES.join('  ·  ')

export default function FeatureTicker() {
  return (
    <div className="overflow-hidden border-y border-amber-400/10 py-3.5 select-none" style={{ background: '#0c0a06' }}>
      <div
        className="animate-marquee-reverse"
        style={{ animationDuration: '35s' }}
      >
        {[0, 1].map((i) => (
          <span
            key={i}
            className="text-amber-400/50 text-xs tracking-widest pr-16 whitespace-nowrap"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
          >
            {ticker}
          </span>
        ))}
      </div>
    </div>
  )
}
