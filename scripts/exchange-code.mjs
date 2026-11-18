// scripts/exchange-code.mjs
// Exchanges a Presage authorization code or redirect URL manually

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { exchangeCode } from './mcp-auth.mjs';

const STATE_FILE = resolve(process.cwd(), '.mcp-auth-state.json');

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/exchange-code.mjs <code_or_redirect_url>');
    process.exit(1);
  }

  if (!existsSync(STATE_FILE)) {
    console.error('No .mcp-auth-state.json found. Run npm run mcp-auth first.');
    process.exit(1);
  }

  const stateData = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));

  let code = arg;
  if (arg.includes('code=')) {
    try {
      const u = new URL(arg.startsWith('http') ? arg : `http://localhost?${arg}`);
      code = u.searchParams.get('code') || code;
    } catch {
      const match = arg.match(/code=([^&]+)/);
      if (match) code = match[1];
    }
  }

  console.log('Exchanging authorization code:', code.slice(0, 10) + '...');
  try {
    const res = await exchangeCode(code, stateData);
    console.log('Successfully completed MCP exchange!');
    console.log('Fetched API Key:', res.fetchedKey ? res.fetchedKey.slice(0, 8) + '...' : 'none');
  } catch (err) {
    console.error('Exchange error:', err.message);
    process.exit(1);
  }
}

main();
