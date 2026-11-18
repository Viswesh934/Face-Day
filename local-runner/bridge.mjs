// local-runner/bridge.mjs
// Presage SmartSpectra SDK WebSocket Bridge for Face Day
// 100% On-Device execution with strict 30-Second Credit Guard

import { WebSocketServer } from 'ws';

const PORT = process.env.BRIDGE_PORT ? parseInt(process.env.BRIDGE_PORT) : 8765;
const wss = new WebSocketServer({ port: PORT });

console.log(`[Face Day Bridge] WebSocket bridge listening on ws://127.0.0.1:${PORT}`);

let sdkInstance = null;
let watchdogTimer = null;
let activeWs = null;

// Dynamic import so runner can run even if native FFI is absent on unsupported environments
let smartSpectra = null;
try {
  smartSpectra = await import('@smartspectra/node-sdk');
} catch (err) {
  console.warn('[Face Day Bridge] @smartspectra/node-sdk not loaded:', err.message);
}

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
      console.log('[Face Day Bridge] Halting SmartSpectra session to preserve credits...');
      await sdkInstance.stopAsync();
      await sdkInstance.destroy();
    } catch (e) {
      console.error('[Face Day Bridge] Error stopping SDK:', e);
    }
    sdkInstance = null;
  }
  broadcast({ type: 'status', status: 'idle' });
}

wss.on('connection', (ws) => {
  activeWs = ws;
  console.log('[Face Day Bridge] Web UI connected.');
  ws.send(JSON.stringify({ 
    type: 'connected', 
    sdkAvailable: !!smartSpectra,
    creditGuardSeconds: 30 
  }));

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'start') {
        const apiKey = msg.apiKey || process.env.SMARTSPECTRA_API_KEY;
        if (!apiKey) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'No Presage API key provided. Set SMARTSPECTRA_API_KEY or supply via UI.' 
          }));
          return;
        }

        if (!smartSpectra) {
          // Synthetic emulation mode for environments without native C-API dependencies
          console.log('[Face Day Bridge] Running in high-fidelity synthetic emulation mode...');
          runSyntheticSession(ws);
          return;
        }

        const { SmartSpectraSDK, cardioMetrics, breathingMetrics, faceMetrics, decodeMetrics } = smartSpectra;
        const requestedMetrics = [...cardioMetrics, ...breathingMetrics, ...faceMetrics];

        await stopSession(); // Clean prior session if any

        console.log('[Face Day Bridge] Initializing SmartSpectra SDK session with 30s credit guard...');
        sdkInstance = new SmartSpectraSDK({
          apiKey,
          requestedMetrics,
          enableAccumulatedOutput: false
        });

        sdkInstance.on('processingStatus', (st) => {
          broadcast({ type: 'processingStatus', status: st });
        });

        sdkInstance.on('validationStatus', (code, ts, hint) => {
          broadcast({ type: 'validationStatus', code, hint });
        });

        sdkInstance.on('metrics', (buf) => {
          try {
            const decoded = decodeMetrics(buf);
            broadcast({
              type: 'metrics',
              pulseRate: decoded.cardio?.pulseRate?.[decoded.cardio.pulseRate.length - 1]?.value ?? null,
              breathingRate: decoded.breathing?.rate?.[decoded.breathing.rate.length - 1]?.value ?? null,
              rmssd: decoded.cardio?.hrv?.rmssd ?? null,
              stressIndex: decoded.cardio?.hrv?.baevskyStressIndex ?? null,
              expressions: decoded.face?.expressionProbabilities ?? null
            });
          } catch (err) {
            console.error('[Face Day Bridge] Metric decode error:', err);
          }
        });

        sdkInstance.on('error', (err) => {
          console.error('[Face Day Bridge] SDK Error:', err);
          broadcast({ type: 'error', message: err.message || 'SDK Error' });
        });

        sdkInstance.start();
        broadcast({ type: 'session_started', durationSeconds: 30 });

        // Enforce 30-second measurement cycle to use exactly 1 credit
        watchdogTimer = setTimeout(async () => {
          console.log('[Face Day Bridge] 30 seconds reached. Automatically stopping session (1 credit consumed).');
          broadcast({ type: 'session_complete' });
          await stopSession();
        }, 30000);

      } else if (msg.type === 'stop') {
        await stopSession();
      }
    } catch (err) {
      console.error('[Face Day Bridge] Message handling error:', err);
    }
  });

  ws.on('close', () => {
    console.log('[Face Day Bridge] Web UI disconnected.');
  });
});

// Synthetic fallback for instant testing without consuming API credits
function runSyntheticSession(ws) {
  let elapsed = 0;
  broadcast({ type: 'session_started', durationSeconds: 30, mode: 'synthetic' });

  const interval = setInterval(() => {
    elapsed += 1;
    // Generate realistic fluctuating micro-vitals
    const t = elapsed / 30;
    const pulse = Math.round(68 + Math.sin(t * 6) * 8 + (Math.random() - 0.5) * 4);
    const breathing = Math.round(14 + Math.sin(t * 3) * 2);
    const rmssd = Math.round(42 + Math.cos(t * 4) * 12);
    const stressIndex = Math.round(85 + Math.sin(t * 5) * 20);

    broadcast({
      type: 'metrics',
      pulseRate: pulse,
      breathingRate: breathing,
      rmssd: rmssd,
      stressIndex: stressIndex,
      elapsed: elapsed,
      remaining: 30 - elapsed
    });

    if (elapsed >= 30) {
      clearInterval(interval);
      broadcast({ type: 'session_complete' });
    }
  }, 1000);

  watchdogTimer = interval;
}

process.on('SIGINT', async () => {
  await stopSession();
  process.exit(0);
});
