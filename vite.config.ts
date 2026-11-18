import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022'
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/presage-bridge': {
        target: 'ws://127.0.0.1:8765',
        ws: true,
        rewriteWsOrigin: true
      }
    }
  },
  plugins: [
    {
      name: 'presage-edge-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/presage-probe', async (req, res) => {
          const url = new URL(req.url || '', 'http://127.0.0.1:5173');
          const targetUrl = url.searchParams.get('url') || 'https://physiology.presagetech.com/';
          const start = Date.now();
          try {
            const upstream = await fetch(targetUrl, {
              headers: {
                'x-api-key': 'T7qZxpQWBs8fzHjhWg2088UAoG1yWxOq9AUXShxp',
                'User-Agent': 'FaceDay-Edge-Proxy/1.0'
              }
            });
            const latencyMs = Date.now() - start;
            const text = await upstream.text();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              ok: upstream.ok,
              status: upstream.status,
              statusText: upstream.statusText,
              latencyMs,
              targetUrl,
              headers: Object.fromEntries(upstream.headers.entries()),
              bodySnippet: text.slice(0, 1000)
            }));
          } catch (err: unknown) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ ok: false, status: 502, error: String(err) }));
          }
        });
      }
    }
  ]
});
