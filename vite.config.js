import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ✅ GitHub Pages ke liye base URL zaroori hai
  base: '/Al-Quran/',
})
