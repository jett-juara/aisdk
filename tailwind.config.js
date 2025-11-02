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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "oklch(var(--accent))",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        chart: {
          "1": "oklch(var(--chart-1))",
          "2": "oklch(var(--chart-2))",
          "3": "oklch(var(--chart-3))",
          "4": "oklch(var(--chart-4))",
          "5": "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
        // Auth theme colors
        "auth-bg-form": "var(--color-auth-bg-form)",
        "auth-bg-testimonial": "var(--color-auth-bg-testimonial)",
        "auth-bg-overlay": "var(--color-auth-bg-overlay)",
        "auth-bg-hover": "var(--color-auth-bg-hover)",
        "auth-text-primary": "var(--color-auth-text-primary)",
        "auth-text-secondary": "var(--color-auth-text-secondary)",
        "auth-text-muted": "var(--color-auth-text-muted)",
        "auth-text-error": "var(--color-auth-text-error)",
        "auth-input-bg": "var(--color-auth-input-bg)",
        "auth-input-border": "var(--color-auth-input-border)",
        "auth-input-focus": "var(--color-auth-input-focus)",
        "auth-input-placeholder": "var(--color-auth-input-placeholder)",
        "auth-button-brand": "var(--color-auth-button-brand)",
        "auth-button-brand-hover": "var(--color-auth-button-brand-hover)",
        "auth-button-brand-active": "var(--color-auth-button-brand-active)",
        "auth-button-secondary": "var(--color-auth-button-secondary)",
        "auth-button-secondary-hover": "var(--color-auth-button-secondary-hover)",
        "auth-border": "var(--color-auth-border)",
        "auth-border-light": "var(--color-auth-border-light)",
        "auth-success": "var(--color-auth-success)",
        "auth-warning": "var(--color-auth-warning)",
        "auth-info": "var(--color-auth-info)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },
      spacing: {
        "0": "var(--space-0)",
        "1": "var(--space-1)",
        "2": "var(--space-2)",
        "3": "var(--space-3)",
        "4": "var(--space-4)",
        "5": "var(--space-5)",
        "6": "var(--space-6)",
        "8": "var(--space-8)",
        "10": "var(--space-10)",
        "12": "var(--space-12)",
        "16": "var(--space-16)",
      },
      fontSize: {
        "xxs": "var(--text-xxs)",
        "xs": "var(--text-xs)",
        "sm": "var(--text-sm)",
        "md": "var(--text-md)",
        "lg": "var(--text-lg)",
        "xl": "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
        "4xl": "var(--text-4xl)",
        "5xl": "var(--text-5xl)",
      },
      fontFamily: {
        sans: ["var(--font-rubik)", "var(--font-manrope)", "sans-serif"],
        serif: ["var(--font-montagu-slab)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        brand: ["var(--font-montserrat)", "sans-serif"],
        heading: ["var(--font-raleway)", "sans-serif"],
        body: ["var(--font-rubik)", "var(--font-manrope)", "sans-serif"],
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        base: "var(--transition-base)",
        slow: "var(--transition-slow)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
