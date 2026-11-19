# ⚡ Face Day: The Biometric Battleground
> *"An edge-powered comic trading card battleground where real physiological micro-signals determine your allegiance to Team Thor (The Hammer) or Team Doom (The Mask)."*

Built for the **Presage SmartSpectra SDK Challenge on DEV Community (Creativity Track)**.

---

## 🎮 The Concept

Rather than displaying vital signs in clinical charts or diagnostic dashboards, **Face Day** transforms contactless human sensing into a tangible, collectible trading card game.

Players step before the interface and undergo sorting into one of two legendary comic factions:
* **Team Thor (The Asgardian Vanguard):** Driven by parasympathetic calm, resilient heart-rate variability (HRV), and deep rhythmic cadence. Represented by the **War Hammer (Mjolnir)**.
* **Team Doom (The Latverian Overseer):** Driven by tactical intensity, acute sympathetic focus, and iron willpower. Represented by the **Iron Mask**.

Every completed trial mints an authentic **RPG Collectible Trading Card** (complete with rarity tiers, foil sheen, custom vector artwork, numbered edition stamp, and attributes: *Agility, Endurance, Focus, Willpower*).

---

## 🕹️ Core Gameplay (The 3 Phases)

### Phase 1: The Choice & Consent Gate
* **Vintage Comic Cover:** Inked borders, halftone Ben-Day dots, split faction preview.
* **Explicit Consent Flow:** 100% client-side privacy disclosure informing users that video frames are processed locally in browser memory with zero network transmission.
* **Two Gameplay Paths:**
  1. **The Trial of Worthiness (Live Camera):** 30-second contactless physiological reading.
  2. **The Overseer's Inquiry (Bypass Mode):** 4-question interactive comic tactical scenario trial for zero-camera or restricted devices.

### Phase 2: The Chamber of Trials
* **Live Camera HUD:** Mirrored video feed with comic targeting reticle, real-time pulse cadence (BPM), respiratory rhythm (/min), and autonomic equilibrium status.
* **Overseer's Inquiry Matrix:** Dynamic tactical dilemmas diagnosing player disposition through action choices.

### Phase 3: The Decree & Collectible Card
* **Faction Decree:** Dramatic screen shake, procedural Web Audio fanfare (Thunder crash for Thor, Latverian metallic resonance for Doom), and confetti burst.
* **Trading Card Canvas:** High-resolution 750x1050 HTML5 2D Canvas rendering a physical card (Pokémon / Marvel Snap / OverPower style) with holographic foil effect on Ultra-Rare and Legendary tiers.
* **Actions:**
  * 1-Click **Download PNG** for your offline collection.
  * Direct **Post to X (Twitter)** intent.
  * **My Card Vault:** Stored locally in `localStorage` to view, inspect, and re-download past minted cards.

---

## 🔒 Privacy & Edge Architecture

* **100% Client-Side:** Deployed on **Cloudflare Edge** via Wrangler (`wrangler.jsonc`).
* **Zero Backend Storage:** No external databases, no analytics logging, and zero image/video data leaves the client device.
* **Local Storage Sandbox:** The user's deck is saved strictly in browser `localStorage`.
* **Zero Emoji Spam:** Strict visual design using custom inline vector SVGs (Hammer, Mask, Shield, Crosshairs, Stars) and bold comic typography (`Bangers`, `Comic Neue`, `Inter`).

---

## ⚡ Presage SmartSpectra Integration & 30s Credit Guard

Presage developer accounts allocate 1 credit per 30-second measurement. Face Day implements a strict **30-Second Credit Guard**:
1. At millisecond 30,000, the session automatically invokes `sdk.stop()`, consuming exactly 1 credit per live run.
2. Dual-mode engine architecture:
   * **Local Hardware Bridge (`local-runner/bridge.mjs`):** Connects to `@smartspectra/node-sdk` via native C-API FFI, decoding metrics (`cardio`, `breathing`, `face`) over local WebSocket (`ws://127.0.0.1:8765`).
   * **In-Browser Camera Scanner (`src/optical-vitals.ts`):** Native optical chrominance & respiratory tracking inside the browser canvas for direct edge testing.
   * **Overseer's Inquiry (Bypass Mode):** 100% camera-free evaluation.

---

## 🚀 Quickstart & Development

### 1. Prerequisites
* Node.js 20+ (Node 24 recommended)
* npm 10+

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Web App Locally
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Run the Presage SDK Dedicated Backend Locally
```bash
export SMARTSPECTRA_API_KEY="your-presage-api-key"
npm run backend
```
The backend starts on `ws://127.0.0.1:8765` with health checks on `http://127.0.0.1:8765/health`.

### 5. Deploy Fullstack to Zerops (Frontend + Backend in One Repo)
Face Day includes a ready-to-use `zerops.yml` that deploys both the native C++ Node backend and the Vite static frontend on [Zerops](https://zerops.io). See **[Zerops Fullstack Deployment Guide](file:///workspaces/Face-Day/docs/ZEROPS_DEPLOYMENT.md)**.

### 6. Build for Production
```bash
npm run build
```

### 7. Deploy to Cloudflare Pages via Wrangler
```bash
npx wrangler pages deploy dist --project-name=face-day
```

---

## 📁 Repository Structure

```text
Face-Day/
├── AGENTS.md                  # Comic design rules & coding guidelines
├── index.html                 # App layout & comic UI panels
├── wrangler.jsonc             # Cloudflare Pages / Assets config
├── docs/
│   ├── ARCHITECTURE.md        # Technical architecture & security spec
│   └── DEMO_SPEC.md           # 90s video demo script & judge criteria
├── local-runner/
│   ├── bridge.mjs             # Presage @smartspectra/node-sdk WebSocket bridge
│   └── package.json           # Native FFI dependencies
└── src/
    ├── main.ts                # Application coordinator & phase controller
    ├── style.css              # Vintage comic book styling & card foil CSS
    ├── icons.ts               # Clean vector SVGs (Hammer, Mask, etc. - No emojis)
    ├── sound-engine.ts        # Procedural Web Audio API sound synthesizer
    ├── sorting-engine.ts      # Thor vs Doom heuristic & RPG stats calculator
    ├── card-canvas.ts         # High-resolution physical trading card renderer
    ├── card-deck.ts           # Local storage card vault manager
    ├── optical-vitals.ts      # Browser-native camera optical vitals engine
    └── biometric-bridge.ts    # Dual-mode connector (Hardware Bridge + Fallback)
```

---

## 🏆 Hackathon Submission Metadata

* **Track:** Creativity Track
* **Tags:** `#presagechallenge`, `javascript`, `webdev`, `cloudflare`
* **License:** MIT
