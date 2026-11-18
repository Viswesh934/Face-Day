# AWS App Runner Deployment Guide — Presage SmartSpectra Backend

This guide outlines how to deploy the **Face Day Presage SmartSpectra Backend** on **AWS App Runner** to provide live, full-duplex WebSocket streaming (`wss://`) for the native C++ Presage SDK within a $5 budget.

---

## 1. Architecture Overview

```
[ Player Web Browser ]
        │
        ├──> Cloudflare Pages (Frontend: https://face-day.pages.dev)
        │
        └──> AWS App Runner (Native SDK: wss://xxxx.us-east-1.awsapprunner.com)
                 │
                 ├── Ingests 160x120 RGBA camera frames
                 ├── Executes @smartspectra/node-sdk (libsmartspectra.so)
                 ├── Pairs with Presage Cloud via SMARTSPECTRA_API_KEY
                 └── Streams real-time decoded metrics & enforces 30s credit guard
```

---

## 2. Prerequisites
1. An AWS Account.
2. Your Presage SmartSpectra API Key (`SMARTSPECTRA_API_KEY`).
3. GitHub repository access to `Face-Day`.

---

## 3. Step-by-Step Deployment on AWS App Runner

### Step 3.1: Create App Runner Service
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/apprunner).
2. Click **Create service**.
3. Under **Repository type**, choose **Source code repository**.
4. Connect your GitHub account and select the repository: `Viswesh934/Face-Day`.
5. Under **Branch**, select `main`.
6. Under **Deployment trigger**, select **Automatic** (deploys whenever code is pushed) or **Manual**.

### Step 3.2: Configure Build & Container
1. **Configuration file:** Select **Configure all settings here**.
2. **Runtime:** Select **Docker**.
3. **Port:** Enter `8080` (or `8765`).

*(Alternatively, if using Source directory build, specify Dockerfile path `/Dockerfile`).*

### Step 3.3: Configure Service & Environment Variables
1. **Service name:** `face-day-presage-backend`
2. **Virtual CPU & Memory:** 
   - **vCPU:** `0.5 vCPU` or `1 vCPU`
   - **Memory:** `1 GB` or `2 GB`
3. **Environment variables:**
   - Key: `SMARTSPECTRA_API_KEY`
   - Value: `<YOUR_PRESAGE_API_KEY>`
   - Key: `PORT`
   - Value: `8080`
4. **Health check:**
   - **Protocol:** `HTTP`
   - **Path:** `/health`
   - **Interval:** `20 seconds`
   - **Timeout:** `5 seconds`
   - **Healthy threshold:** `1`
   - **Unhealthy threshold:** `3`

### Step 3.4: Auto-Scaling & Budget Control (< $5/month)
1. Under **Auto scaling**, create a custom configuration:
   - **Min instances:** `1` (or `0` when paused)
   - **Max instances:** `1` (prevents unexpected scaling costs)
   - **Max concurrency:** `100`
2. **Estimated Monthly Cost:**
   - When idle with 0.5 vCPU / 1 GB: ~$0.007/hour ($\approx$ $0.16/day).
   - Can be paused via the AWS Console when not presenting or testing.
   - Falls comfortably within the $5 budget limit.

### Step 3.5: Deploy
1. Click **Create & deploy**.
2. AWS App Runner will build the Docker container and provide a **Default domain**, e.g.:
   `https://a1b2c3d4e5.us-east-1.awsapprunner.com`

---

## 4. Connecting Face Day to the App Runner Backend

Once App Runner provides your service domain, connect Face Day by setting the WebSocket URL:

### Method A: Environment Variable (Vite Build)
In Cloudflare Pages or `.env.production`:
```env
VITE_PRESAGE_BACKEND_URL=wss://a1b2c3d4e5.us-east-1.awsapprunner.com
```

### Method B: Runtime Browser Override (Console)
For instant verification without redeploying frontend:
```javascript
window.__PRESAGE_BACKEND_URL__ = "wss://a1b2c3d4e5.us-east-1.awsapprunner.com";
```

---

## 5. Local Testing Before Cloud Deployment

You can test the exact same backend locally:
```bash
# Start backend on ws://localhost:8765
npm run backend

# In another terminal, start frontend
npm run dev
```
Face Day automatically connects to `ws://127.0.0.1:8765` when running locally!
