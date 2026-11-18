// src/card-canvas.ts
// High-Resolution Physical Trading Card Canvas Generator
// Renders collectible TCG cards (Pokémon / Marvel Snap / OverPower style)

import { CardProfile } from './sorting-engine';

export class CardCanvasRenderer {
  private width = 750;
  private height = 1050;

  public render(profile: CardProfile): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const isThor = profile.team === 'thor';

    // Palettes
    const primaryColor = isThor ? '#FFCC00' : '#00C853';
    const accentColor = isThor ? '#00E5FF' : '#B0BEC5';
    const darkBg = isThor ? '#0E1726' : '#141D17';
    const frameBorder = isThor ? '#D4A000' : '#009624';

    // 1. Outer Dark Bleed Trim
    ctx.fillStyle = '#0A0A0E';
    this.roundRect(ctx, 0, 0, this.width, this.height, 36);
    ctx.fill();

    // 2. Main Inked Card Border
    ctx.fillStyle = primaryColor;
    this.roundRect(ctx, 16, 16, this.width - 32, this.height - 32, 28);
    ctx.fill();
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 6;
    ctx.stroke();

    // 3. Card Inner Canvas / Cardboard Texture
    ctx.fillStyle = darkBg;
    this.roundRect(ctx, 28, 28, this.width - 56, this.height - 56, 20);
    ctx.fill();

    // Subtle Halftone Dots in card background
    this.drawHalftoneGrid(ctx, 28, 28, this.width - 56, this.height - 56, isThor ? '#FFCC0014' : '#00C85314');

    // 4. Header Bar (Card Title & Power Level)
    this.drawHeader(ctx, profile, primaryColor, accentColor);

    // 5. Illustration Window (Vector Archetype Art)
    this.drawArtworkWindow(ctx, profile, isThor, primaryColor, accentColor, frameBorder);

    // 6. Foil Sheen / Holographic Layer (for Ultra-Rare & Legendary)
    if (profile.rarity === 'LEGENDARY FOIL' || profile.rarity === 'ULTRA-RARE') {
      this.drawHoloFoilEffect(ctx, 42, 120, this.width - 84, 460);
    }

    // 7. RPG Stat Grid (AGI, END, FOC, WIL)
    this.drawStatGrid(ctx, profile, primaryColor, accentColor);

    // 8. Comic Flavor Box (Narration Plate)
    this.drawFlavorPlate(ctx, profile);

    // 9. Card Footer (Collector Numbering, Rarity & Edition Holo-Stamp)
    this.drawFooter(ctx, profile, primaryColor);

