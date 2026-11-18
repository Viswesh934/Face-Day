// src/biometric-bridge.ts
// Dual-mode biometric connector: Bridges to local Presage SmartSpectra runner or browser camera

import { OpticalVitalsScanner, OpticalMetrics, Point2D } from './optical-vitals';

export interface UnifiedVitals {
  source: 'presage-hardware' | 'browser-camera' | 'synthetic';
  elapsed: number;
  remaining: number;
  pulseBpm: number;
  breathingRate: number;
  rmssd?: number | null;
  stressIndex?: number | null;
  calmScore: number;
  guidanceText?: string;
  landmarks?: Point2D[] | null;
  primaryExpression?: string;
  expressions?: Record<string, number> | null;
}

export class BiometricBridge {
  private ws: WebSocket | null = null;
  private optical: OpticalVitalsScanner = new OpticalVitalsScanner();
  private isWsConnected: boolean = false;
  private needsFrames: boolean = false;
  private activeMode: 'presage-hardware' | 'browser-camera' | 'synthetic' = 'browser-camera';

  public onUpdate?: (v: UnifiedVitals) => void;
  public onComplete?: (finalVitals: UnifiedVitals) => void;
  public onError?: (err: Error) => void;
  public onGuidance?: (text: string) => void;
  public onConnectionChange?: (info: { connected: boolean; hasApiKey: boolean; sdkAvailable: boolean; mode: string }) => void;

  private retryTimer: number | null = null;
  private connectionInfo = {
    connected: false,
    hasApiKey: false,
    sdkAvailable: false,
    mode: 'browser-camera'
  };

  constructor() {
    this.probeLocalRunner();
    this.startReconnectionPolling();
  }

  private startReconnectionPolling() {
    if (this.retryTimer) return;
    this.retryTimer = window.setInterval(() => {
      if (!this.isWsConnected) {
        this.probeLocalRunner();
      }
    }, 4000);
  }

