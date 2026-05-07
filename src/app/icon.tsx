import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  const font = readFileSync(join(process.cwd(), 'public/fonts/PlayfairDisplay-BoldItalic.woff2'))

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0a0a0a',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Playfair Display',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 23,
            color: '#fbbf24',
            lineHeight: 1,
            marginBottom: 1,
          }}
        >
          d
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Playfair Display',
          data: font,
          style: 'italic',
          weight: 700,
        },
      ],
    }
  )
}