    return canvas;
  }

  private drawHeader(ctx: CanvasRenderingContext2D, profile: CardProfile, primary: string, accent: string) {
    // Header Banner
    ctx.fillStyle = '#1A1D24';
    this.roundRect(ctx, 42, 42, this.width - 84, 64, 12);
    ctx.fill();
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Team Emblem Pill
    ctx.fillStyle = primary;
    this.roundRect(ctx, 50, 48, 120, 52, 8);
    ctx.fill();
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#111116';
    ctx.font = '900 22px "Bangers", "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(profile.team === 'thor' ? 'HAMMER' : 'MASK', 110, 81);

    // Archetype Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px "Bangers", "Impact", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(profile.archetype.toUpperCase(), 185, 83);

    // Power Rating Badge (Right)
    ctx.fillStyle = accent;
    this.roundRect(ctx, this.width - 170, 48, 118, 52, 8);
    ctx.fill();
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#111116';
    ctx.font = '900 24px "Bangers", "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PWR ${profile.powerRating}`, this.width - 111, 82);
  }

  private drawArtworkWindow(
    ctx: CanvasRenderingContext2D,
    profile: CardProfile,
    isThor: boolean,
    primary: string,
    accent: string,
    frameBorder: string
  ) {
    const artX = 42;
    const artY = 120;
    const artW = this.width - 84;
    const artH = 460;

    // Window border
    ctx.fillStyle = frameBorder;
    this.roundRect(ctx, artX, artY, artW, artH, 14);
    ctx.fill();
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Artwork interior clipping
    ctx.save();
    this.roundRect(ctx, artX + 6, artY + 6, artW - 12, artH - 12, 10);
    ctx.clip();

    // Sky / Atmosphere gradient
    const skyGrad = ctx.createLinearGradient(artX, artY, artX, artY + artH);
    if (isThor) {
      skyGrad.addColorStop(0, '#020C1B');
      skyGrad.addColorStop(0.5, '#0E2B4B');
      skyGrad.addColorStop(1, '#FFCC00');
    } else {
      skyGrad.addColorStop(0, '#06130B');
      skyGrad.addColorStop(0.5, '#0F381E');
      skyGrad.addColorStop(1, '#00E676');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(artX, artY, artW, artH);

    // Comic Burst / Speed lines
    ctx.strokeStyle = '#FFFFFF18';
    ctx.lineWidth = 2;
    const cx = artX + artW / 2;
    const cy = artY + artH / 2;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 400, cy + Math.sin(angle) * 400);
      ctx.stroke();
    }

    if (isThor) {
      this.drawThorIllustration(ctx, cx, cy, primary, accent);
    } else {
      this.drawDoomIllustration(ctx, cx, cy, primary, accent);
    }

    ctx.restore();

    // Rarity Badge Tab (Floating on bottom right of artwork)
    ctx.fillStyle = '#111116';
    this.roundRect(ctx, artX + artW - 190, artY + artH - 38, 180, 34, 6);
    ctx.fill();
    ctx.fillStyle = primary;
    ctx.font = '900 16px "Bangers", "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`★ ${profile.rarity} ★`, artX + artW - 100, artY + artH - 15);
  }

  private drawThorIllustration(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    primary: string,
    accent: string
  ) {
    // Lightning bolts in backdrop
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 140, cy - 180);
    ctx.lineTo(cx - 80, cy - 60);
    ctx.lineTo(cx - 110, cy - 50);
    ctx.lineTo(cx - 40, cy + 80);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 140, cy - 180);
    ctx.lineTo(cx + 80, cy - 70);
    ctx.lineTo(cx + 110, cy - 60);
    ctx.lineTo(cx + 50, cy + 90);
    ctx.stroke();

    // Mjolnir Hammer (Center Stage)
    // Head
    ctx.fillStyle = '#ECEFF1';
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 6;
    ctx.fillRect(cx - 70, cy - 50, 140, 80);
    ctx.strokeRect(cx - 70, cy - 50, 140, 80);

    // Nordic runes on hammer face
    ctx.strokeStyle = primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 22, 0, Math.PI * 2);
    ctx.moveTo(cx - 15, cy - 10);
    ctx.lineTo(cx + 15, cy - 10);
    ctx.moveTo(cx, cy - 25);
    ctx.lineTo(cx, cy + 5);
    ctx.stroke();

    // Hammer Handle
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(cx - 14, cy + 30, 28, 140);
    ctx.strokeRect(cx - 14, cy + 30, 28, 140);

    // Handle Leather Straps
    ctx.strokeStyle = '#BCAAA4';
    ctx.lineWidth = 3;
    for (let y = cy + 45; y < cy + 160; y += 22) {
      ctx.beginPath();
      ctx.moveTo(cx - 13, y);
      ctx.lineTo(cx + 13, y + 10);
      ctx.stroke();
    }

    // Pommel
    ctx.fillStyle = '#CFD8DC';
    ctx.fillRect(cx - 20, cy + 170, 40, 20);
    ctx.strokeRect(cx - 20, cy + 170, 40, 20);
  }

  private drawDoomIllustration(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    primary: string,
    _accent: string
  ) {
    // Latverian Emerald Aura Ring
    ctx.strokeStyle = primary;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 130, 0, Math.PI * 2);
    ctx.stroke();

    // Green Cloak Hood Outline
    ctx.fillStyle = '#1B5E20';
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 160);
    ctx.bezierCurveTo(cx - 140, cy - 140, cx - 120, cy + 100, cx - 110, cy + 160);
    ctx.lineTo(cx + 110, cy + 160);
    ctx.bezierCurveTo(cx + 120, cy + 100, cx + 140, cy - 140, cx, cy - 160);
    ctx.fill();
    ctx.stroke();

    // Titanium Iron Mask
    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.moveTo(cx - 55, cy - 80);
    ctx.lineTo(cx + 55, cy - 80);
    ctx.lineTo(cx + 65, cy + 10);
    ctx.lineTo(cx + 40, cy + 90);
    ctx.lineTo(cx - 40, cy + 90);
    ctx.lineTo(cx - 65, cy + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mask Brow & Nose Ridge
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 35);
    ctx.lineTo(cx, cy - 20);
    ctx.lineTo(cx + 50, cy - 35);
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx, cy + 30);
    ctx.stroke();

    // Slit Eye Sockets (Glowing Emerald)
    ctx.fillStyle = '#00E676';
    ctx.fillRect(cx - 45, cy - 15, 32, 10);
    ctx.fillRect(cx + 13, cy - 15, 32, 10);
    ctx.strokeRect(cx - 45, cy - 15, 32, 10);
    ctx.strokeRect(cx + 13, cy - 15, 32, 10);

    // Mouth Grill Rivets
    ctx.fillStyle = '#37474F';
    ctx.fillRect(cx - 25, cy + 45, 50, 18);
    ctx.strokeRect(cx - 25, cy + 45, 50, 18);
    for (let vx = cx - 18; vx <= cx + 18; vx += 9) {
      ctx.beginPath();
      ctx.moveTo(vx, cy + 47);
      ctx.lineTo(vx, cy + 61);
      ctx.stroke();
    }
  }

  private drawHoloFoilEffect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.save();
    ctx.globalCompositeOperation = 'color-dodge';
    const foilGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    foilGrad.addColorStop(0.0, 'rgba(255, 0, 128, 0.25)');
    foilGrad.addColorStop(0.2, 'rgba(255, 230, 0, 0.25)');
    foilGrad.addColorStop(0.4, 'rgba(0, 255, 128, 0.25)');
    foilGrad.addColorStop(0.6, 'rgba(0, 200, 255, 0.25)');
    foilGrad.addColorStop(0.8, 'rgba(150, 0, 255, 0.25)');
    foilGrad.addColorStop(1.0, 'rgba(255, 0, 128, 0.25)');
    ctx.fillStyle = foilGrad;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  private drawStatGrid(ctx: CanvasRenderingContext2D, profile: CardProfile, primary: string, _accent: string) {
    const gridY = 600;
    const statW = (this.width - 84 - 24) / 2;
    const statH = 58;

    const statsList = [
      { label: 'AGI', name: 'AGILITY', val: profile.stats.agility },
      { label: 'END', name: 'ENDURANCE', val: profile.stats.endurance },
      { label: 'FOC', name: 'FOCUS', val: profile.stats.focus },
      { label: 'WIL', name: 'WILLPOWER', val: profile.stats.willpower }
    ];

    statsList.forEach((stat, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const sx = 42 + col * (statW + 24);
      const sy = gridY + row * (statH + 12);

      // Stat container
      ctx.fillStyle = '#181E24';
      this.roundRect(ctx, sx, sy, statW, statH, 8);
      ctx.fill();
      ctx.strokeStyle = '#111116';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Stat Label Tag
      ctx.fillStyle = primary;
      this.roundRect(ctx, sx + 6, sy + 6, 68, statH - 12, 6);
      ctx.fill();
      ctx.fillStyle = '#111116';
      ctx.font = '900 18px "Bangers", "Impact", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.label, sx + 40, sy + 33);

      // Stat Value Number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px "Bangers", "Impact", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(stat.val), sx + statW - 14, sy + 35);

      // Stat Level Bar
      const barX = sx + 84;
      const barY = sy + 38;
      const barMaxW = statW - 140;
      ctx.fillStyle = '#0B0D11';
      ctx.fillRect(barX, barY, barMaxW, 10);
      ctx.fillStyle = primary;
      ctx.fillRect(barX, barY, (stat.val / 100) * barMaxW, 10);
    });
  }

  private drawFlavorPlate(ctx: CanvasRenderingContext2D, profile: CardProfile) {
    const boxX = 42;
    const boxY = 746;
    const boxW = this.width - 84;
    const boxH = 160;

    // Speech / Narration bubble background
    ctx.fillStyle = '#FDFBF7'; // Vintage comic newsprint
    this.roundRect(ctx, boxX, boxY, boxW, boxH, 10);
    ctx.fill();
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Narration Tag Header
    ctx.fillStyle = '#111116';
    this.roundRect(ctx, boxX + 16, boxY - 14, 160, 28, 4);
    ctx.fill();
    ctx.fillStyle = '#FFCC00';
    ctx.font = '900 14px "Bangers", "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TACTICAL DISPATCH', boxX + 96, boxY + 5);

    // Flavor Quote
    ctx.fillStyle = '#111116';
    ctx.font = 'italic 700 20px "Comic Neue", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    this.wrapText(ctx, `"${profile.flavorQuote}"`, boxX + 24, boxY + 45, boxW - 48, 28);

    // Micro Biometric Stamp in flavor box
    ctx.fillStyle = '#616161';
    ctx.font = '700 13px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      `PULSE: ${profile.biometricSummary.pulse} BPM // BREATH: ${profile.biometricSummary.breathing} // ${profile.biometricSummary.equilibrium.toUpperCase()}`,
      boxX + boxW - 20,
      boxY + boxH - 16
    );
  }

  private drawFooter(ctx: CanvasRenderingContext2D, profile: CardProfile, primary: string) {
    const footerY = 930;

    // Series info line
    ctx.fillStyle = '#B0BEC5';
    ctx.font = '800 15px "Bangers", "Impact", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(profile.edition, 42, footerY + 20);

    // Card Number
    ctx.fillStyle = primary;
    ctx.font = '900 22px "Bangers", "Impact", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(profile.cardNumber, this.width - 42, footerY + 22);

    // Center Gold Seal / Authentic Holo Foil Emblem
    const sealX = this.width / 2;
    const sealY = footerY + 36;
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111116';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#111116';
    ctx.font = '900 14px "Bangers", "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FD', sealX, sealY + 5);

    // Copyright
    ctx.fillStyle = '#78909C';
    ctx.font = '600 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FACE DAY TRADING CARD GAME // 100% CLIENT-SIDE EDGE', sealX, footerY + 74);
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private drawHalftoneGrid(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    dotColor: string
  ) {
    ctx.fillStyle = dotColor;
    const step = 16;
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
    lineHeight: number
  ) {
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
    link.download = `FaceDay-${profile.team}-${profile.cardNumber.replace(/[^0-9]/g, '')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  public getShareToXUrl(profile: CardProfile): string {
    const teamName = profile.team === 'thor' ? 'Team Thor (The Hammer)' : 'Team Doom (The Mask)';
    const text = `The biometrics have spoken! I have been drafted into ${teamName} as "${profile.archetype}" on Face Day! 🔨🎭 Total Power: ${profile.powerRating}. Can your vitals withstand the verdict? #FaceDay #presagechallenge`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  }
}

export const cardRenderer = new CardCanvasRenderer();
