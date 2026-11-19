import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { generateRobotsTxt, generateSitemapXml, normalizeSiteUrl } from './src/lib/seo.ts';

function neuralAtlasSeoPlugin(siteUrl: string): Plugin {
  const normalizedBase = normalizeSiteUrl(siteUrl);
  let outDir = 'dist';

  return {
    name: 'neural-atlas-seo-build',
    configResolved(config) {
      outDir = config.build.outDir || 'dist';
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(generateSitemapXml(normalizedBase));
          return;
        }
        if (req.url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(generateRobotsTxt(normalizedBase));
          return;
        }
        next();
      });
    },
    transformIndexHtml(html) {
      if (!normalizedBase) return html;
      return html
        .replace('</head>', `  <link rel="canonical" href="${normalizedBase}/" />\n  </head>`)
        .replace('<meta property="og:url" content="/" />', `<meta property="og:url" content="${normalizedBase}/" />`)
        .replace('<meta property="og:image" content="/og-preview.png" />', `<meta property="og:image" content="${normalizedBase}/og-preview.png" />`)
        .replace('<meta name="twitter:image" content="/og-preview.png" />', `<meta name="twitter:image" content="${normalizedBase}/og-preview.png" />`);
    },
    closeBundle() {
      const resolvedOut = path.resolve(process.cwd(), outDir);
      if (!fs.existsSync(resolvedOut)) return;
      fs.writeFileSync(path.join(resolvedOut, 'sitemap.xml'), generateSitemapXml(normalizedBase), 'utf8');
      fs.writeFileSync(path.join(resolvedOut, 'robots.txt'), generateRobotsTxt(normalizedBase), 'utf8');
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const configuredSiteUrl = env.VITE_SITE_URL || process.env.VITE_SITE_URL || '';

  return {
    plugins: [
      react(),
      tailwindcss(),
      neuralAtlasSeoPlugin(configuredSiteUrl),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script-defer',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'og-preview.png', 'robots.txt', 'sitemap.xml'],
        devOptions: {
          enabled: true,
        },
        manifest: {
          id: '/',
          name: 'Neural Atlas — Abdalrahman Mostafa',
          short_name: 'Neural Atlas',
          description:
            'Bilingual personal learning portfolio of Abdalrahman Mostafa, Intelligent Computing student at Al-Azhar University.',
          theme_color: '#050811',
          background_color: '#050811',
          display: 'standalone',
          orientation: 'any',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          globPatterns: ['**/*.{html,ico,svg,json,css,js}'],
          globIgnores: [
            '**/KaTeX_*',
            '**/Admin*',
            '**/vendor-katex*',
            '**/vendor-markdown*',
            '**/vendor-three*',
            '**/HeroCanvasScene*',
          ],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /\/assets\/.*\.(?:js|css|woff2|ttf|woff)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'app-lazy-assets-cache',
                expiration: {
                  maxEntries: 80,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-react',
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                priority: 30,
              },
              {
                name: 'vendor-katex',
                test: /[\\/]node_modules[\\/]katex[\\/]/,
                priority: 25,
              },
              {
                name: 'vendor-markdown',
                test: /[\\/]node_modules[\\/](marked|highlight\.js)[\\/]/,
                priority: 24,
              },
              {
                name: 'vendor-firebase',
                test: /[\\/]node_modules[\\/]firebase[\\/]/,
                priority: 22,
              },
              {
                name: 'vendor-three',
                test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
                priority: 20,
              },
            ],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
