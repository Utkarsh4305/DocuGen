import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme base colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // CodeMorph futuristic theme colors
        neon: {
          blue: "#00D4FF",
          purple: "#8B5CF6",
          pink: "#F472B6",
          green: "#10B981",
          orange: "#F59E0B",
          red: "#EF4444",
        },
        dark: {
          900: "#0A0A0F",
          800: "#0F0F17",
          700: "#16161F",
          600: "#1C1C27",
          500: "#24243A",
          400: "#2D2D44",
          300: "#36364E",
          200: "#3F3F58",
          100: "#484862",
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          light: "rgba(255, 255, 255, 0.1)",
          dark: "rgba(0, 0, 0, 0.2)",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "monospace"],
      },
      fontSize: {
        "2xs": "0.625rem",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "morphing": "morphing 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 4s ease-in-out infinite",
        "neon-glow": "neon-glow 1.5s ease-in-out infinite alternate",
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
        "glow-pulse": {
          "0%": {
            boxShadow: "0 0 5px theme('colors.neon.blue'), 0 0 10px theme('colors.neon.blue'), 0 0 15px theme('colors.neon.blue')",
          },
          "100%": {
            boxShadow: "0 0 10px theme('colors.neon.blue'), 0 0 20px theme('colors.neon.blue'), 0 0 30px theme('colors.neon.blue')",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "morphing": {
          "0%, 100%": { 
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            transform: "rotate(0deg) scale(1)",
          },
          "50%": { 
            borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
            transform: "rotate(180deg) scale(1.05)",
          },
        },
        "gradient-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
        "neon-glow": {
          "0%": {
            textShadow: "0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor",
          },
          "100%": {
            textShadow: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid-pattern": `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "neon": "0 0 5px theme('colors.neon.blue'), 0 0 20px theme('colors.neon.blue')",
        "neon-purple": "0 0 5px theme('colors.neon.purple'), 0 0 20px theme('colors.neon.purple')",
        "neon-pink": "0 0 5px theme('colors.neon.pink'), 0 0 20px theme('colors.neon.pink')",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-lg": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};