// src/heat-map.ts
// Strange Reading: Mystical Facial Feature Thermal Heat Map & Comic Face Reading

import { CardProfile } from './sorting-engine';

export class FaceReadingHeatMap {
  public render(profile: CardProfile, container: HTMLElement): void {
    const calm = profile.biometrics.calmScore;
    const pulse = profile.biometrics.pulse;

    // Heat calculation factors based on face reading principles
    const thirdEyeHeat = (37.2 + (100 - calm) * 0.02).toFixed(1);
    const cheekRadiance = (36.1 + (pulse / 100) * 0.8).toFixed(1);
    const templeZen = (35.4 + (calm / 100) * 0.9).toFixed(1);
    const jawTension = (36.8 + ((100 - calm) / 100) * 1.1).toFixed(1);

    container.innerHTML = `
      <div class="heatmap-panel-box">
        <div class="heatmap-header">
          <div class="heatmap-title">STRANGE READING: ASTRAL FACIAL HEAT MAP</div>
          <div class="heatmap-sub">MYSTICAL FACE READING & CHROMATIC THERMAL SCAN</div>
        </div>

        <div class="heatmap-body-layout">
          <!-- Canvas Container -->
          <div class="heatmap-canvas-wrap">
            <canvas id="thermal-face-canvas" width="340" height="340" class="thermal-canvas"></canvas>
            <div class="thermal-legend-bar">
              <span>COOL (ZEN)</span>
              <div class="thermal-gradient-strip"></div>
              <span>WARM (HEAT)</span>
            </div>
          </div>

          <!-- Feature Cards Grid -->
          <div class="heatmap-features-grid">
            <!-- Feature 1: Third Eye -->
            <div class="feature-card">
              <div class="feature-card-header">
                <span class="feature-badge" style="background: #E65100;">THIRD EYE</span>
                <span class="feature-temp">${thirdEyeHeat}&deg;C AURA</span>
              </div>
              <div class="feature-title">FOREHEAD: ASTRAL CONCENTRATION</div>
              <p class="feature-desc">
                ${calm >= 60 
                  ? 'Deep cosmic serenity detected. Your mind is an unrippled astral lake.' 
                  : 'High psychic activity. You currently have 47 mental browser tabs open simultaneously.'}
              </p>
            </div>

            <!-- Feature 2: Cheeks -->
            <div class="feature-card">
              <div class="feature-card-header">
                <span class="feature-badge" style="background: #FFB300;">VASCULAR QI</span>
                <span class="feature-temp">${cheekRadiance}&deg;C RADIANCE</span>
              </div>
              <div class="feature-title">CHEEKBONES: CIRCULATORY VITALITY</div>
              <p class="feature-desc">
                ${pulse < 75 
                  ? 'Smooth, balanced life-force circulation. Pure Asgardian stamina.' 
                  : 'Radiant vascular heat surge. Either high tactical intensity or sudden room warmth.'}
              </p>
            </div>

            <!-- Feature 3: Temples -->
            <div class="feature-card">
              <div class="feature-card-header">
                <span class="feature-badge" style="background: #00E5FF; color: #111116;">AGAMOTTO NODES</span>
                <span class="feature-temp">${templeZen}&deg;C ZEN</span>
              </div>
              <div class="feature-title">PERIORBITAL: GAZE HARMONY</div>
              <p class="feature-desc">
                Unblinking mystic gaze detected. You are either meditating on ancient spells or you forgot to blink.
              </p>
            </div>

            <!-- Feature 4: Jawline -->
            <div class="feature-card">
              <div class="feature-card-header">
                <span class="feature-badge" style="background: #00C853;">STOIC AXIS</span>
                <span class="feature-temp">${jawTension}&deg;C TENSION</span>
              </div>
              <div class="feature-title">JAWLINE: WILLPOWER ANCHOR</div>
              <p class="feature-desc">
                ${calm >= 60 
                  ? 'Relaxed stoicism. Perfectly poised between peace and battle readiness.' 
                  : 'Tight jaw clench detected. Latverian steel resolve (or intense desire for snacks).'}
              </p>
            </div>
          </div>
        </div>

        <!-- Prominent Comic Disclaimer -->
        <div class="heatmap-disclaimer-box">
          <div class="disclaimer-title">NOTICE: ASTRAL ADVISORY & RECREATIONAL DISCLAIMER</div>
          <p class="disclaimer-text">
            This mystical facial heat map and face reading are generated <strong>purely for comic amusement, entertainment, and face-reading lore</strong>. 
            It is <strong>NOT medically accurate, NOT scientifically calibrated, and can be completely and delightfully wrong</strong>. 
            Do not consult the Sorcerer Supreme or this comic mirror for actual medical or physiological advice!
          </p>
        </div>
      </div>
    `;

    // Draw the thermal gradient face onto the canvas
    this.drawThermalFace('thermal-face-canvas', calm);
  }

