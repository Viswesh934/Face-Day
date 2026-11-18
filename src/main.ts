// src/main.ts
// Face Day — Main Application Orchestrator

import confetti from 'canvas-confetti';
import { icons } from './icons';
import { sound } from './sound-engine';
import { BiometricBridge, UnifiedVitals } from './biometric-bridge';
import { sortFromVitals, sortFromInquiry, sortStrangeReading, CardProfile } from './sorting-engine';
import { cardRenderer } from './card-canvas';
import { deckVault } from './card-deck';
import { statDashboard } from './stat-dashboard';
import { faceReadingHeatMap } from './heat-map';

// DOM Element References
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const elements = {
  // Navigation
  navHammer: $('nav-hammer-icon'),
  navMask: $('nav-mask-icon'),
  soundIcon: $('sound-icon'),
  vaultIcon: $('vault-icon'),
  btnSound: $('btn-sound'),
  btnOpenVault: $('btn-open-vault'),
  vaultCountBadge: $('vault-count-badge'),

  // Phase Panels
  phase1: $('phase-1'),
  phase2Camera: $('phase-2-camera'),
  phase2Inquiry: $('phase-2-inquiry'),
  phase3: $('phase-3'),

  // Phase 1 Heroes & Gate
  heroThorIcon: $('hero-thor-icon'),
  heroDoomIcon: $('hero-doom-icon'),
  duelThorCard: $('duel-thor-card'),
  duelDoomCard: $('duel-doom-card'),
  duelVsBurst: $('duel-vs-burst'),
  choiceCameraIcon: $('choice-camera-icon'),
  choiceStrangeIcon: $('choice-strange-icon'),
  choiceInquiryIcon: $('choice-inquiry-icon'),
  btnStartCameraFlow: $('btn-start-camera-flow'),
  btnStartStrangeFlow: $('btn-start-strange-flow'),
  btnStartInquiryFlow: $('btn-start-inquiry-flow'),

  // Marvel Intro Loader
  marvelIntroLoader: $('marvel-intro-loader'),
  btnSkipMarvel: $('btn-skip-marvel'),

  // Consent Modal
  modalConsent: $('modal-consent'),
  btnCloseConsent: $('btn-close-consent'),
  btnDeclineConsent: $('btn-decline-consent'),
  btnAcceptConsent: $('btn-accept-consent'),

  // Phase 2A Camera HUD
  hudCrosshairIcon: $('hud-crosshair-icon'),
  cameraPreview: $('camera-preview') as HTMLVideoElement,
  faceMeshCanvas: $('face-mesh-canvas') as HTMLCanvasElement,
  hudGuidanceBanner: $('hud-guidance-banner'),
  countdownTimer: $('countdown-timer'),
  hudPulseVal: $('hud-pulse-val'),
  hudBreathVal: $('hud-breath-val'),
  hudCalmVal: $('hud-calm-val'),
  hudExprVal: $('hud-expr-val'),
  btnCancelTrial: $('btn-cancel-trial'),

  // Phase 2B Inquiry
  inquiryStepIndicator: $('inquiry-step-indicator'),
  inquiryPrompt: $('inquiry-prompt'),
  inquiryOptionsContainer: $('inquiry-options-container'),

  // Phase 3 Verdict & Card
  verdictTeamName: $('verdict-team-name'),
  verdictSubtext: $('verdict-subtext'),
  cardCanvasMount: $('card-canvas-mount'),
  heatmapMount: $('heatmap-mount'),
  statDossierMount: $('stat-dossier-mount'),
  btnDownloadCard: $('btn-download-card'),
  btnDownloadIcon: $('btn-download-icon'),
  btnShareX: $('btn-share-x'),
  btnShareIcon: $('btn-share-icon'),
  btnPlayAgain: $('btn-play-again'),

  // Vault Drawer Modal
  modalVault: $('modal-vault'),
  btnCloseVault: $('btn-close-vault'),
  vaultDeckContainer: $('vault-deck-container'),
  vaultStatThor: $('vault-stat-thor'),
  vaultStatDoom: $('vault-stat-doom'),
  vaultStatMax: $('vault-stat-max')
};

// Global App State
const bridge = new BiometricBridge();
let currentProfile: CardProfile | null = null;
let activeTrialMode: 'worthiness' | 'strange' = 'worthiness';

