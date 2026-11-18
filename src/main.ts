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
import { multiverseNexusPod } from './nexus-pod';
import { goldenRatioAnalyzer } from './golden-ratio';
import { presageDiagnostics } from './presage-diagnostics';
import { clashMinigame } from './clash-minigame';

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
  btnOpenDiagnostics: $('btn-open-diagnostics'),

  // Phase Panels
  phase1: $('phase-1'),
  phase2Camera: $('phase-2-camera'),
  phase2Inquiry: $('phase-2-inquiry'),
  phase3: $('phase-3'),

  // Phase 1 Single Hero Card & Gate
  singleHeroCard: $('single-hero-card'),
  heroCardEmblem: $('hero-card-emblem'),
  heroCardBurst: $('hero-card-burst'),
  heroCardTitle: $('hero-card-title'),
  heroCardDesc: $('hero-card-desc'),
  heroCardStatsRow: $('hero-card-stats-row'),
  btnToggleHeroFaction: $('btn-toggle-hero-faction'),
  btnLaunchClashGame: $('btn-launch-clash-game'),
  choiceCameraIcon: $('choice-camera-icon'),
  choiceInquiryIcon: $('choice-inquiry-icon'),
  btnStartCameraFlow: $('btn-start-camera-flow'),
  btnStartInquiryFlow: $('btn-start-inquiry-flow'),
  phase1NexusMount: $('phase1-nexus-mount'),

  // Live Bridge / Engine Indicator
  bridgeStatusPill: $('bridge-status-pill'),
  bridgeDot: $('bridge-dot'),
  bridgeStatusLabel: $('bridge-status-label'),

  // Marvel Intro Loader
  marvelIntroLoader: $('marvel-intro-loader'),
  btnSkipMarvel: $('btn-skip-marvel'),

  // Consent Modal
  modalConsent: $('modal-consent'),
  btnCloseConsent: $('btn-close-consent'),
  btnDeclineConsent: $('btn-decline-consent'),
  btnAcceptConsent: $('btn-accept-consent'),

  // Phase 2A Camera HUD & Lens System
  hudCrosshairIcon: $('hud-crosshair-icon'),
  cameraPreview: $('camera-preview') as HTMLVideoElement,
  faceMeshCanvas: $('face-mesh-canvas') as HTMLCanvasElement,
  cardiacWaveCanvas: $('cardiac-wave-canvas') as HTMLCanvasElement,
  hudGuidanceBanner: $('hud-guidance-banner'),
  countdownTimer: $('countdown-timer'),
  hudPulseVal: $('hud-pulse-val'),
  hudBreathVal: $('hud-breath-val'),
  hudCalmVal: $('hud-calm-val'),
  hudExprVal: $('hud-expr-val'),
  btnCancelTrial: $('btn-cancel-trial'),
  lensBtnStorm: $('lens-btn-storm'),
  lensBtnAstral: $('lens-btn-astral'),
  lensBtnDoom: $('lens-btn-doom'),
  oscPulseDot: $('osc-pulse-dot'),
  oscPulseBpm: $('osc-pulse-bpm'),
  reticleOval: $('reticle-oval'),

  // Phase 2B Inquiry
  inquiryStepIndicator: $('inquiry-step-indicator'),
  inquiryPrompt: $('inquiry-prompt'),
  inquiryOptionsContainer: $('inquiry-options-container'),

  // Phase 3 Verdict & Card
  verdictTagPill: $('verdict-tag-pill'),
  verdictTeamName: $('verdict-team-name'),
  verdictSubtext: $('verdict-subtext'),
  cardWrapInteractive: $('card-wrap-interactive'),
  cardGlare: $('card-glare'),
  cardCanvasMount: $('card-canvas-mount'),
  btnTabDossier: $('btn-tab-dossier'),
  btnTabHeatmap: $('btn-tab-heatmap'),
  btnTabGolden: $('btn-tab-golden'),
  heatmapMount: $('heatmap-mount'),
  statDossierMount: $('stat-dossier-mount'),
  goldenRatioMount: $('golden-ratio-mount'),
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
let activeCameraLens: 'storm' | 'astral' | 'doom' = 'storm';
const cardiacBuffer: number[] = new Array(100).fill(0);

// Inquiry Quiz State (Three Balanced Archetypes: 0=Thor, 1=Doom, 2=Strange)
interface QuizQuestion {
  prompt: string;
  options: { label: string; score: number }[];
}

