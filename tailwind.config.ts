import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Stockly brand colors
        'brand-purple': '#7C3AED',
        'brand-purple-light': '#EDE9FF',
        'brand-coral': '#FFD60A',
        'brand-yellow': '#FFD609',
        'brand-cyan': '#00C2FF',
        'brand-cream': '#FFF8F0',
        'brand-navy': '#1E1E2F',
        'brand-navy-muted': '#6B6B8A',
        // Legacy aliases
        navy: '#1E1E2F',
        gold: '#FFD609',
        'gold-light': '#FFD60A',
        'brand-blue': '#7C3AED',
        'success': '#00C2FF',
        'danger': '#FF6B6B',
      },
      keyframes: {
        xpFloat: {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1.2)' },
          '100%': { opacity: '0', transform: 'translateY(-50px) scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.4)' },
          '50%':       { boxShadow: '0 0 0 8px rgba(99,102,241,0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        levelBurst: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '60%':  { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fillBar: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--fill-pct)' },
        },
      },
      animation: {
        xpFloat:    'xpFloat 1.2s ease-out forwards',
        pulseGlow:  'pulseGlow 2s ease-in-out infinite',
        slideUp:    'slideUp 0.3s ease-out forwards',
        levelBurst: 'levelBurst 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
      },
    },
  },
  plugins: [],
}

export default config
