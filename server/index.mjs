// server/index.mjs
// Dedicated Presage SmartSpectra Backend for AWS App Runner & Local Execution
// Handles WebSocket camera frame streaming & strict 30-second credit guard

import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Auto-load .env file if running locally or in development
const __dirname = dirname(fileURLToPath(import.meta.url));
const envCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(__dirname, '../.env'),
  resolve(__dirname, '.env')
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath);
      break;
    } catch {
      // Ignore parse failure
    }
  }
}

// Port configuration (AWS App Runner defaults to 8080 via PORT env; local dev defaults to 8765)
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8765;

// Load @smartspectra/node-sdk
let smartSpectra = null;
try {
  smartSpectra = await import('@smartspectra/node-sdk');
  console.log('[Face Day Server] @smartspectra/node-sdk loaded successfully (v3.5.0).');
} catch (err) {
  console.warn('[Face Day Server] @smartspectra/node-sdk not found, checking local-runner fallback:', err.message);
  try {
    smartSpectra = await import('../local-runner/node_modules/@smartspectra/node-sdk/js/smartspectra.js');
    console.log('[Face Day Server] @smartspectra/node-sdk loaded from local-runner modules.');
  } catch (err2) {
    console.error('[Face Day Server] Critical: @smartspectra/node-sdk could not be resolved:', err2.message);
  }
}

const VALIDATION_GUIDANCE = {
  0: 'TARGET LOCKED: HOLD STEADY',
  1: 'NO FACE DETECTED: STEP INTO THE MIRROR',
  2: 'MULTIPLE FACES: ONLY ONE MAY BE SORTED',
  3: 'ALIGN YOUR GAZE TO CENTER RETICLE',
  4: 'ADJUST DISTANCE TO THE MIRROR',
  5: 'LIGHTING DEFICIENT: INCREASE ILLUMINATION',
  6: 'GLARE DETECTED: SOFTEN LIGHTING',
  7: 'CHEST NOT VISIBLE: FRAME UPPER BODY',
  11: 'FRAME RATE TOO LOW',
  12: 'EXCESSIVE MOTION: REMAIN RESOLUTE',
  13: 'TOO CLOSE: STEP BACK SLIGHTLY',
  14: 'TOO FAR: STEP FORWARD SLIGHTLY',
  17: 'FACE NOT FORWARD: GAZE UPON THE RETICLE'
};

const EXPRESSION_NAMES = {
  0: 'Unspecified',
  1: 'Angry',
  2: 'Contempt',
  3: 'Disgust',
  4: 'Fear',
  5: 'Happy',
  6: 'Neutral',
  7: 'Sad',
  8: 'Surprise'
};

// Create HTTP Server for AWS App Runner Health Check (`GET /health`)
const httpServer = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname === '/health' || url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'face-day-presage-server',
      sdkAvailable: !!smartSpectra,
      hasApiKey: !!process.env.SMARTSPECTRA_API_KEY,
      uptimeSeconds: Math.round(process.uptime()),
      connectedClients: wss.clients.size,
      timestamp: Date.now()
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Attach WebSocket Server to HTTP server
const wss = new WebSocketServer({ server: httpServer });

let sdkInstance = null;
let watchdogTimer = null;
let activeSessionMode = 'none';

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === 1) { // OPEN
      client.send(data);
    }
  }
}

async function stopSession() {
  if (watchdogTimer) {
    clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }
  if (sdkInstance) {
    try {
      console.log('[Face Day Server] Halting SmartSpectra session to preserve credits...');
      await sdkInstance.stopAsync();
      await sdkInstance.destroy();
    } catch (e) {
      console.error('[Face Day Server] Error stopping SDK:', e);
    }
    sdkInstance = null;
  }
  activeSessionMode = 'none';
  broadcast({ type: 'status', status: 'idle' });
}

