import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const config = {
    plugins: [react()],
    // Use conditional base path depending on environment
    base: command === 'serve' ? '/' : '/example/',
    
    // Add resolve.alias configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      outDir: 'example',
    },
  }
  
  return config
})
