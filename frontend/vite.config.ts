import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
// Obfuscation disabled - was breaking production builds
// import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  base: '/iso20022',
  plugins: [
    react(),
    // NOTE: Obfuscation disabled for now - caused runtime errors
    // Will re-enable with safer settings later
    // Generate gzip compressed files
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files larger than 10kb
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Generate brotli compressed files (better compression than gzip)
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Bundle size visualization (run build to generate stats.html)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  // Remove console logs and debugger statements in production
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    // Output to /iso20022/ subdirectory to match base path
    // This ensures assets are served from /iso20022/assets/...
    outDir: 'dist/iso20022',

    // Minification settings
    minify: 'esbuild', // esbuild is faster than terser, good balance of speed and size
    target: 'es2015', // Target modern browsers for better tree shaking

    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunk for React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // MUI core and styling
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],

          // MUI icons (typically large)
          'mui-icons': ['@mui/icons-material'],

          // Search library
          'fuse': ['fuse.js'],
        },

        // Generate meaningful chunk names for better debugging
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,

    // Source maps for production debugging (optional, increases size)
    sourcemap: false,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', 'fuse.js'],
  },
})
