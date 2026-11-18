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

    // Active Face Scan Session Dispatcher
    // Uses env.SMARTSPECTRA_API_KEY to register measurement sessions and record credit usage
    if (url.pathname === '/api/presage-session') {
      const apiKey = env.SMARTSPECTRA_API_KEY || request.headers.get('x-api-key') || '';
      const action = url.searchParams.get('action') || 'start';

      let requestBody: Record<string, unknown> = {};
      if (request.method === 'POST') {
        try {
          requestBody = (await request.json()) as Record<string, unknown>;
        } catch {
          requestBody = {};
        }
      }

      const headers: Record<string, string> = {
        'Accept': 'application/json, */*',
        'User-Agent': 'FaceDay-ComicBattleground/1.0'
      };
      if (apiKey) {
        headers['x-api-key'] = apiKey;
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Dispatch session ping to Presage Physiology Cloud endpoints
      let presageStatus = 200;
      let upstreamDetails: Record<string, unknown> = {};

      try {
        if (apiKey) {
          // Attempt metrics authorization / session registration with Presage
          const pingPromise = fetch('https://cont-api.physiology.presagetech.com/v2/metrics/authorize', {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              metrics: [1, 2, 3, 4],
              session: {
                action,
                durationSeconds: 30,
                client: 'FaceDay-TCG-Battleground',
                telemetry: requestBody
              }
            })
          });

          // Timeout after 3.5s so client never blocks
          const timeoutPromise = new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Presage upstream timeout')), 3500)
          );

          const upstreamRes = await Promise.race([pingPromise, timeoutPromise]);
          presageStatus = upstreamRes.status;
          upstreamDetails = {
            presageStatus: upstreamRes.status,
            presageStatusText: upstreamRes.statusText
          };
        } else {
          upstreamDetails = { note: 'No SMARTSPECTRA_API_KEY set in environment' };
        }
      } catch (err) {
        upstreamDetails = { note: 'Edge fallback active', error: String(err) };
      }

      return new Response(JSON.stringify({
        ok: true,
        action,
        keyConfigured: !!apiKey,
        keyPrefix: apiKey ? apiKey.slice(0, 6) + '...' : 'none',
        sessionDuration: 30,
        presageStatus,
        upstream: upstreamDetails,
        timestamp: Date.now()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
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
