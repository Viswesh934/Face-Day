// src/sorting-engine.ts
// Algorithmic sorting for Face Day: Determines Team Thor (Hammer), Team Doom (Mask), or Doctor Strange (Astral Sorcery)

export type Team = 'thor' | 'doom' | 'strange';
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
    agility: number;    // AGI for Thor/Doom | AST (Astral Energy) for Strange
    endurance: number;  // END for Thor/Doom | MYS (Mystic Sorcery) for Strange
    focus: number;      // FOC for Thor/Doom | GEO (Sacred Geometry) for Strange
    willpower: number;  // WIL for Thor/Doom | CHR (Chrono Stability) for Strange
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

const STRANGE_TITLES = [
  'Master of the Mystic Arts',
  'Sorcerer of the Astral Mirror',
  'Keeper of the Time Stone',
  'Guardian of the Sanctorum',
  'Architect of the Multiverse',
  'Wielder of the Vishanti'
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

const STRANGE_QUOTES = [
  'The Eye of Agamotto unmasks the dimensional veil. You master the arcane geometry of time and space.',
  'Dormammu, I’ve come to bargain! Your astral cadence resonates with infinite timelines and cosmic calm.',
  'We never lose our demons, mortal—we only learn to live above them through mystic discipline.',
  'The mirror dimension bends to your breath. Ancient Kamar-Taj sorcery flows through your pulse.',
  'Faith is my sword, truth my shield, and knowledge my armor. The Vishanti approve your dimensional composure.'
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
    let strangePoints = 0;

    // 1. Pulse Rate Dynamics (Median resting human baseline = 72 BPM)
    // Elevated pulse = sympathetic tactical alertness (DOOM)
    // Low/steady pulse = parasympathetic athletic composure (THOR)
    if (pulse >= 75) {
      doomPoints += 32;
    } else if (pulse <= 68) {
      thorPoints += 32;
    } else {
      // 69-74 BPM: Mid-band
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
    if (rmssd >= 48 && stress <= 88) {
      thorPoints += 24; // High parasympathetic resilience
    } else if (rmssd <= 38 || stress >= 105) {
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

    // Check for rare natural draft into Strange (Astral Transcendence)
    if (calm >= 80 && breathing <= 12 && Math.abs(pulse - 70) <= 3) {
      strangePoints += 45;
    }

    if (strangePoints > thorPoints && strangePoints > doomPoints) {
      team = 'strange';
    } else if (doomPoints > thorPoints) {
      team = 'doom';
    } else if (thorPoints > doomPoints) {
      team = 'thor';
    } else {
      team = expressionTension > 50 ? 'doom' : 'thor';
    }
  }

  let rarity: Rarity = 'RARE';
  if (calm >= 80 || stress > 150 || rmssd > 55 || team === 'strange') {
    rarity = 'LEGENDARY FOIL';
  } else if (calm >= 65 || stress > 120 || rmssd > 45) {
    rarity = 'ULTRA-RARE';
  }

  // Stats tailored by archetype
  const agility = team === 'thor'
    ? Math.min(99, Math.round(75 + (rmssd / 90) * 24))
    : team === 'doom'
      ? Math.min(99, Math.round(62 + (pulse / 120) * 25))
      : Math.min(99, Math.round(82 + (calm / 100) * 16)); // AST (Astral Energy)

  const endurance = team === 'thor'
    ? Math.min(99, Math.round(82 + (16 - Math.abs(breathing - 13)) * 1.2))
    : team === 'doom'
      ? Math.min(99, Math.round(68 + (stress / 200) * 22))
      : Math.min(99, Math.round(88 + (rmssd / 80) * 11)); // MYS (Mystic Sorcery)

  const focus = team === 'thor'
    ? Math.min(99, Math.round(65 + (rmssd / 80) * 22))
    : team === 'doom'
      ? Math.min(99, Math.round(86 + (stress / 180) * 13))
      : Math.min(99, Math.round(92 + (calm / 100) * 7));  // GEO (Sacred Geometry)

  const willpower = team === 'thor'
    ? Math.min(99, Math.round(78 + (calm / 100) * 20))
    : team === 'doom'
      ? Math.min(99, Math.round(88 + ((100 - calm) / 100) * 11))
      : Math.min(99, Math.round(94 + (calm / 100) * 5));  // CHR (Chrono Stability)

  const powerRating = team === 'strange'
    ? Math.round(agility * 2.3 + endurance * 2.5 + focus * 2.7 + willpower * 2.9)
    : Math.round(agility * 2.2 + endurance * 2.6 + focus * 2.4 + willpower * 2.8);

  const titles = team === 'thor' ? THOR_TITLES : team === 'doom' ? DOOM_TITLES : STRANGE_TITLES;
  const quotes = team === 'thor' ? THOR_QUOTES : team === 'doom' ? DOOM_QUOTES : STRANGE_QUOTES;
  const archetype = titles[Math.floor(Math.random() * titles.length)];
  const flavorQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const cardNum = String(Math.floor(Math.random() * 899) + 101).padStart(3, '0');

  let teamName = 'TEAM THOR';
  let equilibrium = 'Asgardian Resolute';
  if (team === 'doom') {
    teamName = 'TEAM DOOM';
    equilibrium = 'Latverian Tactical';
  } else if (team === 'strange') {
    teamName = 'STRANGE TALES';
    equilibrium = calm >= 60 ? 'Astral Serene Calm' : 'Arcane Mystic Focus';
  }

  return {
    id: `fd-${Date.now()}-${cardNum}`,
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
  let strangeVotes = 0;

  for (const c of choices) {
    if (c === 0) thorVotes++;
    else if (c === 1) doomVotes++;
    else if (c === 2) strangeVotes++;
  }

  let selectedTeam: Team = 'thor';
  if (strangeVotes >= 2) {
    selectedTeam = 'strange';
  } else if (doomVotes > thorVotes) {
    selectedTeam = 'doom';
  } else if (thorVotes > doomVotes) {
    selectedTeam = 'thor';
  } else {
    // Tie-breaker
    selectedTeam = choices[3] === 1 ? 'doom' : choices[3] === 2 ? 'strange' : 'thor';
  }

  const pseudoVitals: VitalsInput = selectedTeam === 'thor'
    ? {
        pulseRate: 66 + Math.round(Math.random() * 6),
        rmssd: 54 + Math.round(Math.random() * 16),
        breathingRate: 12 + Math.round(Math.random() * 2),
        stressIndex: 72 + Math.round(Math.random() * 20),
        calmScore: 78
      }
    : selectedTeam === 'doom'
      ? {
          pulseRate: 82 + Math.round(Math.random() * 10),
          rmssd: 32 + Math.round(Math.random() * 8),
          breathingRate: 18 + Math.round(Math.random() * 3),
          stressIndex: 140 + Math.round(Math.random() * 35),
          calmScore: 32
        }
      : {
          pulseRate: 70 + Math.round(Math.random() * 4),
          rmssd: 62 + Math.round(Math.random() * 14),
          breathingRate: 11 + Math.round(Math.random() * 2),
          stressIndex: 65 + Math.round(Math.random() * 15),
          calmScore: 88
        };

  return sortFromVitals(pseudoVitals, selectedTeam);
}

export function sortStrangeReading(v: VitalsInput): CardProfile {
  return sortFromVitals(v, 'strange');
}
