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
    const darkBg = isThor ? '#060F1A' : isDoom ? '#07160C' : '#14081E';

    // 1. Aged Vintage Newsprint Outer Bleed
    ctx.fillStyle = '#111116';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Comic Page Inset (Aged Paper Edge)
    ctx.fillStyle = '#FDFBF7';
    ctx.fillRect(10, 10, this.width - 20, this.height - 20);

    // 3. Cover Background Scene
    const bgGrad = ctx.createLinearGradient(14, 14, 14, this.height - 28);
    bgGrad.addColorStop(0, darkBg);
    bgGrad.addColorStop(0.65, darkBg);
    bgGrad.addColorStop(1, '#020508');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(14, 14, this.width - 28, this.height - 28);

    // Ben-Day Halftone Dot Overlay
    this.drawHalftoneGrid(ctx, 14, 14, this.width - 28, this.height - 28, `${primaryColor}22`);

    // Dynamic Comic Speed Lines from Center
    this.drawSpeedLines(ctx, this.width / 2, 490);

    // 4. Hero Action Scene Illustration (Upper-Mid Section)
    if (isThor) {
      this.drawThorCoverArt(ctx, primaryColor, secondaryColor);
    } else if (isDoom) {
      this.drawDoomCoverArt(ctx, primaryColor, secondaryColor);
    } else {
      this.drawStrangeCoverArt(ctx, primaryColor, secondaryColor);
    }

    // Holographic Foil Shimmer (for Ultra-Rare & Legendary)
    if (profile.rarity === 'LEGENDARY FOIL' || profile.rarity === 'ULTRA-RARE') {
      this.drawHoloFoilEffect(ctx, 14, 14, this.width - 28, this.height - 28);
    }

    // 5. Vintage Comic Trade Dress (Top Bar)
    this.drawTradeDress(ctx);

    // 6. Comics Code Authority Seal (Top Right)
    this.drawComicsCodeSeal(ctx);

    // 7. Corner Box Art (Top Left)
    this.drawCornerBox(ctx, profile, primaryColor);

    // 8. Giant 3D Title Logo
    this.drawCoverTitle(ctx, profile, primaryColor, secondaryColor);

    // 9. Comic Narrative Burst & Blurbs (Centered & Highly Visible)
    this.drawStoryBlurbs(ctx, profile, primaryColor);

    // 10. Biometric Telemetry Dossier Ribbon
    this.drawBiometricRibbon(ctx, profile, primaryColor);

    // 11. Vintage UPC Barcode (Bottom Left)
    this.drawVintageBarcode(ctx, profile);

    // Outer Vintage Distressed Border
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, this.width - 8, this.height - 8);

    return canvas;
  }

  private drawTradeDress(ctx: CanvasRenderingContext2D) {
    // Top Brand Bar: "FACE DAY COMICS GROUP"
    ctx.fillStyle = '#111116';
    ctx.fillRect(14, 14, this.width - 28, 36);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 20px "Bangers", "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FACE DAY COMICS GROUP', this.width / 2, 38);

    // Price and Month Strip
    ctx.fillStyle = '#E23636';
    ctx.fillRect(14, 50, this.width - 28, 5);
  }

  private drawCornerBox(ctx: CanvasRenderingContext2D, profile: CardProfile, primary: string) {
    const boxX = 24;
    const boxY = 62;
    const boxW = 86;
    const boxH = 135;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Price Banner
    ctx.fillStyle = primary;
    ctx.fillRect(boxX + 3, boxY + 3, boxW - 6, 32);
    ctx.fillStyle = '#111116';
    ctx.font = '900 22px "Bangers", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('25¢', boxX + boxW / 2, boxY + 26);

    // Issue & Month
    ctx.fillStyle = '#111116';
    ctx.font = '900 13px "Bangers", sans-serif';
    ctx.fillText('ISSUE #01', boxX + boxW / 2, boxY + 50);
    ctx.font = '800 10px sans-serif';
    ctx.fillText('SPECIAL ED.', boxX + boxW / 2, boxY + 64);

    // Character Silhouette / Emblem
    ctx.fillStyle = '#111116';
    ctx.fillRect(boxX + 10, boxY + 74, boxW - 20, boxH - 82);
    ctx.fillStyle = primary;
    ctx.font = '900 16px "Bangers", sans-serif';
    ctx.fillText(profile.team.toUpperCase().slice(0, 4), boxX + boxW / 2, boxY + 112);
  }

  private drawComicsCodeSeal(ctx: CanvasRenderingContext2D) {
    const sealX = this.width - 108;
    const sealY = 62;
    const sealW = 84;
    const sealH = 105;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(sealX, sealY, sealW, sealH);
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(sealX, sealY, sealW, sealH);

    ctx.fillStyle = '#111116';
    ctx.font = '900 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('APPROVED', sealX + sealW / 2, sealY + 20);
    ctx.fillText('BY THE', sealX + sealW / 2, sealY + 32);

    ctx.font = '900 15px "Bangers", sans-serif';
    ctx.fillStyle = '#D32F2F';
    ctx.fillText('COMICS', sealX + sealW / 2, sealY + 52);
    ctx.fillText('CODE', sealX + sealW / 2, sealY + 68);

    ctx.fillStyle = '#111116';
    ctx.font = '900 9px sans-serif';
    ctx.fillText('AUTHORITY', sealX + sealW / 2, sealY + 86);
  }

  private drawCoverTitle(
    ctx: CanvasRenderingContext2D,
    profile: CardProfile,
    primary: string,
    secondary: string
  ) {
    const titleY = 155;
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
    ctx.fillRect(cx - 240, titleY - 26, 480, 26);
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cx - 240, titleY - 26, 480, 26);

    ctx.fillStyle = '#111116';
    ctx.font = '900 16px "Bangers", sans-serif';
    ctx.fillText(subBanner, cx, titleY - 8);

    // Giant 3D Block Lettering
    ctx.font = '900 74px "Bangers", "Impact", sans-serif';

    // 3D Extrusion Shadow
    ctx.fillStyle = '#111116';
    for (let offset = 8; offset > 0; offset--) {
      ctx.fillText(mainTitle, cx + offset, titleY + 58 + offset);
    }

    // Main Fill
    ctx.fillStyle = primary;
    ctx.fillText(mainTitle, cx, titleY + 58);

    // Inked Outline
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 4;
    ctx.strokeText(mainTitle, cx, titleY + 58);
  }

  private drawThorCoverArt(ctx: CanvasRenderingContext2D, primary: string, secondary: string) {
    const cx = this.width / 2;
    const cy = 490;

    // Lightning Bolts
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 260, 240);
    ctx.lineTo(cx - 120, 390);
    ctx.lineTo(cx - 160, 410);
    ctx.lineTo(cx - 70, 560);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 260, 240);
    ctx.lineTo(cx + 120, 380);
    ctx.lineTo(cx + 150, 400);
    ctx.lineTo(cx + 80, 570);
    ctx.stroke();

    // Giant Mjolnir Hammer Head
    ctx.fillStyle = '#ECEFF1';
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 7;
    ctx.fillRect(cx - 110, cy - 90, 220, 120);
    ctx.strokeRect(cx - 110, cy - 90, 220, 120);

    // Nordic runes on hammer face
    ctx.strokeStyle = primary;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy - 30, 36, 0, Math.PI * 2);
    ctx.moveTo(cx - 25, cy - 30);
    ctx.lineTo(cx + 25, cy - 30);
    ctx.moveTo(cx, cy - 55);
    ctx.lineTo(cx, cy - 5);
    ctx.stroke();

    // Hammer Handle
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(cx - 18, cy + 30, 36, 170);
    ctx.strokeRect(cx - 18, cy + 30, 36, 170);

    // Handle Straps
    ctx.strokeStyle = '#D7CCC8';
    ctx.lineWidth = 3;
    for (let y = cy + 45; y < cy + 190; y += 26) {
      ctx.beginPath();
      ctx.moveTo(cx - 16, y);
      ctx.lineTo(cx + 16, y + 14);
      ctx.stroke();
    }
  }

  private drawDoomCoverArt(ctx: CanvasRenderingContext2D, primary: string, _secondary: string) {
    const cx = this.width / 2;
    const cy = 490;

    // Latverian Arcane Circle
    ctx.strokeStyle = primary;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 170, 0, Math.PI * 2);
    ctx.stroke();

    // Hood Silhouette
    ctx.fillStyle = '#1B5E20';
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 170);
    ctx.bezierCurveTo(cx - 170, cy - 140, cx - 140, cy + 130, cx - 120, cy + 200);
    ctx.lineTo(cx + 120, cy + 200);
    ctx.bezierCurveTo(cx + 140, cy + 130, cx + 170, cy - 140, cx, cy - 170);
    ctx.fill();
    ctx.stroke();

    // Titanium Mask Face
    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.moveTo(cx - 75, cy - 80);
    ctx.lineTo(cx + 75, cy - 80);
    ctx.lineTo(cx + 85, cy + 20);
    ctx.lineTo(cx + 50, cy + 120);
    ctx.lineTo(cx - 50, cy + 120);
    ctx.lineTo(cx - 85, cy + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Eyes
    ctx.fillStyle = '#00E676';
    ctx.fillRect(cx - 62, cy - 15, 42, 14);
    ctx.fillRect(cx + 20, cy - 15, 42, 14);
    ctx.strokeRect(cx - 62, cy - 15, 42, 14);
    ctx.strokeRect(cx + 20, cy - 15, 42, 14);

    // Mouth Grill
    ctx.fillStyle = '#263238';
    ctx.fillRect(cx - 32, cy + 55, 64, 24);
    ctx.strokeRect(cx - 32, cy + 55, 64, 24);
  }

  private drawStrangeCoverArt(ctx: CanvasRenderingContext2D, primary: string, _secondary: string) {
    const cx = this.width / 2;
    const cy = 490;

    // Eye of Agamotto Astral Mandalas
    ctx.strokeStyle = primary;
    ctx.lineWidth = 5;
    for (let r = 70; r <= 180; r += 40) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Glowing Eye of Agamotto Center
    ctx.fillStyle = '#E65100';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 95, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111116';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 15, 32, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawStoryBlurbs(ctx: CanvasRenderingContext2D, profile: CardProfile, primary: string) {
    // Action Starburst (Left)
    const starX = 135;
    const starY = 790;
    this.drawComicBurst(ctx, starX, starY, 75, '#FFEB3B');

    ctx.fillStyle = '#111116';
    ctx.font = '900 16px "Bangers", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STATUS:', starX, starY - 14);
    ctx.fillText('OFFICIAL', starX, starY + 2);
    ctx.fillStyle = '#D32F2F';
    ctx.font = '900 17px "Bangers", sans-serif';
    ctx.fillText('DRAFTED!', starX, starY + 22);

    // Right Narrative Comic Story Box (Clean & Generous Spacing)
    const boxX = 245;
    const boxY = 725;
    const boxW = 525;
    const boxH = 145;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 4;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Blurb Header Tag
    ctx.fillStyle = primary;
    ctx.fillRect(boxX + 16, boxY - 14, 190, 26);
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX + 16, boxY - 14, 190, 26);
    ctx.fillStyle = '#111116';
    ctx.font = '900 14px "Bangers", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(profile.archetype.toUpperCase().slice(0, 22), boxX + 111, boxY + 4);

    // Flavor Quote (Formatted cleanly with high contrast)
    ctx.fillStyle = '#111116';
    ctx.font = 'italic 700 16px "Comic Neue", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    this.wrapText(ctx, `"${profile.flavorQuote}"`, boxX + 20, boxY + 36, boxW - 40, 24);

    // Rarity & Numbering strip inside Blurb (High Contrast Ink & Gold)
    ctx.fillStyle = '#D32F2F';
    ctx.font = '900 13px "Bangers", monospace';
    ctx.fillText(`★ ${profile.rarity} ★`, boxX + 20, boxY + 128);

    ctx.fillStyle = '#111116';
    ctx.font = '800 12px "Courier New", monospace';
    ctx.fillText(`// CARD ${profile.cardNumber}`, boxX + 160, boxY + 128);
  }

  private drawBiometricRibbon(ctx: CanvasRenderingContext2D, profile: CardProfile, primary: string) {
    const barY = 890;
    const barW = this.width - 48;
    const barH = 92;

    ctx.fillStyle = '#111116';
    ctx.fillRect(24, barY, barW, barH);
    ctx.strokeStyle = primary;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(24, barY, barW, barH);

    const bio = profile.biometrics;
    const statsList = [
      { label: 'PULSE', val: `${bio.pulse} BPM` },
      { label: 'HRV', val: `${bio.rmssd} MS` },
      { label: 'RESPIRATION', val: `${bio.breathing} /M` },
      { label: 'EQUILIBRIUM', val: bio.equilibrium.slice(0, 14).toUpperCase() },
      { label: 'POWER LEVEL', val: `${profile.powerRating}` }
    ];

    const colW = barW / statsList.length;
    statsList.forEach((st, idx) => {
      const colX = 24 + idx * colW + colW / 2;
      // High-Contrast Pure White Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 13px "Bangers", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.label, colX, barY + 28);

      // Large Vivid Value with Inked Shadow
      ctx.fillStyle = primary;
      ctx.font = '900 22px "Bangers", sans-serif';
      ctx.fillText(st.val, colX, barY + 62);
    });
  }

  private drawVintageBarcode(ctx: CanvasRenderingContext2D, profile: CardProfile) {
    const codeX = 28;
    const codeY = 1010;
    const codeW = 150;
    const codeH = 96;

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
      ctx.fillRect(bx, codeY + 14, bw, 54);
    }

    ctx.font = '700 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('7 1486 02458 9', codeX + codeW / 2, codeY + 84);

    // Vintage Comic Copyright & Legal Note (High Contrast White & Bright Cyan)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 16px "Bangers", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`SERIES 01 // 2026 // ${profile.edition}`, this.width - 32, codeY + 44);
    ctx.fillStyle = '#00E5FF';
    ctx.font = '700 12px sans-serif';
    ctx.fillText('© 2026 FACE DAY COMICS // ALL RIGHTS RESERVED WORLDWIDE', this.width - 32, codeY + 68);
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

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines = 3
  ) {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, y);
        line = words[n] + ' ';
        y += lineHeight;
        lineCount++;
        if (lineCount >= maxLines - 1 && n < words.length - 1) {
          let rem = words.slice(n).join(' ');
          while (ctx.measureText(rem + '..."').width > maxWidth && rem.length > 0) {
            rem = rem.slice(0, -1);
          }
          ctx.fillText(rem.trim() + '..."', x, y);
          return;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, y);
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
