// src/golden-ratio.ts
// Golden Ratio (Phi = 1.618) & Dermal Aesthetic Assessment Engine
// Features spinning celestial orb, craniofacial structure, skin clarity/acne index, skin type, and iris analysis.

import { CardProfile } from './sorting-engine';
import { icons } from './icons';

export interface GoldenRatioReport {
  score: number;
  phiRatio: number;
  tier: string;
  structure: {
    shape: string;
    description: string;
    symmetry: number;
  };
  dermal: {
    clarityScore: number;
    blemishIndex: string;
    textureType: string;
  };
  skinType: {
    classification: string;
    undertone: string;
    hydration: number;
  };
  eyes: {
    color: string;
    luminescence: string;
    limbalRing: string;
    pupilRatio: string;
  };
}

export class GoldenRatioAnalyzer {
  public generateReport(profile: CardProfile): GoldenRatioReport {
    const isThor = profile.team === 'thor';
    const isDoom = profile.team === 'doom';
    const bio = profile.biometrics;

    // Deterministic procedural calculation based on profile attributes
    const seed = (bio.pulse * 3 + bio.rmssd * 7 + bio.calmScore * 11) % 100;
    const baseScore = 86 + (seed % 11) + (bio.calmScore > 70 ? 2.4 : 0.8);
    const score = Math.min(97.8, Math.max(84.0, parseFloat(baseScore.toFixed(1))));

    // Proximity to golden ratio 1.618
    const phiDev = ((seed % 7) - 3) * 0.006;
    const phiRatio = parseFloat((1.618 + phiDev).toFixed(3));

    const tier =
      score >= 93
        ? 'OLYMPIAN DIVINE HARMONY'
        : score >= 88
        ? 'CLASSICAL HEROIC PROPORTION'
        : 'DYNAMIC ASYMMETRIC VIGOR';

    // 1. Structure Architecture
    const structure = isThor
      ? {
          shape: 'HEROIC DIAMOND',
          description: 'High zygomatic cheekbone projection with chiseled Asgardian mandibular angle.',
          symmetry: 94.6
        }
      : isDoom
      ? {
          shape: 'IMPERIAL SQUARE',
          description: 'Latverian stoic jawline with fortified frontal crest and acute bilateral symmetry.',
          symmetry: 96.2
        }
      : {
          shape: 'MYSTIC OVAL',
          description: 'Elongated Kamar-Taj cranial contours with serene temporal balance.',
          symmetry: 93.1
        };

    // 2. Dermal Clarity & Acne / Blemish Index
    const clarityScore = 88 + (bio.rmssd % 10);
    const blemishIndex =
      clarityScore >= 92
        ? 'Serene Smooth Cadence (Minimal Blemish Variance)'
        : 'Micro-vascular Uniformity (Balanced Dermal Tone)';

    const dermal = {
      clarityScore,
      blemishIndex,
      textureType: isDoom ? 'Cold Matte Titanium' : isThor ? 'Radiant Sun-Forged Velvet' : 'Fine Arcane Luster'
    };

    // 3. Skin Type & Undertone
    const skinType = isThor
      ? {
          classification: 'Balanced Micro-Hydrated',
          undertone: 'Warm Golden Celestial / Oxygenated Capillary Glow',
          hydration: 91
        }
      : isDoom
      ? {
          classification: 'Tempered Shielded Dermis',
          undertone: 'Cool Platinum / High Melanin Stability',
          hydration: 86
        }
      : {
          classification: 'Astral Translucent',
          undertone: 'Warm Amber / High Optical Transparency',
          hydration: 89
        };

    // 4. Eyes & Iris Luminescence
    const eyes = isThor
      ? {
          color: 'Celestial Azure Blue',
          luminescence: 'High Specular Spark (Lightning Luminescence)',
          limbalRing: 'Crisp Deep Navy Periphery',
          pupilRatio: '1 : 1.618 (Phi Proportioned)'
        }
      : isDoom
      ? {
          color: 'Latverian Emerald Hazel',
          luminescence: 'Acute Piercing Tactical Focus',
          limbalRing: 'Solid Graphite Obsidian Rim',
          pupilRatio: '1 : 1.612 (Near-Optimal)'
        }
      : {
          color: 'Mystic Bronze Amber',
          luminescence: 'Astral Eye Luminescence',
          limbalRing: 'Concentric Arcane Iris Rings',
          pupilRatio: '1 : 1.620 (Golden Symmetry)'
        };

    return {
      score,
      phiRatio,
      tier,
      structure,
      dermal,
      skinType,
      eyes
    };
  }