// Inquiry Quiz State
interface QuizQuestion {
  prompt: string;
  options: { label: string; score: number }[];
}

const INQUIRY_QUESTIONS: QuizQuestion[] = [
  {
    prompt: 'A crack of lightning splits the horizon. How do you respond?',
    options: [
      { label: 'Raise your shield and charge directly into the tempest.', score: 0 },
      { label: 'Calculate the lightning coordinates and channel the surge.', score: 1 }
    ]
  },
  {
    prompt: 'A battle descends into utter chaos. What is your core instinct?',
    options: [
      { label: 'Rally the vanguard with an unyielding battle cry!', score: 0 },
      { label: 'Impose immediate order through calculated iron discipline.', score: 1 }
    ]
  },
  {
    prompt: 'What fuels your greatest victories?',
    options: [
      { label: 'Unshakable stamina, heart, and steady composure.', score: 0 },
      { label: 'Supreme intellect, ruthless preparation, and iron willpower.', score: 1 }
    ]
  },
  {
    prompt: 'You stand before the forge of legends. Which relic calls to you?',
    options: [
      { label: 'The enchanted War Hammer forged in the heart of a dying star.', score: 0 },
      { label: 'The titanium Iron Mask imbued with sovereign mastery.', score: 1 }
    ]
  }
];

let currentInquiryIndex = 0;
const inquiryAnswers: number[] = [];

// Initialize Icons
function mountIcons() {
  elements.navHammer.innerHTML = icons.hammer;
  elements.navMask.innerHTML = icons.mask;
  elements.soundIcon.innerHTML = icons.soundOn;
  elements.vaultIcon.innerHTML = icons.deck;

  elements.heroThorIcon.innerHTML = icons.hammer;
  elements.heroDoomIcon.innerHTML = icons.mask;
  elements.choiceCameraIcon.innerHTML = icons.camera;
  elements.choiceStrangeIcon.innerHTML = icons.strange;
  elements.choiceInquiryIcon.innerHTML = icons.inquiry;
  elements.hudCrosshairIcon.innerHTML = icons.crosshair;

  elements.btnDownloadIcon.innerHTML = icons.download;
  elements.btnShareIcon.innerHTML = icons.shareX;
}

// Navigation & Phase Transitions
function showPhase(phase: 'phase-1' | 'phase-2-camera' | 'phase-2-inquiry' | 'phase-3') {
  elements.phase1.classList.remove('active');
  elements.phase2Camera.classList.remove('active');
  elements.phase2Inquiry.classList.remove('active');
  elements.phase3.classList.remove('active');

  if (phase === 'phase-1') elements.phase1.classList.add('active');
  if (phase === 'phase-2-camera') elements.phase2Camera.classList.add('active');
  if (phase === 'phase-2-inquiry') elements.phase2Inquiry.classList.add('active');
  if (phase === 'phase-3') elements.phase3.classList.add('active');
}

// Sound Management
function initSoundControls() {
  elements.btnSound.addEventListener('click', () => {
    const muted = sound.toggleMute();
    elements.soundIcon.innerHTML = muted ? icons.soundOff : icons.soundOn;
    if (!muted) sound.playClick();
  });
}

// Camera Flow & Privacy Consent Gate
function initCameraFlow() {
  elements.btnStartCameraFlow.addEventListener('click', () => {
    sound.playClick();
    activeTrialMode = 'worthiness';
    elements.modalConsent.style.display = 'flex';
  });

  elements.btnStartStrangeFlow.addEventListener('click', () => {
    sound.playClick();
    activeTrialMode = 'strange';
    elements.modalConsent.style.display = 'flex';
  });

  const closeConsent = () => {
    sound.playClick();
    elements.modalConsent.style.display = 'none';
  };

  elements.btnCloseConsent.addEventListener('click', closeConsent);
  elements.btnDeclineConsent.addEventListener('click', closeConsent);

  elements.btnAcceptConsent.addEventListener('click', async () => {
    sound.playClick();
    elements.modalConsent.style.display = 'none';
    startCameraTrial();
  });

  elements.btnCancelTrial.addEventListener('click', () => {
    sound.playClick();
    bridge.stopTrial();
    showPhase('phase-1');
  });
}

