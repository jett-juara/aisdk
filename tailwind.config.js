import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ["class"],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem'
		},
		extend: {
			colors: {
				border: {
					'700': 'var(--color-border-700)',
					'800': 'var(--color-border-800)',
					'900': 'var(--color-border-900)'
				},
				input: {
					bg: {
						'900': 'var(--color-input-bg-900)'
					},
					border: {
						'800': 'var(--color-input-border-800)'
					},
					focus: {
						'700': 'var(--color-input-focus-700)'
					},
					placeholder: {
						'600': 'var(--color-input-placeholder-600)'
					}
				},
				ring: {
					'500': 'var(--color-ring-500)'
				},
				background: {
					'600': 'var(--color-background-600)',
					'700': 'var(--color-background-700)',
					'800': 'var(--color-background-800)',
					'900': 'var(--color-background-900)',
					'brand-800': 'var(--color-background-brand-800)',
					otan: 'var(--color-background-otan)'
				},
				foreground: 'var(--foreground)',
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: 'var(--color-button-secondary)',
				destructive: 'var(--color-button-destructive)',
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				chart: {
					'1': 'var(--chart-1)',
					'2': 'var(--chart-2)',
					'3': 'var(--chart-3)',
					'4': 'var(--chart-4)',
					'5': 'var(--chart-5)'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				text: {
					'50': 'var(--color-text-50)',
					'100': 'var(--color-text-100)',
					'200': 'var(--color-text-200)',
					'400': 'var(--color-text-400)',
					'500': 'var(--color-text-500)',
					'900': 'var(--color-text-900)',
					error: {
						'500': 'var(--color-text-error-500)'
					},
					success: {
						'500': 'var(--color-text-success-500)'
					},
					warning: {
						'500': 'var(--color-text-warning-500)'
					},
					info: {
						'500': 'var(--color-text-info-500)'
					},
					grafy: {
						'500': 'var(--color-text-grafy-500)'
					},
					otan: {
						'500': 'var(--color-text-otan-500)'
					}
				},
				'background-toast': {
					success: 'var(--color-background-success)',
					error: 'var(--color-background-error)',
					warning: 'var(--color-background-warning)',
					info: 'var(--color-background-info)',
					destructive: 'var(--color-background-destructive)'
				},
				brand: {
					'50': 'var(--color-brand-50)',
					'100': 'var(--color-brand-100)',
					'500': 'var(--color-brand-500)',
					'600': 'var(--color-brand-600)',
					'700': 'var(--color-brand-700)',
					'800': 'var(--color-brand-800)'
				},
				hover: {
					overlay: {
						'700': 'var(--color-hover-overlay-700)'
					}
				},
				button: {
					primary: 'var(--color-button-primary)',
					'primary-hover': 'var(--color-button-primary-hover)',
					'primary-active': 'var(--color-button-primary-active)'
				},
				'secondary-hover': 'var(--color-button-secondary-hover)',
				'outline-text': 'var(--color-button-outline-text)',
				'outline-border': 'var(--color-button-outline-border)',
				'outline-hover': 'var(--color-button-outline-hover)',
				'destructive-hover': 'var(--color-button-destructive-hover)',
				'destructive-active': 'var(--color-button-destructive-active)',
				orange: 'var(--color-button-orange)',
				'orange-hover': 'var(--color-button-orange-hover)',
				'orange-active': 'var(--color-button-orange-active)',
				blue: 'var(--color-button-blue)',
				'blue-hover': 'var(--color-button-blue-hover)',
				'blue-active': 'var(--color-button-blue-active)',
				green: 'var(--color-button-green)',
				'green-hover': 'var(--color-button-green-hover)',
				'green-active': 'var(--color-button-green-active)',

				// Premium Theme Colors
				'background-deep': 'var(--color-background-deep)',
				'glass-border': 'var(--color-glass-border)',
				'glass-bg': 'var(--color-glass-bg)',
				'glass-bg-hover': 'var(--color-glass-bg-hover)',
				'glow-primary': 'var(--color-glow-primary)',
				'glow-secondary': 'var(--color-glow-secondary)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'calc(var(--radius) + 4px)',
				'2xl': 'var(--radius-2xl)',
				'3xl': 'calc(var(--radius) + 8px)',
				full: 'var(--radius-full)',
				none: 'var(--radius-none)'
			},
			spacing: {
				'0': 'var(--space-0)',
				'1': 'var(--space-1)',
				'2': 'var(--space-2)',
				'3': 'var(--space-3)',
				'4': 'var(--space-4)',
				'5': 'var(--space-5)',
				'6': 'var(--space-6)',
				'8': 'var(--space-8)',
				'10': 'var(--space-10)',
				'12': 'var(--space-12)',
				'16': 'var(--space-16)'
			},
			fontFamily: {
				sans: [
					'var(--font-rubik)',
					'var(--font-manrope)',
					'sans-serif'
				],
				serif: [
					'var(--font-montagu-slab)',
					'serif'
				],
				mono: [
					'var(--font-jetbrains-mono)',
					'monospace'
				],
				brand: [
					'var(--font-montserrat)',
					'sans-serif'
				],
				heading: [
					'var(--font-albert-sans)',
					'sans-serif'
				],
				subheading: [
					'var(--font-rubik)',
					'sans-serif'
				],
				body: [
					'var(--font-manrope)',
					'sans-serif'
				],
				button: [
					'var(--font-instrument-sans)',
					'sans-serif'
				]
			},
			width: {
				mobile: '100%',
				tablet: '60%',
				desktop: '50%'
			},
			maxWidth: {
				mobile: '100%',
				tablet: '80%',
				desktop: '50%'
			},
			size: {
				'icon-mobile': '80px',
				'icon-tablet': '180px',
				'icon-desktop': '350px'
			},
			transitionDuration: {
				fast: 'var(--transition-fast)',
				base: 'var(--transition-base)',
				slow: 'var(--transition-slow)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			transitionTimingFunction: {
				'premium': 'cubic-bezier(0.22, 1, 0.36, 1)'
			},
			backgroundImage: {
				'noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
				'glass-gradient': 'linear-gradient(to top right, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
			}
		}
	},
	plugins: [animate],
};

export default config;
