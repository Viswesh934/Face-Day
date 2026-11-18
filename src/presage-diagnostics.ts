// src/presage-diagnostics.ts
// Live Presage SmartSpectra API Health & Diagnostic Probe for Face Day
// Surfaces real network requests, latency, HTTP statuses, and raw error payloads in production

export interface ProbeResult {
  endpoint: string;
  name: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR' | 'BLOCKED';
  httpCode?: number;
  latencyMs?: number;
  details?: string;
  rawResponse?: string;
}

export class PresageDiagnostics {
  private defaultApiKey = 'T7qZxpQWBs8fzHjhWg2088UAoG1yWxOq9AUXShxp';
  private modalEl: HTMLElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private keyInput: HTMLInputElement | null = null;
  private isProbing = false;

  constructor() {
    this.createDiagnosticModal();
  }

  public get currentKey(): string {
    return localStorage.getItem('presage_api_key_override') || this.defaultApiKey;
  }

  public setApiKey(newKey: string) {
    if (newKey) {
      localStorage.setItem('presage_api_key_override', newKey.trim());
    } else {
      localStorage.removeItem('presage_api_key_override');
    }
  }

  private createDiagnosticModal() {
    const existing = document.getElementById('presage-diag-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'presage-diag-modal';
    modal.className = 'diag-modal-backdrop';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="diag-modal-box">
        <div class="diag-header">
          <div class="diag-title-cluster">
            <span class="diag-badge">HACKATHON DIAGNOSTICS</span>
            <h2 class="diag-title">PRESAGE SMARTSPECTRA &bull; PROD HEALTH PROBE</h2>
          </div>
          <button id="btn-close-diag" class="diag-close-btn">&times;</button>
        </div>

        <div class="diag-body">
          <div class="diag-key-bar">
            <div class="diag-key-label">ACTIVE PRESAGE API KEY:</div>
            <div class="diag-key-input-row">
              <input type="text" id="diag-api-key-input" class="diag-input" placeholder="Enter Presage API Key (psg_...)" value="${this.currentKey}" />
              <button id="btn-save-run-probe" class="comic-btn comic-btn-gold comic-btn-sm">
                <span>SAVE &amp; PROBE NOW</span>
              </button>
            </div>
            <div class="diag-hint">Key Length: ${this.currentKey.length} chars &bull; Masked: ${this.currentKey.slice(0, 6)}...${this.currentKey.slice(-4)}</div>
          </div>

          <div class="diag-results-pane" id="diag-results-pane">
            <div class="diag-empty-msg">Click "RUN LIVE PROBE" to dispatch real network requests to Presage API endpoints and inspect HTTP status, headers, and error codes.</div>
          </div>

          <div class="diag-architecture-card">
            <div class="diag-arch-title">PRESAGE PRODUCTION ARCHITECTURE NOTE:</div>
            <p>
              The official <strong>@smartspectra/node-sdk</strong> uses a native C-API (<code>libsmartspectra_capi.so</code>) executing <strong>100% on-device neural rPPG</strong> without streaming user video to the cloud.
            </p>
            <p style="margin-top: 6px;">
              In edge/static web browsers, Face Day runs the high-performance browser-native rPPG optical engine and connects seamlessly to the native bridge on <code>ws://127.0.0.1:8765</code> when running desktop developer mode.
            </p>
          </div>
        </div>

        <div class="diag-footer">
          <button id="btn-run-full-probe" class="comic-btn comic-btn-emerald">
            <span>RUN FULL PROBE (4 ENDPOINTS)</span>
          </button>
          <button id="btn-dismiss-diag" class="comic-btn comic-btn-dark comic-btn-sm">
            <span>CLOSE</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this.resultsContainer = modal.querySelector('#diag-results-pane');
    this.keyInput = modal.querySelector('#diag-api-key-input');

    modal.querySelector('#btn-close-diag')?.addEventListener('click', () => this.hide());
    modal.querySelector('#btn-dismiss-diag')?.addEventListener('click', () => this.hide());
    modal.querySelector('#btn-save-run-probe')?.addEventListener('click', () => {
      const val = this.keyInput?.value.trim() || '';
      this.setApiKey(val);
      this.runProbes();
    });
    modal.querySelector('#btn-run-full-probe')?.addEventListener('click', () => this.runProbes());
  }

  public show() {
    if (!this.modalEl) this.createDiagnosticModal();
    if (this.modalEl) {
      this.modalEl.style.display = 'flex';
      if (this.keyInput) this.keyInput.value = this.currentKey;
      this.runProbes();
    }
  }

  public hide() {
    if (this.modalEl) this.modalEl.style.display = 'none';
  }

  public async runProbes(): Promise<ProbeResult[]> {
    if (this.isProbing) return [];
    this.isProbing = true;

    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = `
        <div class="diag-probing-spinner">
          <div class="diag-pulse-ring"></div>
          <span>DISPATCHING LIVE HTTP/WS PROBES TO PRESAGE ENDPOINTS...</span>
        </div>
      `;
    }

    const key = this.currentKey;
    const results: ProbeResult[] = [];

    // Probe 1: Presage Physiology Platform Portal
    results.push(await this.probeHttp(
      'https://physiology.presagetech.com/',
      'Presage Physiology Portal',
      'GET',
      { 'x-api-key': key }
    ));

    // Probe 2: Presage MCP Infrastructure
    results.push(await this.probeHttp(
      'https://mcp.presagetech.com/',
      'Presage MCP Gateway (AWS API-GW)',
      'GET',
      { 'x-api-key': key }
    ));

    // Probe 3: Presage MCP JSON-RPC Streamable HTTP Endpoint
    results.push(await this.probeHttp(
      'https://mcp.presagetech.com/mcp',
      'Presage MCP Tools RPC (/mcp)',
      'POST',
      { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} })
    ));

    // Probe 4: Local Presage Hardware Bridge WebSocket
    results.push(await this.probeWebSocket(
      'ws://127.0.0.1:8765',
      'Local Desktop C-API Bridge (ws://127.0.0.1:8765)'
    ));

    this.renderResults(results);
    this.isProbing = false;
    return results;
  }

  private async probeHttp(
    url: string,
    name: string,
    method: 'GET' | 'POST',
    headers: Record<string, string>,
    body?: string
  ): Promise<ProbeResult> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - start);

      let text = '';
      try {
        text = await res.text();
      } catch {
        text = '(Could not parse body text)';
      }

      const isOk = res.status >= 200 && res.status < 400;
      return {
        endpoint: url,
        name,
        status: isOk ? 'SUCCESS' : 'ERROR',
        httpCode: res.status,
        latencyMs: latency,
        details: `HTTP ${res.status} ${res.statusText || ''} (${latency}ms)`,
        rawResponse: text.slice(0, 300)
      };
    } catch (err: unknown) {
      const latency = Math.round(performance.now() - start);
      const errStr = String(err);
      const isCors = errStr.includes('Failed to fetch') || errStr.includes('NetworkError');

      return {
        endpoint: url,
        name,
        status: 'BLOCKED',
        latencyMs: latency,
        details: isCors 
          ? `Browser CORS Policy Blocked direct origin request (${latency}ms)`
          : `Network Exception: ${errStr} (${latency}ms)`,
        rawResponse: isCors
          ? `CORS Preflight / Origin Restricted by server policy. Cloudflare Pages origin (https://*) cannot directly cross-fetch raw endpoints unless Presage enables Access-Control-Allow-Origin: * on this route.`
          : errStr
      };
    }
  }

  private probeWebSocket(url: string, name: string): Promise<ProbeResult> {
    return new Promise((resolve) => {
      const start = performance.now();
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

      if (isHttps) {
        resolve({
          endpoint: url,
          name,
          status: 'BLOCKED',
          details: 'HTTPS Mixed Content Block: Modern browsers prohibit ws://127.0.0.1 on https:// sites.',
          rawResponse: 'Run Face Day locally on http://localhost:5173 to bridge with local Presage C-API FFI runner.'
        });
        return;
      }

      try {
        const socket = new WebSocket(url);
        let resolved = false;

        const timer = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            try { socket.close(); } catch {}
            resolve({
              endpoint: url,
              name,
              status: 'ERROR',
              details: `Connection timeout after 3000ms`,
              rawResponse: 'Local runner (node local-runner/bridge.mjs) is not currently listening on port 8765.'
            });
          }
        }, 3000);

        socket.onopen = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            const latency = Math.round(performance.now() - start);
            try { socket.close(); } catch {}
            resolve({
              endpoint: url,
              name,
              status: 'SUCCESS',
              latencyMs: latency,
              details: `Connected to Presage SmartSpectra Local Bridge (${latency}ms)`,
              rawResponse: 'WebSocket handshake accepted. Hardware C-API pipeline ready.'
            });
          }
        };

        socket.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve({
              endpoint: url,
              name,
              status: 'ERROR',
              details: 'WebSocket connection refused (port 8765 inactive)',
              rawResponse: 'Start runner via: npm run bridge'
            });
          }
        };
      } catch (e) {
        resolve({
          endpoint: url,
          name,
          status: 'ERROR',
          details: String(e),
          rawResponse: 'Failed to construct WebSocket.'
        });
      }
    });
  }

  private renderResults(results: ProbeResult[]) {
    if (!this.resultsContainer) return;

    this.resultsContainer.innerHTML = results.map((r) => {
      const isSuccess = r.status === 'SUCCESS';
      const isError = r.status === 'ERROR';

      const badgeColor = isSuccess ? '#00E676' : isError ? '#FF5252' : '#FFAB00';
      const badgeBg = isSuccess ? 'rgba(0, 230, 118, 0.15)' : isError ? 'rgba(255, 82, 82, 0.15)' : 'rgba(255, 171, 0, 0.15)';

      return `
        <div class="diag-result-card">
          <div class="diag-result-header">
            <div>
              <div class="diag-endpoint-name">${r.name}</div>
              <div class="diag-endpoint-url">${r.endpoint}</div>
            </div>
            <span class="diag-status-pill" style="color: ${badgeColor}; background: ${badgeBg}; border-color: ${badgeColor};">
              ${r.status} ${r.httpCode ? `[${r.httpCode}]` : ''}
            </span>
          </div>

          <div class="diag-result-details">${r.details || ''}</div>

          ${r.rawResponse ? `
            <div class="diag-raw-box">
              <div class="diag-raw-label">RAW RESPONSE / DIAGNOSIS:</div>
              <pre class="diag-raw-pre">${escapeHtml(r.rawResponse)}</pre>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const presageDiagnostics = new PresageDiagnostics();
