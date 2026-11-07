/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direct Theme Tokens
        app: 'var(--bg-app)',
        surface: {
          main: 'var(--surface-main)',
          secondary: 'var(--surface-secondary)',
          elevated: 'var(--surface-elevated)',
        },
        ocean: {
          deep: '#164E63',        // Deep Ocean Primary
          deepHover: '#0e3846',
          deepDark: '#0B2934',
          cyan: '#06B6D4',        // Cyan Interactive Accent
          cyanHover: '#0891B2',
          cyanLight: '#E0F2FE',
          cyanGlow: 'rgba(6, 182, 212, 0.25)',
          violet: '#8B5CF6',      // Violet Secondary Accent
          violetHover: '#7C3AED',
          violetLight: '#EDE9FE',
          violetGlow: 'rgba(139, 92, 246, 0.25)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        line: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        // Backward compatibility with previous brand green
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#06B6D4', // Redirected to Ocean Cyan
          600: '#164E63', // Redirected to Deep Ocean
          700: '#0E3846',
          800: '#0B2934',
          900: '#071827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.3)',
        'glow-violet': '0 0 20px -3px rgba(139, 92, 246, 0.3)',
        'saas-card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'saas-card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'saas-dropdown': '0 12px 30px -4px rgba(16, 42, 67, 0.15)',
        'saas-dropdown-dark': '0 12px 30px -4px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
