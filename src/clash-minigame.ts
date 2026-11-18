// src/clash-minigame.ts
// Fast-paced Retro Comic Arcade Duel: Mjolnir (Team Thor) vs Iron Mask (Team Doom)
// Zero emojis, 100% SVG vector ink & canvas audio synth!

import { sound } from './sound-engine';
import { icons } from './icons';
import { CardProfile } from './sorting-engine';
import { deckVault } from './card-deck';
import confetti from 'canvas-confetti';

export class ClashMinigame {
  private modalEl: HTMLElement | null = null;
  private energyGauge = 50; // 0 = Doom Victory, 100 = Thor Victory
  private timer = 15;
  private intervalId: number | null = null;
  private isPlaying = false;
  private chosenFaction: 'thor' | 'doom' = 'thor';
  public onGameComplete?: (winnerProfile: CardProfile) => void;

  constructor() {
    this.createClashModal();
  }

  private createClashModal() {
    const existing = document.getElementById('clash-game-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'clash-game-modal';
    modal.className = 'clash-modal-backdrop';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="clash-game-box">
        <!-- Header -->
        <div class="clash-header">
          <div class="clash-tag-pill">ARCADE BATTLE ARENA</div>
          <h2 class="clash-title">CLASH OF REALITIES: MJOLNIR VS DOOM MASK</h2>
          <button id="btn-close-clash" class="clash-close-btn">&times;</button>
        </div>

        <!-- Faction Selector Bar -->
        <div class="clash-faction-select-bar">
          <span>CHOOSE YOUR CHAMPION:</span>
          <button id="btn-pick-thor" class="clash-pick-btn active" data-faction="thor">
            <span class="clash-pick-icon">${icons.hammer}</span>
            <span>TEAM THOR</span>
          </button>
          <button id="btn-pick-doom" class="clash-pick-btn" data-faction="doom">
            <span class="clash-pick-icon">${icons.mask}</span>
            <span>TEAM DOOM</span>
          </button>
        </div>

        <!-- Clash Arena Stage -->
        <div class="clash-arena-stage" id="clash-arena-stage">
          <!-- Left Hero: Thor -->
          <div class="clash-fighter clash-fighter-thor">
            <div class="clash-fighter-icon">${icons.hammer}</div>
            <div class="clash-fighter-name">MJOLNIR</div>
            <div class="clash-fighter-stats">STORM CADENCE: 98%</div>
          </div>

          <!-- Central Energy Beam Clash -->
          <div class="clash-center-nexus">
            <div class="clash-timer-badge" id="clash-timer-val">15s</div>
            <div class="clash-beam-container">
              <div class="clash-beam-fill-thor" id="clash-beam-thor" style="width: 50%;"></div>
              <div class="clash-beam-fill-doom" id="clash-beam-doom" style="width: 50%;"></div>
              <div class="clash-sparks-core" id="clash-sparks-core"></div>
            </div>
            <div class="clash-burst-callout" id="clash-burst-callout">READY!</div>
          </div>

          <!-- Right Hero: Doom -->
          <div class="clash-fighter clash-fighter-doom">
            <div class="clash-fighter-icon">${icons.mask}</div>
            <div class="clash-fighter-name">IRON MASK</div>
            <div class="clash-fighter-stats">TACTICAL WILL: 99%</div>
          </div>
        </div>

        <!-- Action Strike Bar -->
        <div class="clash-actions-bar">
          <button id="btn-clash-strike" class="comic-btn comic-btn-gold clash-strike-btn">
            <span>STRIKE! (TAP RAPIDLY / SPACEBAR)</span>
          </button>
        </div>

        <div class="clash-footer-hint">
          Rapidly tap STRIKE to push the cosmic energy beam into enemy territory before the 15-second clock expires!
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    modal.querySelector('#btn-close-clash')?.addEventListener('click', () => this.hide());
    modal.querySelector('#btn-pick-thor')?.addEventListener('click', () => this.selectFaction('thor'));
    modal.querySelector('#btn-pick-doom')?.addEventListener('click', () => this.selectFaction('doom'));

    const strikeBtn = modal.querySelector('#btn-clash-strike');
    strikeBtn?.addEventListener('click', () => this.handleStrike());

    window.addEventListener('keydown', (e) => {
      if (this.isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        this.handleStrike();
      }
    });
  }

  public show() {
    if (!this.modalEl) this.createClashModal();
    if (this.modalEl) {
      this.modalEl.style.display = 'flex';
      this.startGame();
    }
  }

  public hide() {
    this.stopGame();
    if (this.modalEl) this.modalEl.style.display = 'none';
  }

  private selectFaction(f: 'thor' | 'doom') {
    sound.playClick();
    this.chosenFaction = f;
    const thorBtn = this.modalEl?.querySelector('#btn-pick-thor');
    const doomBtn = this.modalEl?.querySelector('#btn-pick-doom');

    if (f === 'thor') {
      thorBtn?.classList.add('active');
      doomBtn?.classList.remove('active');
    } else {
      doomBtn?.classList.add('active');
      thorBtn?.classList.remove('active');
    }
  }

  private startGame() {
    this.isPlaying = true;
    this.energyGauge = 50;
    this.timer = 15;
    this.updateBeam();

    const timerEl = this.modalEl?.querySelector('#clash-timer-val');
    const calloutEl = this.modalEl?.querySelector('#clash-burst-callout');
    if (timerEl) timerEl.textContent = '15s';
    if (calloutEl) calloutEl.textContent = 'CLASH!';

    sound.playThunder();

    if (this.intervalId) clearInterval(this.intervalId);

    // AI counter-push simulation + timer tick
    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying) return;

      this.timer--;
      if (timerEl) timerEl.textContent = `${this.timer}s`;

      // Opposing faction applies tactical counter-force
      const aiPush = Math.random() * 5 + 2;
      if (this.chosenFaction === 'thor') {
        this.energyGauge = Math.max(5, this.energyGauge - aiPush);
      } else {
        this.energyGauge = Math.min(95, this.energyGauge + aiPush);
      }
      this.updateBeam();

      if (this.timer <= 0) {
        this.concludeGame();
      }
    }, 1000);
  }

  private stopGame() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private handleStrike() {
    if (!this.isPlaying) return;

    sound.playClick();
    const burstQuotesThor = ['KRAK-BOOM!', 'THUNDER STRIKE!', 'WORTHY!', 'LIGHTNING SURGE!'];
    const burstQuotesDoom = ['CLANG!', 'TACTICAL SHIELD!', 'IRON DOMINANCE!', 'SUBMIT!'];

    const quotes = this.chosenFaction === 'thor' ? burstQuotesThor : burstQuotesDoom;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const calloutEl = this.modalEl?.querySelector('#clash-burst-callout');
    if (calloutEl) {
      calloutEl.textContent = randomQuote;
      calloutEl.classList.remove('callout-pop');
      void (calloutEl as HTMLElement).offsetWidth; // trigger reflow
      calloutEl.classList.add('callout-pop');
    }

    // Apply player strike power
    const playerPower = 4.5 + Math.random() * 2.5;
    if (this.chosenFaction === 'thor') {
      this.energyGauge = Math.min(98, this.energyGauge + playerPower);
    } else {
      this.energyGauge = Math.max(2, this.energyGauge - playerPower);
    }

    this.updateBeam();

    // Early knockout victory if beam pushed past 92% or below 8%
    if (this.energyGauge >= 92 || this.energyGauge <= 8) {
      this.concludeGame();
    }
  }

  private updateBeam() {
    const thorBeam = this.modalEl?.querySelector('#clash-beam-thor') as HTMLElement;
    const doomBeam = this.modalEl?.querySelector('#clash-beam-doom') as HTMLElement;
    const sparks = this.modalEl?.querySelector('#clash-sparks-core') as HTMLElement;

    if (thorBeam && doomBeam) {
      thorBeam.style.width = `${this.energyGauge}%`;
      doomBeam.style.width = `${100 - this.energyGauge}%`;
    }
    if (sparks) {
      sparks.style.left = `${this.energyGauge}%`;
    }
  }

  private concludeGame() {
    this.stopGame();

    const isThorWinner = this.energyGauge >= 50;
    const winnerFaction = isThorWinner ? 'thor' : 'doom';
    const won = this.chosenFaction === winnerFaction;

    const calloutEl = this.modalEl?.querySelector('#clash-burst-callout');
    if (calloutEl) {
      calloutEl.textContent = won ? 'VICTORY!' : 'TACTICAL DRAW!';
    }

    if (isThorWinner) {
      sound.playThunder();
    } else {
      sound.playDoomClank();
    }

    confetti({
      particleCount: 100,
      spread: 80,
      colors: isThorWinner ? ['#FFCC00', '#00E5FF', '#111116'] : ['#00C853', '#ECEFF1', '#111116']
    });

    // Create commemorative Battle Mint Card Profile
    const cardNum = String(Math.floor(Math.random() * 899) + 101).padStart(3, '0');
    const winnerProfile: CardProfile = {
      id: `clash-${Date.now()}-${cardNum}`,
      timestamp: Date.now(),
      team: winnerFaction,
      teamName: isThorWinner ? 'TEAM THOR' : 'TEAM DOOM',
      archetype: isThorWinner ? 'Clash Thunder Victor' : 'Iron Mask Duel Master',
      rarity: 'LEGENDARY FOIL',
      stats: {
        agility: Math.round(85 + Math.random() * 14),
        endurance: Math.round(88 + Math.random() * 11),
        focus: Math.round(84 + Math.random() * 15),
        willpower: Math.round(92 + Math.random() * 7)
      },
      powerRating: Math.round(880 + Math.random() * 110),
      flavorQuote: isThorWinner
        ? 'Mjolnir shattered the Latverian energy grid in a flurry of lightning! Certified Worthy.'
        : 'Doctor Doom subordinated the thunder surge under unyielding titanium order. All hail Doom.',
      cardNumber: `#${cardNum} / 100`,
      edition: 'BATTLE ARENA FOIL',
      biometrics: {
        pulse: Math.round(isThorWinner ? 68 + Math.random() * 4 : 82 + Math.random() * 8),
        breathing: Math.round(isThorWinner ? 12 : 18),
        rmssd: Math.round(isThorWinner ? 55 : 32),
        stressIndex: Math.round(isThorWinner ? 75 : 135),
        calmScore: isThorWinner ? 78 : 35,
        equilibrium: isThorWinner ? 'Asgardian Duelist' : 'Latverian Champion',
        expressions: { combat: 95, resolve: 90, calm: isThorWinner ? 75 : 30 }
      }
    };

    deckVault.saveCard(winnerProfile);

    setTimeout(() => {
      this.hide();
      if (this.onGameComplete) {
        this.onGameComplete(winnerProfile);
      }
    }, 1400);
  }
}

export const clashMinigame = new ClashMinigame();