function drawFaceMesh(landmarks: { x: number; y: number }[] | null | undefined, calmScore: number) {
  const canvas = elements.faceMeshCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Sync canvas size
  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
    canvas.width = canvas.clientWidth || 640;
    canvas.height = canvas.clientHeight || 480;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks || landmarks.length === 0) return;

  const w = canvas.width;
  const h = canvas.height;
  const isThor = calmScore >= 55;
  const strokeColor = isThor ? '#00E5FF' : '#00E676';
  const nodeColor = isThor ? '#FFCC00' : '#ECEFF1';

  // Draw wireframe connecting lines
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = 8;

  ctx.beginPath();
  for (let i = 0; i < landmarks.length; i++) {
    const px = landmarks[i].x * w;
    const py = landmarks[i].y * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Draw nodes
  ctx.shadowBlur = 0;
  ctx.fillStyle = nodeColor;
  for (let i = 0; i < landmarks.length; i++) {
    const px = landmarks[i].x * w;
    const py = landmarks[i].y * h;
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

async function startCameraTrial() {
  showPhase('phase-2-camera');
  sound.playClick();

  elements.countdownTimer.textContent = '30';
  elements.hudPulseVal.innerHTML = '-- <span style="font-size: 16px;">BPM</span>';
  elements.hudBreathVal.innerHTML = '-- <span style="font-size: 16px;">/MIN</span>';
  elements.hudCalmVal.textContent = 'STABILIZING';
  elements.hudExprVal.textContent = 'CALIBRATING';
  elements.hudGuidanceBanner.textContent = 'CALIBRATING OPTICAL CADENCE...';

  let lastVitals: UnifiedVitals = {
    source: 'browser-camera',
    elapsed: 0,
    remaining: 30,
    pulseBpm: 72,
    breathingRate: 14,
    calmScore: 60
  };

  bridge.onGuidance = (text: string) => {
    elements.hudGuidanceBanner.textContent = text;
  };

  bridge.onUpdate = (v: UnifiedVitals) => {
    lastVitals = v;
    elements.countdownTimer.textContent = String(v.remaining);
    elements.hudPulseVal.innerHTML = `${v.pulseBpm} <span style="font-size: 16px;">BPM</span>`;
    elements.hudBreathVal.innerHTML = `${v.breathingRate} <span style="font-size: 16px;">/MIN</span>`;
    elements.hudCalmVal.textContent = v.calmScore >= 55 ? 'ASGARDIAN CALM' : 'LATVERIAN FOCUS';
    elements.hudExprVal.textContent = (v.primaryExpression || 'RESOLUTE').toUpperCase();

    if (v.guidanceText) {
      elements.hudGuidanceBanner.textContent = v.guidanceText;
    }

    // Render live face mesh overlay
    drawFaceMesh(v.landmarks, v.calmScore);
  };

  bridge.onComplete = (finalV: UnifiedVitals) => {
    bridge.stopTrial();
    const vitalsToUse = finalV || lastVitals;
    const profile = activeTrialMode === 'strange'
      ? sortStrangeReading({
          pulseRate: vitalsToUse.pulseBpm,
          breathingRate: vitalsToUse.breathingRate,
          rmssd: vitalsToUse.rmssd,
          stressIndex: vitalsToUse.stressIndex,
          calmScore: vitalsToUse.calmScore,
          expressions: vitalsToUse.expressions
        })
      : sortFromVitals({
          pulseRate: vitalsToUse.pulseBpm,
          breathingRate: vitalsToUse.breathingRate,
          rmssd: vitalsToUse.rmssd,
          stressIndex: vitalsToUse.stressIndex,
          calmScore: vitalsToUse.calmScore,
          expressions: vitalsToUse.expressions
        });
    revealVerdict(profile);
  };

  bridge.onError = (err) => {
    console.warn('[Face Day] Camera trial error:', err);
    alert('Camera could not be accessed. Switching to the Overseer’s Inquiry.');
    startInquiryFlow();
  };

  await bridge.startTrial(elements.cameraPreview);
}

// Inquiry Quiz (Bypass Mode) Flow
function initInquiryFlow() {
  elements.btnStartInquiryFlow.addEventListener('click', () => {
    sound.playClick();
    startInquiryFlow();
  });
}

function startInquiryFlow() {
  currentInquiryIndex = 0;
  inquiryAnswers.length = 0;
  showPhase('phase-2-inquiry');
  renderInquiryQuestion();
}

function renderInquiryQuestion() {
  const q = INQUIRY_QUESTIONS[currentInquiryIndex];
  elements.inquiryStepIndicator.textContent = `QUESTION ${currentInquiryIndex + 1} OF ${INQUIRY_QUESTIONS.length}`;
  elements.inquiryPrompt.textContent = q.prompt;
  elements.inquiryOptionsContainer.innerHTML = '';

  q.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'inquiry-opt-btn';
    btn.innerHTML = `
      <span style="display: inline-block; width: 28px; height: 28px; border: 2.5px solid var(--ink); border-radius: 6px; background: #fff; text-align: center; line-height: 24px; font-family: 'Bangers';">
        ${opt.score === 0 ? 'H' : 'M'}
      </span>
      <span>${opt.label}</span>
    `;

    btn.addEventListener('click', () => {
      sound.playClick();
      inquiryAnswers.push(opt.score);
      currentInquiryIndex++;
      if (currentInquiryIndex < INQUIRY_QUESTIONS.length) {
        renderInquiryQuestion();
      } else {
        const profile = sortFromInquiry({
          q1: inquiryAnswers[0],
          q2: inquiryAnswers[1],
          q3: inquiryAnswers[2],
          q4: inquiryAnswers[3]
        });
        revealVerdict(profile);
      }
    });

    elements.inquiryOptionsContainer.appendChild(btn);
  });
}

