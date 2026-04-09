const PHRASES = [
  'you drifted through warsaw',
  'got lost on purpose',
  'heard the city whisper',
  'found what the guidebooks missed',
  'explored like a local',
  'wandered without a plan',
  'discovered the unseen',
  'drifted off the map',
  'no map · no plan · no problem',
  'the city has secrets',
  'wander on purpose',
  'every route is one of a kind',
  "you're not lost · you drifted",
  'stop following · start drifting',
]

const ticker = PHRASES.join('  ·  ')

export default function TickerBar() {
  return (
    <div className="overflow-hidden bg-[#0d0d0d] border-y border-white/[0.05] py-3.5 select-none">
      <div className="animate-marquee">
        {/* Two identical spans — animation moves exactly -50% so it loops seamlessly */}
        {[0, 1].map((i) => (
          <span
            key={i}
            className="text-warm-gray-400 text-xs tracking-widest font-mono pr-16 whitespace-nowrap"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
          >
            {ticker}
          </span>
        ))}
      </div>
    </div>
  )
}
