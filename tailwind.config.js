/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Share Tech Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        matrix: '#00ff66',
        void: '#000000',
        carbon: '#0a0a0a',
      },
      boxShadow: {
        neon: '0 0 24px rgba(0,255,102,0.35)',
        danger: '0 0 28px rgba(248,113,113,0.45)',
      },
      animation: {
        'slow-spin': 'spin 16s linear infinite',
        scan: 'scan 7s linear infinite',
        pulsefast: 'pulse 1.15s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
};
