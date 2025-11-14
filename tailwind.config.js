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
    },
    extend: {
      colors: {
        // Standard shadcn/ui colors (mapped to new dark mode system)
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },

        // ===== NEW COLOR SYSTEM (Dark Mode Only) =====
        // Based on Sophisticated Dark Green-Gray Theme with Warm Accents

        // Background System (6 levels)
        background: {
          900: "var(--color-background-900)",  // Main app background
          800: "var(--color-background-800)",  // Surfaces
          700: "var(--color-background-700)",   // Elevated
          600: "var(--color-background-600)",   // Muted
          "brand-800": "var(--color-background-brand-800)", // Brand background
          otan: "var(--color-background-otan)",         // Otan background
        },

        // Text System (5 levels)
        text: {
          50: "var(--color-text-50)",      // Primary text
          100: "var(--color-text-100)",    // Secondary text
          200: "var(--color-text-200)",    // Tertiary text
          400: "var(--color-text-400)",    // Muted text
          500: "var(--color-text-500)",    // Disabled text
          900: "var(--color-text-900)",    // Text on light background
          error: {
            500: "var(--color-text-error-500)",    // Error messages
          },
          success: {
            500: "var(--color-text-success-500)",  // Success messages
          },
          warning: {
            500: "var(--color-text-warning-500)",  // Warning messages
          },
          info: {
            500: "var(--color-text-info-500)",    // Info messages
          },
          grafy: {
            500: "var(--color-text-grafy-500)",    // Optional color Grafy
          },
          otan: {
            500: "var(--color-text-otan-500)",     // Optional color Otan
          },
        },

        // Background Toast System (5 levels)
        "background-toast": {
          success: "var(--color-background-success)",     // Success toast background
          error: "var(--color-background-error)",         // Error toast background
          warning: "var(--color-background-warning)",     // Warning toast background
          info: "var(--color-background-info)",           // Info toast background
          destructive: "var(--color-background-destructive)", // Destructive toast background
        },

        // Brand System (5 levels)
        brand: {
          50: "var(--color-brand-50)",     // Light variant
          100: "var(--color-brand-100)",   // Light variant
          500: "var(--color-brand-500)",   // Primary brand
          600: "var(--color-brand-600)",   // Hover state
          700: "var(--color-brand-700)",   // Active state
          800: "var(--color-brand-800)",   // Secondary brand
        },

        // Border System (3 levels)
        border: {
          900: "var(--color-border-900)",  // Very Dark borders
          800: "var(--color-border-800)",  // Default borders
          700: "var(--color-border-700)",  // Light borders
        },

        // Input System (4 levels)
        input: {
          bg: {
            900: "var(--color-input-bg-900)",    // Input background
          },
          border: {
            800: "var(--color-input-border-800)", // Input border
          },
          focus: {
            700: "var(--color-input-focus-700)",   // Focus ring
          },
          placeholder: {
            600: "var(--color-input-placeholder-600)", // Placeholder
          },
        },

        // Interactive States
        hover: {
          overlay: {
            700: "var(--color-hover-overlay-700)", // Hover effects
          },
        },
        ring: {
          500: "var(--color-ring-500)",           // Focus rings
        },

        // ===== BUTTON COLORS (12 tokens) =====

        // Primary Button (3 states)
        button: {
          primary: "var(--color-button-primary)",         // Base
          "primary-hover": "var(--color-button-primary-hover)",   // Hover
          "primary-active": "var(--color-button-primary-active)",  // Active
        },

        // Secondary Button (2 states)
        secondary: "var(--color-button-secondary)",               // Secondary button
        "secondary-hover": "var(--color-button-secondary-hover)", // Secondary hover

        // Outline Button (3 states)
        "outline-text": "var(--color-button-outline-text)",      // Text color
        "outline-border": "var(--color-button-outline-border)",   // Border
        "outline-hover": "var(--color-button-outline-hover)",     // Hover bg

        // Destructive Button (3 states)
        destructive: "var(--color-button-destructive)",            // Base
        "destructive-hover": "var(--color-button-destructive-hover)",  // Custom hover
        "destructive-active": "var(--color-button-destructive-active)", // Custom active

        // Colorful Buttons (3 colors × 3 states each)
        orange: "var(--color-button-orange)",              // Orange base
        "orange-hover": "var(--color-button-orange-hover)",   // Orange hover
        "orange-active": "var(--color-button-orange-active)", // Orange active

        blue: "var(--color-button-blue)",                // Blue base
        "blue-hover": "var(--color-button-blue-hover)",     // Blue hover
        "blue-active": "var(--color-button-blue-active)",   // Blue active

        green: "var(--color-button-green)",              // Green base
        "green-hover": "var(--color-button-green-hover)",   // Green hover
        "green-active": "var(--color-button-green-active)", // Green active
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "var(--radius-2xl)",
        "3xl": "calc(var(--radius) + 8px)",
        full: "var(--radius-full)",
        none: "var(--radius-none)",
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
        fontFamily: {
        sans: ["var(--font-rubik)", "var(--font-manrope)", "sans-serif"],
        serif: ["var(--font-montagu-slab)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        brand: ["var(--font-montserrat)", "sans-serif"],
        heading: ["var(--font-albert-sans)", "sans-serif"],
        subheading: ["var(--font-rubik)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        button: ["var(--font-instrument-sans)", "sans-serif"],
      },

      // Global responsive width system (simplified)
      width: {
        "mobile": "100%",     // Mobile default
        "tablet": "60%",      // md: 768px+
        "desktop": "50%",     // lg: 1024px+
      },
      maxWidth: {
        "mobile": "100%",     // Mobile default
        "tablet": "80%",      // md: 768px+
        "desktop": "50%",     // lg: 1024px+
      },

      // Global responsive component sizing (simplified)
      size: {
        "icon-mobile": "80px",   // Mobile
        "icon-tablet": "180px", // md: 768px+
        "icon-desktop": "350px", // lg: 1024px+
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
