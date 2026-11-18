// local-runner/bridge.mjs
// Presage SmartSpectra SDK WebSocket Bridge for Face Day
// 100% On-Device execution with strict 30-Second Credit Guard

import { WebSocketServer } from 'ws';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Auto-load .env file from root or local runner dir
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
      // Ignore if parsing fails
    }
  }
}

const PORT = process.env.BRIDGE_PORT ? parseInt(process.env.BRIDGE_PORT) : 8765;
const wss = new WebSocketServer({ port: PORT });

console.log(`[Face Day Bridge] WebSocket bridge listening on ws://127.0.0.1:${PORT}`);

let sdkInstance = null;
let watchdogTimer = null;
let activeSessionMode = 'none';

// Load @smartspectra/node-sdk
let smartSpectra = null;
try {
  smartSpectra = await import('@smartspectra/node-sdk');
  console.log('[Face Day Bridge] @smartspectra/node-sdk loaded successfully.');
} catch (err) {
  console.warn('[Face Day Bridge] @smartspectra/node-sdk could not be loaded:', err.message);
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
  activeSessionMode = 'none';
  broadcast({ type: 'status', status: 'idle' });
}

wss.on('connection', (ws) => {
  console.log('[Face Day Bridge] Web UI connected.');

  const hasApiKey = !!process.env.SMARTSPECTRA_API_KEY;
  ws.send(JSON.stringify({ 
    type: 'connected', 
    sdkAvailable: !!smartSpectra,
    hasApiKey,
    creditGuardSeconds: 30 
  }));

  ws.on('message', async (raw) => {
    try {
      // Check if message is binary raw frame
      if (Buffer.isBuffer(raw) && activeSessionMode === 'custom-frames' && sdkInstance) {
        // High-performance binary frame pipeline (RGBA buffer)
        // Stride = 160 * 4 = 640 bytes for a 160x120 frame
        const nowUs = Number(process.hrtime.bigint() / 1000n);
        sdkInstance.sendFrame(raw, 160, 120, 640, smartSpectra.PixelFormat.kRGBA, nowUs);
        return;
      }

      const msg = JSON.parse(raw.toString());

      if (msg.type === 'start') {
        const apiKey = msg.apiKey || process.env.SMARTSPECTRA_API_KEY;
        if (!apiKey) {
          console.warn('[Face Day Bridge] Missing API key in start request.');
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'No Presage API key provided. Set SMARTSPECTRA_API_KEY or supply via UI.' 
          }));
          return;
        }

        if (!smartSpectra) {
          console.log('[Face Day Bridge] Running in high-fidelity synthetic emulation mode...');
          runSyntheticSession(ws);
          return;
        }

        const { SmartSpectraSDK, CameraSelection, cardioMetrics, breathingMetrics, faceMetrics, decodeMetrics } = smartSpectra;
        const requestedMetrics = [...cardioMetrics, ...breathingMetrics, ...faceMetrics];

        await stopSession();

        console.log('[Face Day Bridge] Initializing SmartSpectra SDK session with 30s credit guard...');
        sdkInstance = new SmartSpectraSDK({
          apiKey,
          requestedMetrics,
          enableAccumulatedOutput: false
        });

        // Determine camera input mode
        let availableCameras = [];
        try {
          availableCameras = SmartSpectraSDK.availableCameras();
        } catch {
          availableCameras = [];
        }

        if (availableCameras.length > 0) {
          console.log('[Face Day Bridge] Utilizing host camera hardware via useCamera()...');
          sdkInstance.useCamera(CameraSelection.default);
          activeSessionMode = 'native-camera';
        } else {
          console.log('[Face Day Bridge] Utilizing browser frame pipeline via useCustomInput()...');
          sdkInstance.useCustomInput();
          activeSessionMode = 'custom-frames';
        }

        // Notify client about frame expectations
        broadcast({ 
          type: 'session_configured', 
          mode: activeSessionMode,
          needsFrames: activeSessionMode === 'custom-frames'
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
            
            // Extract latest cardio values
            const pulseRate = decoded.cardio?.pulseRate?.[decoded.cardio.pulseRate.length - 1]?.value ?? null;
            const rmssd = decoded.cardio?.hrv?.[decoded.cardio.hrv.length - 1]?.rmssd ?? null;
            const stressIndex = decoded.cardio?.hrv?.[decoded.cardio.hrv.length - 1]?.baevsky ?? null;
            
            // Extract latest breathing
            const breathingRate = decoded.breathing?.rate?.[decoded.breathing.rate.length - 1]?.value ?? null;
            
            // Extract facial analysis: landmarks, blinks, expressions
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
            console.error('[Face Day Bridge] Metric decode error:', err);
          }
        });

        sdkInstance.on('error', (err) => {
          console.error('[Face Day Bridge] SDK Error:', err);
          broadcast({ type: 'error', message: err.message || 'SmartSpectra Engine Error' });
        });

        sdkInstance.start();
        broadcast({ type: 'session_started', durationSeconds: 30 });

        // Enforce exact 30-second measurement cycle to use exactly 1 credit
        watchdogTimer = setTimeout(async () => {
          console.log('[Face Day Bridge] 30 seconds reached. Automatically stopping session (1 credit consumed).');
          broadcast({ type: 'session_complete' });
          await stopSession();
        }, 30000);

      } else if (msg.type === 'frame' && activeSessionMode === 'custom-frames' && sdkInstance) {
        // Base64 frame ingestion from client
        if (msg.data) {
          const rawBuf = Buffer.from(msg.data, 'base64');
          const nowUs = Number(process.hrtime.bigint() / 1000n);
          sdkInstance.sendFrame(rawBuf, msg.width, msg.height, msg.stride, smartSpectra.PixelFormat.kRGBA, nowUs);
        }
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

// Synthetic fallback for rapid verification without consuming API credits
function runSyntheticSession(ws) {
  let elapsed = 0;
  activeSessionMode = 'synthetic';
  broadcast({ type: 'session_started', durationSeconds: 30, mode: 'synthetic' });

  const interval = setInterval(() => {
    elapsed += 1;
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
      expressions: {
        neutral: Math.round(70 + Math.sin(t * 4) * 15),
        happy: Math.round(15 + Math.cos(t * 3) * 10),
        focused: Math.round(15 + Math.sin(t * 5) * 10)
      },
      elapsed: elapsed,
      remaining: 30 - elapsed
    });

    if (elapsed >= 30) {
      clearInterval(interval);
      broadcast({ type: 'session_complete' });
      activeSessionMode = 'none';
    }
  }, 1000);

  watchdogTimer = interval;
}

process.on('SIGINT', async () => {
  await stopSession();
  process.exit(0);
});