const INQUIRY_QUESTIONS: QuizQuestion[] = [
  {
    prompt: 'A cosmic fracture splits the horizon. How do you respond?',
    options: [
      { label: 'Raise Mjolnir, brace your boots, and charge headfirst into the storm!', score: 0 },
      { label: 'Calculate the fracture vector and subordinate the energy under Latverian will.', score: 1 },
      { label: 'Weave a Kamar-Taj sling-ring mandala and bend the rift into the mirror dimension.', score: 2 }
    ]
  },
  {
    prompt: 'A battle descends into utter chaos. What is your decisive instinct?',
    options: [
      { label: 'Rally the vanguard with an unyielding Asgardian war cry!', score: 0 },
      { label: 'Impose cold order through tactical surveillance and ruthless counter-strikes.', score: 1 },
      { label: 'Consult the Eye of Agamotto to view 14 million outcomes and strike the true path.', score: 2 }
    ]
  },
  {
    prompt: 'What fuels your greatest triumphs?',
    options: [
      { label: 'Unshakable physical endurance, heart, and steady rhythmic breath.', score: 0 },
      { label: 'Supreme analytical foresight, calculated leverage, and sovereign discipline.', score: 1 },
      { label: 'Mastery over sacred geometry, dimensional equilibrium, and cosmic calm.', score: 2 }
    ]
  },
  {
    prompt: 'You stand before the Sanctum of Legends. Which relic calls to your soul?',
    options: [
      { label: 'The War Hammer Mjolnir, humming with stellar lightning.', score: 0 },
      { label: 'The Titanium Iron Mask, radiating unbending authority.', score: 1 },
      { label: 'The Eye of Agamotto Amulet, glowing with the emerald Time Stone.', score: 2 }
    ]
  }
];

let currentInquiryIndex = 0;
const inquiryAnswers: number[] = [];

