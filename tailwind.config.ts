/** biome-ignore-all lint/complexity/useArrowFunction: <explanation> */
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.tsx',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundColor: {
        tinted: 'var(--bg-tinted)',
        'card-tinted': 'var(--card-tinted)',
        'accent-tinted': 'var(--accent-tinted)',
        'tinted-subtle': 'rgba(var(--mana-rgb), 0.06)',
        'tinted-medium': 'rgba(var(--mana-rgb), 0.15)',
        'tinted-strong': 'rgba(var(--mana-rgb), 0.25)',
      },
      borderColor: {
        tinted: 'var(--border-tinted)',
        'tinted-strong': 'rgba(var(--mana-rgb), 0.4)',
        'tinted-medium': 'rgba(var(--mana-rgb), 0.25)',
        'tinted-subtle': 'rgba(var(--mana-rgb), 0.15)',
      },
      textColor: {
        tinted: 'var(--mana-color)',
        'tinted-subtle': 'rgba(var(--mana-rgb), 0.8)',
        'tinted-strong': 'var(--mana-color)',
        'tinted-dim': 'rgba(var(--mana-rgb), 0.6)',
      },
      boxShadow: {
        tinted: '0 4px 16px rgba(var(--mana-rgb), 0.15)',
        'tinted-lg': '0 8px 32px rgba(var(--mana-rgb), 0.2)',
        'tinted-xl': '0 16px 48px rgba(var(--mana-rgb), 0.25)',
        'tinted-glow': '0 0 20px rgba(var(--mana-rgb), 0.25), 0 8px 32px rgba(var(--mana-rgb), 0.15)',
        'tinted-inner': 'inset 0 2px 4px 0 rgba(var(--mana-rgb), 0.15)',
      },
      backgroundImage: {
        'gradient-tinted': 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
        'gradient-tinted-radial': 'radial-gradient(circle at center, rgba(var(--mana-rgb), 0.2), transparent 70%)',
        'gradient-tinted-conic': 'conic-gradient(from 180deg at 50% 50%, var(--gradient-start), var(--gradient-mid), var(--gradient-end), var(--gradient-start))',
        'gradient-tinted-subtle': 'linear-gradient(135deg, rgba(var(--mana-rgb), 0.08), rgba(var(--mana-rgb), 0.04))',
      },
      keyframes: {
        meteor: {
          '0%': {
            transform: 'rotate(var(--angle)) translateX(0)',
            opacity: '1',
          },
          '70%': {
            opacity: '1',
          },
          '100%': {
            transform: 'rotate(var(--angle)) translateX(-500px)',
            opacity: '0',
          },
        },
        shimmer: {
          '0%': {
            transform: 'translateX(-100%) translateY(-100%)',
          },
          '100%': {
            transform: 'translateX(100%) translateY(100%)',
          },
        },
        'pulse-tinted': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(var(--mana-rgb), 0.5)',
          },
          '50%': {
            boxShadow: '0 0 0 12px rgba(var(--mana-rgb), 0)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(var(--mana-rgb), 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(var(--mana-rgb), 0.8)',
          },
        },
      },
      animation: {
        shimmer: 'shimmer 3s infinite',
        'pulse-tinted': 'pulse-tinted 2s infinite',
        float: 'float 4s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        mana: 'var(--mana-color)',
        manargb: 'rgba(var(--mana-rgb), <alpha-value>)',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      opacity: {
        '2': '0.02',
        '3': '0.03',
        '4': '0.04',
        '6': '0.06',
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
        '18': '0.18',
        '25': '0.25',
        '35': '0.35',
        '45': '0.45',
      },
      ringColor: {
        mana: 'var(--mana-color)',
        tinted: 'rgba(var(--mana-rgb), 0.35)',
        'tinted-strong': 'rgba(var(--mana-rgb), 0.5)',
      },
      ringOffsetColor: {
        mana: 'var(--mana-color)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    function ({ addUtilities }: any) {
      const newUtilities = {
        // Glass effects with proper mana coloring
        '.glass-tinted': {
          background: 'linear-gradient(135deg, rgba(var(--mana-rgb), 0.08), rgba(var(--mana-rgb), 0.04))',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          border: '1px solid rgba(var(--mana-rgb), 0.2)',
          boxShadow: '0 8px 32px rgba(var(--mana-rgb), 0.1)',
        },
        '.glass-tinted-subtle': {
          background: 'linear-gradient(135deg, rgba(var(--mana-rgb), 0.04), rgba(var(--mana-rgb), 0.02))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(var(--mana-rgb), 0.12)',
        },
        '.glass-tinted-strong': {
          background: 'linear-gradient(135deg, rgba(var(--mana-rgb), 0.15), rgba(var(--mana-rgb), 0.08))',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          border: '1px solid rgba(var(--mana-rgb), 0.3)',
          boxShadow: '0 12px 48px rgba(var(--mana-rgb), 0.15)',
        },
        
        // Light mode glass (white-based with mana tint)
        '.glass-light': {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          border: '1px solid rgba(var(--mana-rgb), 0.2)',
          boxShadow: '0 8px 32px rgba(var(--mana-rgb), 0.12)',
        },

        // Dark mode glass adjustments
        '.dark .glass-tinted': {
          background: 'linear-gradient(135deg, rgba(var(--mana-rgb), 0.1), rgba(var(--mana-rgb), 0.05))',
          border: '1px solid rgba(var(--mana-rgb), 0.25)',
          backdropFilter: 'blur(16px) saturate(1.25)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.25)',
        },
        '.dark .glass-tinted-subtle': {
          background: 'linear-gradient(135deg, rgba(var(--mana-rgb), 0.05), rgba(var(--mana-rgb), 0.025))',
          border: '1px solid rgba(var(--mana-rgb), 0.15)',
        },
        '.dark .glass-tinted-strong': {
          background: 'linear-gradient(135deg, rgba(var(--mana-rgb), 0.18), rgba(var(--mana-rgb), 0.1))',
          border: '1px solid rgba(var(--mana-rgb), 0.35)',
        },

        // Button styles with stronger tinting
        '.btn-tinted': {
          background: 'rgba(var(--mana-rgb), 0.1)',
          border: '1px solid rgba(var(--mana-rgb), 0.25)',
          color: 'var(--mana-color)',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(var(--mana-rgb), 0.18)',
            border: '1px solid rgba(var(--mana-rgb), 0.35)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(var(--mana-rgb), 0.2)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 6px rgba(var(--mana-rgb), 0.15)',
          },
        },
        '.btn-tinted-primary': {
          background: 'var(--mana-color)',
          border: 'none',
          color: 'white',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(var(--mana-rgb), 0.25)',
          '&:hover': {
            filter: 'brightness(1.1) saturate(1.1)',
            boxShadow: '0 6px 20px rgba(var(--mana-rgb), 0.3)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 8px rgba(var(--mana-rgb), 0.2)',
          },
        },
        '.btn-tinted-outline': {
          background: 'transparent',
          border: '2px solid var(--mana-color)',
          color: 'var(--mana-color)',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(var(--mana-rgb), 0.1)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(var(--mana-rgb), 0.15)',
          },
        },

        // Input styles with visible tinting
        '.input-tinted': {
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(var(--mana-rgb), 0.2)',
          transition: 'all 0.2s ease',
          '&:focus': {
            background: 'rgba(255, 255, 255, 1)',
            borderColor: 'var(--mana-color)',
            boxShadow: '0 0 0 3px rgba(var(--mana-rgb), 0.1)',
            outline: 'none',
          },
          '&::placeholder': {
            color: 'rgba(var(--mana-rgb), 0.5)',
          },
        },
        '.dark .input-tinted': {
          background: 'rgba(255, 255, 255, 0.05)',
          '&:focus': {
            background: 'rgba(255, 255, 255, 0.08)',
          },
        },

        // Card styles with proper elevation
        '.card-tinted': {
          background: 'var(--card)',
          border: '1px solid rgba(var(--mana-rgb), 0.15)',
          boxShadow: '0 4px 16px rgba(var(--mana-rgb), 0.08)',
          transition: 'all 0.2s ease',
        },
        '.card-tinted-filled': {
          background: 'rgba(var(--mana-rgb), 0.08)',
          border: '1px solid rgba(var(--mana-rgb), 0.2)',
          boxShadow: '0 4px 16px rgba(var(--mana-rgb), 0.1)',
        },
        '.card-tinted-glass': {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          border: '1px solid rgba(var(--mana-rgb), 0.2)',
          boxShadow: '0 8px 32px rgba(var(--mana-rgb), 0.12)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(var(--mana-rgb), 0.18)',
            borderColor: 'rgba(var(--mana-rgb), 0.3)',
          },
        },
        '.dark .card-tinted-glass': {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        },

        // Badge styles
        '.badge-tinted': {
          background: 'rgba(var(--mana-rgb), 0.1)',
          border: '1px solid rgba(var(--mana-rgb), 0.25)',
          color: 'var(--mana-color)',
          fontWeight: '500',
        },
        '.badge-tinted-primary': {
          background: 'var(--mana-color)',
          border: 'none',
          color: 'white',
          fontWeight: '600',
        },

        // Hover and focus utilities
        '.hover-tinted': {
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(var(--mana-rgb), 0.12)',
            borderColor: 'rgba(var(--mana-rgb), 0.3)',
          },
        },
        '.focus-ring-tinted': {
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(var(--mana-rgb), 0.15)',
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(var(--mana-rgb), 0.15)',
          },
        },

        // Gradient utilities
        '.gradient-tinted': {
          background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
        },
        '.gradient-tinted-text': {
          background: 'linear-gradient(to right, var(--gradient-start), var(--gradient-end))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent',
        },

        // Glow effects
        '.mana-glow': {
          boxShadow: '0 0 30px rgba(var(--mana-rgb), 0.3), 0 0 60px rgba(var(--mana-rgb), 0.15)',
        },
        '.mana-glow-sm': {
          boxShadow: '0 0 15px rgba(var(--mana-rgb), 0.25)',
        },
        '.mana-glow-lg': {
          boxShadow: '0 0 40px rgba(var(--mana-rgb), 0.35), 0 0 80px rgba(var(--mana-rgb), 0.2)',
        },

        // Border gradient
        '.mana-border-gradient': {
          position: 'relative',
          background: 'var(--card)',
          backgroundClip: 'padding-box',
          border: '2px solid transparent',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0',
            zIndex: '-1',
            margin: '-2px',
            borderRadius: 'inherit',
            background: 'linear-gradient(45deg, var(--gradient-start), var(--gradient-end))',
          },
        },

        // Overlay effects
        '.overlay-tinted': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(135deg, rgba(var(--mana-rgb), 0.08), transparent)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
          },
        },

        // Special handling for white mana (yellow) text contrast
        '[data-mana="white"] .btn-tinted-primary': {
          color: '#1a1a1a !important',
          textShadow: 'none !important',
        },
        'html[data-mana="white"] .btn-tinted-primary': {
          color: '#1a1a1a !important',
          textShadow: 'none !important',
        },
        'html[data-mana="white"] .badge-tinted-primary': {
          color: '#1a1a1a !important',
        },
        '.dark html[data-mana="white"] .btn-tinted-primary': {
          color: '#0a0a0a !important',
        },
        '.dark html[data-mana="white"] .badge-tinted-primary': {
          color: '#0a0a0a !important',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}

export default config