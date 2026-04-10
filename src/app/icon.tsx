import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 7,
        }}
      >
        <div
          style={{
            color: '#fbbf24',
            fontSize: 22,
            fontWeight: 900,
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          d
        </div>
      </div>
    ),
    { width: 32, height: 32 }
  )
}
