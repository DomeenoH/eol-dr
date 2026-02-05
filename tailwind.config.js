/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 启用类名控制的暗色模式
  theme: {
    extend: {
      colors: {
        // Platform brand colors
        discord: '#5865F2',
        whatsapp: '#25D366',
        facebook: '#1877F2',
        twitter: '#1DA1F2',
        instagram: '#E4405F',
        google: '#4285F4',
        github: '#181717',
        linkedin: '#0A66C2',
        skype: '#00AFF0',
        imessage: '#34C759',

        // Extended slate for dark mode background
        slate: {
          850: '#1e293b', // 混合色
          950: '#0F172A', // 深岩灰背景
        },

        // New Design System Colors
        accent: {
          blue: {
            DEFAULT: '#3B82F6',
            hover: '#2563EB',
            glow: 'rgba(59, 130, 246, 0.5)',
          },
          purple: {
            DEFAULT: '#8B5CF6',
            hover: '#7C3AED',
            glow: 'rgba(139, 92, 246, 0.5)',
          },
          orange: {
            DEFAULT: '#F97316',
            hover: '#EA580C',
            glow: 'rgba(249, 115, 22, 0.5)',
          },
        },

        // Legacy support (to be refactored)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        status: {
          'not-started': '#9ca3af',
          'in-progress': '#f59e0b',
          'completed': '#10b981',
          'error': '#ef4444',
        },
      },
      // Glassmorphism utilities
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.3)',
        'glow-md': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      spacing: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