  public render(profile: CardProfile, container: HTMLElement): void {
    const report = this.generateReport(profile);
    const isThor = profile.team === 'thor';
    const isDoom = profile.team === 'doom';
    const accentColor = isThor ? 'var(--thor-gold)' : isDoom ? 'var(--doom-emerald)' : '#E65100';

    container.innerHTML = `
      <div class="golden-ratio-box">
        <!-- Hero Header -->
        <div class="golden-header">
          <div class="golden-title-wrap">
            <span class="golden-orb-header-icon">${icons.spinningOrb}</span>
            <div>
              <div class="golden-title">GOLDEN RATIO &amp; DERMA MATRIX</div>
              <div class="golden-sub">PHI (&Phi; = 1.618) AESTHETIC HARMONY &bull; FACIAL ARCHITECTURE &bull; SKIN TELEMETRY</div>
            </div>
          </div>
        </div>

        <!-- Spinning Green Steel Ball & Golden Harmony Hero Score -->
        <div class="golden-hero-panel">
          <!-- Animated Spinning Green Steel Ball -->
          <div class="spinning-ball-chamber">
            <div class="celestial-orb-wrapper">
              <div class="orb-core green-steel-ball" title="The Emerald Steel Ball — Proportional Phi Radar">
                <div class="steel-ball-specular"></div>
                <div class="steel-ball-groove groove-h"></div>
                <div class="steel-ball-groove groove-v"></div>
                <span class="orb-phi-glyph">&Phi;</span>
              </div>
              <div class="orb-ring ring-latitude"></div>
              <div class="orb-ring ring-longitude"></div>
              <div class="orb-ring ring-equator"></div>
            </div>
            <div class="orb-caption">GREEN STEEL BALL &bull; &Phi; RADAR</div>
          </div>

          <!-- Hero Ratio Rating Banner -->
          <div class="golden-score-col">
            <div class="golden-score-badge">${report.tier}</div>
            <div class="golden-score-num" style="color: ${accentColor};">${report.score}%</div>
            <div class="golden-score-sub">FACIAL PROPORTIONAL HARMONY ALIGNMENT</div>
            <div class="golden-phi-caliper-row">
              <span class="caliper-tag">CALIPER RATIO:</span>
              <span class="caliper-val">&Phi; = ${report.phiRatio} / 1.618</span>
              <span class="caliper-diff">(&Delta; ${Math.abs(report.phiRatio - 1.618) < 0.001 ? '0.000 PERFECT' : (report.phiRatio - 1.618 > 0 ? '+' : '') + (report.phiRatio - 1.618).toFixed(3)})</span>
            </div>
          </div>
        </div>

        <!-- 4 Detailed Dermal & Structural Cards -->
        <div class="golden-cards-grid">
          <!-- 1. Bone Structure Architecture -->
          <div class="golden-card">
            <div class="golden-card-header">
              <span class="golden-card-icon">${icons.structure}</span>
              <span class="golden-card-title">CRANIOFACIAL STRUCTURE</span>
            </div>
            <div class="golden-card-body">
              <div class="golden-trait-headline">${report.structure.shape}</div>
              <p class="golden-trait-desc">${report.structure.description}</p>
              <div class="golden-metric-strip">
                <span>BILATERAL SYMMETRY:</span>
                <strong style="color: ${accentColor};">${report.structure.symmetry}% BALANCE</strong>
              </div>
            </div>
          </div>

          <!-- 2. Skin Clarity & Acne Variance -->
          <div class="golden-card">
            <div class="golden-card-header">
              <span class="golden-card-icon">${icons.dermal}</span>
              <span class="golden-card-title">SKIN CLARITY &amp; ACNE INDEX</span>
            </div>
            <div class="golden-card-body">
              <div class="golden-trait-headline">${report.dermal.clarityScore}% CLARITY RATING</div>
              <p class="golden-trait-desc">${report.dermal.blemishIndex}</p>
              <div class="golden-metric-strip">
                <span>TEXTURE FINISH:</span>
                <strong>${report.dermal.textureType}</strong>
              </div>
            </div>
          </div>

          <!-- 3. Skin Type & Undertone -->
          <div class="golden-card">
            <div class="golden-card-header">
              <span class="golden-card-icon">${icons.calipers}</span>
              <span class="golden-card-title">COMPLEXION &amp; UNDERTONE</span>
            </div>
            <div class="golden-card-body">
              <div class="golden-trait-headline">${report.skinType.classification}</div>
              <p class="golden-trait-desc">${report.skinType.undertone}</p>
              <div class="golden-metric-strip">
                <span>CELLULAR HYDRATION:</span>
                <strong style="color: ${accentColor};">${report.skinType.hydration}% OPTIMAL</strong>
              </div>
            </div>
          </div>

          <!-- 4. Eye Color & Iris Luminescence -->
          <div class="golden-card">
            <div class="golden-card-header">
              <span class="golden-card-icon">${icons.eyeIris}</span>
              <span class="golden-card-title">IRIS COLOR &amp; LUMINESCENCE</span>
            </div>
            <div class="golden-card-body">
              <div class="golden-trait-headline">${report.eyes.color}</div>
              <p class="golden-trait-desc">${report.eyes.luminescence}</p>
              <div class="golden-metric-strip">
                <span>PUPIL-TO-IRIS RATIO:</span>
                <strong>${report.eyes.pupilRatio}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Comic Disclaimer Footnote -->
        <div class="golden-footnote">
          ★ ESTIMATED VIA CHROMATIC MESH SPATIAL HARMONY // NON-DIAGNOSTIC RETRO COMIC AESTHETIC PROTOCOL ★
        </div>
      </div>
    `;
  }
}

export const goldenRatioAnalyzer = new GoldenRatioAnalyzer();
