// tailwind.config.ts
// Created: Christmas Shopping Journey theme configuration

import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // shadcn/ui base colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Primary - Deep dark (matches Spooky Hunt aesthetic)
        primary: {
          DEFAULT: "#0f1419",
          foreground: "#F8FAFC",
        },

        // Secondary - Christmas Red
        secondary: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#1F2937",
          foreground: "#F8FAFC",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ==========================================
        // CHRISTMAS THEME COLORS
        // ==========================================

        // Christmas Red palette
        "christmas-red": {
          DEFAULT: "#dc2626",
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },

        // Christmas Green palette
        "christmas-green": {
          DEFAULT: "#16a34a",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },

        // Christmas Gold palette
        "christmas-gold": {
          DEFAULT: "#f59e0b",
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },

        // Legacy color aliases (for Spooky Hunt compatibility)
        "gold": "#f59e0b",
        "dark-gray": "#1F2937",
        "light-gray": "#F8FAFC",
        "white-600": "#F3F4F6",
        "white-700": "#E5E7EB",
        "onyx-gray": "#1a1f2e",
        "black-600": "#1F2937",
        "green-success": "#16a34a",
        "red-error": "#dc2626",
        "text-light": "#F8FAFC",
        "text-muted": "#9CA3AF",

        // Semantic colors
        success: "#16a34a",
        error: "#dc2626",
        warning: "#f59e0b",
        info: "#0ea5e9",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      spacing: {
        "touch": "44px", // Minimum touch target
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },

      keyframes: {
        // shadcn/ui defaults
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },

        // Custom animations
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(220, 38, 38, 0.4)" },
          "50%": { boxShadow: "0 0 30px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.3)" },
        },
        "pulse-glow-green": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(22, 163, 74, 0.4)" },
          "50%": { boxShadow: "0 0 30px rgba(22, 163, 74, 0.6), 0 0 40px rgba(22, 163, 74, 0.3)" },
        },
        "pulse-glow-gold": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(245, 158, 11, 0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(245, 158, 11, 0.5), 0 0 35px rgba(245, 158, 11, 0.2)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
        "border-glow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        "text-glow": {
          "0%, 100%": { textShadow: "0 0 10px currentColor" },
          "50%": { textShadow: "0 0 20px currentColor, 0 0 30px currentColor" },
        },
        "confetti": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        "count-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      animation: {
        // shadcn/ui defaults
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        // Custom animations
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "fade-in-down": "fade-in-down 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "pulse-glow-green": "pulse-glow-green 2s ease-in-out infinite",
        "pulse-glow-gold": "pulse-glow-gold 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "wiggle": "wiggle 0.5s ease-in-out",
        "border-glow": "border-glow 2s ease-in-out infinite",
        "text-glow": "text-glow 2s ease-in-out infinite",
        "confetti": "confetti 3s ease-out forwards",
        "count-up": "count-up 0.5s ease-out",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "christmas-gradient": "linear-gradient(135deg, #dc2626 0%, #16a34a 100%)",
        "gold-gradient": "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
        "shimmer-gradient": "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
      },

      boxShadow: {
        "glow-red": "0 0 20px rgba(220, 38, 38, 0.4), 0 0 40px rgba(220, 38, 38, 0.2)",
        "glow-green": "0 0 20px rgba(22, 163, 74, 0.4), 0 0 40px rgba(22, 163, 74, 0.2)",
        "glow-gold": "0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)",
        "inner-glow": "inset 0 2px 4px 0 rgb(255 255 255 / 0.05)",
      },

      transitionTimingFunction: {
        "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config