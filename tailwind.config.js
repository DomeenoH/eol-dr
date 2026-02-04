/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Platform brand colors for visual form design
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
        // App theme colors
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
        // Progress status colors
        status: {
          'not-started': '#9ca3af',
          'in-progress': '#f59e0b',
          'completed': '#10b981',
          'error': '#ef4444',
        },
      },
      // Touch-friendly spacing for mobile
      spacing: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
