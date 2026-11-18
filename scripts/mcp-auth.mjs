// scripts/mcp-auth.mjs
// Automated OAuth 2.1 PKCE Authenticator for Presage SmartSpectra MCP Server
// Connects to https://mcp.presagetech.com, registers dynamically, and fetches API Key & Usage

import { createServer } from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const MCP_BASE = 'https://mcp.presagetech.com';
const PORT = 9999;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const STATE_FILE = resolve(process.cwd(), '.mcp-auth-state.json');

function base64Url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function exchangeCode(code, stateData) {
  console.log('\nExchanging Authorization Code for tokens with Presage...');
  const tokenRes = await fetch(`${MCP_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: stateData.clientId,
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: stateData.codeVerifier,
      resource: 'https://mcp.presagetech.com/mcp'
    })
  });

  const tokens = await tokenRes.json();
  if (!tokens.access_token) {
    console.error('Token exchange failed:', tokens);
    throw new Error(tokens.error_description || tokens.error || 'Token exchange failed');
  }

  const accessToken = tokens.access_token;
  console.log('Access Token acquired successfully!');

  // Query MCP Tools via Streamable HTTP (JSON-RPC)
  console.log('\nQuerying Presage MCP Tools for your account credentials...');

  // Call api_keys.get tool
  const apiKeyRes = await fetch(`${MCP_BASE}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'api_keys.get',
        arguments: {}
      }
    })
  });

  const apiKeyData = await apiKeyRes.json();
  console.log('api_keys.get result:', JSON.stringify(apiKeyData));

  // Call usage.get_plan tool
  const planRes = await fetch(`${MCP_BASE}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'usage.get_plan',
        arguments: {}
      }
    })
  });

  const planData = await planRes.json();
  console.log('usage.get_plan result:', JSON.stringify(planData));

  // Extract API key text
  let fetchedKey = null;
  if (apiKeyData?.result?.content?.[0]?.text) {
    try {
      const parsed = JSON.parse(apiKeyData.result.content[0].text);
      fetchedKey = parsed.api_key || parsed.apiKey;
    } catch {
      fetchedKey = apiKeyData.result.content[0].text.trim();
    }
  }

  if (fetchedKey) {
    console.log('\nSaving authorized Presage API Key to .env...');
    const envPath = resolve(process.cwd(), '.env');
    let envContent = '';
    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf-8');
    }
    if (envContent.includes('SMARTSPECTRA_API_KEY=')) {
      envContent = envContent.replace(/SMARTSPECTRA_API_KEY=.*/g, `SMARTSPECTRA_API_KEY=${fetchedKey}`);
    } else {
      envContent += `\nSMARTSPECTRA_API_KEY=${fetchedKey}\n`;
    }
    writeFileSync(envPath, envContent.trim() + '\n');
    console.log('SUCCESS: .env updated with verified Presage API Key!');
  }

  return { fetchedKey, planData };
}

async function run() {
  console.log('⚡ [Face Day] Presage SmartSpectra MCP Authenticator');
  console.log('==================================================');

  // 1. Dynamic Client Registration
  console.log('1. Registering dynamic MCP client with Presage...');
  let regRes;
  try {
    const regFetch = await fetch(`${MCP_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'FaceDay Hackathon Assistant',
        redirect_uris: [REDIRECT_URI],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
        scope: 'usage:read apps:read apps:write api_keys:read api_keys:rotate docs:read'
      })
    });
    regRes = await regFetch.json();
  } catch (err) {
    console.error('Failed to register dynamic client:', err);
    process.exit(1);
  }

  const clientId = regRes.client_id;
  if (!clientId) {
    console.error('No client_id returned by registration:', regRes);
    process.exit(1);
  }
  console.log('   Dynamic Client ID:', clientId);

  // 2. Generate PKCE Verifier & Challenge
  const codeVerifier = base64Url(randomBytes(32));
  const codeChallenge = base64Url(createHash('sha256').update(codeVerifier).digest());
  const state = base64Url(randomBytes(16));

  // Save state for offline / manual exchange
  const stateData = { clientId, codeVerifier, state };
  writeFileSync(STATE_FILE, JSON.stringify(stateData, null, 2));

  // RFC 8707 & MCP spec requires `resource=https://mcp.presagetech.com/mcp`
  const authUrl = `${MCP_BASE}/authorize?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&resource=${encodeURIComponent(
    'https://mcp.presagetech.com/mcp'
  )}&scope=${encodeURIComponent(
    'usage:read apps:read apps:write api_keys:read api_keys:rotate docs:read'
  )}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;

  console.log('\n2. Authorize with your SmartSpectra Account:');
  console.log('--------------------------------------------------');
  console.log('Open the following link in your browser:\n');
  console.log(authUrl);
  console.log('\n--------------------------------------------------');
  console.log(`Waiting for browser authorization redirect on port ${PORT}...`);

  // 3. Temporary HTTP server for OAuth Callback
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
      if (parsedUrl.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const code = parsedUrl.searchParams.get('code');
      const err = parsedUrl.searchParams.get('error');

      if (err) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h1>Authentication Failed</h1><p>${err}</p>`);
        console.error('OAuth Error:', err);
        server.close();
        process.exit(1);
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Missing Code</h1>');
        return;
      }

      console.log('\n3. Authorization Code received via HTTP callback!');
      await exchangeCode(code, stateData);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #0E1726; color: #FFF;">
          <h1 style="color: #FFCC00; font-size: 32px;">FACE DAY &times; PRESAGE MCP AUTHENTICATED!</h1>
          <p style="font-size: 18px; color: #00E5FF;">Your account has been connected and your verified credentials are now synced.</p>
          <p style="color: #A0AEC0;">You may now close this browser tab and return to the game.</p>
        </div>
      `);

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1500);

    } catch (err) {
      console.error('Error handling callback:', err);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>Internal Error</h1><p>${err.message}</p>`);
      server.close();
      process.exit(1);
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`OAuth local listener active on http://0.0.0.0:${PORT}`);
  });
}

if (process.argv[1]?.endsWith('mcp-auth.mjs')) {
  run().catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });
}
