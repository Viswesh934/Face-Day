// src/icons.ts
// Crisp vector SVGs with comic-ink style borders — Zero emojis used!

export const icons = {
  // Thor's War Hammer (Mjolnir)
  hammer: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-svg">
      <path d="M14 8H34V20H14V8Z" fill="#FFCC00" stroke="#111116" stroke-width="3" stroke-linejoin="round"/>
      <path d="M11 11H14V17H11V11Z" fill="#FFE066" stroke="#111116" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M34 11H37V17H34V11Z" fill="#FFE066" stroke="#111116" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 20V40H26V20H22Z" fill="#8D5B4C" stroke="#111116" stroke-width="3" stroke-linejoin="round"/>
      <path d="M20 40H28V43H20V40Z" fill="#D4D8DD" stroke="#111116" stroke-width="2.5"/>
      <path d="M19 14L29 14" stroke="#111116" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 23L24 37" stroke="#FFE066" stroke-width="1.5" stroke-dasharray="2 2"/>
    </svg>
  `,

  // Doom's Titanium Mask
  mask: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-svg">
      <path d="M12 12C12 8 16 6 24 6C32 6 36 8 36 12V28C36 36 29 42 24 43C19 42 12 36 12 28V12Z" fill="#00C853" stroke="#111116" stroke-width="3" stroke-linejoin="round"/>
      <path d="M15 14H33V26C33 33 28 38 24 39C20 38 15 33 15 26V14Z" fill="#B0BEC5" stroke="#111116" stroke-width="2"/>
      <!-- Slit Eyes -->
      <path d="M18 19L23 21L18 22H17L18 19Z" fill="#111116"/>
      <path d="M30 19L25 21L30 22H31L30 19Z" fill="#111116"/>
      <!-- Iron Rivets & Vent -->
      <path d="M24 24V31M21 28H27M20 33H28" stroke="#111116" stroke-width="2" stroke-linecap="round"/>
      <circle cx="16" cy="11" r="1.5" fill="#ECEFF1" stroke="#111116" stroke-width="1"/>
      <circle cx="32" cy="11" r="1.5" fill="#ECEFF1" stroke="#111116" stroke-width="1"/>
    </svg>
  `,

  // Comic Shield
  shield: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,

  // Comic Lightning Bolt
  bolt: `
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="#111116" stroke-width="1.5" stroke-linejoin="round" class="icon-svg">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  `,

  // Comic Crosshair / Target Reticle
  crosshair: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <circle cx="12" cy="12" r="8"/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
    </svg>
  `,

  // Comic Star (For Card Rarity Tiers)
  star: `
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="#111116" stroke-width="1.5" stroke-linejoin="round" class="icon-svg">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  `,

  // Download Icon
  download: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  `,

  // Share / Post to X (Twitter)
  shareX: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  `,

  // Card Deck / Vault Icon
  deck: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <rect x="3" y="5" width="14" height="17" rx="2"/>
      <path d="M7 2h14v16"/>
    </svg>
  `,

  // Camera Eye
  camera: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  `,

  // Checklist / Inquiry
  inquiry: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  `,

  // Sound Speaker On
  soundOn: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  `,

  // Sound Speaker Off
  soundOff: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  `,

  // Close / Exit
  close: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `
};
