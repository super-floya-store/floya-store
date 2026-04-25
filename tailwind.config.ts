import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: '#D4A574',
          foreground: '#1B2A4A',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          sand: '#f5ebe1',
          blush: '#f0d5c2',
          caramel: '#d6a37c',
          ink: '#17304f',
          night: '#0d1b2a',
          gold: '#c79052',
        },
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 0.5rem)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        soft: '0 10px 30px -18px rgba(18, 34, 56, 0.18)',
        medium: '0 22px 50px -24px rgba(13, 27, 42, 0.28)',
        heavy: '0 35px 90px -35px rgba(13, 27, 42, 0.38)',
        glow: '0 20px 60px -25px rgba(215, 153, 104, 0.45)',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at top right, rgba(231, 193, 162, 0.26), transparent 28%), radial-gradient(circle at bottom left, rgba(217, 163, 122, 0.18), transparent 24%)',
        'surface-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.62))',
        'footer-gradient': 'linear-gradient(145deg, #0d1b2a 0%, #17304f 55%, #25486f 100%)',
      },
      fontFamily: {
        sans: ['Noto Sans Arabic', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(215, 153, 104, 0.18)' },
          '50%': { boxShadow: '0 0 0 14px rgba(215, 153, 104, 0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '60%': { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.6s linear infinite',
        float: 'float 7s ease-in-out infinite',
        'fade-up': 'fade-up 0.8s ease-out both',
        'soft-pulse': 'soft-pulse 2.4s ease-out infinite',
        'bounce-in': 'bounceIn 0.45s ease-out both',
      },
    },
  },
  plugins: [],
}
export default config
