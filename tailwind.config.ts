import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1A',
        secondary: '#888888',
        muted: '#666666',
        accent: '#AAAAAA',
        light: '#CCCCCC',
        bg: '#EDEDED',
        dark: '#111111',
        darker: '#0D0D0D',
        border: '#E8E8E8',
        borderDark: '#333333',
        success: '#22AA66',
        error: '#FF4444',
        warning: '#FFAA00',
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
        'body': ['15px', { lineHeight: '1.8' }],
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
