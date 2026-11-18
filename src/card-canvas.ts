// src/card-canvas.ts
// High-Resolution Vintage Comic Book Cover Page Canvas Generator
// Renders authentic comic covers (Marvel / Silver-Age / Comics Code style)

import { CardProfile } from './sorting-engine';

export class CardCanvasRenderer {
  private width = 800;
  private height = 1160;

  public render(profile: CardProfile): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const isThor = profile.team === 'thor';
    const isDoom = profile.team === 'doom';

    // Palette Configuration
    const primaryColor = isThor ? '#FFCC00' : isDoom ? '#00C853' : '#FF9800';
    const secondaryColor = isThor ? '#00E5FF' : isDoom ? '#D4D8DD' : '#FFD54F';
    const darkBg = isThor ? '#08121E' : isDoom ? '#0A170F' : '#1A0C22';

    // 1. Aged Vintage Newsprint Outer Bleed
    ctx.fillStyle = '#111116';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Comic Page Inset
    ctx.fillStyle = '#FDFBF7';
    ctx.fillRect(12, 12, this.width - 24, this.height - 24);

    // 3. Cover Background Scene
    const bgGrad = ctx.createLinearGradient(12, 12, 12, this.height - 24);
    bgGrad.addColorStop(0, darkBg);
    bgGrad.addColorStop(0.65, darkBg);
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(16, 16, this.width - 32, this.height - 32);

    // Ben-Day Halftone Dot Overlay
    this.drawHalftoneGrid(ctx, 16, 16, this.width - 32, this.height - 32, `${primaryColor}18`);

    // Dynamic Comic Speed Lines from Center
    this.drawSpeedLines(ctx, this.width / 2, 540);

    // 4. Dramatic Hero Scene Illustration
    if (isThor) {
      this.drawThorCoverArt(ctx, primaryColor, secondaryColor);
    } else if (isDoom) {
      this.drawDoomCoverArt(ctx, primaryColor, secondaryColor);
    } else {
      this.drawStrangeCoverArt(ctx, primaryColor, secondaryColor);
    }

    // Holographic Foil Shimmer (for Ultra-Rare & Legendary)
    if (profile.rarity === 'LEGENDARY FOIL' || profile.rarity === 'ULTRA-RARE') {
      this.drawHoloFoilEffect(ctx, 16, 16, this.width - 32, this.height - 32);
    }

    // 5. Vintage Comic Trade Dress (Top Bar)
    this.drawTradeDress(ctx, profile);

    // 6. Comics Code Authority Seal (Top Right)
    this.drawComicsCodeSeal(ctx);

    // 7. Corner Box Art (Top Left)
    this.drawCornerBox(ctx, profile, primaryColor);

    // 8. Giant 3D Title Logo
    this.drawCoverTitle(ctx, profile, primaryColor, secondaryColor);

    // 9. Comic Narrative Burst & Blurbs
    this.drawStoryBlurbs(ctx, profile, primaryColor);

    // 10. Biometric Telemetry Dossier Ribbon
    this.drawBiometricRibbon(ctx, profile, primaryColor);

    // 11. Vintage UPC Barcode (Bottom Left)
    this.drawVintageBarcode(ctx, profile);

