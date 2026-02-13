/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/frontend/tailwind/**/*.{js,ts,jsx,tsx}',
    './src/frontend/shared/**/*.{js,ts,jsx,tsx}',
    './src/frontend/admin/**/*.{js,ts,jsx,tsx}',
    './node_modules/iiif-browser/dist/**/*.{js,mjs,cjs}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
