/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        creator: {
          bg: '#07090e',
          card: '#0f1420',
          border: '#1e2638',
          hover: '#172033',
          text: '#f1f5f9',
          muted: '#94a3b8',
        },
        yt: {
          red: '#ff0000',
          hover: '#cc0000',
          glow: 'rgba(255, 0, 0, 0.2)',
        },
        ig: {
          pink: '#e1306c',
          purple: '#833ab4',
          orange: '#f56040',
          gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        },
        ai: {
          cyan: '#06b6d4',
          indigo: '#6366f1',
          purple: '#a855f7',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        'glow-red': '0 0 20px -5px rgba(255, 0, 0, 0.3)',
        'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.3)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-slow': 'glow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.4', filter: 'blur(8px)' },
          '100%': { opacity: '0.8', filter: 'blur(12px)' },
        }
      }
    },
  },
  plugins: [],
}
