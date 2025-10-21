import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Add tinted background colors
      backgroundColor: {
        'tinted': 'var(--bg-tinted)',
        'card-tinted': 'var(--card-tinted)',
        'accent-tinted': 'var(--accent-tinted)',
      },
      // Add tinted border colors
      borderColor: {
        'tinted': 'var(--border-tinted)',
        'tinted-strong': 'rgba(var(--mana-rgb), 0.25)',
        'tinted-subtle': 'rgba(var(--mana-rgb), 0.08)',
      },
      // Add tinted text colors
      textColor: {
        'tinted': 'var(--mana-color)',
        'tinted-subtle': 'rgba(var(--mana-rgb), 0.7)',
        'tinted-strong': 'var(--mana-color)',
      },
      // Add custom box shadows with tints
      boxShadow: {
        'tinted': '0 2px 8px rgba(var(--glass-shadow-rgb), 0.1)',
        'tinted-lg': '0 4px 16px rgba(var(--glass-shadow-rgb), 0.15)',
        'tinted-xl': '0 8px 32px rgba(var(--glass-shadow-rgb), 0.2)',
        'tinted-glow': '0 0 20px rgba(var(--mana-rgb), 0.15), 0 4px 16px rgba(var(--glass-shadow-rgb), 0.1)',
      },
      // Add gradient utilities
      backgroundImage: {
        'gradient-tinted': 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
        'gradient-tinted-radial': 'radial-gradient(circle at center, rgba(var(--mana-rgb), 0.15), transparent 70%)',
      },
      // Enhanced animations
      keyframes: {
        meteor: {
          '0%': {
            transform: 'rotate(var(--angle)) translateX(0)',
            opacity: '1'
          },
          '70%': {
            opacity: '1'
          },
          '100%': {
            transform: 'rotate(var(--angle)) translateX(-500px)',
            opacity: '0'
          }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%) translateY(-100%)' },
          '100%': { transform: 'translateX(100%) translateY(100%)' }
        },
        'pulse-tinted': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(var(--mana-rgb), 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(var(--mana-rgb), 0)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        'shimmer': 'shimmer 3s infinite',
        'pulse-tinted': 'pulse-tinted 2s infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      // Update border radius with CSS variables
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      // Enhanced color system
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Add mana color utilities
        'mana': 'var(--mana-color)',
        'mana-rgb': 'rgba(var(--mana-rgb), <alpha-value>)',
        // Add DefCat brand colors
        'defcat': {
          purple: '#a855f7',
          pink: '#ec4899',
          blue: '#3b82f6',
        }
      },
      // Add backdrop filters
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      // Add custom opacity utilities for glass effects
      opacity: {
        '2': '0.02',
        '3': '0.03',
        '5': '0.05',
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
      },
      // Add ring utilities for focus states
      ringColor: {
        'mana': 'var(--mana-color)',
        'tinted': 'rgba(var(--mana-rgb), 0.5)',
      },
      ringOffsetColor: {
        'mana': 'var(--mana-color)',
      },
      // Add transition durations
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      // Custom spacing for consistent gaps
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },
      // Custom z-index values for layering
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add custom utility plugin for glass effects
    function({ addUtilities }: any) {
      const newUtilities = {
        '.glass-tinted': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(var(--mana-rgb), 0.1)',
        },
        '.glass-tinted-subtle': {
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(var(--mana-rgb), 0.08)',
        },
        '.glass-tinted-strong': {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(var(--mana-rgb), 0.15)',
        },
        '.dark .glass-tinted': {
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(var(--mana-rgb), 0.15)',
        },
        '.dark .glass-tinted-subtle': {
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(var(--mana-rgb), 0.12)',
        },
        '.dark .glass-tinted-strong': {
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(var(--mana-rgb), 0.2)',
        },
        // Button utilities
        '.btn-tinted': {
          background: 'rgba(var(--mana-rgb), 0.1)',
          border: '1px solid rgba(var(--mana-rgb), 0.2)',
          '&:hover': {
            background: 'rgba(var(--mana-rgb), 0.15)',
            border: '1px solid rgba(var(--mana-rgb), 0.3)',
          }
        },
        '.btn-tinted-primary': {
          background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
          color: 'white',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            filter: 'brightness(1.1)',
            boxShadow: '0 4px 12px rgba(var(--mana-rgb), 0.25)',
          }
        },
        // Dark text for white mana buttons
        '[data-mana="W"] .btn-tinted-primary': {
          color: 'hsl(var(--foreground))',
          textShadow: 'none',
        },
        // Input utilities
        '.input-tinted': {
          background: 'rgba(var(--mana-rgb), 0.03)',
          border: '1px solid rgba(var(--mana-rgb), 0.15)',
          '&:focus': {
            background: 'rgba(var(--mana-rgb), 0.05)',
            borderColor: 'var(--mana-color)',
            boxShadow: '0 0 0 3px rgba(var(--mana-rgb), 0.1)',
          }
        },
        // Card utilities
        '.card-tinted': {
          background: 'hsl(var(--card))',
          border: '1px solid rgba(var(--mana-rgb), 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
        '.card-tinted-glass': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(var(--mana-rgb), 0.12)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

export default config