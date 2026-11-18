// worker/index.ts
// Cloudflare Worker Edge Proxy for Face Day & Presage SmartSpectra Health Checks

export interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  SMARTSPECTRA_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight handling for API routes
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // Edge Health & Proxy Route: Bypasses browser CORS for Presage API diagnostic probes
    if (url.pathname === '/api/presage-probe') {
      const targetParam = url.searchParams.get('url') || 'https://physiology.presagetech.com/';
      const apiKey = env.SMARTSPECTRA_API_KEY || request.headers.get('x-api-key') || '';

      const start = Date.now();
      try {
        const headers: Record<string, string> = {
          'Accept': '*/*',
          'User-Agent': 'FaceDay-Edge-Proxy/1.0'
        };
        if (apiKey) {
          headers['x-api-key'] = apiKey;
        }

        const upstream = await fetch(targetParam, {
          method: request.method === 'POST' ? 'POST' : 'GET',
          headers,
          body: request.method === 'POST' ? await request.text() : undefined
        });

        const latencyMs = Date.now() - start;
        const bodyText = await upstream.text();

        return new Response(JSON.stringify({
          ok: upstream.ok,
          status: upstream.status,
          statusText: upstream.statusText,
          latencyMs,
          targetUrl: targetParam,
          headers: Object.fromEntries(upstream.headers.entries()),
          bodySnippet: bodyText.slice(0, 1000)
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (err: unknown) {
        return new Response(JSON.stringify({
          ok: false,
          status: 502,
          error: String(err),
          targetUrl: targetParam
        }), {
          status: 200, // Return 200 so browser diagnostic client can parse the error payload
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Default: Serve static assets (HTML, CSS, JS, images)
    return env.ASSETS.fetch(request);
  }
};
