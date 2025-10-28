/** biome-ignore-all lint/complexity/useArrowFunction: <explanation> */
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
  		backgroundColor: {
  			tinted: 'var(--bg-tinted)',
  			'card-tinted': 'var(--card-tinted)',
  			'accent-tinted': 'var(--accent-tinted)'
  		},
  		borderColor: {
  			tinted: 'var(--border-tinted)',
  			'tinted-strong': 'rgba(var(--mana-rgb), 0.35)',
  			'tinted-subtle': 'rgba(var(--mana-rgb), 0.15)'
  		},
  		textColor: {
  			tinted: 'var(--mana-color)',
  			'tinted-subtle': 'rgba(var(--mana-rgb), 0.75)',
  			'tinted-strong': 'var(--mana-color)'
  		},
  		boxShadow: {
  			tinted: '0 2px 8px rgba(var(--glass-shadow-rgb), 0.12)',
  			'tinted-lg': '0 4px 16px rgba(var(--glass-shadow-rgb), 0.18)',
  			'tinted-xl': '0 8px 32px rgba(var(--glass-shadow-rgb), 0.25)',
  			'tinted-glow': '0 0 20px rgba(var(--mana-rgb), 0.25), 0 4px 16px rgba(var(--glass-shadow-rgb), 0.15)'
  		},
  		backgroundImage: {
  			'gradient-tinted': 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
  			'gradient-tinted-radial': 'radial-gradient(circle at center, rgba(var(--mana-rgb), 0.20), transparent 70%)'
  		},
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
  				'0%': {
  					transform: 'translateX(-100%) translateY(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%) translateY(100%)'
  				}
  			},
  			'pulse-tinted': {
  				'0%, 100%': {
  					boxShadow: '0 0 0 0 rgba(var(--mana-rgb), 0.5)'
  				},
  				'50%': {
  					boxShadow: '0 0 0 12px rgba(var(--mana-rgb), 0)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			}
  		},
  		animation: {
  			shimmer: 'shimmer 3s infinite',
  			'pulse-tinted': 'pulse-tinted 2s infinite',
  			float: 'float 4s ease-in-out infinite'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
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
  			mana: 'var(--mana-color)',
  			'mana-rgb': 'rgba(var(--mana-rgb), <alpha-value>)',
  			defcat: {
  				purple: '#a855f7',
  				pink: '#ec4899',
  				blue: '#3b82f6'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		backdropBlur: {
  			xs: '2px',
  			sm: '4px',
  			DEFAULT: '8px',
  			md: '12px',
  			lg: '16px',
  			xl: '24px'
  		},
  		opacity: {
  			'2': '0.02',
  			'3': '0.03',
  			'6': '0.06',
  			'8': '0.08',
  			'10': '0.10',
  			'12': '0.12',
  			'15': '0.15',
  			'18': '0.18',
  			'20': '0.20'
  		},
  		ringColor: {
  			mana: 'var(--mana-color)',
  			tinted: 'rgba(var(--mana-rgb), 0.5)'
  		},
  		ringOffsetColor: {
  			mana: 'var(--mana-color)'
  		},
  		transitionDuration: {
  			'250': '250ms',
  			'350': '350ms',
  			'400': '400ms'
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'120': '30rem'
  		},
  		zIndex: {
  			'60': '60',
  			'70': '70',
  			'80': '80',
  			'90': '90',
  			'100': '100'
  		}
  	}
  },
  plugins: [
    require('tailwindcss-animate'),
    // Add custom utility plugin for glass effects - ENHANCED VISIBILITY
    function ({ addUtilities }: any) {
      const newUtilities = {
        // GLASS EFFECTS - Light Mode (more visible)
        '.glass-tinted': {
          background:
            'linear-gradient(135deg, rgba(var(--glass-base-rgb), 0.12), rgba(var(--glass-base-rgb), 0.06))',
          backdropFilter:
            'blur(var(--glass-blur)) saturate(var(--glass-saturation)) brightness(var(--glass-brightness))',
          WebkitBackdropFilter:
            'blur(var(--glass-blur)) saturate(var(--glass-saturation)) brightness(var(--glass-brightness))',
          border: '1px solid rgba(var(--glass-border-rgb), 0.22)',
        },
        '.glass-tinted-subtle': {
          background:
            'linear-gradient(135deg, rgba(var(--glass-base-rgb), 0.08), rgba(var(--glass-base-rgb), 0.04))',
          backdropFilter: 'blur(10px) saturate(1.1)',
          WebkitBackdropFilter: 'blur(10px) saturate(1.1)',
          border: '1px solid rgba(var(--glass-border-rgb), 0.15)',
        },
        '.glass-tinted-strong': {
          background:
            'linear-gradient(135deg, rgba(var(--glass-base-rgb), 0.18), rgba(var(--glass-base-rgb), 0.10))',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          border: '1px solid rgba(var(--glass-border-rgb), 0.28)',
        },

        // GLASS EFFECTS - Dark Mode (enhanced)
        '.dark .glass-tinted': {
          background:
            'linear-gradient(135deg, rgba(var(--glass-base-rgb), 0.10), rgba(var(--glass-base-rgb), 0.05))',
          border: '1px solid rgba(var(--glass-border-rgb), 0.18)',
          backdropFilter: 'blur(16px) saturate(1.25) brightness(1.08)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.25) brightness(1.08)',
        },
        '.dark .glass-tinted-subtle': {
          background:
            'linear-gradient(135deg, rgba(var(--glass-base-rgb), 0.06), rgba(var(--glass-base-rgb), 0.03))',
          border: '1px solid rgba(var(--glass-border-rgb), 0.12)',
          backdropFilter: 'blur(12px) saturate(1.15)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.15)',
        },
        '.dark .glass-tinted-strong': {
          background:
            'linear-gradient(135deg, rgba(var(--glass-base-rgb), 0.15), rgba(var(--glass-base-rgb), 0.08))',
          border: '1px solid rgba(var(--glass-border-rgb), 0.25)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
        },

        // BUTTON UTILITIES - Enhanced visibility
        '.btn-tinted': {
          background: 'rgba(var(--mana-rgb), 0.15)',
          border: '1px solid rgba(var(--mana-rgb), 0.28)',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(var(--mana-rgb), 0.22)',
            border: '1px solid rgba(var(--mana-rgb), 0.40)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(var(--mana-rgb), 0.25)',
          },
        },
        '.btn-tinted-primary': {
          background: 'linear-gradient(135deg, var(--mana-tint-medium), var(--mana-tint-light))',
          border: '1px solid var(--border-tinted)',
          color: 'var(--text-primary)',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, var(--mana-tint-strong), var(--mana-tint-medium))',
            borderColor: 'var(--mana-color)',
            boxShadow: '0 4px 12px rgba(var(--mana-rgb), 0.32)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 6px rgba(var(--mana-rgb), 0.25)',
          },
        },

        // Dark text for white mana buttons (better contrast)
        '[data-mana="white"] .btn-tinted-primary': {
          color: '#1a1a1a !important',
          textShadow: 'none !important',
        },
        'html[data-mana="white"] .btn-tinted-primary': {
          color: '#1a1a1a !important',
          textShadow: 'none !important',
        },
        'html[data-mana="white"] a.btn-tinted-primary': {
          color: '#1a1a1a !important',
          textShadow: 'none !important',
        },
        'html[data-mana="white"] .text-primary-foreground': {
          color: '#1a1a1a !important',
        },
        'html[data-mana="white"] .btn-tinted-primary.text-primary-foreground': {
          color: '#1a1a1a !important',
        },
        '.dark html[data-mana="white"] .btn-tinted-primary': {
          color: '#0a0a0a !important',
          textShadow: 'none !important',
        },

        // INPUT UTILITIES - Enhanced visibility
        '.input-tinted': {
          background: 'rgba(var(--mana-rgb), 0.06)',
          border: '1px solid rgba(var(--mana-rgb), 0.25)',
          transition: 'all 0.2s ease',
          '&:focus': {
            background: 'rgba(var(--mana-rgb), 0.10)',
            borderColor: 'var(--mana-color)',
            boxShadow: '0 0 0 3px rgba(var(--mana-rgb), 0.15)',
            outline: 'none',
          },
          '&::placeholder': {
            color: 'var(--text-tertiary)',
          },
        },

        // CARD UTILITIES - Enhanced depth
        '.card-tinted': {
          background: 'var(--card-tinted)',
          border: '1px solid var(--border-tinted)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(var(--mana-rgb), 0.15)',
          transition: 'all 0.2s ease',
        },
        '.card-tinted-glass': {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturation))',
          WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturation))',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(var(--mana-rgb), 0.20)',
            borderColor: 'rgba(var(--glass-border-rgb), 0.28)',
          },
        },

        // HOVER STATES - More pronounced
        '.hover-tinted': {
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'var(--hover-overlay)',
            borderColor: 'rgba(var(--mana-rgb), 0.35)',
          },
        },

        // FOCUS RINGS - More visible
        '.focus-ring-tinted': {
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px var(--focus-ring)',
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 3px var(--focus-ring)',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
}

export default config
