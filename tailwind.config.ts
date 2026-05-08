import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Stockly — Money Moves palette
        'brand-black':   '#0D0D0D',
        'brand-surface': '#1A1A1A',
        'brand-purple':  '#8B00FF',
        'brand-green':   '#39FF14',
        'brand-white':   '#FFFFFF',
        'brand-muted':   '#A0A0A0',
        'brand-error':   '#FF6B6B',
        // Legacy aliases
        navy:          '#0D0D0D',
        gold:          '#39FF14',
        'gold-light':  '#39FF14',
        'brand-blue':  '#8B00FF',
        'success':     '#39FF14',
        'danger':      '#FF6B6B',
      },
      keyframes: {
        xpFloat: {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1.2)' },
          '100%': { opacity: '0', transform: 'translateY(-50px) scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(139,0,255,0.5)' },
          '50%':       { boxShadow: '0 0 0 12px rgba(139,0,255,0)' },
        },
        greenGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(57,255,20,0.5)' },
          '50%':       { boxShadow: '0 0 0 12px rgba(57,255,20,0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        levelBurst: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '60%':  { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-8px)' },
          '40%':      { transform: 'translateX(8px)' },
          '60%':      { transform: 'translateX(-6px)' },
          '80%':      { transform: 'translateX(6px)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        fillBar: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--fill-pct)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadein: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        logoReveal: {
          '0%':   { opacity: '0', transform: 'scale(0.8) translateY(20px)' },
          '60%':  { opacity: '1', transform: 'scale(1.05) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        splashOut: {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0', pointerEvents: 'none' },
        },
      },
      animation: {
        xpFloat:    'xpFloat 1.2s ease-out forwards',
        pulseGlow:  'pulseGlow 2s ease-in-out infinite',
        greenGlow:  'greenGlow 2s ease-in-out infinite',
        slideUp:    'slideUp 0.4s ease-out forwards',
        slideIn:    'slideIn 0.4s ease-out forwards',
        levelBurst: 'levelBurst 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        shake:      'shake 0.4s ease-in-out',
        bounce:     'bounce 0.6s ease-in-out',
        pop:        'pop 0.2s ease-in-out',
        float:       'float 3s ease-in-out infinite',
        fadein:      'fadein 0.6s ease-out forwards',
        logoReveal:  'logoReveal 0.8s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        splashOut:   'splashOut 0.5s ease-in forwards',
      },
    },
  },
  plugins: [],
}

export default config
