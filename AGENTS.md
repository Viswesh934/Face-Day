# Face Day — Project Rules & Design System

## Core Directive
Face Day is a fast-paced, edge-powered comic book trading card battleground where real physiological signals or tactile face assessments draft players into **Team Thor (The Hammer)** or **Team Doom (The Mask)**.

---

## 1. Visual Theme & Art Direction
- **Comic & TCG Aesthetic:** 
  - Thick inked outlines (2px–4px solid `#111116`), bold high-contrast panels, Ben-Day halftone dots, parchment/newsprint undertones (`#FBF8EE`), action burst banners.
  - Video game & physical TCG card anatomy: outer card border, collector numbering (`#001/050`), rarity tag (`COMMON`, `RARE`, `ULTRA-RARE`, `LEGENDARY FOIL`), holographic foil shimmer CSS, card title bar, illustrated archetype frame, numeric stat boxes (Agility, Endurance, Focus, Willpower), power rating badge, and comic flavor quote.
- **Team Emblems & Identity:**
  - **Team Thor:** The Asgardian War Hammer (Mjolnir). Colors: Celestial Gold (`#FFCC00`), Lightning Azure (`#00E5FF`), Midnight Navy (`#0E1726`).
  - **Team Doom:** The Latverian Iron Mask. Colors: Emerald Green (`#00C853`), Cold Titanium Steel (`#D4D8DD`), Dark Graphite (`#1A211E`).
- **Strict Prohibition on Emojis:**
  - DO NOT spam emojis in the UI (`⚡`, `🔥`, `👁️`, `👑`, `🎮`, etc.).
  - Use custom inline SVG emblems (hammer vector, mask vector, shield vector, crosshair vector, starbursts) and bold comic typography.

---

## 2. Copywriting & Tone (No Vibe Coding, No Prompt Bleeding)
- **Zero Prompt Bleeding:**
  - The game interface must NEVER display AI prompt jargon or internal SDK technical names (e.g. DO NOT put "Live Biometric Scan powered by Presage SmartSpectra SDK" or "Autonomic nervous system classifier" on game buttons).
  - In-game language must feel tactile, physical, and comic-native:
    - Camera Path: **"The Trial of Worthiness"** (sub: *Hold your gaze upon the mirror. 30 seconds to reveal your nature.*)
    - Bypass Path: **"The Overseer's Inquiry"** (sub: *Four tactical questions. Instant assignment.*)
  - All developer-facing documentation (Presage SmartSpectra, rPPG, edge architecture) belongs exclusively in `docs/` and repository README.
- **Tone:** Sharp, punchy, vintage comic editorial voice (reminiscent of 1980s Marvel bullpen / arcade fighting game announcer).

---

## 3. Architecture & Privacy Invariance
- **Zero Server Retention:** 100% client-side execution. No database, no backend logging, no telemetry transmission.
- **Storage:** Local-only (`localStorage`) for the user's personal Trading Card Deck.
- **Presage SmartSpectra Integration:**
  - Handled via dedicated local bridge / Node FFI runner (`local-runner/bridge.mjs`) and client-side rPPG/face mesh parser.
  - Preserves API credits by enforcing an exact 30-second measurement cycle with auto-stop.

---

## 4. Git Commit Discipline
- Work will be developed and committed phase-by-phase with clear, structured commit messages:
  - Phase 1: Scaffolding, Design System & Architecture Docs
  - Phase 2: Game Engine, Consent Gate, The Two Trials (Camera & Inquiry)
  - Phase 3: The Sorting Engine, Trading Card Canvas Generator, Card Deck Vault
  - Phase 4: Polish, Sound FX & Cloudflare Wrangler Deployment Configuration
