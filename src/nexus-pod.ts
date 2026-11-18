// src/nexus-pod.ts
// Compact Floating Multiverse Nexus Pod — Controls full-page cosmic reality effects!
// Features Thanos Snap (50% page ash disintegration), Loki Yggdrasil timelines, Doctor Strange fiery portal, and Bifrost surge.

import { sound } from './sound-engine';
import { icons } from './icons';

export type NexusMode = 'thanos' | 'loki' | 'strange' | 'bifrost';

interface FullScreenParticle {
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
  private currentMode: NexusMode = 'thanos';
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  private particles: FullScreenParticle[] = [];
  private effectTimer: number | null = null;
  private bannerTimer: number | null = null;
  private isEffectActive: boolean = false;
  private portalAngle: number = 0;

  public init(): void {
    this.canvas = document.getElementById('multiverse-fx-canvas') as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    this.bindFloatingPodEvents();
    this.updateCoreVisuals();
  }

  // Fallback for Phase 3 tab if opened
  public render(container?: HTMLElement): void {
    if (container) {
      container.innerHTML = `
        <div class="phase3-nexus-callout">
          <div class="callout-badge">★ MULTIVERSE NEXUS ACTIVE ★</div>
          <h3 class="callout-title">COSMIC SELECTOR DOCKED ON RIGHT</h3>
          <p class="callout-desc">Use the floating circular Nexus Pod docked on the right edge of your screen to warp the entire page with Thanos Snap, Loki Timelines, Strange Portal, or Bifrost Surge!</p>
        </div>
      `;
    }
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private bindFloatingPodEvents(): void {
    const podEl = document.getElementById('multiverse-floating-pod');
    if (!podEl) return;

    // Orbital Node Buttons
    const nodeBtns = podEl.querySelectorAll<HTMLButtonElement>('.pod-node-btn');
    nodeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.mode as NexusMode;
        if (!mode) return;
        this.setMode(mode);
        this.triggerCosmicEvent();
      });
    });

    // Central Circular Core Button
    const mainCoreBtn = document.getElementById('pod-main-core');
    mainCoreBtn?.addEventListener('click', () => {
      this.triggerCosmicEvent();
    });
  }

  public setMode(mode: NexusMode): void {
    this.currentMode = mode;

    const podEl = document.getElementById('multiverse-floating-pod');
    if (!podEl) return;

    const nodeBtns = podEl.querySelectorAll<HTMLButtonElement>('.pod-node-btn');
    nodeBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    this.updateCoreVisuals();
  }

  private updateCoreVisuals(): void {
    const glyphEl = document.getElementById('pod-core-glyph');
    const mainCoreBtn = document.getElementById('pod-main-core');
    if (!glyphEl || !mainCoreBtn) return;

    // Reset mode classes
    mainCoreBtn.classList.remove('mode-thanos', 'mode-loki', 'mode-strange', 'mode-bifrost');
    mainCoreBtn.classList.add(`mode-${this.currentMode}`);

    switch (this.currentMode) {
      case 'thanos':
        glyphEl.innerHTML = icons.snap;
        break;
      case 'loki':
        glyphEl.innerHTML = icons.lokiTree;
        break;
      case 'strange':
        glyphEl.innerHTML = icons.strange;
        break;
      case 'bifrost':
        glyphEl.innerHTML = icons.bolt;
        break;
    }
  }

  public triggerCosmicEvent(): void {
    this.isEffectActive = true;
    this.particles = [];

    // Clear previous timers
    if (this.effectTimer) {
      clearTimeout(this.effectTimer);
      this.effectTimer = null;
    }

    switch (this.currentMode) {
      case 'thanos':
        this.executeThanosSnap();
        break;
      case 'loki':
        this.executeLokiTimelines();
        break;
      case 'strange':
        this.executeStrangePortal();
        break;
      case 'bifrost':
        this.executeBifrostSurge();
        break;
    }

    this.startParticleLoop();
  }

  // ====================================================
  // 1. THANOS SNAP: Disintegrates 50% of the whole page
  // ====================================================
  private executeThanosSnap(): void {
    sound.playSnapBoom();

    // Flash overlay
    const flashEl = document.getElementById('multiverse-fx-flash');
    if (flashEl) {
      flashEl.className = 'multiverse-fx-flash flash-white active';
      setTimeout(() => flashEl.classList.remove('active'), 500);
    }

    // Screen tremor
    document.body.classList.add('reality-tremor');
    setTimeout(() => document.body.classList.remove('reality-tremor'), 600);

    // Show comic banner
    this.showComicBanner('💥 SNAP! 50% OF REALITY DISINTEGRATED INTO ASH! 💥', '#AB47BC');

    // Spawn 200 ash particles rising and swirling across entire screen
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < 220; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 4 + 1.2,
        vy: -Math.random() * 3.5 - 0.8, // Float upward like cosmic dust
        size: 1.5 + Math.random() * 3.5,
        color: Math.random() > 0.4 ? '#90A4AE' : '#CFD8DC',
        alpha: 0.9,
        life: 0,
        maxLife: 90 + Math.random() * 80
      });
    }

    // Disintegrate 50% of visible cards on the whole page!
    const targetElements = Array.from(document.querySelectorAll<HTMLElement>(
      '.choice-box, .duel-faction-pill, .brand-badge, .bridge-status-pill, .gate-options, .card-3d-wrap'
    ));

    // Shuffle and pick 50%
    const shuffled = [...targetElements].sort(() => 0.5 - Math.random());
    const dustedTargets = shuffled.slice(0, Math.ceil(targetElements.length * 0.5));

    dustedTargets.forEach((el, idx) => {
      setTimeout(() => {
        el.classList.add('thanos-dusted');
      }, idx * 120);
    });

    // Time Stone Reversal after 4.8 seconds
    this.effectTimer = window.setTimeout(() => {
      // Time stone emerald flash
      sound.playLokiChime();
      if (flashEl) {
        flashEl.className = 'multiverse-fx-flash flash-emerald active';
        setTimeout(() => flashEl.classList.remove('active'), 450);
      }

      this.showComicBanner('⏳ TIME STONE REVERSAL: REALITY RECONSTRUCTED! ⏳', '#00C853');

      dustedTargets.forEach((el) => {
        el.classList.remove('thanos-dusted');
      });

      this.stopEffectAfter(1200);
    }, 4800);
  }

  // ====================================================
  // 2. LOKI TIMELINES: Weaves Yggdrasil branches across page
  // ====================================================
  private executeLokiTimelines(): void {
    sound.playLokiChime();

    document.body.classList.add('loki-timeline-aura');
    this.showComicBanner('🌿 YGGDRASIL BRANCHES WOVEN: SACRED MULTIVERSE TIMELINES ACTIVE! 🌿', '#00C853');

    // Spawn green temporal spark particles
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#00E676' : '#69F0AE',
        alpha: 0.9,
        life: 0,
        maxLife: 100 + Math.random() * 60
      });
    }

    this.effectTimer = window.setTimeout(() => {
      document.body.classList.remove('loki-timeline-aura');
      this.stopEffectAfter(1000);
    }, 5000);
  }

  // ====================================================
  // 3. DOCTOR STRANGE PORTAL: Giant fiery sling-ring portal
  // ====================================================
  private executeStrangePortal(): void {
    sound.playPortalWhoosh();

    document.body.classList.add('strange-portal-aura');
    this.showComicBanner('🔮 KAMAR-TAJ PORTAL: DIMENSIONAL BOUNDARIES BREACHED! 🔮', '#E65100');

    this.effectTimer = window.setTimeout(() => {
      document.body.classList.remove('strange-portal-aura');
      this.stopEffectAfter(1000);
    }, 5000);
  }

  // ====================================================
  // 4. BIFROST SURGE: Rainbow teleporter beam strikes page
  // ====================================================
  private executeBifrostSurge(): void {
    sound.playBifrostBeam();

    document.body.classList.add('bifrost-surge-active');
    document.body.classList.add('reality-tremor');
    setTimeout(() => document.body.classList.remove('reality-tremor'), 800);

    this.showComicBanner('⚡ BIFROST STRUCK! ASGARDIAN RAINBOW SURGE DISCHARGED! ⚡', '#00E5FF');

    const w = window.innerWidth;
    const h = window.innerHeight;
    const rainbow = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#00E5FF', '#D500F9'];

    for (let i = 0; i < 140; i++) {
      this.particles.push({
        x: w / 2 + (Math.random() - 0.5) * 260,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 6,
        size: 2.5 + Math.random() * 4,
        color: rainbow[Math.floor(Math.random() * rainbow.length)],
        alpha: 1,
        life: 0,
        maxLife: 80 + Math.random() * 50
      });
    }

    this.effectTimer = window.setTimeout(() => {
      document.body.classList.remove('bifrost-surge-active');
      this.stopEffectAfter(1000);
    }, 4500);
  }

  private stopEffectAfter(ms: number): void {
    setTimeout(() => {
      this.isEffectActive = false;
      this.particles = [];
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }, ms);
  }

  private startParticleLoop(): void {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }

    const render = () => {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      if (this.isEffectActive) {
        // Draw Mode-Specific Full Screen Animation
        switch (this.currentMode) {
          case 'strange':
            this.drawFullScreenStrangePortal(ctx, cx, cy);
            break;
          case 'loki':
            this.drawFullScreenLokiTimelines(ctx, w, h);
            break;
          case 'bifrost':
            this.drawFullScreenBifrostBeam(ctx, cx, h);
            break;
        }

        // Draw and update active particles
        this.updateAndDrawParticles(ctx);
        this.portalAngle += 0.04;
      }

      if (this.isEffectActive || this.particles.length > 0) {
        this.animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, w, h);
        this.animId = null;
      }
    };

    this.animId = requestAnimationFrame(render);
  }

  // Doctor Strange Giant Fiery Portal on Full Page
  private drawFullScreenStrangePortal(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const portalR = Math.min(cx, cy) * 0.48;

    // Glowing orange rim
    ctx.strokeStyle = '#FFE082';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#FF6D00';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, portalR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Spawn whirling sparks from rim
    for (let i = 0; i < 5; i++) {
      const a = this.portalAngle * 3 + Math.random() * Math.PI * 2;
      const r = portalR + (Math.random() - 0.5) * 20;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      const tangentA = a + Math.PI / 2;
      const speed = 2 + Math.random() * 5;

      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(tangentA) * speed + (Math.random() - 0.5) * 3,
        vy: Math.sin(tangentA) * speed + (Math.random() - 0.5) * 3,
        size: 2 + Math.random() * 3.5,
        color: Math.random() > 0.4 ? '#FFD54F' : '#FF6D00',
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 25
      });
    }

    // Floating mystic mandala runes
    ctx.strokeStyle = 'rgba(255, 179, 0, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.portalAngle * 0.8);

    // Inner square
    const sq = portalR * 0.7;
    ctx.strokeRect(-sq / 2, -sq / 2, sq, sq);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-sq / 2, -sq / 2, sq, sq);

    ctx.restore();
  }

  // Loki Emerald Branches Spanning the Entire Page
  private drawFullScreenLokiTimelines(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const branches = 7;
    const time = this.portalAngle * 0.6;
    const originX = w * 0.9;
    const originY = h * 0.5;

    ctx.strokeStyle = '#00E676';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00E676';
    ctx.shadowBlur = 16;

    for (let b = 0; b < branches; b++) {
      const baseAngle = Math.PI - 0.8 + (b / (branches - 1)) * 1.6;
      ctx.beginPath();
      ctx.moveTo(originX, originY);

      let px = originX;
      let py = originY;
      const steps = 14;
      const stepLen = w / (steps * 1.1);

      for (let s = 1; s <= steps; s++) {
        const a = baseAngle + Math.sin(time + s * 0.4 + b) * 0.35;
        px += Math.cos(a) * stepLen;
        py += Math.sin(a) * stepLen;
        ctx.lineTo(px, py);

        // Nodes on branches
        if (s % 3 === 0) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px - 3, py - 3, 6, 6);
        }
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // Thor's Bifrost Beam Shooting Down Entire Screen
  private drawFullScreenBifrostBeam(ctx: CanvasRenderingContext2D, cx: number, h: number): void {
    const beamW = 200 + Math.sin(this.portalAngle * 4) * 30;
    const rainbow = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#00E5FF', '#2979FF', '#D500F9'];

    // Vertical prismatic rainbow ribbons
    const ribbonW = beamW / rainbow.length;
    const startX = cx - beamW / 2;

    for (let i = 0; i < rainbow.length; i++) {
      ctx.fillStyle = rainbow[i];
      ctx.globalAlpha = 0.45;
      ctx.fillRect(startX + i * ribbonW, 0, ribbonW, h);
    }
    ctx.globalAlpha = 1;

    // Center core laser white line
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 28;
    ctx.fillRect(cx - 8, 0, 16, h);
    ctx.shadowBlur = 0;
  }

  private updateAndDrawParticles(ctx: CanvasRenderingContext2D): void {
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

  private showComicBanner(text: string, accentColor: string): void {
    const bannerEl = document.getElementById('multiverse-comic-banner');
    if (!bannerEl) return;

    if (this.bannerTimer) {
      clearTimeout(this.bannerTimer);
      this.bannerTimer = null;
    }

    bannerEl.textContent = text;
    bannerEl.style.borderColor = accentColor;
    bannerEl.style.display = 'block';
    bannerEl.classList.remove('slide-in');
    // Force reflow
    void bannerEl.offsetWidth;
    bannerEl.classList.add('slide-in');

    this.bannerTimer = window.setTimeout(() => {
      bannerEl.classList.remove('slide-in');
      setTimeout(() => {
        bannerEl.style.display = 'none';
      }, 350);
    }, 3800);
  }
}

export const multiverseNexusPod = new MultiverseNexusPod();
