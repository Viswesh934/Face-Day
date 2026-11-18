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
  - **AWS App Runner / Cloud Container:** Dedicated Node.js backend container (`server/index.mjs` via `Dockerfile`) hosting the native `@smartspectra/node-sdk` C++ runtime, streaming full-duplex WebSockets (`wss://`) with real Presage cloud pairing within a $5 budget. See [docs/AWS_APP_RUNNER.md](file:///workspaces/Face-Day/docs/AWS_APP_RUNNER.md).
  - **Desktop / Local Dev Mode:** `npm run backend` (`server/index.mjs`) or `local-runner/bridge.mjs` executing `@smartspectra/node-sdk` on `ws://localhost:8765`.
  - **Standalone Edge Fallback:** Browser-native optical chrominance analysis & face landmark pipeline (`src/optical-vitals.ts`) for zero-latency testing when the hardware backend is offline.

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
- **Frontend:** Built using **Vite + TypeScript**, deployed to **Cloudflare Pages** (`face-day.pages.dev`).
- **Backend (Native Presage SDK):** Containerized via `Dockerfile` and deployed to **AWS App Runner** (or local `npm run backend`).
- **Full Guide:** See [docs/AWS_APP_RUNNER.md](file:///workspaces/Face-Day/docs/AWS_APP_RUNNER.md).
