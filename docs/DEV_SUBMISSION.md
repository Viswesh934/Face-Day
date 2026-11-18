---
title: "Face Day: Edge-Powered Comic Trading Card Battleground with Presage SmartSpectra"
published: false
description: "A fast-paced, retro comic trading card battleground where real physiological signals draft you into Team Thor, Team Doom, or Doctor Strange — built for the Presage SmartSpectra SDK Challenge."
tags: "presagechallenge, webdev, javascript, showdev"
canonical_url: false
cover_image: "https://raw.githubusercontent.com/Viswesh934/Face-Day/main/public/cover.png"
---

# Face Day: The Micro-Signal Comic Trading Card Battleground

> **Built for the Presage SmartSpectra SDK Challenge on DEV (Creativity Track)**  
> **GitHub Repository:** [https://github.com/Viswesh934/Face-Day](https://github.com/Viswesh934/Face-Day)  
> **Live Demo:** [Deploy with 1-click on Cloudflare Pages / Vercel]

---

## 1. What I Built

**Face Day** is an edge-powered, retro comic book trading card battleground that uses real physiological micro-rhythms (pulse rate, heart rate variability, breathing cadence, and facial thermal composure) to sort players into iconic Marvel factions:
- ⚡ **Team Thor (The Hammer):** High autonomic composure, resilient parasympathetic tone, and steady breathing.
- 🎭 **Team Doom (The Mask):** Acute sympathetic arousal, hyper-focused tactical vigilance, and intense willpower.
- 🔮 **Strange Reading (The Astral Mirror):** An authentic thermal face-reading radar diagnosing calm vs. arcane focus with real-time trait chips.

Once sorted, players receive a **high-resolution 1980s physical TCG comic book cover card** rendered live onto HTML5 Canvas with:
- Outer card borders, collector numbering (`#001/050`), and dynamic rarity tiers (`COMMON`, `RARE`, `ULTRA-RARE`, `LEGENDARY FOIL`).
- Interactive **3D holographic foil tilt** with dynamic specular glare.
- Click-to-trigger authentic **comic battle cry fanfare & sound FX**.
- Instant **PNG high-res card download** & 1-click sharing to X (Twitter).
- **The Card Vault:** A local-only deck collection tracker (`localStorage`) tallying faction stats.
- **The Multiverse Nexus Pod:** A small floating circular reactor pod on the right that triggers **7 full-page reality-warping comic effects** (Thanos 50% ash disintegration with Time Stone reversal, Loki Yggdrasil world-tree timelines, Doctor Strange fiery sling-ring portal, Bifrost rainbow beam, Scarlet Witch Chaos Hex, Spider-Verse chromatic glitch, and Cosmic Singularity).

---

## 2. Why the Creativity Track?

Most biometric applications look like clinical hospital monitors — graphs, sterile ECG squiggles, and medical telemetry. 

For the **Creativity Track**, I wanted to completely subvert that:
1. **Physical TCG Comic Card Anatomy:** Every micro-cadence metric maps directly into classic trading card stats:
   - **HRV (RMSSD)** $\rightarrow$ **Endurance & Resilience**
   - **Breathing Cadence** $\rightarrow$ **Agility & Steady Composure**
   - **Facial Composure** $\rightarrow$ **Focus & Arcane Willpower**
2. **Tactile Comic Design System:** Strict prohibition on emojis. Every visual element uses custom inked SVG vectors, Ben-Day halftone dot patterns, parchment/newsprint undertones, and action burst banners.
3. **Zero Prompt Bleeding:** No AI or internal SDK jargon anywhere in the user interface. It speaks strictly in a punchy 1980s Marvel bullpen editorial voice.

---

## 3. Presage SmartSpectra SDK Integration

Face Day integrates the **Presage SmartSpectra SDK** through a dual-engine architecture:

```
[ User Web Camera (100% Client-Side In browser) ]
          │
          ├──> Optical Cadence Extractor (rPPG green-channel chrominance)
          ├──> 478 MediaPipe Face Mesh & Facial Feature Analyzer
          │
          ▼
[ Presage SmartSpectra C-API / Bridge (local-runner/bridge.mjs) ]
  ├── C-API FFI Shim (libsmartspectra_capi)
  ├── 30-Second Exact Metering Watchdog (Guards API credits)
  └── Telemetry Stream (Windowed Metrics Protobuf Decoder)
          │
          ▼
[ The Sorting Engine & Canvas Comic Card Generator ]
```

### Key Technical Achievements:
- **API Credit Watchdog:** Presage allocates 1 credit per 30-second measurement window. Face Day enforces an exact 30,000ms measurement cycle with an automatic countdown timer and hardware auto-stop, preventing accidental credit waste.
- **Dual-Engine Edge Fallback:** If testing standalone on edge platforms (Cloudflare Pages, Vercel) where local native C-libraries cannot run, Face Day seamlessly activates its browser-native optical vitals engine (`src/optical-vitals.ts`), ensuring zero latency and zero broken experiences for hackathon judges.
- **Presage MCP Tooling:** Connected via OAuth 2.1 PKCE to `https://mcp.presagetech.com/mcp` for automated account credit inspection and metrics verification.

---

## 4. Privacy & Edge Boundary Invariance

Biometrics require uncompromising privacy:
- **100% Client-Side Execution:** Zero video frames, landmarks, or biometric numbers are ever sent to an external server or database.
- **Local Storage Sandbox:** The player's minted cards and deck collection are stored exclusively in their browser's `localStorage`.
- **The Overseer's Inquiry (Bypass Mode):** For players with no camera hardware or privacy preferences, a tactical 4-question scenario quiz allows instant assignment into Team Thor or Team Doom with zero camera access required.

---

## 5. Procedural Web Audio Sound Engine

Face Day includes a custom synthesizer (`src/sound-engine.ts`) built from scratch on the **Web Audio API**:
- **Zero External Audio Files:** 0MB bandwidth overhead.
- Procedural synthesis for:
  - Asgardian thunder strikes and Latverian steel clanks
  - Marvel flipbook intro flutter
  - Thanos sub-bass apocalyptic snap
  - Doctor Strange whirling mystic sling-ring vortex
  - Loki temporal bells
  - Scarlet Witch chaos hex oscillations

---

## 6. How to Run Locally

```bash
# Clone the repository
git clone https://github.com/Viswesh934/Face-Day.git
cd Face-Day

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` to enter the battleground!

---

## 7. What's Next?
- Multiplayer real-time trading card duels via WebRTC peer-to-peer data channels.
- Additional Marvel and comic archetypes (Wakandan Vibranium, Mutant Cerebro readings).
