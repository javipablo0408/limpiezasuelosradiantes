import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0d1117',
        surface: '#161b22',
        surface2: '#21262d',
        border: '#30363d',
        border2: '#484f58',
        text: '#e6edf3',
        muted: '#8b949e',
        accent: '#2dd4bf',
        accent2: '#0d9488'
      }
    }
  }
};

export default config;