// Phase 3 Verdict & Card Reveal
function revealVerdict(profile: CardProfile) {
  currentProfile = profile;
  deckVault.saveCard(profile);
  updateVaultBadge();

  showPhase('phase-3');

  // Trigger Team Audio & Banner
  const isThor = profile.team === 'thor';
  const isDoom = profile.team === 'doom';

  if (isThor) {
    sound.playThunder();
    elements.verdictTeamName.textContent = 'THE HAMMER HAS CHOSEN!';
    elements.verdictTeamName.style.textShadow = '3px 3px 0 var(--thor-gold)';
    elements.verdictSubtext.textContent = `DRAFTED INTO TEAM THOR AS "${profile.archetype.toUpperCase()}"`;
  } else if (isDoom) {
    sound.playDoomClank();
    elements.verdictTeamName.textContent = 'DOOM DEMANDS YOUR ALLEGIANCE!';
    elements.verdictTeamName.style.textShadow = '3px 3px 0 var(--doom-emerald)';
    elements.verdictSubtext.textContent = `DRAFTED INTO TEAM DOOM AS "${profile.archetype.toUpperCase()}"`;
  } else {
    sound.playFanfare();
    elements.verdictTeamName.textContent = 'THE ASTRAL MIRROR HAS DECREED!';
    elements.verdictTeamName.style.textShadow = '3px 3px 0 var(--strange-amber)';
    elements.verdictSubtext.textContent = `MINTED AS "${profile.archetype.toUpperCase()}"`;
  }

  // Sound fanfare and card whoosh
  setTimeout(() => {
    sound.playFanfare();
    sound.playCardWhoosh();
  }, 200);

  // Confetti burst
  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.6 },
    colors: isThor 
      ? ['#FFCC00', '#00E5FF', '#111116'] 
      : isDoom 
        ? ['#00C853', '#D4D8DD', '#111116'] 
        : ['#E65100', '#FFD54F', '#111116']
  });

  // Render Comic Book Cover Page to Canvas & Mount
  const canvas = cardRenderer.render(profile);
  canvas.className = 'card-canvas-display';
  elements.cardCanvasMount.innerHTML = '';
  elements.cardCanvasMount.appendChild(canvas);

  // Render Strange Reading Heat Map if Strange Reading mode
  if (profile.team === 'strange') {
    faceReadingHeatMap.render(profile, elements.heatmapMount);
    elements.heatmapMount.style.display = 'flex';
  } else {
    elements.heatmapMount.innerHTML = '';
    elements.heatmapMount.style.display = 'none';
  }

  // Render Biometric Stat Dashboard
  statDashboard.render(profile, elements.statDossierMount);
}

