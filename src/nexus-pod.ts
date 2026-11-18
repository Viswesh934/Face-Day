// src/nexus-pod.ts
// Compact Floating Multiverse Nexus Pod — On-Click Menu with 7 Full-Page Marvel Cosmic Effects!
// Modes:
// 1. THANOS SNAP (50% page ash disintegration & time stone reversal)
// 2. LOKI TIMELINES (Full-screen Yggdrasil world-tree branches)
// 3. STRANGE PORTAL (Giant fiery sling-ring portal & mystic runes)
// 4. BIFROST SURGE (Asgardian vertical rainbow beam strike)
// 5. CHAOS HEX (Scarlet Witch reality-warping crimson polygons)
// 6. SPIDER-GLITCH (Spider-Verse chromatic aberration RGB shift & halftone glitch)
// 7. SINGULARITY (Cosmic black hole event horizon & gravitational accretion vortex)

import { sound } from './sound-engine';
import { icons } from './icons';

export type NexusMode = 'thanos' | 'loki' | 'strange' | 'bifrost' | 'hex' | 'glitch' | 'vortex';

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
  angle?: number;
  distance?: number;
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
  private isMenuOpen: boolean = false;

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
          <p class="callout-desc">Click the floating circular Nexus Pod on the right edge of your screen to open the 7-mode reality warp menu!</p>
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
    const mainCoreBtn = document.getElementById('pod-main-core');
    const closeBtn = document.getElementById('btn-close-pod-menu');

    // Click circular core button to toggle menu!
    mainCoreBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Close button inside menu
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeMenu();
    });

    // Click outside to close menu
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (this.isMenuOpen && !target.closest('#multiverse-floating-pod')) {
        this.closeMenu();
      }
    });

    // Menu item clicks
    const menuItems = document.querySelectorAll<HTMLButtonElement>('.pod-menu-item');
    menuItems.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.mode as NexusMode;
        if (!mode) return;
        this.setMode(mode);
        this.triggerCosmicEvent();
        this.closeMenu();
      });
    });
  }

  public toggleMenu(): void {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  public openMenu(): void {
    const menuEl = document.getElementById('pod-flyout-menu');
    if (!menuEl) return;
    this.isMenuOpen = true;
    menuEl.style.display = 'flex';
    // Force reflow
    void menuEl.offsetWidth;
    menuEl.classList.add('flyout-open');
    sound.playClick();
  }

  public closeMenu(): void {
    const menuEl = document.getElementById('pod-flyout-menu');
    if (!menuEl) return;
    this.isMenuOpen = false;
    menuEl.classList.remove('flyout-open');
    setTimeout(() => {
      if (!this.isMenuOpen) {
        menuEl.style.display = 'none';
      }
    }, 200);
  }

  public setMode(mode: NexusMode): void {
    this.currentMode = mode;

    const menuItems = document.querySelectorAll<HTMLButtonElement>('.pod-menu-item');
    menuItems.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    this.updateCoreVisuals();
  }

  private updateCoreVisuals(): void {
    const glyphEl = document.getElementById('pod-core-glyph');
    const mainCoreBtn = document.getElementById('pod-main-core');
    if (!glyphEl || !mainCoreBtn) return;

    // Reset mode classes
    mainCoreBtn.classList.remove(
      'mode-thanos', 'mode-loki', 'mode-strange', 'mode-bifrost',
      'mode-hex', 'mode-glitch', 'mode-vortex'
    );
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
      case 'hex':
        glyphEl.innerHTML = icons.hex;
        break;
      case 'glitch':
        glyphEl.innerHTML = icons.spiderGlitch;
        break;
      case 'vortex':
        glyphEl.innerHTML = icons.vortex;
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
      case 'hex':
        this.executeChaosHex();
        break;
      case 'glitch':
        this.executeSpiderGlitch();
        break;
      case 'vortex':
        this.executeSingularity();
        break;
    }

    this.startParticleLoop();
  }

  // ====================================================
  // 1. THANOS SNAP: Disintegrates 50% of the whole page
  // ====================================================
  private executeThanosSnap(): void {
    sound.playSnapBoom();

    const flashEl = document.getElementById('multiverse-fx-flash');
    if (flashEl) {
      flashEl.className = 'multiverse-fx-flash flash-white active';
      setTimeout(() => flashEl.classList.remove('active'), 500);
    }

    document.body.classList.add('reality-tremor');
    setTimeout(() => document.body.classList.remove('reality-tremor'), 600);

    this.showComicBanner('💥 SNAP! 50% OF REALITY DISINTEGRATED INTO ASH! 💥', '#AB47BC');

    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < 220; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 4 + 1.2,
        vy: -Math.random() * 3.5 - 0.8,
        size: 1.5 + Math.random() * 3.5,
        color: Math.random() > 0.4 ? '#90A4AE' : '#CFD8DC',
        alpha: 0.9,
        life: 0,
        maxLife: 90 + Math.random() * 80
      });
    }

    const targetElements = Array.from(document.querySelectorAll<HTMLElement>(
      '.choice-box, .duel-faction-pill, .brand-badge, .bridge-status-pill, .gate-options, .card-3d-wrap'
    ));

    const shuffled = [...targetElements].sort(() => 0.5 - Math.random());
    const dustedTargets = shuffled.slice(0, Math.ceil(targetElements.length * 0.5));

    dustedTargets.forEach((el, idx) => {
      setTimeout(() => {
        el.classList.add('thanos-dusted');
      }, idx * 120);
    });

    this.effectTimer = window.setTimeout(() => {
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

  // ====================================================
  // 5. SCARLET WITCH CHAOS HEX (NEW 1/3): Reality distortion
  // ====================================================
  private executeChaosHex(): void {
    sound.playChaosHex();

    document.body.classList.add('chaos-hex-aura');
    document.body.classList.add('chaos-reality-warped');
    this.showComicBanner('🔮 CHAOS MAGIC UNLEASHED: REALITY REWRITTEN BY SCARLET WITCH! 🔮', '#D50000');

    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < 160; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.4 ? '#FF1744' : '#D50000',
        alpha: 0.85,
        life: 0,
        maxLife: 90 + Math.random() * 60
      });
    }

    this.effectTimer = window.setTimeout(() => {
      document.body.classList.remove('chaos-hex-aura');
      document.body.classList.remove('chaos-reality-warped');
      this.stopEffectAfter(1000);
    }, 4800);
  }

  // ====================================================
  // 6. SPIDER-VERSE GLITCH (NEW 2/3): Chromatic de-sync
  // ====================================================
  private executeSpiderGlitch(): void {
    sound.playSpiderGlitch();

    document.body.classList.add('spider-glitch-active');
    this.showComicBanner('🕷️ MULTIVERSE GLITCH: DIMENSIONAL DE-SYNCHRONIZATION DETECTED! 🕷️', '#00E5FF');

    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 12, // Rapid stutter steps
        vy: (Math.random() - 0.5) * 4,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#00E5FF' : '#FF0055',
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 30
      });
    }

    this.effectTimer = window.setTimeout(() => {
      document.body.classList.remove('spider-glitch-active');
      this.stopEffectAfter(800);
    }, 4200);
  }

  // ====================================================
  // 7. COSMIC SINGULARITY (NEW 3/3): Black hole vortex pull
  // ====================================================
  private executeSingularity(): void {
    sound.playSingularity();

    document.body.classList.add('singularity-active');
    this.showComicBanner('🌀 COSMIC SINGULARITY: GRAVITATIONAL LENSING EVENT HORIZON! 🌀', '#7C4DFF');

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    // Spawn 180 particles from outer edges spiraling inward
    for (let i = 0; i < 180; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = Math.min(cx, cy) * 0.85 + Math.random() * 200;
      this.particles.push({
        x: cx + Math.cos(a) * dist,
        y: cy + Math.sin(a) * dist,
        vx: 0,
        vy: 0,
        size: 2 + Math.random() * 3.5,
        color: Math.random() > 0.5 ? '#B388FF' : '#651FFF',
        alpha: 0.9,
        life: 0,
        maxLife: 120 + Math.random() * 60,
        angle: a,
        distance: dist
      });
    }

    this.effectTimer = window.setTimeout(() => {
      document.body.classList.remove('singularity-active');
      this.stopEffectAfter(1000);
    }, 5000);
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
          case 'hex':
            this.drawFullScreenChaosHex(ctx, cx, cy);
            break;
          case 'glitch':
            this.drawFullScreenSpiderGlitch(ctx, w, h);
            break;
          case 'vortex':
            this.drawFullScreenSingularity(ctx, cx, cy);
            break;
        }

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

  // Doctor Strange Giant Fiery Portal
  private drawFullScreenStrangePortal(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const portalR = Math.min(cx, cy) * 0.48;

    ctx.strokeStyle = '#FFE082';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#FF6D00';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, portalR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

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

    ctx.strokeStyle = 'rgba(255, 179, 0, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.portalAngle * 0.8);
    const sq = portalR * 0.7;
    ctx.strokeRect(-sq / 2, -sq / 2, sq, sq);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-sq / 2, -sq / 2, sq, sq);
    ctx.restore();
  }

  // Loki Emerald Branches
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

        if (s % 3 === 0) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px - 3, py - 3, 6, 6);
        }
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // Thor Bifrost Beam
  private drawFullScreenBifrostBeam(ctx: CanvasRenderingContext2D, cx: number, h: number): void {
    const beamW = 200 + Math.sin(this.portalAngle * 4) * 30;
    const rainbow = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#00E5FF', '#2979FF', '#D500F9'];
    const ribbonW = beamW / rainbow.length;
    const startX = cx - beamW / 2;

    for (let i = 0; i < rainbow.length; i++) {
      ctx.fillStyle = rainbow[i];
      ctx.globalAlpha = 0.45;
      ctx.fillRect(startX + i * ribbonW, 0, ribbonW, h);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 28;
    ctx.fillRect(cx - 8, 0, 16, h);
    ctx.shadowBlur = 0;
  }

  // Scarlet Witch Chaos Magic Hex Polygons
  private drawFullScreenChaosHex(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const rings = 4;
    ctx.strokeStyle = '#FF1744';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#D50000';
    ctx.shadowBlur = 18;

    for (let r = 1; r <= rings; r++) {
      const radius = r * 85 + Math.sin(this.portalAngle * 2 + r) * 20;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.portalAngle * (r % 2 === 0 ? 0.7 : -0.7));

      // Draw hexagon
      ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const a = (s / 6) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    ctx.shadowBlur = 0;
  }

  // Spider-Verse Glitch Scanlines & Chromatic Ribbons
  private drawFullScreenSpiderGlitch(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Horizontal chromatic glitch ribbons
    const ribbonCount = 5;
    for (let i = 0; i < ribbonCount; i++) {
      const y = ((this.portalAngle * 90 + i * (h / ribbonCount)) % h);
      const rH = 8 + Math.random() * 24;

      ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 229, 255, 0.28)' : 'rgba(255, 0, 85, 0.28)';
      ctx.fillRect(0, y, w, rH);
    }

    // Comic Ben-Day halftone dots overlay
    ctx.fillStyle = 'rgba(17, 17, 22, 0.08)';
    const dotSpacing = 32;
    for (let x = 0; x < w; x += dotSpacing) {
      for (let y = 0; y < h; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Cosmic Singularity Accretion Disk Vortex
  private drawFullScreenSingularity(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const holeR = 50;

    // Outer swirling accretion disk
    for (let d = holeR + 15; d < holeR + 180; d += 25) {
      ctx.strokeStyle = `rgba(124, 77, 255, ${1 - (d - holeR) / 180})`;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#651FFF';
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(cx, cy, d, this.portalAngle * 2, this.portalAngle * 2 + Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Pitch-black event horizon in center
    ctx.fillStyle = '#060810';
    ctx.beginPath();
    ctx.arc(cx, cy, holeR, 0, Math.PI * 2);
    ctx.fill();

    // Glowing photon sphere ring
    ctx.strokeStyle = '#B388FF';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#7C4DFF';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, holeR + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Move spiral particles toward black hole
    for (let p of this.particles) {
      if (p.distance !== undefined && p.angle !== undefined) {
        p.distance = Math.max(holeR + 4, p.distance - 2.8);
        p.angle += 0.04;
        p.x = cx + Math.cos(p.angle) * p.distance;
        p.y = cy + Math.sin(p.angle) * p.distance;
      }
    }
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
