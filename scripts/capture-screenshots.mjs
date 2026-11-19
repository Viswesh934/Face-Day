// scripts/capture-screenshots.mjs
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  console.log('[Screenshot Bot] Launching Chromium...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 860 },
    deviceScaleFactor: 2,
    permissions: ['camera']
  });

  const page = await context.newPage();

  console.log('[Screenshot Bot] Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Front Cover (The Choice & Faction Duel)
  console.log('[Screenshot Bot] 1. Capturing front cover...');
  await page.screenshot({ path: path.join(outDir, '01-comic-cover.png'), fullPage: false });

  // 2. Consent Modal
  console.log('[Screenshot Bot] 2. Capturing consent gate...');
  await page.click('#btn-start-camera-flow');
  await page.waitForSelector('#modal-consent', { state: 'visible' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '02-consent-gate.png'), fullPage: false });
  await page.click('#btn-close-consent');
  await page.waitForTimeout(300);

  // 3. The Overseer's Inquiry (Tactical Quiz)
  console.log('[Screenshot Bot] 3. Capturing Overseer Inquiry...');
  await page.click('#btn-start-inquiry-flow');
  await page.waitForSelector('#phase-2-inquiry.active', { state: 'visible' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, '03-inquiry-quiz.png'), fullPage: false });

  // Complete inquiry to get a Doom Card
  console.log('[Screenshot Bot] Answering questions for Doom profile...');
  // Q1: Option 2 (Doom)
  await page.click('#inquiry-options-container button:nth-child(2)');
  await page.waitForTimeout(300);
  // Q2: Option 2 (Doom)
  await page.click('#inquiry-options-container button:nth-child(2)');
  await page.waitForTimeout(300);
  // Q3: Option 2 (Doom)
  await page.click('#inquiry-options-container button:nth-child(2)');
  await page.waitForTimeout(300);
  // Q4: Option 2 (Doom)
  await page.click('#inquiry-options-container button:nth-child(2)');
  await page.waitForTimeout(1200);

  // 4. Team Doom Minted Trading Card
  console.log('[Screenshot Bot] 4. Capturing Team Doom minted card...');
  await page.screenshot({ path: path.join(outDir, '05-minted-card-doom.png'), fullPage: false });

  // Now let's trigger a Thor sorting flow
  console.log('[Screenshot Bot] Resetting to trigger Thor flow...');
  await page.click('#btn-play-again');
  await page.waitForTimeout(500);

  // Take Camera HUD screenshot by opening camera flow
  console.log('[Screenshot Bot] 5. Capturing Camera Trial HUD...');
  await page.click('#btn-start-camera-flow');
  await page.waitForSelector('#modal-consent', { state: 'visible' });
  await page.click('#btn-accept-consent');
  await page.waitForSelector('#phase-2-camera.active', { state: 'visible' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '04-camera-trial-hud.png'), fullPage: false });
  await page.click('#btn-cancel-trial');
  await page.waitForTimeout(400);

  // Now do Inquiry for Thor Card
  console.log('[Screenshot Bot] Answering inquiry for Thor profile...');
  await page.click('#btn-start-inquiry-flow');
  await page.waitForSelector('#phase-2-inquiry.active', { state: 'visible' });
  await page.waitForTimeout(300);
  // Q1: Option 1 (Thor)
  await page.click('#inquiry-options-container button:nth-child(1)');
  await page.waitForTimeout(300);
  // Q2: Option 1 (Thor)
  await page.click('#inquiry-options-container button:nth-child(1)');
  await page.waitForTimeout(300);
  // Q3: Option 1 (Thor)
  await page.click('#inquiry-options-container button:nth-child(1)');
  await page.waitForTimeout(300);
  // Q4: Option 1 (Thor)
  await page.click('#inquiry-options-container button:nth-child(1)');
  await page.waitForTimeout(1200);

  // 6. Team Thor Minted Trading Card
  console.log('[Screenshot Bot] 6. Capturing Team Thor minted card...');
  await page.screenshot({ path: path.join(outDir, '06-minted-card-thor.png'), fullPage: false });

  // 7. Card Vault
  console.log('[Screenshot Bot] 7. Capturing Card Vault modal...');
  await page.click('#btn-open-vault');
  await page.waitForSelector('#modal-vault', { state: 'visible' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, '07-card-vault.png'), fullPage: false });

  await browser.close();
  console.log('[Screenshot Bot] All screenshots captured successfully in docs/screenshots/ !');
}

capture().catch((err) => {
  console.error('[Screenshot Bot] Error:', err);
  process.exit(1);
});
