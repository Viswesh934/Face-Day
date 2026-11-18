// src/stat-dashboard.ts
// Interactive Biometric Stat Dashboard: Surfaces complete Presage SmartSpectra telemetry

import { CardProfile } from './sorting-engine';

export class StatDashboard {
  public render(profile: CardProfile, container: HTMLElement): void {
    const bio = profile.biometrics;
    const isThor = profile.team === 'thor';
    const isDoom = profile.team === 'doom';

    const accentColor = isThor ? 'var(--thor-gold)' : isDoom ? 'var(--doom-emerald)' : '#E65100';

    container.innerHTML = `
      <div class="stat-dossier-box">
        <div class="dossier-header">
          <div class="dossier-title-tag">PHYSIOLOGICAL TELEMETRY DOSSIER</div>
          <div class="dossier-sub-id">RECORD ID: ${profile.id} &bull; PRESAGE SMARTSPECTRA ENGINE</div>
        </div>

        <div class="dossier-grid">
          <!-- 1. Cardio & Autonomic Tone -->
          <div class="dossier-card">
            <div class="dossier-card-title">CARDIAC & AUTONOMIC SPECTRUM</div>
            <div class="dossier-metrics-row">
              <div class="dossier-metric">
                <span class="dossier-val" style="color: ${accentColor};">${bio.pulse}</span>
                <span class="dossier-unit">BPM</span>
                <span class="dossier-label">PULSE RATE</span>
              </div>
              <div class="dossier-metric">
                <span class="dossier-val">${bio.rmssd}</span>
                <span class="dossier-unit">MS</span>
                <span class="dossier-label">HRV (RMSSD)</span>
              </div>
              <div class="dossier-metric">
                <span class="dossier-val">${bio.stressIndex}</span>
                <span class="dossier-unit">IDX</span>
                <span class="dossier-label">BAEVSKY STRESS</span>
              </div>
            </div>
            <div class="dossier-bar-wrap">
              <div class="dossier-bar-label">
                <span>PARASYMPATHETIC (CALM)</span>
                <span>${bio.calmScore}%</span>
              </div>
              <div class="dossier-bar-track">
                <div class="dossier-bar-fill" style="width: ${bio.calmScore}%; background: ${accentColor};"></div>
              </div>
            </div>
          </div>

          <!-- 2. Respiratory Dynamics -->
          <div class="dossier-card">
            <div class="dossier-card-title">RESPIRATORY MECHANICS</div>
            <div class="dossier-metrics-row">
              <div class="dossier-metric">
                <span class="dossier-val" style="color: ${accentColor};">${bio.breathing}</span>
                <span class="dossier-unit">/MIN</span>
                <span class="dossier-label">RESPIRATION RATE</span>
              </div>
              <div class="dossier-metric">
                <span class="dossier-val">${bio.breathing <= 15 ? 'DEEP' : 'TACTICAL'}</span>
                <span class="dossier-unit">CADENCE</span>
                <span class="dossier-label">RHYTHM DEPTH</span>
              </div>
            </div>
            <div class="dossier-note">
              ${bio.breathing <= 16 
                ? 'Steady, restorative cadence indicating high parasympathetic stability.' 
                : 'Rapid or heightened respiratory drive indicating acute alert state.'}
            </div>
          </div>

          <!-- 3. Facial Micro-Expressions -->
          <div class="dossier-card">
            <div class="dossier-card-title">FACIAL MICRO-EXPRESSIONS</div>
            <div class="dossier-expr-list">
              ${this.renderExpressionBars(bio.expressions, accentColor)}
            </div>
          </div>

          <!-- 4. Faction Assignment Heuristic -->
          <div class="dossier-card">
            <div class="dossier-card-title">FACTION DECREE MATRIX</div>
            <div class="dossier-summary-stat">
              <span class="dossier-summary-badge" style="background: ${accentColor};">${profile.teamName}</span>
              <p style="font-weight: 700; margin-top: 8px;">EQUILIBRIUM: ${bio.equilibrium.toUpperCase()}</p>
              <p style="font-size: 13px; color: #4A4A52; margin-top: 4px;">
                ${isThor 
                  ? 'High HRV resilient equilibrium & rhythmic breathing drafted this profile to Team Thor (The Vanguard).'
                  : isDoom 
                    ? 'Elevated tactical focus, heightened sympathetic drive, and unwavering composure drafted this profile to Team Doom (The Overseer).'
                    : 'Harmonious astral balance and serene micro-tensions aligned this profile with Strange Tales (Sorcerer Supreme).'}
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderExpressionBars(exprs: Record<string, number>, color: string): string {
    const defaultExprs: Record<string, number> = exprs && Object.keys(exprs).length > 0
      ? exprs
      : { neutral: 65, calm: 25, focus: 10 };

    return Object.entries(defaultExprs)
      .slice(0, 4)
      .map(([name, val]) => `
        <div class="expr-row">
          <span class="expr-name">${name.toUpperCase()}</span>
          <div class="expr-track">
            <div class="expr-fill" style="width: ${Math.min(100, val)}%; background: ${color};"></div>
          </div>
          <span class="expr-num">${val}%</span>
        </div>
      `)
      .join('');
  }
}

export const statDashboard = new StatDashboard();
