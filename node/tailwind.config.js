/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../templates/**/*.html',
    '../**/templates/**/*.html',
    '../**/forms.py',
  ],
  theme: {
    extend: {
      fontSize: {
        // set the base font size to 15px
        base: '0.9375rem',
      },
      textOpacity: {
        '85': '0.85', // Custom text opacity
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
  daisyui: {
    themes: ["sunset"],
  },
  safelist: [
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-info',
  ],
}

