// src/sorting-engine.ts
// Algorithmic sorting for Face Day: Determines Team Thor (Hammer) or Team Doom (Mask)
// Pure vintage comic duel, zero prompt bleeding, balanced autonomic thresholds

export type Team = 'thor' | 'doom';
export type Rarity = 'RARE' | 'ULTRA-RARE' | 'LEGENDARY FOIL';

export interface VitalsInput {
  pulseRate?: number | null;
  rmssd?: number | null;
  breathingRate?: number | null;
  stressIndex?: number | null;
  calmScore?: number;
  expressions?: Record<string, number> | null;
}

export interface InquiryInput {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

export interface CardProfile {
  id: string;
  timestamp: number;
  team: Team;
  teamName: string;
  archetype: string;
  rarity: Rarity;
  stats: {
    agility: number;    // AGI
    endurance: number;  // END
    focus: number;      // FOC
    willpower: number;  // WIL
  };
  powerRating: number;
  flavorQuote: string;
  cardNumber: string;
  edition: string;
  biometrics: {
    pulse: number;
    breathing: number;
    rmssd: number;
    stressIndex: number;
    calmScore: number;
    equilibrium: string;
    expressions: Record<string, number>;
  };
}

const THOR_TITLES = [
  'Storm Vanguard',
  'Thunder Berserker',
  'Wielder of Mjolnir',
  'Asgardian Shieldmaster',
  'Lord of the Sky-Forge',
  'Vanguard of Valhalla'
];

const DOOM_TITLES = [
  'Latverian Overseer',
  'Titanium Sovereign',
  'Architect of Order',
  'Steely Inquisitor',
  'Master of Iron Will',
  'The Latverian Strategist'
];

// Witty, iconic comic quotes (Zero prompt bleeding!)
const THOR_QUOTES = [
  'The hammer calls you—and you are worthy! Whosoever holds this hammer shall possess the power of Thor.',
  '100% Certified Worthy! The hammer calls you, Mjolnir ignites the storm, but Odin is definitely concerned about your sleep schedule.',
  'The Asgardian war hammer answers your resolute pulse. You are worthy to lead the charge across the Bifrost.',
  'Stamina so absurdly high, you could sprint across the Bifrost just because you left your phone charger on Midgard.',
  'Heart rate so calm, Thor legitimately thought you were taking a power nap during the final battle of Ragnarok.'
];

const DOOM_QUOTES = [
  'The titanium mask claims you—and hell itself answers to your command! Bow before the supreme sovereign of Latveria.',
  'Hell answers to you! Doctor Doom approves your cold, calculating pulse. You are now officially authorized to conquer your inbox.',
  'With this level of tactical tension, even the underworld obeys your calculation. Still spent twenty minutes looking for your sunglasses.',
  'Stress index off the charts! Doom is prescribing three cups of soothing Latverian chamomile tea immediately.',
  'You don’t just fight battles—you micromanage your enemies and the laws of physics into submission.'
];

export function sortFromVitals(v: VitalsInput, forcedTeam?: Team): CardProfile {
  const pulse = Math.round(v.pulseRate || 72);
  const rmssd = Math.round(v.rmssd || 42);
  const breathing = Math.round(v.breathingRate || 14);
  const stress = Math.round(v.stressIndex || 95);

  // Normalized calmScore centered at 50 for 72 BPM
  const calm = v.calmScore !== undefined
    ? Math.max(10, Math.min(95, Math.round(v.calmScore)))
    : Math.max(10, Math.min(95, Math.round(50 - (pulse - 72) * 2.2)));

  const exprs: Record<string, number> = v.expressions || {
    neutral: 70,
    calm: calm,
    focus: 100 - calm
  };

  let team: Team;
  if (forcedTeam) {
    team = forcedTeam;
  } else {
    let thorPoints = 0;
    let doomPoints = 0;

    // 1. Pulse Rate Dynamics (Median resting baseline = 72 BPM)
    // Elevated pulse = sympathetic tactical alertness (DOOM)
    // Low/steady pulse = parasympathetic athletic composure (THOR)
    if (pulse >= 74) {
      doomPoints += 32;
    } else if (pulse <= 69) {
      thorPoints += 32;
    } else {
      // 70-73 BPM: Mid-band
      thorPoints += 16;
      doomPoints += 16;
    }

    // 2. Respiration Cadence (Normal = 12-16 / min)
    if (breathing >= 16) {
      doomPoints += 26; // Rapid tactical calculation
    } else if (breathing <= 13) {
      thorPoints += 26; // Deep diaphragmatic calm
    } else {
      thorPoints += 13;
      doomPoints += 13;
    }

    // 3. Heart Rate Variability (RMSSD) & Autonomic Stress
    if (rmssd >= 46 && stress <= 88) {
      thorPoints += 24; // High parasympathetic resilience
    } else if (rmssd <= 38 || stress >= 96) {
      doomPoints += 24; // High tactical vigilance & focus
    } else {
      thorPoints += 12;
      doomPoints += 12;
    }

    // 4. Facial Expression & Gaze Composure
    const expressionTension = exprs.focus || (100 - calm);
    if (expressionTension >= 52) {
      doomPoints += 18; // Focused brow furrow, analytical scrutiny
    } else {
      thorPoints += 18; // Resolute composure, relaxed jaw
    }

    if (doomPoints > thorPoints) {
      team = 'doom';
    } else if (thorPoints > doomPoints) {
      team = 'thor';
    } else {
      team = expressionTension > 50 ? 'doom' : 'thor';
    }
  }

  let rarity: Rarity = 'RARE';
  if (calm >= 80 || stress > 140 || rmssd > 55) {
    rarity = 'LEGENDARY FOIL';
  } else if (calm >= 65 || stress > 115 || rmssd > 45) {
    rarity = 'ULTRA-RARE';
  }

  // Stats tailored by archetype
  const agility = team === 'thor'
    ? Math.min(99, Math.round(75 + (rmssd / 90) * 24))
    : Math.min(99, Math.round(62 + (pulse / 120) * 25));

  const endurance = team === 'thor'
    ? Math.min(99, Math.round(82 + (16 - Math.abs(breathing - 13)) * 1.2))
    : Math.min(99, Math.round(70 + (calm / 100) * 20));

  const focus = team === 'thor'
    ? Math.min(99, Math.round(68 + (calm / 100) * 25))
    : Math.min(99, Math.round(84 + ((100 - calm) / 100) * 15));

  const willpower = team === 'thor'
    ? Math.min(99, Math.round(80 + (calm / 100) * 18))
    : Math.min(99, Math.round(86 + (stress / 200) * 13));

  const powerRating = Math.round((agility + endurance + focus + willpower) * 2.45);

  const teamName = team === 'thor' ? 'TEAM THOR // THE WAR HAMMER' : 'TEAM DOOM // THE TITANIUM MASK';
  const titlePool = team === 'thor' ? THOR_TITLES : DOOM_TITLES;
  const quotePool = team === 'thor' ? THOR_QUOTES : DOOM_QUOTES;

  const archetype = titlePool[Math.floor(Math.random() * titlePool.length)];
  const flavorQuote = quotePool[Math.floor(Math.random() * quotePool.length)];

  const cardNum = Math.floor(Math.random() * 89 + 10).toString().padStart(3, '0');

  let equilibrium = 'Equilibrium Stable';
  if (team === 'thor') {
    equilibrium = calm >= 65 ? 'Resolute High Calm' : 'Vanguard Endurance';
  } else {
    equilibrium = stress >= 110 ? 'Ruthless Tactical Hyper-Focus' : 'Calculating Strategic Mind';
  }

  return {
    id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    team,
    teamName,
    archetype,
    rarity,
    stats: {
      agility,
      endurance,
      focus,
      willpower
    },
    powerRating,
    flavorQuote,
    cardNumber: `#${cardNum} / 100`,
    edition: '1ST EDITION - COMICS GROUP',
    biometrics: {
      pulse,
      breathing,
      rmssd,
      stressIndex: stress,
      calmScore: calm,
      equilibrium,
      expressions: exprs
    }
  };
}

export function sortFromInquiry(answers: InquiryInput): CardProfile {
  const choices = [answers.q1, answers.q2, answers.q3, answers.q4];
  let thorVotes = 0;
  let doomVotes = 0;

  for (const c of choices) {
    if (c === 0) thorVotes++;
    else doomVotes++;
  }

  let selectedTeam: Team = 'thor';
  if (doomVotes > thorVotes) {
    selectedTeam = 'doom';
  } else if (thorVotes > doomVotes) {
    selectedTeam = 'thor';
  } else {
    // Tie-breaker: question 4 choice
    selectedTeam = choices[3] === 1 ? 'doom' : 'thor';
  }

  const pseudoVitals: VitalsInput = selectedTeam === 'thor'
    ? {
        pulseRate: 66 + Math.round(Math.random() * 6),
        rmssd: 54 + Math.round(Math.random() * 16),
        breathingRate: 12 + Math.round(Math.random() * 2),
        stressIndex: 72 + Math.round(Math.random() * 20),
        calmScore: 78
      }
    : {
        pulseRate: 82 + Math.round(Math.random() * 10),
        rmssd: 32 + Math.round(Math.random() * 8),
        breathingRate: 18 + Math.round(Math.random() * 3),
        stressIndex: 140 + Math.round(Math.random() * 35),
        calmScore: 32
      };

  return sortFromVitals(pseudoVitals, selectedTeam);
}