wss.on('connection', (ws, req) => {
  console.log(`[Face Day Server] Client connected from ${req.socket.remoteAddress}`);

  const hasApiKey = !!process.env.SMARTSPECTRA_API_KEY;
  ws.send(JSON.stringify({
    type: 'connected',
    sdkAvailable: !!smartSpectra,
    hasApiKey,
    creditGuardSeconds: 30
  }));

  ws.on('message', async (raw) => {
    try {
      // 1. Binary raw RGBA frame from browser camera
      if (Buffer.isBuffer(raw) && activeSessionMode === 'custom-frames' && sdkInstance) {
        const nowUs = Number(process.hrtime.bigint() / 1000n);
        try {
          sdkInstance.sendFrame(raw, 160, 120, 640, smartSpectra.PixelFormat.kRGBA, nowUs);
        } catch {
          // Suppress if pipeline draining
        }
        return;
      }

      // 2. Control JSON message
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'start') {
        const apiKey = msg.apiKey || process.env.SMARTSPECTRA_API_KEY;
        if (!apiKey) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'No Presage API key configured. Provide SMARTSPECTRA_API_KEY in environment or start payload.'
          }));
          return;
        }

        if (!smartSpectra) {
          console.warn('[Face Day Server] SmartSpectra SDK not loaded, running fallback session...');
          runEmulationSession(ws);
          return;
        }

        const { SmartSpectraSDK, MetricType, decodeMetrics } = smartSpectra;
        const requestedMetrics = [
          MetricType.PULSE_RATE,
          MetricType.HRV,
          MetricType.BREATHING_RATE,
          MetricType.FACE_LANDMARKS,
          MetricType.EXPRESSIONS
        ];

        await stopSession();

        console.log('[Face Day Server] Starting Presage SmartSpectra session (30-second credit guard active)...');
        sdkInstance = new SmartSpectraSDK({
          apiKey,
          requestedMetrics,
          enableAccumulatedOutput: false,
          enableTelemetry: true
        });

        sdkInstance.useCustomInput();
        activeSessionMode = 'custom-frames';

        broadcast({
          type: 'session_configured',
          mode: activeSessionMode,
          needsFrames: true
        });

        sdkInstance.on('processingStatus', (st) => {
          broadcast({ type: 'processingStatus', status: st });
        });

        sdkInstance.on('validationStatus', (code, ts, hint) => {
          const guidance = VALIDATION_GUIDANCE[code] || hint || 'ADJUST POSITIONING';
          broadcast({ type: 'validationStatus', code, hint, guidance });
        });

        sdkInstance.on('metrics', (buf) => {
          try {
            const decoded = decodeMetrics(buf);

            // Extract latest cardio
            const pulseRate = decoded.cardio?.pulseRate?.[decoded.cardio.pulseRate.length - 1]?.value ?? null;
            const rmssd = decoded.cardio?.hrv?.[decoded.cardio.hrv.length - 1]?.rmssd ?? null;
            const stressIndex = decoded.cardio?.hrv?.[decoded.cardio.hrv.length - 1]?.baevsky ?? null;

            // Extract latest respiration
            const breathingRate = decoded.breathing?.rate?.[decoded.breathing.rate.length - 1]?.value ?? null;

            // Extract landmarks and expressions
            const latestLandmarksObj = decoded.face?.landmarks?.[decoded.face.landmarks.length - 1];
            const landmarks = latestLandmarksObj?.value?.map((pt) => ({ x: pt.x, y: pt.y })) ?? null;

            const latestExpressionObj = decoded.face?.expression?.[decoded.face.expression.length - 1];
            const expressions = {};
            if (latestExpressionObj?.scores) {
              for (const s of latestExpressionObj.scores) {
                const name = EXPRESSION_NAMES[s.type] || 'Unknown';
                expressions[name.toLowerCase()] = Math.round(s.confidence);
              }
            }

            broadcast({
              type: 'metrics',
              pulseRate,
              breathingRate,
              rmssd,
              stressIndex,
              landmarks,
              expressions: Object.keys(expressions).length > 0 ? expressions : null
            });
          } catch (err) {
            console.error('[Face Day Server] Metric decode error:', err);
          }
        });

        sdkInstance.on('error', (code, message, retryable) => {
          console.error(`[Face Day Server] SmartSpectra Error (${code}):`, message);
          broadcast({
            type: 'error',
            code,
            message: typeof message === 'string' ? message : String(code),
            authFailed: code === 2
          });
        });

        sdkInstance.start();
        broadcast({ type: 'session_started', durationSeconds: 30 });

        // Enforce exact 30-second measurement cycle to consume exactly 1 credit
        watchdogTimer = setTimeout(async () => {
          console.log('[Face Day Server] 30s elapsed: session complete, 1 credit consumed.');
          broadcast({ type: 'session_complete' });
          await stopSession();
        }, 30000);

      } else if (msg.type === 'frame' && activeSessionMode === 'custom-frames' && sdkInstance) {
        if (msg.data) {
          const rawBuf = Buffer.from(msg.data, 'base64');
          const nowUs = Number(process.hrtime.bigint() / 1000n);
          sdkInstance.sendFrame(rawBuf, msg.width, msg.height, msg.stride, smartSpectra.PixelFormat.kRGBA, nowUs);
        }
      } else if (msg.type === 'stop') {
        await stopSession();
      }
    } catch (err) {
      console.error('[Face Day Server] Message error:', err);
    }
  });

  ws.on('close', () => {
    console.log('[Face Day Server] Client disconnected.');
  });
});

function runEmulationSession(ws) {
  let elapsed = 0;
  activeSessionMode = 'emulation';
  broadcast({ type: 'session_started', durationSeconds: 30, mode: 'emulation' });

  const interval = setInterval(() => {
    elapsed += 1;
    const t = elapsed / 30;
    broadcast({
      type: 'metrics',
      pulseRate: Math.round(70 + Math.sin(t * 5) * 6),
      breathingRate: Math.round(14 + Math.sin(t * 3) * 2),
      rmssd: Math.round(48 + Math.cos(t * 4) * 8),
      stressIndex: 75,
      elapsed,
      remaining: Math.max(0, 30 - elapsed)
    });

    if (elapsed >= 30) {
      clearInterval(interval);
      broadcast({ type: 'session_complete' });
      activeSessionMode = 'none';
    }
  }, 1000);
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Face Day Server] Listening on http://0.0.0.0:${PORT} (WebSocket + Health check on /health)`);
});
