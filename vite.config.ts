import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Replace 'your-repo-name' with your actual GitHub repository name
  // Example: if your repo is github.com/user/meal-app, use '/meal-app/'
  base: '/Meal-Management-System/', 
})