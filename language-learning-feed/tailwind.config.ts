import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      display: ['var(--font-display)', 'var(--font-geist-sans)'],
      sans: ['var(--font-sans)', 'var(--font-geist-sans)', 'system-ui'],
      mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace'],
    },
    extend: {
      colors: {
        brand: {
          surface: '#070711',
          surfaceAlt: '#111129',
          textPrimary: '#F6F6FF',
          textSecondary: '#B4B6C8',
          accent: '#8B82FF',
          accentSoft: '#C0BAFF',
          success: '#2EE6C5',
          warning: '#FFB84D',
          danger: '#FF5C8D',
          glow: '#5EFFFB',
        },
      },
      gradientColorStops: {
        'brand-hero-start': '#6141FF',
        'brand-hero-end': '#FF73B7',
        'brand-reward-start': '#2EE6C5',
        'brand-reward-end': '#5EFFFB',
        'brand-quest-start': '#FFB84D',
        'brand-quest-end': '#FF5C8D',
      },
      boxShadow: {
        neon: '0 12px 32px -20px rgba(98, 88, 255, 0.6), 0 4px 18px -14px rgba(0, 0, 0, 0.7)',
        glow: '0 0 24px rgba(94, 255, 251, 0.45)',
      },
      borderRadius: {
        xl: '24px',
        '3xl': '32px',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      transitionTimingFunction: {
        swipe: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'reward-pop': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '45%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 0 rgba(94, 255, 251, 0.2)' },
          '50%': { opacity: '1', boxShadow: '0 0 36px rgba(94, 255, 251, 0.45)' },
        },
      },
      animation: {
        'reward-pop': 'reward-pop 380ms var(--ease-swipe, cubic-bezier(0.16, 1, 0.3, 1)) both',
        'pulse-glow': 'pulse-glow 2.6s ease-in-out infinite',
      },
    },
  },
  safelist: [
    { pattern: /bg-gradient-to-br/ },
    { pattern: /from-brand-(hero|reward|quest)-(start|end)/ },
    { pattern: /to-brand-(hero|reward|quest)-(start|end)/ },
  ],
  plugins: [typography, forms],
}

export default config


