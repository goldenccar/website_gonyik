import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
        accentWarm: 'var(--color-accent-warm)',
        light: 'var(--color-light)',
        bg: 'var(--color-bg)',
        dark: 'var(--color-dark)',
        darker: 'var(--color-darker)',
        border: 'var(--color-border)',
        borderDark: 'var(--color-border-dark)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
      },
      fontFamily: {
        sans: ['Inter', 'Alibaba PuHuiTi 2.0', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      fontSize: {
        'hero': ['52px', { lineHeight: '1.15', fontWeight: '700' }],
        'h1': ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '1.25', fontWeight: '700' }],
        'h3': ['28px', { lineHeight: '1.3', fontWeight: '700' }],
        'h4': ['22px', { lineHeight: '1.4', fontWeight: '700' }],
        'h5': ['18px', { lineHeight: '1.4', fontWeight: '700' }],
        'body': ['16px', { lineHeight: '1.5' }],
        'label': ['11px', { lineHeight: '1.4', letterSpacing: '2px', fontWeight: '500' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      maxWidth: {
        'content': '1280px',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config
