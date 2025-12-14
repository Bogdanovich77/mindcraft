import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env variables regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'

  return {
    plugins: [
      react(),
      // Bundle analyzer for production builds
      isProduction && visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        // Ensure single React instance
        'react': resolve(__dirname, 'node_modules/react'),
        'react-dom': resolve(__dirname, 'node_modules/react-dom'),
        '@emotion/react': resolve(__dirname, 'node_modules/@emotion/react'),
        '@emotion/styled': resolve(__dirname, 'node_modules/@emotion/styled'),
      },
    },
    build: {
      // Enhanced production build optimizations
      target: 'es2020',
      minify: isProduction ? 'terser' : false,
      sourcemap: isDevelopment,
      reportCompressedSize: isProduction,
      rollupOptions: {
        output: {
          // Advanced code splitting strategy
          manualChunks: (id) => {
            // Core React ecosystem - keep together to prevent multiple instances
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-redux') || 
                id.includes('@emotion/react') || id.includes('@emotion/styled')) {
              return 'react-vendor'
            }
            // Material-UI components
            if (id.includes('@mui/material') || id.includes('@mui/icons-material')) {
              return 'mui-vendor'
            }
            // Chart libraries
            if (id.includes('d3') || id.includes('recharts')) {
              return 'charts-vendor'
            }
            // Utility libraries
            if (id.includes('lodash') || id.includes('date-fns')) {
              return 'utils-vendor'
            }
            // Socket.IO and networking
            if (id.includes('socket.io') || id.includes('axios')) {
              return 'network-vendor'
            }
            // Performance monitoring
            if (id.includes('@sentry')) {
              return 'monitoring-vendor'
            }
            // Node.js polyfills
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
          // Optimize chunk naming for long-term caching
          chunkFileNames: isProduction
            ? 'static/js/[name]-[hash:8].js'
            : 'static/js/[name].js',
          entryFileNames: isProduction
            ? 'static/js/[name]-[hash:8].js'
            : 'static/js/[name].js',
          assetFileNames: isProduction
            ? 'static/assets/[name]-[hash:8].[ext]'
            : 'static/assets/[name].[ext]',
        },
        // External dependencies for CDN - removed React to prevent conflicts
        external: isProduction ? [] : [],
      },
      // Reduced chunk size warnings for better mobile performance
      chunkSizeWarningLimit: 500,
      // Optimize assets
      assetsInlineLimit: isProduction ? 2048 : 4096,
      cssCodeSplit: true,
      // Enable CSS code splitting
      cssMinify: isProduction,
      // Enable dynamic import optimizations
      dynamicImportVarsOptions: {
        warnOnError: true,
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      // Enhanced HMR configuration
      hmr: {
        overlay: true,
        port: 5173, // Use same port as server to avoid WebSocket connection issues
      },
      // Enhanced proxy configuration for development
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          timeout: 10000,
        },
        '/socket.io': {
          target: env.VITE_SOCKET_URL || 'http://localhost:8080',
          changeOrigin: true,
          ws: true,
          timeout: 10000,
        },
      },
      // CORS configuration
      cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      // Production preview optimizations
      headers: {
        'Cache-Control': 'public, max-age=31536000',
      },
    },
    // Enhanced environment-specific configurations
    define: {
      __APP_ENV__: JSON.stringify(mode),
      __API_URL__: JSON.stringify(env.VITE_API_URL || 'http://localhost:8080'),
      __SOCKET_URL__: JSON.stringify(env.VITE_SOCKET_URL || 'http://localhost:8080'),
      __CDN_URL__: JSON.stringify(env.VITE_CDN_URL || ''),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __SENTRY_DSN__: JSON.stringify(env.VITE_SENTRY_DSN || ''),
      __GOOGLE_ANALYTICS_ID__: JSON.stringify(env.VITE_GOOGLE_ANALYTICS_ID || ''),
      __ENABLE_ANALYTICS__: JSON.stringify(env.VITE_ENABLE_ANALYTICS === 'true'),
      __ENABLE_ERROR_TRACKING__: JSON.stringify(env.VITE_ENABLE_ERROR_TRACKING === 'true'),
      __ENABLE_PERFORMANCE_MONITORING__: JSON.stringify(env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true'),
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-redux',
        '@emotion/react',
        '@emotion/styled',
        '@mui/material',
        '@mui/icons-material',
        'd3',
        'recharts',
        'socket.io-client',
        'axios',
        'lodash',
        'date-fns',
        'hoist-non-react-statics',
      ],
      // Force optimization to prevent duplicate React instances
      force: true,
      // Ensure single instance of React and related packages
      preBundleExtensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    // Experimental features for production
    experimental: {
      renderBuiltUrl: (filename, { hostType, type: _type }) => {
        if (hostType === 'js' && isProduction && env.VITE_CDN_URL) {
          return { js: `${env.VITE_CDN_URL}/${filename}` }
        }
        return { relative: true }
      },
    },
  }
})
