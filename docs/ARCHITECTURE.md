# Face Day — Technical Architecture & Security Specification

## Overview
**Face Day** is a zero-backend, client-side comic trading card battleground engineered for the **Presage SmartSpectra SDK Challenge (Creativity Track)**. It sorts users into two warring factions (**Team Thor / The Hammer** or **Team Doom / The Mask**) based on live physiological micro-signals (pulse, HRV, breathing rate, facial expressions) or a zero-camera tactical inquiry bypass.

---

## 1. System Topology

```text
[ Client Browser (Cloudflare Edge Pages / Workers Assets) ]
  │
  ├── UI & Audio Layer (Comic Engine, Halftone Shaders, Web Audio Synth)
  ├── Consent & Privacy Controller (Explicit Opt-In, Camera Gate)
  ├── Sorting Engine (Thor vs. Doom Decision Matrix)
  ├── Card Renderer (HTML5 Canvas 2D, Holographic Foil Shaders, Image Blob Exporter)
  └── Local Card Vault (Client-Side Storage / IndexedDB / localStorage)
        ▲
        │ Local WebSocket / Direct Bridge (Optional)
        ▼
[ Local Hardware Bridge / Developer Harness (Node.js + @smartspectra/node-sdk) ]
  ├── C-API FFI Shim (libsmartspectra_capi)
  ├── 30-Second Exact Metering Watchdog (Guards 100/100 API credits)
  └── Telemetry Stream (Windowed Metrics Protobuf Decoder)
```

---

## 2. Privacy & Edge Boundary
1. **Zero Database / Zero Logging:** The application operates entirely on Cloudflare edge static delivery. No camera frames, video data, facial landmark coordinates, or physiological metrics ever leave the user's browser or device.
2. **Local Storage Only:** Player cards and deck history are saved strictly to the browser's `localStorage` sandbox.
3. **Explicit Consent & Escape Hatch:** Users must actively opt into camera activation. At any point, the user can decline or exit to the "Overseer's Inquiry" (Face Reading Bypass) which uses zero camera hardware.

---

## 3. Presage SmartSpectra SDK Integration & Credit Guard
- **API Credit Preservation:** Presage accounts allocate 1 credit per 30-second measurement window. Face Day implements an automatic 30-second countdown timer that enforces `sdk.stop()` at millisecond 30,000, preventing credit depletion.
- **Metric Groups Utilized:**
  - `cardio`: Pulse Rate (BPM), Relative Arterial Pressure Shape, Heart Rate Variability (RMSSD / Baevsky Stress Index).
  - `breathing`: Breathing Rate (breaths/min) and chest/abdominal respiratory traces.
  - `face`: 478 MediaPipe facial landmarks, blink frequency, facial expression probabilities (neutral, calm, surprise, resolve).
- **Dual Bridge Implementation:**
  - Desktop / Local Dev Mode: `local-runner/bridge.mjs` executes `@smartspectra/node-sdk` via native FFI and streams real-time decoded measurements over local WebSocket (`ws://localhost:8765`).
  - Standalone Edge Mode: Browser-native optical chrominance analysis & face landmark pipeline + pre-validated synthetic rPPG sample playback for judges testing directly in browser without local terminal setup.

---

## 4. The Sorting Heuristic Matrix

| Metric Dimension | Team Thor (The Hammer) | Team Doom (The Mask) |
| :--- | :--- | :--- |
| **Autonomic State** | High Parasympathetic Tone / Calm | High Sympathetic Drive / Tactical Intensity |
| **Heart Rate Variability (HRV)** | RMSSD > 45 ms (Resilient equilibrium) | RMSSD < 38 ms (Hyper-focused activation) |
| **Breathing Cadence** | Deep, rhythmic (10–16 bpm) | Rapid or rigidly held (17–24 bpm) |
| **Expression Balance** | Resolute, calm, open | Steely, intense, calculating |
| **RPG Attribute Affinity** | High Endurance & Agility | High Focus & Willpower |

---

## 5. Deployment Model
- Built using **Vite + TypeScript**.
- Target: Cloudflare Pages / Workers static assets.
- Configuration: `wrangler.jsonc`.
- Deployment command: `npx wrangler pages deploy dist` or `npx wrangler deploy`.
