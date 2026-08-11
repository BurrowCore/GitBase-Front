/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gitbase: {
          dark: '#1a1b25',
          light: '#ffffff',
          secondary: '#232432',
          'secondary-light': '#f8fafc',
          border: '#2f3042',
          'border-dark': '#2f3042',
          'border-light': '#e2e8f0',
          // Panel/'card' background sitting above the page gradient. Without this, form controls
          // (input/textarea/select) fell back to the browser's white default and their light text
          // became invisible.
          surface: {
            dark: '#232432',
            light: '#ffffff',
          },
          danger: '#FC8181',
          primary: '#7C5CF3',
          'primary-light': '#a78bfa',
          accent: '#00D4FF',
          'accent-light': '#7dd3fc',
          success: '#4FD1C5',
          'success-light': '#6ee7b7',
          warning: '#F6AD55',
          'warning-light': '#fcd34d',
          error: '#FC8181',
          'error-light': '#fca5a5',
          purple: '#8b5cf6',
          pink: '#ec4899',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          text: {
            primary: '#F7FAFC',
            secondary: '#A0AEC0',
            dark: '#1f2937',
            muted: '#6b7280'
          },
          gradient: {
            start: '#4f46e5',
            mid: '#7c3aed',
            end: '#c026d3'
          }
        }
      }
    },
  },
  plugins: [],
}