// Initialize Icons
function mountIcons() {
  if (elements.navHammer) elements.navHammer.innerHTML = icons.hammer;
  if (elements.navMask) elements.navMask.innerHTML = icons.mask;
  if (elements.soundIcon) elements.soundIcon.innerHTML = icons.soundOn;
  if (elements.vaultIcon) elements.vaultIcon.innerHTML = icons.deck;

  if (elements.heroCardEmblem) elements.heroCardEmblem.innerHTML = icons.hammer;
  if (elements.choiceCameraIcon) elements.choiceCameraIcon.innerHTML = icons.camera;
  if (elements.choiceInquiryIcon) elements.choiceInquiryIcon.innerHTML = icons.inquiry;
  if (elements.hudCrosshairIcon) elements.hudCrosshairIcon.innerHTML = icons.crosshair;

  if (elements.btnDownloadIcon) elements.btnDownloadIcon.innerHTML = icons.download;
  if (elements.btnShareIcon) elements.btnShareIcon.innerHTML = icons.shareX;
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
  elements.btnStartCameraFlow?.addEventListener('click', () => {
    sound.playClick();
    activeTrialMode = 'worthiness';
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

function setupLensSwitcher() {
  const lensBtns = [
    { el: elements.lensBtnStorm, mode: 'storm' as const },
    { el: elements.lensBtnAstral, mode: 'astral' as const },
    { el: elements.lensBtnDoom, mode: 'doom' as const }
  ];

  lensBtns.forEach(({ el, mode }) => {
    if (!el) return;
    el.addEventListener('click', () => {
      sound.playClick();
      lensBtns.forEach(({ el: b }) => b?.classList.remove('active'));
      el.classList.add('active');
      activeCameraLens = mode;

      if (elements.reticleOval) {
        elements.reticleOval.style.borderColor = mode === 'storm'
          ? '#00E5FF'
          : mode === 'astral'
            ? '#FFAB00'
            : '#00E676';
        elements.reticleOval.style.boxShadow = mode === 'storm'
          ? '0 0 18px rgba(0, 229, 255, 0.4)'
          : mode === 'astral'
            ? '0 0 18px rgba(255, 171, 0, 0.4)'
            : '0 0 18px rgba(0, 230, 118, 0.4)';
      }
    });
  });
}

function drawCardiacOscilloscope(waveformY: number, pulseBpm: number) {
  const canvas = elements.cardiacWaveCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
    canvas.width = canvas.clientWidth || 440;
    canvas.height = canvas.clientHeight || 48;
  }

  cardiacBuffer.push(waveformY);
  if (cardiacBuffer.length > 100) cardiacBuffer.shift();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;
  const midY = h / 2;

  // Grid midline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(w, midY);
  ctx.stroke();

  const waveColor = activeCameraLens === 'storm'
    ? '#00E5FF'
    : activeCameraLens === 'astral'
      ? '#FFAB00'
      : '#00E676';

  ctx.strokeStyle = waveColor;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = waveColor;
  ctx.shadowBlur = 6;

  ctx.beginPath();
  const step = w / (cardiacBuffer.length - 1);
  for (let i = 0; i < cardiacBuffer.length; i++) {
    const x = i * step;
    const y = midY - (cardiacBuffer[i] * 3.2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Pulse dot flash
  if (elements.oscPulseDot) {
    if (waveformY > 2.0) {
      elements.oscPulseDot.style.transform = 'scale(1.4)';
      elements.oscPulseDot.style.background = '#00E676';
    } else {
      elements.oscPulseDot.style.transform = 'scale(1)';
      elements.oscPulseDot.style.background = '#FF5252';
    }
  }

  if (elements.oscPulseBpm) {
    elements.oscPulseBpm.textContent = `${pulseBpm} BPM`;
  }
}

function drawFaceMesh(landmarks: { x: number; y: number }[] | null | undefined, _calmScore?: number) {
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

  if (activeCameraLens === 'astral') {
    // ASTRAL TAO LENS: Kamar-Taj Sling-Ring Tao Mandalas & Third Eye
    const foreheadX = (landmarks[0]?.x ?? 0.5) * w;
    const foreheadY = ((landmarks[0]?.y ?? 0.35) - 0.08) * h;

    const now = performance.now() * 0.002;
    ctx.save();
    ctx.translate(foreheadX, foreheadY);
    ctx.rotate(now);
    ctx.strokeStyle = '#FFAB00';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#FF9100';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();

    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30);
      ctx.lineTo(Math.cos(a) * 42, Math.sin(a) * 42);
      ctx.stroke();
    }
    ctx.fillStyle = '#00E676';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(255, 171, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < landmarks.length; i++) {
      const px = landmarks[i].x * w;
      const py = landmarks[i].y * h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#FFD54F';
    for (let i = 0; i < landmarks.length; i++) {
      const px = landmarks[i].x * w;
      const py = landmarks[i].y * h;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (activeCameraLens === 'doom') {
    // DOOMSCAN LENS: Latverian Tactical Titanium Green Wireframe
    ctx.strokeStyle = '#00E676';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00E676';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    for (let i = 0; i < landmarks.length; i++) {
      const px = landmarks[i].x * w;
      const py = landmarks[i].y * h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ECEFF1';
    for (let i = 0; i < landmarks.length; i++) {
      const px = landmarks[i].x * w;
      const py = landmarks[i].y * h;
      ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
    }

    if (landmarks.length > 5) {
      const cx = landmarks[5].x * w;
      const cy = landmarks[5].y * h;
      ctx.strokeStyle = 'rgba(0, 230, 118, 0.7)';
      ctx.strokeRect(cx - 15, cy - 15, 30, 30);
    }

  } else {
    // STORMCADENCE LENS: Asgardian Electric Cyan Lightning Arcs
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    for (let i = 0; i < landmarks.length; i++) {
      const px = landmarks[i].x * w;
      const py = landmarks[i].y * h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFCC00';
    for (let i = 0; i < landmarks.length; i++) {
      const px = landmarks[i].x * w;
      const py = landmarks[i].y * h;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

async function startCameraTrial() {
  showPhase('phase-2-camera');
  sound.playClick();
  setupLensSwitcher();

  elements.countdownTimer.textContent = '30';
  elements.hudPulseVal.innerHTML = '-- <span style="font-size: 16px;">BPM</span>';
  elements.hudBreathVal.innerHTML = '-- <span style="font-size: 16px;">/MIN</span>';
  elements.hudCalmVal.textContent = 'STABILIZING';
  elements.hudExprVal.textContent = 'CALIBRATING';
  elements.hudGuidanceBanner.textContent = 'CALIBRATING OPTICAL CADENCE...';

  // If entering from Strange Reading button, auto-activate astral lens
  if (activeTrialMode === 'strange') {
    elements.lensBtnAstral?.click();
  }

  let lastVitals: UnifiedVitals = {
    source: 'browser-camera',
    elapsed: 0,
    remaining: 30,
    pulseBpm: 72,
    breathingRate: 14,
    calmScore: 50
  };

  bridge.onGuidance = (text: string) => {
    elements.hudGuidanceBanner.textContent = text;
  };

  bridge.onUpdate = (v: UnifiedVitals) => {
    lastVitals = v;
    elements.countdownTimer.textContent = String(v.remaining);
    elements.hudPulseVal.innerHTML = `${v.pulseBpm} <span style="font-size: 16px;">BPM</span>`;
    elements.hudBreathVal.innerHTML = `${v.breathingRate} <span style="font-size: 16px;">/MIN</span>`;

    // Dynamic Autonomic Tone Display
    if (activeCameraLens === 'astral' || activeTrialMode === 'strange') {
      elements.hudCalmVal.textContent = 'ASTRAL RESONANCE';
    } else if (v.calmScore >= 52) {
      elements.hudCalmVal.textContent = 'ASGARDIAN CALM';
    } else {
      elements.hudCalmVal.textContent = 'LATVERIAN FOCUS';
    }

    elements.hudExprVal.textContent = (v.primaryExpression || 'RESOLUTE').toUpperCase();

    // Dynamic Comic Narrator Voice
    if (v.remaining > 27) {
      elements.hudGuidanceBanner.textContent = 'CALIBRATING OPTICAL CADENCE...';
    } else if (activeCameraLens === 'astral') {
      elements.hudGuidanceBanner.textContent = 'THE EYE OF AGAMOTTO PIERCES THE ASTRAL VEIL';
    } else if (v.calmScore >= 52) {
      elements.hudGuidanceBanner.textContent = 'ASGARDIAN RESILIENT EQUILIBRIUM: WORTHY';
    } else {
      elements.hudGuidanceBanner.textContent = 'LATVERIAN TACTICAL SCRUTINY: ACUTE FOCUS';
    }

    // Render live face mesh overlay & cardiac oscilloscope
    drawFaceMesh(v.landmarks, v.calmScore);
    drawCardiacOscilloscope(v.waveformY || 0, v.pulseBpm);
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
    const badgeText = opt.score === 0 ? 'H' : opt.score === 1 ? 'M' : 'S';
    const badgeBg = opt.score === 0 ? 'var(--thor-gold)' : opt.score === 1 ? 'var(--doom-emerald)' : '#FFAB00';
    btn.innerHTML = `
      <span style="display: inline-block; width: 28px; height: 28px; border: 2.5px solid var(--ink); border-radius: 6px; background: ${badgeBg}; text-align: center; line-height: 24px; font-family: 'Bangers'; color: #111116; flex-shrink: 0;">
        ${badgeText}
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
    elements.verdictTagPill.textContent = '★ 100% CERTIFIED WORTHY ★';
    elements.verdictTagPill.style.color = '#FFCC00';
    elements.verdictTeamName.textContent = 'THE HAMMER CALLS YOU: YOU ARE WORTHY!';
    elements.verdictTeamName.className = 'verdict-title thor-theme';
    elements.verdictSubtext.textContent = `WHOSOEVER HOLDS THIS HAMMER SHALL POSSESS THE POWER // ${profile.archetype.toUpperCase()}`;
  } else if (isDoom) {
    sound.playDoomClank();
    elements.verdictTagPill.textContent = '★ AUTHORIZED BY DOOM ★';
    elements.verdictTagPill.style.color = '#00E676';
    elements.verdictTeamName.textContent = 'THE MASK CLAIMS YOU: HELL ANSWERS TO YOU!';
    elements.verdictTeamName.className = 'verdict-title doom-theme';
    elements.verdictSubtext.textContent = `HELL ANSWERS TO YOUR UNYIELDING COMMAND // ${profile.archetype.toUpperCase()}`;
  } else {
    sound.playFanfare();
    elements.verdictTagPill.textContent = '★ ASTRAL MIRROR DECREE ★';
    elements.verdictTagPill.style.color = '#FF9800';
    elements.verdictTeamName.textContent = 'THE ASTRAL MIRROR HAS DECREED!';
    elements.verdictTeamName.className = 'verdict-title strange-theme';
    elements.verdictSubtext.textContent = `ASTRAL NATURE UNLOCKED ACROSS DIMENSIONS // ${profile.archetype.toUpperCase()}`;
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

  // Render views for the right column
  statDashboard.render(profile, elements.statDossierMount);
  faceReadingHeatMap.render(profile, elements.heatmapMount);
  goldenRatioAnalyzer.render(profile, elements.goldenRatioMount);

  // Set default active tab
  if (profile.team === 'strange') {
    switchPhase3Tab('heatmap');
  } else {
    switchPhase3Tab('dossier');
  }

  // Setup interactive 3D tilt and battle cry on card
  setupInteractiveCardTilt(profile);
}

function switchPhase3Tab(tab: 'dossier' | 'heatmap' | 'golden') {
  elements.btnTabDossier.classList.toggle('active', tab === 'dossier');
  elements.btnTabHeatmap.classList.toggle('active', tab === 'heatmap');
  elements.btnTabGolden.classList.toggle('active', tab === 'golden');

  elements.statDossierMount.style.display = tab === 'dossier' ? 'block' : 'none';
  elements.heatmapMount.style.display = tab === 'heatmap' ? 'block' : 'none';
  elements.goldenRatioMount.style.display = tab === 'golden' ? 'block' : 'none';
}

function setupInteractiveCardTilt(profile: CardProfile) {
  const wrap = elements.cardWrapInteractive;
  const glare = elements.cardGlare;
  if (!wrap) return;

  const canvas = wrap.querySelector('.card-canvas-display') as HTMLElement;
  if (canvas) {
    if (profile.team === 'thor') {
      canvas.style.outline = '3px solid #FFCC00';
      canvas.style.boxShadow = '0 0 35px rgba(0, 229, 255, 0.45), 8px 12px 0 #111116';
    } else if (profile.team === 'doom') {
      canvas.style.outline = '3px solid #00E676';
      canvas.style.boxShadow = '0 0 35px rgba(0, 230, 118, 0.45), 8px 12px 0 #111116';
    } else {
      canvas.style.outline = '3px solid #FF9800';
      canvas.style.boxShadow = '0 0 35px rgba(255, 152, 0, 0.45), 8px 12px 0 #111116';
    }
  }

  wrap.onmousemove = (e: MouseEvent) => {
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -14;
    const rotY = ((x - cx) / cx) * 14;

    const canvas = wrap.querySelector('.card-canvas-display') as HTMLElement;
    if (canvas) {
      canvas.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.03)`;
    }

    if (glare) {
      const px = ((x / rect.width) * 100).toFixed(1);
      const py = ((y / rect.height) * 100).toFixed(1);
      glare.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 204, 0, 0.25) 35%, rgba(0, 229, 255, 0.18) 65%, transparent 85%)`;
    }
  };

  wrap.onmouseleave = () => {
    const canvas = wrap.querySelector('.card-canvas-display') as HTMLElement;
    if (canvas) {
      canvas.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    }
  };

  wrap.onclick = () => {
    if (profile.team === 'thor') {
      sound.playThunder();
    } else if (profile.team === 'doom') {
      sound.playDoomClank();
    } else {
      sound.playFanfare();
    }
  };
}

// Actions Toolbar
function initCardActions() {
  elements.btnTabDossier.addEventListener('click', () => {
    sound.playClick();
    switchPhase3Tab('dossier');
  });

  elements.btnTabHeatmap.addEventListener('click', () => {
    sound.playClick();
    switchPhase3Tab('heatmap');
  });

  elements.btnTabGolden.addEventListener('click', () => {
    sound.playClick();
    switchPhase3Tab('golden');
  });

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
      <div style="text-align: center; padding: 40px 20px; color: #111116; font-weight: 700;">
        <p style="font-family: 'Bangers'; font-size: 20px;">NO CARDS IN VAULT YET</p>
        <p style="font-size: 13px;">Complete a trial to mint your first collectible card.</p>
      </div>
    `;
    return;
  }

  cards.forEach((card) => {
    const isThor = card.team === 'thor';
    const isDoom = card.team === 'doom';
    const emblemBg = isThor ? 'var(--thor-gold)' : isDoom ? 'var(--doom-emerald)' : '#FFAB00';
    const emblemIcon = isThor ? icons.hammer : isDoom ? icons.mask : icons.vishanti;

    const item = document.createElement('div');
    item.className = 'vault-item';
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="display: inline-block; width: 34px; height: 34px; border: 2px solid var(--ink); border-radius: 6px; background: ${emblemBg}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${emblemIcon}
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

// Single Dynamic Hero Card & Arcade Interactions
function initSingleHeroCard() {
  let currentHeroFaction: 'thor' | 'doom' = 'thor';

  const updateCardUi = () => {
    if (!elements.singleHeroCard) return;
    if (currentHeroFaction === 'thor') {
      elements.singleHeroCard.className = 'single-hero-card thor-mode';
      if (elements.heroCardEmblem) elements.heroCardEmblem.innerHTML = icons.hammer;
      if (elements.heroCardBurst) elements.heroCardBurst.textContent = 'WORTHY';
      if (elements.heroCardTitle) elements.heroCardTitle.textContent = 'TEAM THOR // THE WAR HAMMER';
      if (elements.heroCardDesc) {
        elements.heroCardDesc.textContent = 'High parasympathetic tone, resilient heart rate equilibrium, and deep diaphragmatic breath draft you into the Asgardian Vanguard.';
      }
      if (elements.heroCardStatsRow) {
        elements.heroCardStatsRow.innerHTML = `
          <div class="hero-stat-pill"><span>AGI</span> <strong>92</strong></div>
          <div class="hero-stat-pill"><span>END</span> <strong>95</strong></div>
          <div class="hero-stat-pill"><span>FOC</span> <strong>88</strong></div>
          <div class="hero-stat-pill"><span>WIL</span> <strong>94</strong></div>
          <div class="hero-stat-pill power-pill"><span>PWR</span> <strong>940</strong></div>
        `;
      }
    } else {
      elements.singleHeroCard.className = 'single-hero-card doom-mode';
      if (elements.heroCardEmblem) elements.heroCardEmblem.innerHTML = icons.mask;
      if (elements.heroCardBurst) elements.heroCardBurst.textContent = 'SUBMIT';
      if (elements.heroCardTitle) elements.heroCardTitle.textContent = 'TEAM DOOM // THE TITANIUM MASK';
      if (elements.heroCardDesc) {
        elements.heroCardDesc.textContent = 'Acute sympathetic focus, elevated tactical alertness, and unwavering calculated willpower draft you to Doctor Doom.';
      }
      if (elements.heroCardStatsRow) {
        elements.heroCardStatsRow.innerHTML = `
          <div class="hero-stat-pill"><span>AGI</span> <strong>86</strong></div>
          <div class="hero-stat-pill"><span>END</span> <strong>89</strong></div>
          <div class="hero-stat-pill"><span>FOC</span> <strong>98</strong></div>
          <div class="hero-stat-pill"><span>WIL</span> <strong>99</strong></div>
          <div class="hero-stat-pill power-pill"><span>PWR</span> <strong>955</strong></div>
        `;
      }
    }
  };

  updateCardUi();

  const toggleFaction = () => {
    sound.playClick();
    currentHeroFaction = currentHeroFaction === 'thor' ? 'doom' : 'thor';
    updateCardUi();
    if (currentHeroFaction === 'thor') sound.playThunder();
    else sound.playDoomClank();
  };

  elements.btnToggleHeroFaction?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFaction();
  });

  elements.singleHeroCard?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('button')) return;
    toggleFaction();
  });

  // Launch Clash Minigame
  elements.btnLaunchClashGame?.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playClick();
    clashMinigame.show();
  });

  clashMinigame.onGameComplete = (winnerProfile) => {
    revealVerdict(winnerProfile);
  };

  // Live Presage API Diagnostics
  elements.btnOpenDiagnostics?.addEventListener('click', () => {
    sound.playClick();
    presageDiagnostics.show();
  });
}

// Live Bridge Status Indicator
function initBridgeStatus() {
  const updateUi = (info: { connected: boolean; hasApiKey: boolean; sdkAvailable: boolean; mode: string }) => {
    if (elements.bridgeDot && elements.bridgeStatusLabel) {
      if (info.connected && info.sdkAvailable) {
        elements.bridgeDot.className = 'bridge-dot online';
        elements.bridgeStatusLabel.textContent = 'PRESAGE C-API: ACTIVE';
      } else if (info.connected) {
        elements.bridgeDot.className = 'bridge-dot online';
        elements.bridgeStatusLabel.textContent = 'BRIDGE: CONNECTED';
      } else {
        elements.bridgeDot.className = 'bridge-dot local';
        elements.bridgeStatusLabel.textContent = 'BROWSER OPTICAL: READY';
      }
    }
  };

  bridge.onConnectionChange = updateUi;
  updateUi(bridge.currentStatus);
}

// App Initialization
function bootstrap() {
  mountIcons();
  initBridgeStatus();
  initMarvelIntroLoader();
  initSingleHeroCard();
  initSoundControls();
  initCameraFlow();
  initInquiryFlow();
  initCardActions();
  initVaultModal();
  updateVaultBadge();

  // Initialize Compact Floating Multiverse Nexus Pod (Docked on Right)
  multiverseNexusPod.init();
}

window.addEventListener('DOMContentLoaded', bootstrap);
