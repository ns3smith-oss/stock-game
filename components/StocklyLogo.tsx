interface StocklyLogoProps {
  size?: number
}

export function StocklyLogo({ size = 64 }: StocklyLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* S — depth layer */}
      <path
        d="M 130 28 C 35 18, 25 85, 88 95 C 152 105, 148 168, 52 172"
        stroke="#5B00BB"
        strokeWidth="30"
        strokeLinecap="round"
        fill="none"
      />
      {/* S — main purple */}
      <path
        d="M 130 28 C 35 18, 25 85, 88 95 C 152 105, 148 168, 52 172"
        stroke="#8B00FF"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      {/* S — inner highlight for 3D ribbon look */}
      <path
        d="M 130 28 C 35 18, 25 85, 88 95 C 152 105, 148 168, 52 172"
        stroke="#C084FC"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Arrow at top of S */}
      <path
        d="M 118 20 L 150 8 L 152 40"
        stroke="#5B00BB"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 118 20 L 150 8 L 152 40"
        stroke="#8B00FF"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 118 20 L 150 8 L 152 40"
        stroke="#C084FC"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />

      {/* Candlestick 1 — teal, shorter (left) */}
      <line x1="66" y1="122" x2="66" y2="170" stroke="#50D8F0" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="57" y="133" width="18" height="26" rx="3" fill="#50D8F0" />

      {/* Candlestick 2 — white, tallest (center) */}
      <line x1="92" y1="58" x2="92" y2="138" stroke="#F0F0F0" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="83" y="70" width="18" height="50" rx="3" fill="#F0F0F0" />

      {/* Candlestick 3 — neon green, tall (right) */}
      <line x1="118" y1="44" x2="118" y2="122" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="109" y="55" width="18" height="44" rx="3" fill="#39FF14" />
    </svg>
  )
}