// Actions Toolbar
function initCardActions() {
  elements.btnDownloadCard.addEventListener('click', () => {
    sound.playClick();
    if (currentProfile) {
      cardRenderer.downloadCard(currentProfile);
    }
  });

  elements.btnShareX.addEventListener('click', () => {
    sound.playClick();
    if (currentProfile) {
      const url = cardRenderer.getShareToXUrl(currentProfile);
      window.open(url, '_blank');
    }
  });

  elements.btnPlayAgain.addEventListener('click', () => {
    sound.playClick();
    showPhase('phase-1');
  });
}

// Vault Drawer
function initVaultModal() {
  elements.btnOpenVault.addEventListener('click', () => {
    sound.playClick();
    renderVaultList();
    elements.modalVault.style.display = 'flex';
  });

  elements.btnCloseVault.addEventListener('click', () => {
    sound.playClick();
    elements.modalVault.style.display = 'none';
  });

  elements.modalVault.addEventListener('click', (e) => {
    if (e.target === elements.modalVault) {
      sound.playClick();
      elements.modalVault.style.display = 'none';
    }
  });
}

function updateVaultBadge() {
  const stats = deckVault.getStats();
  elements.vaultCountBadge.textContent = String(stats.total);
}

function renderVaultList() {
  const stats = deckVault.getStats();
  elements.vaultStatThor.textContent = String(stats.thorCount);
  elements.vaultStatDoom.textContent = String(stats.doomCount);
  elements.vaultStatMax.textContent = String(stats.maxPower);

  const cards = deckVault.getCards();
  elements.vaultDeckContainer.innerHTML = '';

  if (cards.length === 0) {
    elements.vaultDeckContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #777;">
        <p style="font-family: 'Bangers'; font-size: 20px;">NO CARDS IN VAULT YET</p>
        <p style="font-size: 13px;">Complete a trial to mint your first collectible card.</p>
      </div>
    `;
    return;
  }

  cards.forEach((card) => {
    const isThor = card.team === 'thor';
    const item = document.createElement('div');
    item.className = 'vault-item';
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="display: inline-block; width: 34px; height: 34px; border: 2px solid var(--ink); border-radius: 6px; background: ${isThor ? 'var(--thor-gold)' : 'var(--doom-emerald)'}; display: flex; align-items: center; justify-content: center;">
          ${isThor ? icons.hammer : icons.mask}
        </span>
        <div>
          <div class="vault-item-title">${card.archetype}</div>
          <div class="vault-item-meta">${card.cardNumber} &bull; PWR ${card.powerRating} &bull; ${card.rarity}</div>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="comic-btn comic-btn-sm btn-vault-inspect" style="padding: 4px 8px;">VIEW</button>
        <button class="comic-btn comic-btn-sm btn-vault-download" style="padding: 4px 8px;">PNG</button>
      </div>
    `;

    item.querySelector('.btn-vault-inspect')?.addEventListener('click', () => {
      sound.playClick();
      elements.modalVault.style.display = 'none';
      revealVerdict(card);
    });

    item.querySelector('.btn-vault-download')?.addEventListener('click', () => {
      sound.playClick();
      cardRenderer.downloadCard(card);
    });

    elements.vaultDeckContainer.appendChild(item);
  });
}

// Marvel Intro Loader
function initMarvelIntroLoader() {
  const loader = elements.marvelIntroLoader;
  if (!loader) return;

  // Sound: rapid page-turn flutter
  setTimeout(() => {
    sound.playPageFlutter();
  }, 200);

  const dismiss = () => {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  };

  elements.btnSkipMarvel?.addEventListener('click', () => {
    sound.playClick();
    dismiss();
  });

  // Auto-dismiss after 2.4s
  setTimeout(dismiss, 2400);
}

// Compact Duel Interactions
function initDuelInteractions() {
  elements.duelThorCard?.addEventListener('click', () => {
    sound.playThunder();
  });

  elements.duelDoomCard?.addEventListener('click', () => {
    sound.playDoomClank();
  });

  elements.duelVsBurst?.addEventListener('click', () => {
    sound.playClick();
  });
}

// App Initialization
function bootstrap() {
  mountIcons();
  initMarvelIntroLoader();
  initDuelInteractions();
  initSoundControls();
  initCameraFlow();
  initInquiryFlow();
  initCardActions();
  initVaultModal();
  updateVaultBadge();
}

window.addEventListener('DOMContentLoaded', bootstrap);
