---
name: comic-card-game
description: Design system and implementation rules for Face Day — retro comic styling, physical TCG card rendering, Hammer vs Mask themes, zero prompt bleeding, and no emoji spam.
---

# Comic Card Game Skill

## Core Principles

1. **Card Game Tactility:**
   - Cards must look and feel like physical collectible trading cards (Pokémon / Magic / Marvel OverPower / Marvel Snap).
   - Essential card layers:
     - Rounded outer border with bleed trim
     - Header banner with Card Name & Cost/Tier
     - Hero / Archetype character portrait illustration window
     - Foil sheen / holographic reflection effect
     - Stat grid: 4 core attributes (AGI, END, FOC, WIL) with comic bar meters
     - Flavor text quote in italicized speech bubble
     - Card footer: Set number (e.g. `SERIES 01 // 2026`), edition badge, and rarity star stamp

2. **Team Emblems:**
   - Team Thor: **The Hammer** (`#FFCC00`, `#00E5FF`, `#0E1726`)
   - Team Doom: **The Mask** (`#00C853`, `#D4D8DD`, `#1A211E`)
   - All emblems must be rendered as SVGs or canvas vector paths — never raw unicode emojis.

3. **No Prompt Bleeding / Natural Game UI:**
   - Keep user-facing copy strictly in-character.
   - Prohibited in UI: "Presage SmartSpectra SDK", "Live Biometric Scan", "Autonomic Nervous System", "AI Classifier".
   - Approved in UI: "The Trial of Worthiness", "The Overseer's Inquiry", "Face The Mirror", "The Decree".

4. **Zero Emoji Spam:**
   - Use comic badges, halftone patterns, stars, crosshairs, and SVG icons.

5. **Audio & Animation:**
   - Procedural Web Audio API sound effects: thunder crack for Hammer, metallic hum/servo clank for Mask.
   - Screen shake and comic burst transitions on card reveal.
