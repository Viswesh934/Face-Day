# Face Day — Technical Architecture & Security Specification

## Overview
**Face Day** is a zero-server-retention, client-side comic trading card battleground engineered for the **Presage SmartSpectra SDK Challenge (Creativity Track)**. It sorts users into two warring factions (**Team Thor / The Hammer** or **Team Doom / The Mask**) based on live physiological micro-signals (pulse rate, HRV / RMSSD, breathing cadence, facial expressions) or a zero-camera tactical inquiry bypass.

---

## 1. System Topology

```text
[ Client Browser (HTML5 / TypeScript / Vite) ]
  │
  ├── UI & Audio Layer (Comic Engine, Ben-Day Halftone Shaders, Web Audio Synth)
  ├── Consent & Privacy Controller (The Chamber of Decision, Camera Opt-In Gate)
  ├── Sorting Engine (Thor vs. Doom Decision Matrix, RPG Attribute Calculator)
  ├── Card Renderer (HTML5 Canvas 2D, 3D Holographic Foil Shaders, High-Res PNG Exporter)
  └── Local Card Vault (Client-Side Storage Sandbox / localStorage)
        ▲
        │ Full-Duplex WebSocket (Port 8765)
        ▼
[ Presage SmartSpectra Backend Runner (server/index.mjs via Node.js 20) ]
  ├── Native C++ SDK Runtime (@smartspectra/node-sdk, libsmartspectra.so)
  ├── 30-Second Exact Metering Watchdog (Guards API credits)
  └── Telemetry Stream (Windowed Metrics Protobuf Decoder)
```

---

## 2. Privacy & Edge Boundary
1. **Zero Database / Zero Server Logging:** The application operates with zero server-side logging. No camera frames, video data, facial landmark coordinates, or physiological metrics are ever recorded or stored on any server.
2. **Local Storage Sandbox:** Player cards and deck history are saved strictly to the browser's `localStorage` sandbox on the client device.
3. **Explicit Consent & Escape Hatch:** Users must actively opt in through the **Chamber of Decision** modal before camera hardware is queried. At any point, the user can decline or exit to **The Overseer's Inquiry** (Bypass Mode) which uses zero camera hardware.

---

## 3. Presage SmartSpectra SDK Integration & Credit Guard
- **API Credit Preservation:** Presage developer accounts allocate 1 credit per 30-second measurement cycle. Face Day implements an automatic 30-second countdown watchdog in both frontend and backend that halts the measurement session at millisecond 30,000, preventing credit depletion.
- **Metric Groups Utilized:**
  - `cardio`: Pulse Rate (BPM), Heart Rate Variability (`rmssd`), Arterial Pressure Waveform Trace.
  - `breathing`: Breathing Rate (breaths/min) and respiratory trace.
  - `face`: 478 MediaPipe facial landmarks, blink frequency, facial expression classifications (calm, resolve, focused).
- **Execution Environments:**
  - **Zerops Turnkey Fullstack:** Single `zerops.yml` deploying both Ubuntu LXC Node.js backend with C++ runtime support and static Nginx frontend bundle.
  - **Local Dev Mode:** `npm run backend` (`server/index.mjs`) on `ws://localhost:8765`.
  - **Standalone Edge Fallback:** Browser-native optical chrominance & face geometry engine (`src/optical-vitals.ts`) for zero-latency preview when backend is not running.

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

## 5. Deployment Options
- **Turnkey Fullstack (Zerops):** [zerops.yml](../zerops.yml) deploys both the native backend and static frontend in a single repository. See [Zerops Deployment Guide](ZEROPS_DEPLOYMENT.md).
- **Static Edge (Cloudflare Pages):** Frontend can deploy standalone to Cloudflare Pages with edge fallback.
- **Container Backend (AWS App Runner / Docker):** Standalone backend container using `Dockerfile`. See [AWS App Runner Guide](AWS_APP_RUNNER.md).
