# Zerops Fullstack Deployment Guide — Face Day

This guide walks you through deploying both the **Frontend** (Vite SPA) and **Backend** (Presage SmartSpectra C++ WebSocket engine) together on **[Zerops](https://zerops.io)**.

---

## 1. Why Zerops is a Perfect Fit
* **True Ubuntu Linux Containers:** Zerops runs full LXC containers with standard glibc and C++ runtime support, allowing `@smartspectra/node-sdk` and `libsmartspectra.so` to run natively without emulation.
* **Native WebSockets & HTTP Support:** Built-in SSL (`wss://`) and persistent WebSocket streaming for real-time camera frames and telemetry.
* **Monorepo / Dual-Service in One Repo:** A single `zerops.yml` in the root configures both the `backend` and `frontend` services simultaneously.

---

## 2. Step-by-Step Setup in Zerops GUI

### Step 2.1: Create a Project
1. Log in to [Zerops GUI](https://app.zerops.io).
2. Click **Add Project** and give it a name (e.g., `face-day`).

### Step 2.2: Add the Two Services
Under your project, add the two services matching the names in `zerops.yml`:

1. **Backend Service:**
   * Click **Add Service**.
   * Choose **Node.js**.
   * Set **Hostname / Service Name:** `backend` *(must match `setup: backend` in `zerops.yml`)*.
   * Select **Ubuntu** base OS.
   * Under **Environment Variables**, add:
     * `SMARTSPECTRA_API_KEY`: `<your-presage-api-key>`
     * `PORT`: `8765`

2. **Frontend Service:**
   * Click **Add Service**.
   * Choose **Static**.
   * Set **Hostname / Service Name:** `frontend` *(must match `setup: frontend` in `zerops.yml`)*.

### Step 2.3: Connect GitHub Repository
1. In your project settings, connect your GitHub account.
2. Select repository: `Viswesh934/Face-Day`.
3. Set both `backend` and `frontend` to trigger from the `main` branch.

### Step 2.4: Enable Public Access (Subdomains)
1. In the **backend** service, enable a **public subdomain** (e.g., `https://backend-xxxx.zerops.app`).
   * This provides your secure `wss://backend-xxxx.zerops.app` WebSocket URL.
2. In the **frontend** service, enable a **public subdomain** (e.g., `https://frontend-xxxx.zerops.app`) or point your custom domain.
3. In the frontend environment variables or build args, set:
   * `VITE_PRESAGE_BACKEND_URL`: `wss://backend-xxxx.zerops.app`
   *(Or you can paste it at runtime in the browser console via `window.__PRESAGE_BACKEND_URL__ = 'wss://...'`)*.

---

## 3. How the Pipeline Works

```
[ Git Push to main ]
        │
        ├──> Zerops detects zerops.yml
        │
        ├──> [setup: backend]
        │      ├── Ubuntu Node.js 20 container
        │      ├── Installs libgomp1 & server/ dependencies
        │      ├── Starts node server/index.mjs on port 8765
        │      └── Opens wss:// public access
        │
        └──> [setup: frontend]
               ├── Builds Vite static bundle (npm run build)
               ├── Deploys dist/~ to static Nginx runtime
               └── Opens https:// public access
```
