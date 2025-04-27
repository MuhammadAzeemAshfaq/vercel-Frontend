import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,       // <-- this line makes Vite open the browser
    port: 5173        // you can customize the port here too
  }
})



