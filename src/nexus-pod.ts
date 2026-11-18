// src/nexus-pod.ts
// Interactive Circular Multiverse Nexus Pod: Renders live Marvel Cosmic Easter Eggs
// Real-time canvas particle physics: Strange Portal, Loki's World Tree, Thanos Snap, Bifrost Beam

import { sound } from './sound-engine';

export type NexusMode = 'strange' | 'loki' | 'thanos' | 'bifrost';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class MultiverseNexusPod {
  private currentMode: NexusMode = 'strange';
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  private particles: Particle[] = [];
  private snapTriggered: boolean = false;
  private snapProgress: number = 0;
  private angleOffset: number = 0;

  public render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="nexus-pod-box">
        <!-- Header -->
        <div class="nexus-header">
          <div class="nexus-title">THE MULTIVERSE NEXUS POD</div>
          <div class="nexus-sub">INTERACTIVE COSMIC REALITY SELECTOR</div>
        </div>

        <div class="nexus-core-layout">
          <!-- Circular Pod Chamber (Left) -->
          <div class="nexus-chamber-wrap">
            <div class="nexus-radial-ring">
              <canvas id="nexus-canvas" width="220" height="220" class="nexus-canvas"></canvas>
            </div>
            <button id="btn-trigger-cosmic" class="comic-btn comic-btn-sm comic-btn-gold" style="margin-top: 8px; width: 100%;">
              <span>DISCHARGE COSMIC SURGE</span>
            </button>
          </div>

          <!-- Circular Selector Dial & Trait Dossier (Right) -->
          <div class="nexus-controls-col">
            <!-- 4 Radial Selector Nodes -->
            <div class="nexus-selector-grid">
              <button class="nexus-dial-btn ${this.currentMode === 'strange' ? 'active' : ''}" data-mode="strange">
                <span class="dial-node-dot" style="background: #FF9800;"></span>
                <span>STRANGE PORTAL</span>
              </button>
              <button class="nexus-dial-btn ${this.currentMode === 'loki' ? 'active' : ''}" data-mode="loki">
                <span class="dial-node-dot" style="background: #00E676;"></span>
                <span>LOKI TIMELINES</span>
              </button>
              <button class="nexus-dial-btn ${this.currentMode === 'thanos' ? 'active' : ''}" data-mode="thanos">
                <span class="dial-node-dot" style="background: #AB47BC;"></span>
                <span>THANOS SNAP</span>
              </button>
              <button class="nexus-dial-btn ${this.currentMode === 'bifrost' ? 'active' : ''}" data-mode="bifrost">
                <span class="dial-node-dot" style="background: #00E5FF;"></span>
                <span>BIFROST SURGE</span>
              </button>
            </div>

            <!-- Active Reality Lore Card -->
            <div class="nexus-lore-card" id="nexus-lore-card">
              ${this.getLoreContent(this.currentMode)}
            </div>
          </div>
        </div>

        <!-- 1-Line Comic Easter Egg Note -->
        <div class="nexus-compact-footnote">
          ★ MULTIVERSE PROTOCOL // INTERACTIVE COSMIC PHENOMENON SIMULATOR ★
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.initCanvas();
  }

  private getLoreContent(mode: NexusMode): string {
    switch (mode) {
      case 'strange':
        return `
          <div class="lore-header" style="color: #E65100;">ELD RITCH SLING-RING PORTAL</div>
          <p class="lore-quote">"I went forward in time to view alternate futures. 14,000,605 possibilities—and only one where we conquer our inbox."</p>
          <div class="lore-meta">DIMENSION: KAMAR-TAJ // ENERGY: 840 TERA-WATTS</div>
        `;
      case 'loki':
        return `
          <div class="lore-header" style="color: #00C853;">YGGDRASIL MULTIVERSE TIMELINES</div>
          <p class="lore-quote">"I know what kind of god I need to be. For you. For all of us. Holding the branches of time together with pure willpower."</p>
          <div class="lore-meta">TEMPORAL WEAVE: INFINITE // TIME LOOM STABILIZED</div>
        `;
      case 'thanos':
        return `
          <div class="lore-header" style="color: #8E24AA;">THE INFINITY GAUNTLET SNAP</div>
          <p class="lore-quote">"Dread it. Run from it. Destiny arrives all the same. Click Discharge to snap half the universe's notifications into dust."</p>
          <div class="lore-meta">STONES ASSEMBLED: 6/6 // ENTROPY: 50.0%</div>
        `;
      case 'bifrost':
        return `
          <div class="lore-header" style="color: #0091EA;">ASGARDIAN BIFROST RAINBOW SURGE</div>
          <p class="lore-quote">"Heimdall, open the Bifrost! Stand within the prismatic beam and be transported across the Nine Realms instantaneously."</p>
          <div class="lore-meta">TRANSMISSION: VALHALLA GATE // PRISMATIC POWER: PEAK</div>
        `;
    }
  }

  private bindEvents(container: HTMLElement) {
    const buttons = container.querySelectorAll<HTMLButtonElement>('.nexus-dial-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode as NexusMode;
        if (!mode || mode === this.currentMode) return;

        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        this.setMode(mode);
      });
    });

    const triggerBtn = container.querySelector('#btn-trigger-cosmic');
    triggerBtn?.addEventListener('click', () => {
      this.triggerCosmicEvent();
    });
  }

  public setMode(mode: NexusMode) {
    this.currentMode = mode;
    this.particles = [];
    this.snapTriggered = false;
    this.snapProgress = 0;

    // Play signature sound
    switch (mode) {
      case 'strange':
        sound.playPortalWhoosh();
        break;
      case 'loki':
        sound.playLokiChime();
        break;
      case 'thanos':
        sound.playSnapBoom();
        break;
      case 'bifrost':
        sound.playBifrostBeam();
        break;
    }

    // Update lore card text
    const loreCard = document.getElementById('nexus-lore-card');
    if (loreCard) {
      loreCard.innerHTML = this.getLoreContent(mode);
    }
  }

  public triggerCosmicEvent() {
    switch (this.currentMode) {
      case 'strange':
        sound.playPortalWhoosh();
        this.spawnStrangeBurst();
        break;
      case 'loki':
        sound.playLokiChime();
        this.spawnLokiBurst();
        break;
      case 'thanos':
        sound.playSnapBoom();
        this.triggerThanosSnap();
        break;
      case 'bifrost':
        sound.playBifrostBeam();
        this.spawnBifrostBurst();
        break;
    }
  }

  private initCanvas() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }

    this.canvas = document.getElementById('nexus-canvas') as HTMLCanvasElement;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.particles = [];
    this.loop();
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Deep cosmic dark background with faint reticle
    ctx.fillStyle = '#060810';
    ctx.fillRect(0, 0, w, h);

    // Draw active mode animation
    switch (this.currentMode) {
      case 'strange':
        this.drawStrangePortal(ctx, cx, cy);
        break;
      case 'loki':
        this.drawLokiTimelines(ctx, cx, cy);
        break;
      case 'thanos':
        this.drawThanosSnap(ctx, cx, cy);
        break;
      case 'bifrost':
        this.drawBifrostBeam(ctx, cx, cy);
        break;
    }

    // Outer cosmic reticle circle
    ctx.strokeStyle = '#1E2538';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 102, 0, Math.PI * 2);
    ctx.stroke();

    this.angleOffset += 0.035;
    this.animId = requestAnimationFrame(this.loop);
  };

  // 1. Doctor Strange Sling-Ring Fiery Spark Portal
  private drawStrangePortal(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    const portalR = 64;

    // Center dark mystic void
    const voidGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, portalR);
    voidGrad.addColorStop(0, '#1A0C00');
    voidGrad.addColorStop(0.7, '#381600');
    voidGrad.addColorStop(1, '#FF6D00');
    ctx.fillStyle = voidGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, portalR, 0, Math.PI * 2);
    ctx.fill();

    // Spawn rotating spark particles
    for (let i = 0; i < 4; i++) {
      const a = this.angleOffset * 2 + Math.random() * Math.PI * 2;
      const r = portalR + (Math.random() - 0.5) * 12;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      const speed = 1 + Math.random() * 2;
      const tangentA = a + Math.PI / 2;

      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(tangentA) * speed + (Math.random() - 0.5) * 1.5,
        vy: Math.sin(tangentA) * speed + (Math.random() - 0.5) * 1.5,
        size: 1.5 + Math.random() * 2.5,
        color: Math.random() > 0.4 ? '#FFD54F' : '#FF6D00',
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 15
      });
    }

    // Update & draw sparks
    this.updateAndDrawParticles(ctx);

    // Glowing fiery ring core
    ctx.strokeStyle = '#FFE082';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#FF6D00';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, portalR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 2. Loki Yggdrasil World Tree Multiverse Timeline Vines
  private drawLokiTimelines(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    const branches = 6;
    const time = this.angleOffset * 0.8;

    // Glowing emerald temporal core
    const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 80);
    coreGrad.addColorStop(0, '#00E676');
    coreGrad.addColorStop(0.4, 'rgba(0, 200, 83, 0.4)');
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#69F0AE';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00E676';
    ctx.shadowBlur = 12;

    for (let b = 0; b < branches; b++) {
      const baseA = (b / branches) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);

      let px = cx;
      let py = cy;
      for (let step = 1; step <= 8; step++) {
        const segR = step * 10.5;
        const wiggle = Math.sin(time + step * 0.7 + b * 2) * 14;
        const a = baseA + (wiggle / segR);
        px = cx + Math.cos(a) * segR;
        py = cy + Math.sin(a) * segR;
        ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Branch node star
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Center throne knot
    ctx.fillStyle = '#00C853';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 3. Thanos Infinity Gauntlet Dust Disintegration
  private drawThanosSnap(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    if (this.snapTriggered) {
      this.snapProgress += 1;
      if (this.snapProgress < 8) {
        // Blinding cosmic flash
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - this.snapProgress / 8})`;
        ctx.fillRect(0, 0, 220, 220);
      }
      if (this.snapProgress > 90) {
        this.snapTriggered = false;
      }
    }

    // Six Infinity Stones ring
    const stoneColors = ['#00E5FF', '#D500F9', '#FF1744', '#FF9100', '#00E676', '#FFD600'];
    const r = 58;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + this.angleOffset * 0.5;
      const sx = cx + Math.cos(a) * r;
      const sy = cy + Math.sin(a) * r;

      ctx.fillStyle = stoneColors[i];
      ctx.shadowColor = stoneColors[i];
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Center Gold Gauntlet Silhouette
    ctx.fillStyle = '#FFD54F';
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111116';
    ctx.font = '900 13px "Bangers", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SNAP', cx, cy + 5);

    // Update floating ash dust particles
    this.updateAndDrawParticles(ctx);
  }

  // 4. Thor's Bifrost Prismatic Teleport Beam
  private drawBifrostBeam(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    const rainbow = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#00E5FF', '#2979FF', '#D500F9'];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angleOffset * 0.6);

    for (let i = 0; i < rainbow.length; i++) {
      const rad = 25 + i * 9;
      ctx.strokeStyle = rainbow[i];
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Stellar rune crosshair
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-90, 0);
    ctx.lineTo(90, 0);
    ctx.moveTo(0, -90);
    ctx.lineTo(0, 90);
    ctx.stroke();

    ctx.restore();

    this.updateAndDrawParticles(ctx);
  }

  private updateAndDrawParticles(ctx: CanvasRenderingContext2D) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  private spawnStrangeBurst() {
    if (!this.canvas) return;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#FFD54F' : '#FF6D00',
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 20
      });
    }
  }

  private spawnLokiBurst() {
    if (!this.canvas) return;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#00E676' : '#69F0AE',
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 25
      });
    }
  }

  private triggerThanosSnap() {
    this.snapTriggered = true;
    this.snapProgress = 0;
    if (!this.canvas) return;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Disintegrating ash dust particles
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4.5;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 0.8, // drift upward like ash
        size: 1.5 + Math.random() * 2.5,
        color: Math.random() > 0.5 ? '#B0BEC5' : '#78909C',
        alpha: 1,
        life: 0,
        maxLife: 45 + Math.random() * 30
      });
    }
  }

  private spawnBifrostBurst() {
    if (!this.canvas) return;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const colors = ['#00E5FF', '#FFEA00', '#FF1744', '#D500F9'];
    for (let i = 0; i < 50; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        size: 2 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 20
      });
    }
  }

  public destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

export const multiverseNexusPod = new MultiverseNexusPod();