  private drawThermalFace(canvasId: string, calm: number): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Dark cosmic background
    ctx.fillStyle = '#080A12';
    ctx.fillRect(0, 0, w, h);

    // Comic reticle grid
    ctx.strokeStyle = '#1E2333';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Thermal Aura Heat Map Ellipses (Radial Thermal Blends)
    // 1. Base Face Oval (Cool Blue/Cyan)
    const baseGrad = ctx.createRadialGradient(cx, cy - 10, 40, cx, cy - 10, 130);
    baseGrad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
    baseGrad.addColorStop(0.6, 'rgba(0, 200, 83, 0.35)');
    baseGrad.addColorStop(1, 'rgba(10, 15, 30, 0)');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 10, 105, 135, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Forehead Thermal Hotspot (Third Eye - Orange/Red)
    const foreheadGrad = ctx.createRadialGradient(cx, cy - 65, 5, cx, cy - 65, 55);
    const hotFactor = (100 - calm) / 100;
    foreheadGrad.addColorStop(0, `rgba(255, 23, 68, ${0.7 + hotFactor * 0.25})`);
    foreheadGrad.addColorStop(0.4, 'rgba(255, 145, 0, 0.6)');
    foreheadGrad.addColorStop(1, 'rgba(255, 214, 0, 0)');
    ctx.fillStyle = foreheadGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 65, 55, 0, Math.PI * 2);
    ctx.fill();

    // 3. Left Cheek Vascular Glow
    const lCheekGrad = ctx.createRadialGradient(cx - 52, cy + 10, 5, cx - 52, cy + 10, 42);
    lCheekGrad.addColorStop(0, 'rgba(255, 112, 67, 0.65)');
    lCheekGrad.addColorStop(0.5, 'rgba(255, 202, 40, 0.4)');
    lCheekGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = lCheekGrad;
    ctx.beginPath();
    ctx.arc(cx - 52, cy + 10, 42, 0, Math.PI * 2);
    ctx.fill();

    // 4. Right Cheek Vascular Glow
    const rCheekGrad = ctx.createRadialGradient(cx + 52, cy + 10, 5, cx + 52, cy + 10, 42);
    rCheekGrad.addColorStop(0, 'rgba(255, 112, 67, 0.65)');
    rCheekGrad.addColorStop(0.5, 'rgba(255, 202, 40, 0.4)');
    rCheekGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = rCheekGrad;
    ctx.beginPath();
    ctx.arc(cx + 52, cy + 10, 42, 0, Math.PI * 2);
    ctx.fill();

    // 5. Chin & Jaw Hotspot
    const chinGrad = ctx.createRadialGradient(cx, cy + 85, 5, cx, cy + 85, 45);
    chinGrad.addColorStop(0, 'rgba(255, 179, 0, 0.55)');
    chinGrad.addColorStop(0.6, 'rgba(0, 230, 118, 0.35)');
    chinGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = chinGrad;
    ctx.beginPath();
    ctx.arc(cx, cy + 85, 45, 0, Math.PI * 2);
    ctx.fill();

    // Draw Inked Comic Face Wireframe Over the Thermal Map
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 6;

    // Jawline contour
    ctx.beginPath();
    ctx.ellipse(cx, cy - 10, 85, 115, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Eyebrows
    ctx.beginPath();
    ctx.moveTo(cx - 55, cy - 35);
    ctx.quadraticCurveTo(cx - 35, cy - 42, cx - 15, cy - 36);
    ctx.moveTo(cx + 15, cy - 36);
    ctx.quadraticCurveTo(cx + 35, cy - 42, cx + 55, cy - 35);
    ctx.stroke();

    // Eyes
    ctx.beginPath();
    ctx.ellipse(cx - 35, cy - 20, 16, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 35, cy - 20, 16, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Nose
    ctx.beginPath();
    ctx.moveTo(cx, cy - 25);
    ctx.lineTo(cx, cy + 15);
    ctx.lineTo(cx - 8, cy + 22);
    ctx.moveTo(cx, cy + 15);
    ctx.lineTo(cx + 8, cy + 22);
    ctx.stroke();

    // Mouth
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy + 50);
    ctx.quadraticCurveTo(cx, cy + (calm >= 60 ? 56 : 46), cx + 28, cy + 50);
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Center Crosshair Marker on Third Eye
    ctx.strokeStyle = '#FF1744';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 65, 12, 0, Math.PI * 2);
    ctx.moveTo(cx - 18, cy - 65);
    ctx.lineTo(cx + 18, cy - 65);
    ctx.moveTo(cx, cy - 83);
    ctx.lineTo(cx, cy - 47);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ASTRAL RETICLE', cx, cy - 88);
  }
}

export const faceReadingHeatMap = new FaceReadingHeatMap();