  // Attempt discovery of local Presage Node runner via Vite proxy or direct WS
  public probeLocalRunner() {
    if (this.isWsConnected && this.ws) return;

    try {
      const isHttps = window.location.protocol === 'https:';
      const wsProto = isHttps ? 'wss:' : 'ws:';
      // In dev with Vite, /presage-bridge proxies to 8765. Otherwise try direct 127.0.0.1:8765
      const wsUrl = window.location.host 
        ? `${wsProto}//${window.location.host}/presage-bridge`
        : 'ws://127.0.0.1:8765';

      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        this.isWsConnected = true;
        this.ws = socket;
        console.log('[Face Day] Connected to Presage SmartSpectra Bridge at', wsUrl);
        this.bindWsEvents(socket);
      };

      socket.onerror = () => {
        // Fallback to direct 127.0.0.1:8765 if proxy attempt failed on HTTP
        if (!isHttps && wsUrl.includes('/presage-bridge')) {
          try {
            const fallbackSocket = new WebSocket('ws://127.0.0.1:8765');
            fallbackSocket.onopen = () => {
              this.isWsConnected = true;
              this.ws = fallbackSocket;
              this.bindWsEvents(fallbackSocket);
            };
          } catch {
            // direct failed too
          }
        }
        this.isWsConnected = false;
        this.notifyStatus(false);
      };

      socket.onclose = () => {
        this.isWsConnected = false;
        this.ws = null;
        this.notifyStatus(false);
      };
    } catch {
      this.isWsConnected = false;
      this.notifyStatus(false);
    }
  }

  private notifyStatus(connected: boolean, hasApiKey = false, sdkAvailable = false) {
    this.connectionInfo = {
      connected,
      hasApiKey,
      sdkAvailable,
      mode: connected && sdkAvailable ? 'presage-hardware' : 'browser-camera'
    };
    if (this.onConnectionChange) {
      this.onConnectionChange(this.connectionInfo);
    }
  }

  public get isConnectedToBridge(): boolean {
    return this.isWsConnected;
  }

  public get currentStatus() {
    return this.connectionInfo;
  }

  private bindWsEvents(socket: WebSocket) {
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connected') {
          this.notifyStatus(true, !!data.hasApiKey, !!data.sdkAvailable);
        } else if (data.type === 'session_configured') {
          this.needsFrames = !!data.needsFrames;
          console.log(`[Face Day] Presage Bridge configured: mode=${data.mode}, needsFrames=${this.needsFrames}`);
        } else if (data.type === 'validationStatus') {
          if (this.onGuidance && data.guidance) {
            this.onGuidance(data.guidance);
          }
        } else if (data.type === 'error') {
          console.warn('[Face Day] Presage Bridge returned error:', data.message);
          if (data.authFailed) {
            // Presage server rejected key: seamlessly switch to optical scanner
            this.activeMode = 'browser-camera';
          }
        } else if (data.type === 'metrics') {
          const uv: UnifiedVitals = {
            source: 'presage-hardware',
            elapsed: data.elapsed || 0,
            remaining: data.remaining || 30,
            pulseBpm: data.pulseRate || 72,
            breathingRate: data.breathingRate || 14,
            rmssd: data.rmssd,
            stressIndex: data.stressIndex,
            calmScore: Math.round(data.rmssd ? Math.min(95, Math.max(10, (data.rmssd / 65) * 100)) : 60),
            landmarks: data.landmarks,
            expressions: data.expressions,
            primaryExpression: data.expressions ? this.getTopExpression(data.expressions) : undefined
          };
          if (this.onUpdate) this.onUpdate(uv);
        } else if (data.type === 'session_complete') {
          if (this.onComplete) {
            this.onComplete({
              source: 'presage-hardware',
              elapsed: 30,
              remaining: 0,
              pulseBpm: 72,
              breathingRate: 14,
              calmScore: 65
            });
          }
        }
      } catch (e) {
        console.error('[Face Day] Error parsing bridge frame:', e);
      }
    };
  }

  private getTopExpression(expressions: Record<string, number>): string {
    let topName = 'Neutral';
    let maxVal = -1;
    for (const [name, val] of Object.entries(expressions)) {
      if (val > maxVal) {
        maxVal = val;
        topName = name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
    return topName;
  }

  public async startTrial(videoEl: HTMLVideoElement, apiKey?: string): Promise<void> {
    // Always configure optical callbacks so camera preview, face tracking and fallback work flawlessly
    this.optical.onUpdate = (opt: OpticalMetrics) => {
      if (this.activeMode !== 'presage-hardware') {
        const uv: UnifiedVitals = {
          source: 'browser-camera',
          elapsed: opt.elapsedSeconds,
          remaining: opt.remainingSeconds,
          pulseBpm: opt.pulseBpm,
          breathingRate: opt.breathingRate,
          calmScore: opt.calmScore,
          guidanceText: opt.guidanceText,
          landmarks: opt.landmarks,
          primaryExpression: opt.primaryExpression
        };
        if (this.onUpdate) this.onUpdate(uv);
        if (this.onGuidance && opt.guidanceText) this.onGuidance(opt.guidanceText);
      }
    };

    this.optical.onComplete = (opt: OpticalMetrics) => {
      if (this.activeMode !== 'presage-hardware') {
        const finalV: UnifiedVitals = {
          source: 'browser-camera',
          elapsed: 30,
          remaining: 0,
          pulseBpm: opt.pulseBpm,
          breathingRate: opt.breathingRate,
          calmScore: opt.calmScore,
          primaryExpression: opt.primaryExpression
        };
        if (this.onComplete) this.onComplete(finalV);
      }
    };

    this.optical.onError = (err) => {
      if (this.onError) this.onError(err);
    };

    if (this.isWsConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.activeMode = 'presage-hardware';
      this.ws.send(JSON.stringify({ type: 'start', apiKey }));

      // Also start optical camera feed so user sees their face in preview
      this.optical.onFrameData = (buf: Uint8Array) => {
        if (this.needsFrames && this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(buf);
        }
      };

      await this.optical.start(videoEl);
    } else {
      // In-browser optical camera trial
      this.activeMode = 'browser-camera';
      await this.optical.start(videoEl);
    }
  }

  public stopTrial(): void {
    if (this.activeMode === 'presage-hardware' && this.ws) {
      this.ws.send(JSON.stringify({ type: 'stop' }));
    }
    this.optical.stop();
  }
}
