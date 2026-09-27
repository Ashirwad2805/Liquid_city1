module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#FAFAD9',
          100: '#F8F8D3',
          200: '#F5F5CD', // Exact prompt color #F5F5CD
          300: '#ECECB8',
          400: '#E0E0A0',
          500: '#D2D284',
          600: '#B8B864',
          700: '#8E8E42',
          800: '#5C5C26',
          900: '#303010',
        },
        city: {
          black: '#000000',
          charcoal: '#000000',
          dark: '#000000',
          gray: '#333333',
          muted: '#666666',
          border: '#000000',
          card: '#F5F5CD',
          surface: '#F5F5CD',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(0,0,0,0.1)',
        panel: '0 4px 16px 0 rgba(0,0,0,0.12)',
        modal: '0 20px 60px 0 rgba(0,0,0,0.25)',
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
