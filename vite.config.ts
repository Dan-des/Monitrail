import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Load all env vars (including non-VITE_ keys for local dev API execution)
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Monitrail - Monthly Financial Tracker',
          short_name: 'Monitrail',
          description: 'Track your spending and manage your finances seamlessly.',
          theme_color: '#09090b',
          background_color: '#09090b',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: /^\/api\/.*/i,
              handler: 'NetworkOnly',
            },
          ],
        },
      }),
      // Local dev middleware: directly imports and delegates to the real
      // Vercel serverless handler (/api/transactions.ts) via ssrLoadModule,
      // ensuring zero logic or SQL duplication between dev and production.
      {
        name: 'vercel-api-dev-middleware',
        apply: 'serve',
        configureServer(server) {
          let cachedHandler: any = null
          server.watcher.on('change', (file) => {
            if (file.includes('api/transactions')) {
              cachedHandler = null
            }
          })

          server.middlewares.use(async (req: any, res: any, next: any) => {
            if (req.url && req.url.startsWith('/api/transactions')) {
              try {
                const url = new URL(req.url, 'http://localhost')
                req.query = Object.fromEntries(url.searchParams.entries())

                if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
                  const buffers: any[] = []
                  for await (const chunk of req) {
                    buffers.push(chunk)
                  }
                  const rawBody = Buffer.concat(buffers).toString('utf8')
                  try {
                    req.body = rawBody ? JSON.parse(rawBody) : {}
                  } catch {
                    req.body = rawBody
                  }
                }

                res.status = (code: number) => {
                  res.statusCode = code
                  return res
                }
                res.json = (data: any) => {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(data))
                  return res
                }

                if (!cachedHandler) {
                  const mod = await server.ssrLoadModule('/api/transactions.ts')
                  cachedHandler = mod.default
                }
                await cachedHandler(req, res)
                return
              } catch (err) {
                console.error('Error handling API request in dev server:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Internal Server Error' }))
                return
              }
            }
            next()
          })
        },
      },
    ],
  }
})
