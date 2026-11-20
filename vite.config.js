import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  //test
  test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/setupTests.js',
  },
  server: {
    proxy: {
      // microservicios Spring Boot (las rutas especificas van primero)
      '/api/v1/usuarios': 'http://localhost:8082',
      '/api/v1/comentarios': 'http://localhost:8082',
      '/api/v1/compras': 'http://localhost:8083',
      '/api/v1/productos': 'http://localhost:8081',
      '/api/v1/categorias': 'http://localhost:8081',
    },
    watch: {
      usePolling: true,
      ignored: ["**/node_modules/**", "**/.git/**", "**/server/**"]
    }
  }
})