    // Outer Vintage Distressed Border
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, this.width - 10, this.height - 10);

    return canvas;
  }

  private drawTradeDress(ctx: CanvasRenderingContext2D, _profile: CardProfile) {
    // Top Brand Bar: "FACE DAY COMICS GROUP"
    ctx.fillStyle = '#111116';
    ctx.fillRect(16, 16, this.width - 32, 34);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 18px "Bangers", "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText('FACE DAY COMICS GROUP', this.width / 2, 39);

    // Price and Month Strip
    ctx.fillStyle = '#FFCC00';
    ctx.fillRect(16, 50, this.width - 32, 6);
  }

  private drawCornerBox(ctx: CanvasRenderingContext2D, profile: CardProfile, primary: string) {
    const boxX = 28;
    const boxY = 64;
    const boxW = 86;
    const boxH = 140;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Price Circle
    ctx.fillStyle = primary;
    ctx.fillRect(boxX + 4, boxY + 4, boxW - 8, 30);
    ctx.fillStyle = '#111116';
    ctx.font = '900 20px "Bangers", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('25¢', boxX + boxW / 2, boxY + 26);

    // Issue & Month
    ctx.fillStyle = '#111116';
    ctx.font = '900 13px "Bangers", sans-serif';
    ctx.fillText('ISSUE #01', boxX + boxW / 2, boxY + 50);
    ctx.font = '800 10px sans-serif';
    ctx.fillText('OCTOBER', boxX + boxW / 2, boxY + 64);

    // Character Silhouette / Emblem inside corner box
    ctx.fillStyle = '#111116';
    ctx.fillRect(boxX + 12, boxY + 74, boxW - 24, boxH - 82);
    ctx.fillStyle = primary;
    ctx.font = '900 18px "Bangers", sans-serif';
    ctx.fillText(profile.team.toUpperCase().slice(0, 4), boxX + boxW / 2, boxY + 114);
  }

  private drawComicsCodeSeal(ctx: CanvasRenderingContext2D) {
    const sealX = this.width - 110;
    const sealY = 64;
    const sealW = 82;
    const sealH = 105;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(sealX, sealY, sealW, sealH);
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 3;
    ctx.strokeRect(sealX, sealY, sealW, sealH);

    ctx.fillStyle = '#111116';
    ctx.font = '900 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('APPROVED', sealX + sealW / 2, sealY + 20);
    ctx.fillText('BY THE', sealX + sealW / 2, sealY + 32);

    ctx.font = '900 14px "Bangers", sans-serif';
    ctx.fillStyle = '#D32F2F';
    ctx.fillText('COMICS', sealX + sealW / 2, sealY + 52);
    ctx.fillText('CODE', sealX + sealW / 2, sealY + 68);

    ctx.fillStyle = '#111116';
    ctx.font = '900 10px sans-serif';
    ctx.fillText('AUTHORITY', sealX + sealW / 2, sealY + 88);
  }

  private drawCoverTitle(
    ctx: CanvasRenderingContext2D,
    profile: CardProfile,
    primary: string,
    secondary: string
  ) {
    const titleY = 160;
    const cx = this.width / 2;

    ctx.textAlign = 'center';

    let mainTitle = 'THE MIGHTY THOR';
    let subBanner = 'THE ASGARDIAN WAR HAMMER!';
    if (profile.team === 'doom') {
      mainTitle = 'THE WRATH OF DOOM';
      subBanner = 'THE TITANIUM IRON MASK!';
    } else if (profile.team === 'strange') {
      mainTitle = 'STRANGE TALES';
      subBanner = 'MASTER OF THE ASTRAL MIRROR!';
    }

    // Top Sub-Banner Ribbon
    ctx.fillStyle = secondary;
    ctx.fillRect(cx - 240, titleY - 25, 480, 26);
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cx - 240, titleY - 25, 480, 26);

    ctx.fillStyle = '#111116';
    ctx.font = '900 16px "Bangers", sans-serif';
    ctx.fillText(subBanner, cx, titleY - 7);

    // Giant 3D Block Lettering
    ctx.font = '900 78px "Bangers", "Impact", sans-serif';

    // 3D Extrusion Shadow
    ctx.fillStyle = '#111116';
    for (let offset = 8; offset > 0; offset--) {
      ctx.fillText(mainTitle, cx + offset, titleY + 62 + offset);
    }

    // Main Fill
    ctx.fillStyle = primary;
    ctx.fillText(mainTitle, cx, titleY + 62);

    // Inked Outline
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 4;
    ctx.strokeText(mainTitle, cx, titleY + 62);
  }

  private drawThorCoverArt(ctx: CanvasRenderingContext2D, primary: string, secondary: string) {
    const cx = this.width / 2;
    const cy = 560;

    // Lightning Bolts
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 260, 220);
    ctx.lineTo(cx - 120, 420);
    ctx.lineTo(cx - 170, 440);
    ctx.lineTo(cx - 80, 620);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 260, 220);
    ctx.lineTo(cx + 120, 400);
    ctx.lineTo(cx + 160, 420);
    ctx.lineTo(cx + 90, 630);
    ctx.stroke();

    // Giant Mjolnir Hammer in Center
    ctx.fillStyle = '#ECEFF1';
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 8;
    ctx.fillRect(cx - 120, cy - 100, 240, 140);
    ctx.strokeRect(cx - 120, cy - 100, 240, 140);

    // Nordic runes on hammer face
    ctx.strokeStyle = primary;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy - 30, 42, 0, Math.PI * 2);
    ctx.moveTo(cx - 30, cy - 30);
    ctx.lineTo(cx + 30, cy - 30);
    ctx.moveTo(cx, cy - 60);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Hammer Handle
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(cx - 22, cy + 40, 44, 240);
    ctx.strokeRect(cx - 22, cy + 40, 44, 240);

    // Handle Straps
    ctx.strokeStyle = '#D7CCC8';
    ctx.lineWidth = 4;
    for (let y = cy + 60; y < cy + 260; y += 32) {
      ctx.beginPath();
      ctx.moveTo(cx - 20, y);
      ctx.lineTo(cx + 20, y + 16);
      ctx.stroke();
    }
  }

  private drawDoomCoverArt(ctx: CanvasRenderingContext2D, primary: string, _secondary: string) {
    const cx = this.width / 2;
    const cy = 560;

    // Latverian Arcane Circle
    ctx.strokeStyle = primary;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy - 20, 210, 0, Math.PI * 2);
    ctx.stroke();

    // Hood Silhouette
    ctx.fillStyle = '#1B5E20';
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 220);
    ctx.bezierCurveTo(cx - 210, cy - 180, cx - 180, cy + 180, cx - 160, cy + 260);
    ctx.lineTo(cx + 160, cy + 260);
    ctx.bezierCurveTo(cx + 180, cy + 180, cx + 210, cy - 180, cx, cy - 220);
    ctx.fill();
    ctx.stroke();

    // Titanium Mask Face
    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.moveTo(cx - 90, cy - 100);
    ctx.lineTo(cx + 90, cy - 100);
    ctx.lineTo(cx + 105, cy + 30);
    ctx.lineTo(cx + 60, cy + 150);
    ctx.lineTo(cx - 60, cy + 150);
    ctx.lineTo(cx - 105, cy + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Eyes
    ctx.fillStyle = '#00E676';
    ctx.fillRect(cx - 75, cy - 20, 50, 16);
    ctx.fillRect(cx + 25, cy - 20, 50, 16);
    ctx.strokeRect(cx - 75, cy - 20, 50, 16);
    ctx.strokeRect(cx + 25, cy - 20, 50, 16);

    // Mouth Grill
    ctx.fillStyle = '#263238';
    ctx.fillRect(cx - 40, cy + 70, 80, 30);
    ctx.strokeRect(cx - 40, cy + 70, 80, 30);
  }

  private drawStrangeCoverArt(ctx: CanvasRenderingContext2D, primary: string, _secondary: string) {
    const cx = this.width / 2;
    const cy = 560;

    // Eye of Agamotto Astral Mandalas
    ctx.strokeStyle = primary;
    ctx.lineWidth = 6;
    for (let r = 80; r <= 220; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Glowing Eye of Agamotto Center
    ctx.fillStyle = '#E65100';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 110, 65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111116';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 38, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawStoryBlurbs(ctx: CanvasRenderingContext2D, profile: CardProfile, primary: string) {
    // Action Starburst (Left)
    const starX = 140;
    const starY = 820;
    this.drawComicBurst(ctx, starX, starY, 78, '#FFEB3B');

    ctx.fillStyle = '#111116';
    ctx.font = '900 15px "Bangers", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BIOMETRIC', starX, starY - 14);
    ctx.fillText('VERDICT:', starX, starY + 2);
    ctx.fillStyle = '#D32F2F';
    ctx.font = '900 18px "Bangers", sans-serif';
    ctx.fillText(profile.archetype.toUpperCase().slice(0, 12), starX, starY + 22);

    // Right Narrative Comic Story Box
    const boxX = 260;
    const boxY = 760;
    const boxW = 500;
    const boxH = 120;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 4;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Blurb Header Tag
    ctx.fillStyle = primary;
    ctx.fillRect(boxX + 16, boxY - 14, 180, 26);
    ctx.strokeRect(boxX + 16, boxY - 14, 180, 26);
    ctx.fillStyle = '#111116';
    ctx.font = '900 14px "Bangers", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ISSUE EXCLUSIVE!', boxX + 106, boxY + 4);

    // Flavor Quote
    ctx.fillStyle = '#111116';
    ctx.font = 'italic 700 17px "Comic Neue", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    this.wrapText(ctx, `"${profile.flavorQuote}"`, boxX + 20, boxY + 36, boxW - 40, 24);

    // Rarity Flag inside Blurb
    ctx.fillStyle = '#616161';
    ctx.font = '800 12px "Courier New", monospace';
    ctx.fillText(`RARITY: ★ ${profile.rarity} ★ // NUMBER: ${profile.cardNumber}`, boxX + 20, boxY + 104);
  }

  private drawBiometricRibbon(ctx: CanvasRenderingContext2D, profile: CardProfile, primary: string) {
    const barY = 910;
    const barW = this.width - 64;
    const barH = 88;

    ctx.fillStyle = '#111116';
    ctx.fillRect(32, barY, barW, barH);
    ctx.strokeStyle = primary;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(32, barY, barW, barH);

    const bio = profile.biometrics;
    const statsList = [
      { label: 'PULSE', val: `${bio.pulse} BPM` },
      { label: 'HRV', val: `${bio.rmssd} MS` },
      { label: 'RESP', val: `${bio.breathing} /M` },
      { label: 'EQUILIBRIUM', val: bio.equilibrium.slice(0, 14).toUpperCase() },
      { label: 'POWER', val: `${profile.powerRating}` }
    ];

    const colW = barW / statsList.length;
    statsList.forEach((st, idx) => {
      const colX = 32 + idx * colW + colW / 2;
      ctx.fillStyle = '#B0BEC5';
      ctx.font = '900 12px "Bangers", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.label, colX, barY + 28);

      ctx.fillStyle = primary;
      ctx.font = '900 20px "Bangers", sans-serif';
      ctx.fillText(st.val, colX, barY + 58);
    });
  }

  private drawVintageBarcode(ctx: CanvasRenderingContext2D, profile: CardProfile) {
    const codeX = 36;
    const codeY = 1018;
    const codeW = 150;
    const codeH = 90;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(codeX, codeY, codeW, codeH);
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(codeX, codeY, codeW, codeH);

    // Barcode stripes
    ctx.fillStyle = '#111116';
    const numBars = 28;
    for (let i = 0; i < numBars; i++) {
      const bx = codeX + 12 + i * 4.5;
      const bw = (i % 3 === 0 || i % 7 === 0) ? 3 : 1.5;
      ctx.fillRect(bx, codeY + 12, bw, 52);
    }

    ctx.font = '700 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('7 1486 02458 9', codeX + codeW / 2, codeY + 78);

    // Copyright & Series Text in Footer
    ctx.fillStyle = '#B0BEC5';
    ctx.font = '800 13px "Bangers", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`SERIES 01 // 2026 // ${profile.edition}`, this.width - 36, codeY + 45);
    ctx.font = '600 11px sans-serif';
    ctx.fillText('FACE DAY COMIC BOOK BATTLEGROUND // 100% CLIENT-SIDE EDGE', this.width - 36, codeY + 68);
  }

  private drawComicBurst(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    const spikes = 16;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.65;
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawSpeedLines(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 600, cy + Math.sin(a) * 600);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawHoloFoilEffect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.save();
    ctx.globalCompositeOperation = 'color-dodge';
    const foilGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    foilGrad.addColorStop(0.0, 'rgba(255, 0, 128, 0.22)');
    foilGrad.addColorStop(0.25, 'rgba(255, 230, 0, 0.22)');
    foilGrad.addColorStop(0.5, 'rgba(0, 255, 128, 0.22)');
    foilGrad.addColorStop(0.75, 'rgba(0, 200, 255, 0.22)');
    foilGrad.addColorStop(1.0, 'rgba(255, 0, 128, 0.22)');
    ctx.fillStyle = foilGrad;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  private drawHalftoneGrid(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dotColor: string) {
    ctx.fillStyle = dotColor;
    const step = 18;
    for (let px = x + 8; px < x + w; px += step) {
      for (let py = y + 8; py < y + h; py += step) {
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  public downloadCard(profile: CardProfile): void {
    const canvas = this.render(profile);
    const link = document.createElement('a');
    link.download = `FaceDay-Comic-${profile.team}-${profile.cardNumber.replace(/[^0-9]/g, '')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  public getShareToXUrl(profile: CardProfile): string {
    const teamLabel = profile.team === 'thor' 
      ? 'Team Thor (The Hammer)' 
      : profile.team === 'doom' 
        ? 'Team Doom (The Mask)' 
        : 'Strange Tales (Astral Mirror)';
    const text = `The biometrics have spoken! I have been drafted into ${teamLabel} as "${profile.archetype}" on the cover of Face Day #${profile.cardNumber}! ⚡ Pulse: ${profile.biometrics.pulse} BPM // HRV: ${profile.biometrics.rmssd}ms // Total Power: ${profile.powerRating}. #FaceDay #presagechallenge`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  }
}

export const cardRenderer = new CardCanvasRenderer();
