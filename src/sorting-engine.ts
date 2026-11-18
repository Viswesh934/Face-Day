// src/sorting-engine.ts
// Algorithmic sorting for Face Day: Determines Team Thor (Hammer) vs Team Doom (Mask)

export type Team = 'thor' | 'doom';
export type Rarity = 'RARE' | 'ULTRA-RARE' | 'LEGENDARY FOIL';

export interface VitalsInput {
  pulseRate?: number | null;
  rmssd?: number | null;
  breathingRate?: number | null;
  stressIndex?: number | null;
  calmScore?: number; // 0 to 100
}

export interface InquiryInput {
  q1: number; // 0 (calm) to 1 (tactical)
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
  biometricSummary: {
    pulse: number;
    breathing: number;
    equilibrium: string;
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

const THOR_QUOTES = [
  'Let the thunder shake the mountains—my spirit stands unbroken!',
  'True strength is not wrath; it is the calm eye within the tempest.',
  'By Odin’s beard, we charge toward the dawn without hesitation!',
  'The hammer answers only those whose hearts beat steady and true.'
];

const DOOM_QUOTES = [
  'Destiny does not favor the meek. It bends before absolute tactical will.',
  'Emotions are fractures in armor. Precision is victory.',
  'Doom bows to no storm. The elements themselves shall submit.',
  'Where others see chaos, Doom enforces eternal iron order.'
];

export function sortFromVitals(v: VitalsInput): CardProfile {
  const pulse = v.pulseRate || 72;
  const rmssd = v.rmssd || 40;
  const breathing = v.breathingRate || 14;
  const stress = v.stressIndex || 100;

  // Calm Index calculation:
  // Steady pulse (55-75), high HRV (>40ms), rhythmic breathing (10-15) -> Asgardian Calm (Thor)
  // Elevated pulse (>80), lower HRV (<35ms), tactical breathing or high stress index -> Tactical Intensity (Doom)
  let thorScore = 0;
  let doomScore = 0;

  if (rmssd >= 42) thorScore += 35;
  else doomScore += 35;

  if (pulse >= 55 && pulse <= 76) thorScore += 25;
  else doomScore += 25;

  if (breathing >= 10 && breathing <= 16) thorScore += 20;
  else doomScore += 20;

  if (stress < 110) thorScore += 20;
  else doomScore += 20;

  const isThor = thorScore >= doomScore;
  const team: Team = isThor ? 'thor' : 'doom';

  // Rarity calculation based on extreme balance
  let rarity: Rarity = 'RARE';
  const delta = Math.abs(thorScore - doomScore);
  if (delta >= 60) {
    rarity = 'LEGENDARY FOIL';
  } else if (delta >= 30) {
    rarity = 'ULTRA-RARE';
  }

  // RPG Stat calculations (1-100 scale)
  const agility = isThor
    ? Math.min(99, Math.round(75 + (rmssd / 90) * 24))
    : Math.min(99, Math.round(60 + (pulse / 120) * 25));

  const endurance = isThor
    ? Math.min(99, Math.round(80 + (16 - Math.abs(breathing - 13)) * 1.3))
    : Math.min(99, Math.round(65 + (stress / 200) * 20));

  const focus = isThor
    ? Math.min(99, Math.round(60 + (rmssd / 80) * 25))
    : Math.min(99, Math.round(82 + (stress / 180) * 17));

  const willpower = isThor
    ? Math.min(99, Math.round(78 + (thorScore / 100) * 20))
    : Math.min(99, Math.round(85 + (doomScore / 100) * 14));

  const powerRating = Math.round(agility * 2.2 + endurance * 2.6 + focus * 2.4 + willpower * 2.8);

  const titles = isThor ? THOR_TITLES : DOOM_TITLES;
  const quotes = isThor ? THOR_QUOTES : DOOM_QUOTES;
  const archetype = titles[Math.floor(Math.random() * titles.length)];
  const flavorQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const cardNum = String(Math.floor(Math.random() * 899) + 101).padStart(3, '0');

  return {
    id: `fd-${Date.now()}-${cardNum}`,
    timestamp: Date.now(),
    team,
    teamName: isThor ? 'TEAM THOR' : 'TEAM DOOM',
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
    edition: '1ST EDITION - SERIES 1',
    biometricSummary: {
      pulse: Math.round(pulse),
      breathing: Math.round(breathing),
      equilibrium: isThor ? 'Asgardian Resolute' : 'Latverian Tactical'
    }
  };
}

export function sortFromInquiry(answers: InquiryInput): CardProfile {
  const sum = answers.q1 + answers.q2 + answers.q3 + answers.q4; // 0 to 4
  const isThor = sum < 2.5;

  const pseudoVitals: VitalsInput = isThor
    ? {
        pulseRate: 68 + Math.round(Math.random() * 8),
        rmssd: 52 + Math.round(Math.random() * 18),
        breathingRate: 13 + Math.round(Math.random() * 3),
        stressIndex: 75 + Math.round(Math.random() * 25)
      }
    : {
        pulseRate: 84 + Math.round(Math.random() * 12),
        rmssd: 31 + Math.round(Math.random() * 8),
        breathingRate: 19 + Math.round(Math.random() * 4),
        stressIndex: 145 + Math.round(Math.random() * 40)
      };

  return sortFromVitals(pseudoVitals);
}
