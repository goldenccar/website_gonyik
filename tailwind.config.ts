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
        sans: ['Inter Variable', 'Noto Sans SC Variable', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      fontSize: {
        'hero': ['56px', { lineHeight: '1.1', fontWeight: '600' }],
        'h1': ['44px', { lineHeight: '1.15', fontWeight: '600' }],
        'h2': ['40px', { lineHeight: '1.18', fontWeight: '600' }],
        'h3': ['30px', { lineHeight: '1.25', fontWeight: '600' }],
        'h4': ['22px', { lineHeight: '1.35', fontWeight: '600' }],
        'h5': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.7', fontWeight: '400' }],
        'label': ['11px', { lineHeight: '1.4', letterSpacing: '0.16em', fontWeight: '500' }],
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
