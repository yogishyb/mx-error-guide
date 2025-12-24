import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // JavaScript obfuscation for production builds
    obfuscatorPlugin({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['node_modules/**'],
      apply: 'build',
      options: {
        // Control flow flattening
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,

        // Dead code injection
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.3,

        // String obfuscation
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 0.5,
        stringArrayRotate: true,
        stringArrayShuffle: true,

        // Identifier obfuscation
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false, // Keep React/MUI imports working

        // Split strings
        splitStrings: true,
        splitStringsChunkLength: 10,

        // Anti-debugging
        debugProtection: true,
        debugProtectionInterval: 2000,
        disableConsoleOutput: true,

        // Self-defending
        selfDefending: true,

        // Transform object keys
        transformObjectKeys: true,

        // Target browser
        target: 'browser',

        // Seed for reproducible builds
        seed: 0,
      },
    }),
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
