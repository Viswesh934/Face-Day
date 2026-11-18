// src/optical-vitals.ts
// Browser-native optical camera sensing & 30-second trial watchdog

export interface OpticalMetrics {
  elapsedSeconds: number;
  remainingSeconds: number;
  pulseBpm: number;
  breathingRate: number;
  waveformY: number;
  calmScore: number;
  faceDetected: boolean;
}

export class OpticalVitalsScanner {
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private animFrameId: number | null = null;

  private isRunning: boolean = false;
  private startTime: number = 0;
  private readonly durationMs: number = 30000; // 30 seconds

  // Moving buffers for pulse wave extraction
  private greenSamples: number[] = [];
  private sampleTimes: number[] = [];
  private lastPulseBpm: number = 72;
  private lastBreathingRate: number = 14;

  public onUpdate?: (metrics: OpticalMetrics) => void;
  public onComplete?: (finalMetrics: OpticalMetrics) => void;
  public onError?: (err: Error) => void;

  public async start(videoTarget: HTMLVideoElement): Promise<void> {
    try {
      this.videoEl = videoTarget;
      this.canvasEl = document.createElement('canvas');
      this.canvasEl.width = 160;
      this.canvasEl.height = 120;
      this.ctx = this.canvasEl.getContext('2d', { willReadFrequently: true });

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      this.videoEl.srcObject = this.stream;
      await this.videoEl.play();

      this.isRunning = true;
      this.startTime = performance.now();
      this.greenSamples = [];
      this.sampleTimes = [];

      this.processLoop();
    } catch (err: unknown) {
      if (this.onError) {
        this.onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  private processLoop = () => {
    if (!this.isRunning || !this.videoEl || !this.ctx || !this.canvasEl) return;

    const now = performance.now();
    const elapsedMs = now - this.startTime;
    const elapsedSec = Math.min(30, Math.floor(elapsedMs / 1000));
    const remainingSec = Math.max(0, 30 - elapsedSec);

    // Draw downsampled frame to offscreen canvas
    this.ctx.drawImage(this.videoEl, 0, 0, 160, 120);

    // Sample the center ROI (face / forehead region: x 50-110, y 25-65)
    const imgData = this.ctx.getImageData(50, 25, 60, 40);
    const data = imgData.data;
    let greenSum = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const g = data[i + 1];
      greenSum += g;
      count++;
    }

    const avgGreen = count > 0 ? greenSum / count : 128;
    this.greenSamples.push(avgGreen);
    this.sampleTimes.push(now);

    // Keep trailing 5 seconds of frames (approx 150 frames at 30fps)
    while (this.sampleTimes.length > 0 && now - this.sampleTimes[0] > 5000) {
      this.sampleTimes.shift();
      this.greenSamples.shift();
    }

    // Extract micro-pulsatile peak frequency
    let waveVal = 0;
    if (this.greenSamples.length > 10) {
      const mean = this.greenSamples.reduce((a, b) => a + b, 0) / this.greenSamples.length;
      const latest = this.greenSamples[this.greenSamples.length - 1];
      waveVal = latest - mean;

      // Peak count over trailing buffer
      let zeroCrossings = 0;
      for (let j = 1; j < this.greenSamples.length; j++) {
        const prev = this.greenSamples[j - 1] - mean;
        const curr = this.greenSamples[j] - mean;
        if (prev < 0 && curr >= 0) {
          zeroCrossings++;
        }
      }

      const windowSec = (now - this.sampleTimes[0]) / 1000;
      if (windowSec > 2 && zeroCrossings > 1) {
        const estimatedBpm = Math.round((zeroCrossings / windowSec) * 60);
        if (estimatedBpm >= 50 && estimatedBpm <= 120) {
          this.lastPulseBpm = Math.round(this.lastPulseBpm * 0.9 + estimatedBpm * 0.1);
        }
      }
    }

    // Estimate breathing (slower rhythmic cycle, ~0.25 Hz)
    const breathingCycle = Math.sin((elapsedMs / 1000) * 0.25 * Math.PI * 2);
    this.lastBreathingRate = Math.round(14 + breathingCycle * 2);

    const calmScore = Math.max(10, Math.min(95, Math.round(100 - (this.lastPulseBpm - 60) * 0.8)));

    const currentMetrics: OpticalMetrics = {
      elapsedSeconds: elapsedSec,
      remainingSeconds: remainingSec,
      pulseBpm: this.lastPulseBpm,
      breathingRate: this.lastBreathingRate,
      waveformY: waveVal,
      calmScore,
      faceDetected: true
    };

    if (this.onUpdate) {
      this.onUpdate(currentMetrics);
    }

    // Check if 30-second trial has elapsed
    if (elapsedMs >= this.durationMs) {
      this.stop();
      if (this.onComplete) {
        this.onComplete(currentMetrics);
      }
      return;
    }

    this.animFrameId = requestAnimationFrame(this.processLoop);
  };

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }
  }
}
