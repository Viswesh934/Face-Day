// src/sorting-engine.ts
// Algorithmic sorting for Face Day: Determines Team Thor (Hammer), Team Doom (Mask), or Strange Reading (Astral Face Reading)

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

const STRANGE_TITLES = [
  'Sorcerer of the Astral Mirror',
  'Master of Serene Mysticism',
  'The Arcane Inquisitor',
  'Cosmic Guardian of Agamotto',
  'Keeper of the Mystic Cadence',
  'Architect of Dimensional Will'
];

// Witty, humorous comic quotes (Zero prompt bleeding!)
const THOR_QUOTES = [
  '100% Certified Worthy! Mjolnir approves your heart rate, but Odin is definitely concerned about your sleep schedule.',
  'Stamina so absurdly high, you could run across the Bifrost just because you left your phone charger on Midgard.',
  'Pulse steady enough to chug Asgardian mead in the middle of a lightning tempest without spilling a drop.',
  'Heart rate so calm, Thor legitimately thought you were taking a power nap during the final battle of Ragnarok.'
];

const DOOM_QUOTES = [
  'Doctor Doom approves your cold, calculating pulse. You are now officially authorized to conquer your inbox.',
  'Stress index off the charts! Doom is prescribing three cups of soothing Latverian chamomile tea immediately.',
  'With this level of tactical tension, you don’t just fight battles—you micromanage your enemies into submission.',
  'Calculated every single variable in the multiverse. Still spent twenty minutes looking for your sunglasses.'
];

const STRANGE_QUOTES = [
  'The Astral Mirror reveals: Your third eye is wide open, but your physical eyes are screaming for a cup of coffee.',
  'Face reading complete: 85% cosmic wisdom, 15% thinking intensely about what to eat for dinner.',
  'Your brow furrow suggests deep multidimensional meditation... or you just remembered you forgot to lock the front door.',
  'The Eye of Agamotto has gazed upon your cheeks. Verdict: Dangerously unbothered by the chaos of reality.'
];

export function sortFromVitals(v: VitalsInput, forcedTeam?: Team): CardProfile {
  const pulse = v.pulseRate || 72;
  const rmssd = v.rmssd || 42;
  const breathing = v.breathingRate || 14;
  const stress = v.stressIndex || 95;
  const calm = v.calmScore ?? Math.round(Math.min(95, Math.max(10, (rmssd / 65) * 100)));

  const exprs: Record<string, number> = v.expressions || {
    neutral: 70,
    calm: calm,
    focus: 100 - calm
  };

  let team: Team;
  if (forcedTeam) {
    team = forcedTeam;
  } else {
    let thorScore = 0;
    let doomScore = 0;

    if (rmssd >= 40) thorScore += 35;
    else doomScore += 35;

    if (pulse >= 55 && pulse <= 75) thorScore += 25;
    else doomScore += 25;

    if (breathing >= 10 && breathing <= 16) thorScore += 20;
    else doomScore += 20;

    if (stress < 105) thorScore += 20;
    else doomScore += 20;

    team = thorScore >= doomScore ? 'thor' : 'doom';
  }

  let rarity: Rarity = 'RARE';
  if (calm >= 80 || stress > 160 || rmssd > 55) {
    rarity = 'LEGENDARY FOIL';
  } else if (calm >= 65 || stress > 130 || rmssd > 45) {
    rarity = 'ULTRA-RARE';
  }

  const agility = team === 'thor'
    ? Math.min(99, Math.round(75 + (rmssd / 90) * 24))
    : team === 'doom'
      ? Math.min(99, Math.round(60 + (pulse / 120) * 25))
      : Math.min(99, Math.round(70 + (calm / 100) * 28));

  const endurance = team === 'thor'
    ? Math.min(99, Math.round(82 + (16 - Math.abs(breathing - 13)) * 1.2))
    : team === 'doom'
      ? Math.min(99, Math.round(65 + (stress / 200) * 22))
      : Math.min(99, Math.round(75 + (rmssd / 80) * 20));

  const focus = team === 'thor'
    ? Math.min(99, Math.round(65 + (rmssd / 80) * 22))
    : team === 'doom'
      ? Math.min(99, Math.round(84 + (stress / 180) * 15))
      : Math.min(99, Math.round(86 + (calm / 100) * 13));

  const willpower = team === 'thor'
    ? Math.min(99, Math.round(78 + (calm / 100) * 20))
    : team === 'doom'
      ? Math.min(99, Math.round(88 + ((100 - calm) / 100) * 11))
      : Math.min(99, Math.round(90 + (calm / 100) * 9));

  const powerRating = Math.round(agility * 2.2 + endurance * 2.6 + focus * 2.4 + willpower * 2.8);

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
      pulse: Math.round(pulse),
      breathing: Math.round(breathing),
      rmssd: Math.round(rmssd),
      stressIndex: Math.round(stress),
      calmScore: calm,
      equilibrium,
      expressions: exprs
    }
  };
}

export function sortFromInquiry(answers: InquiryInput): CardProfile {
  const sum = answers.q1 + answers.q2 + answers.q3 + answers.q4;
  const isThor = sum < 2.5;

  const pseudoVitals: VitalsInput = isThor
    ? {
        pulseRate: 68 + Math.round(Math.random() * 8),
        rmssd: 52 + Math.round(Math.random() * 18),
        breathingRate: 13 + Math.round(Math.random() * 3),
        stressIndex: 75 + Math.round(Math.random() * 25),
        calmScore: 78
      }
    : {
        pulseRate: 84 + Math.round(Math.random() * 12),
        rmssd: 31 + Math.round(Math.random() * 8),
        breathingRate: 19 + Math.round(Math.random() * 4),
        stressIndex: 145 + Math.round(Math.random() * 40),
        calmScore: 35
      };

  return sortFromVitals(pseudoVitals);
}

export function sortStrangeReading(v: VitalsInput): CardProfile {
  return sortFromVitals(v, 'strange');
}
