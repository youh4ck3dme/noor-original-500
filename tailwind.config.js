
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'gm-bg': 'var(--gm-bg)',
        'gm-bg-soft': 'var(--gm-bg-soft)',
        'gm-surface': 'var(--gm-surface)',
        'gm-surface-glass': 'var(--gm-surface-glass)',
        'gm-primary': 'var(--gm-primary)',
        'gm-primary-hover': 'var(--gm-primary-hover)',
        'gm-accent': 'var(--gm-accent)',
        'gm-text': 'var(--gm-text)',
        'gm-text-muted': 'var(--gm-text-muted)',
        'gm-border': 'var(--gm-border)',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'gm-sm': 'var(--gm-radius-sm)',
        'gm-md': 'var(--gm-radius-md)',
        'gm-lg': 'var(--gm-radius-lg)',
        'gm-xl': 'var(--gm-radius-xl)',
      },
      boxShadow: {
        'gm-soft': 'var(--gm-shadow-soft)',
      }
    },
  },
  plugins: [],
}
