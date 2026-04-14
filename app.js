/**
 * ============================================================
 * COLOR HEAVEN — app.js
 * Professional Color Palette Generator
 * Vanilla JavaScript | No Dependencies
 * ============================================================
 */

// ============================================================
// SECTION 1: COLOR CONVERSION UTILITIES
// ============================================================

/**
 * Convert a HEX color string to an HSL object.
 * @param {string} hex - e.g. "#1e7fcb"
 * @returns {{ h: number, s: number, l: number }}
 */
function hexToHsl(hex) {
  // Remove # and parse RGB components
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r: h = ((g - b) / delta + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / delta + 2) / 6; break;
      case b: h = ((r - g) / delta + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL values to a HEX color string.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} HEX color e.g. "#1e7fcb"
 */
function hslToHex(h, s, l) {
  // Normalize and clamp inputs
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));

  const sn = s / 100;
  const ln = l / 100;

  const c  = (1 - Math.abs(2 * ln - 1)) * sn;
  const x  = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m  = ln - c / 2;

  let r = 0, g = 0, b = 0;

  if      (h < 60)  { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }

  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Parse any valid hex string (with or without #) to normalized form.
 * Returns null if invalid.
 * @param {string} input
 * @returns {string|null}
 */
function parseHex(input) {
  const cleaned = input.trim().replace(/^#/, '');
  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) return `#${cleaned.toLowerCase()}`;
  if (/^[0-9A-Fa-f]{3}$/.test(cleaned)) {
    const [a, b, c] = cleaned;
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  return null;
}


// ============================================================
// SECTION 2: COLOR THEORY — PALETTE GENERATORS
// ============================================================

/**
 * Generate 5 color harmony palettes from a base hex color.
 * Returns an array of palette objects.
 * @param {string} baseHex
 * @returns {Array<{name, description, colors: string[]}>}
 */
function generatePalettes(baseHex) {
  const { h, s, l } = hexToHsl(baseHex);

  return [
    {
      name: 'Analogous',
      description: 'Colors adjacent on the wheel — naturally harmonious',
      colors: [
        hslToHex(h - 40, s, l),
        hslToHex(h - 20, s, l),
        baseHex,
        hslToHex(h + 20, s, l),
        hslToHex(h + 40, s, l),
      ]
    },
    {
      name: 'Monochromatic',
      description: 'Same hue, varying lightness — clean and professional',
      colors: [
        hslToHex(h, s, Math.max(l - 30, 5)),
        hslToHex(h, s, Math.max(l - 15, 10)),
        baseHex,
        hslToHex(h, Math.max(s - 15, 5), Math.min(l + 15, 90)),
        hslToHex(h, Math.max(s - 25, 5), Math.min(l + 30, 95)),
      ]
    },
    {
      name: 'Triadic',
      description: '120° apart — bold, vibrant, and balanced',
      colors: [
        baseHex,
        hslToHex(h + 120, s, l),
        hslToHex(h + 240, s, l),
        hslToHex(h + 120, Math.max(s - 15, 5), Math.min(l + 15, 90)),
        hslToHex(h + 240, Math.max(s - 15, 5), Math.min(l + 15, 90)),
      ]
    },
    {
      name: 'Complementary',
      description: 'Opposite on the wheel — high contrast, energetic',
      colors: [
        hslToHex(h, s, Math.max(l - 20, 10)),
        baseHex,
        hslToHex(h, Math.max(s - 20, 5), Math.min(l + 25, 90)),
        hslToHex(h + 180, s, l),
        hslToHex(h + 180, Math.max(s - 15, 5), Math.min(l + 20, 90)),
      ]
    },
    {
      name: 'Tetradic',
      description: '4 hues, 90° apart — rich and versatile',
      colors: [
        baseHex,
        hslToHex(h + 90,  s, l),
        hslToHex(h + 180, s, l),
        hslToHex(h + 270, s, l),
        hslToHex(h + 90,  Math.max(s - 20, 5), Math.min(l + 20, 90)),
      ]
    }
  ];
}


// ============================================================
// SECTION 3: ACCESSIBILITY — WCAG CONTRAST
// ============================================================

/**
 * Calculate relative luminance of a hex color.
 * Per WCAG 2.1 spec: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @param {string} hex
 * @returns {number} luminance (0–1)
 */
function getLuminance(hex) {
  const toLinear = (c) => {
    const s = parseInt(c, 16) / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(hex.slice(1, 3));
  const g = toLinear(hex.slice(3, 5));
  const b = toLinear(hex.slice(5, 7));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two colors.
 * @param {string} hex1
 * @param {string} hex2
 * @returns {number} contrast ratio (1–21)
 */
function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns WCAG badge info: which text color works best and its AA/AAA rating.
 * @param {string} bgHex - Background color
 * @returns {{ textColor: string, label: string, cssClass: string, ratio: string }}
 */
function getWcagInfo(bgHex) {
  const contrastWhite = getContrastRatio(bgHex, '#ffffff');
  const contrastBlack = getContrastRatio(bgHex, '#000000');

  // Use whichever has better contrast
  const bestContrast = Math.max(contrastWhite, contrastBlack);
  const textColor    = contrastWhite >= contrastBlack ? '#ffffff' : '#000000';

  let label, cssClass;
  if (bestContrast >= 7) {
    label    = 'AAA ✓';
    cssClass = 'pass';
  } else if (bestContrast >= 4.5) {
    label    = 'AA ✓';
    cssClass = 'pass';
  } else if (bestContrast >= 3) {
    label    = 'AA Large';
    cssClass = 'warn';
  } else {
    label    = 'Fail ✗';
    cssClass = 'fail';
  }

  return {
    textColor,
    label,
    cssClass,
    ratio: bestContrast.toFixed(1)
  };
}


// ============================================================
// SECTION 4: EXPORT — CSS VARIABLES
// ============================================================

/**
 * Generate a CSS variables file string from a palette.
 * @param {object} palette
 * @returns {string} CSS content
 */
function generateCssExport(palette) {
  const varLines = palette.colors
    .map((color, i) => `  --color-${palette.name.toLowerCase()}-${i + 1}: ${color};`)
    .join('\n');

  return `/* Color Heaven — ${palette.name} Palette */\n/* Generated on ${new Date().toLocaleDateString()} */\n\n:root {\n${varLines}\n}\n`;
}

/**
 * Trigger a file download in the browser.
 * @param {string} content
 * @param {string} filename
 */
function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/css' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


// ============================================================
// SECTION 5: CLIPBOARD
// ============================================================

/**
 * Copy text to clipboard. Falls back to execCommand for older browsers.
 * @param {string} text
 * @returns {Promise<void>}
 */
async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Legacy fallback
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity  = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}


// ============================================================
// SECTION 6: TOAST NOTIFICATION
// ============================================================

let toastTimer = null;

/**
 * Show a temporary toast message.
 * @param {string} message
 */
function showToast(message = 'Copied!') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  // Reset auto-hide timer
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}


// ============================================================
// SECTION 7: DOM RENDERING
// ============================================================

/**
 * Build and return a DOM element for a single color swatch.
 * @param {string} hex - Color hex
 * @returns {HTMLElement}
 */
function createSwatchEl(hex) {
  const wcag = getWcagInfo(hex);

  const swatch = document.createElement('div');
  swatch.className = 'swatch';
  swatch.style.backgroundColor = hex;
  swatch.setAttribute('title', `Click to copy ${hex} — Contrast ${wcag.ratio}:1`);
  swatch.setAttribute('role', 'button');
  swatch.setAttribute('tabindex', '0');
  swatch.setAttribute('aria-label', `Color ${hex}, contrast ratio ${wcag.ratio}:1, WCAG ${wcag.label}`);

  swatch.innerHTML = `
    <div class="swatch-info">
      <span class="swatch-hex" style="color: ${wcag.textColor}">
        ${hex} <span class="copy-icon">⎘</span>
      </span>
      <span class="wcag-badge ${wcag.cssClass}">${wcag.label}</span>
    </div>
  `;

  // Click to copy
  swatch.addEventListener('click', async () => {
    try {
      await copyToClipboard(hex);
      swatch.classList.add('copied');
      setTimeout(() => swatch.classList.remove('copied'), 300);
      showToast(`${hex} copied!`);
    } catch {
      showToast('Copy failed');
    }
  });

  // Keyboard accessibility
  swatch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      swatch.click();
    }
  });

  return swatch;
}

/**
 * Build and return a DOM element for a full palette block.
 * @param {object} palette - { name, description, colors }
 * @returns {HTMLElement}
 */
function createPaletteBlock(palette) {
  const block = document.createElement('div');
  block.className = 'palette-block';

  // Header: title + export button
  const header = document.createElement('div');
  header.className = 'palette-header';

  const titleGroup = document.createElement('div');
  titleGroup.innerHTML = `
    <div class="palette-title">${palette.name}</div>
    <div class="palette-description">${palette.description}</div>
  `;

  const exportBtn = document.createElement('button');
  exportBtn.className = 'export-btn';
  exportBtn.setAttribute('aria-label', `Download ${palette.name} palette as CSS`);
  exportBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    CSS Variables
  `;
  exportBtn.addEventListener('click', () => {
    const css = generateCssExport(palette);
    const filename = `color-heaven-${palette.name.toLowerCase()}.css`;
    downloadFile(css, filename);
    showToast(`${palette.name} exported!`);
  });

  header.appendChild(titleGroup);
  header.appendChild(exportBtn);

  // Swatches grid
  const grid = document.createElement('div');
  grid.className = 'swatches-grid';

  palette.colors.forEach(hex => {
    grid.appendChild(createSwatchEl(hex));
  });

  block.appendChild(header);
  block.appendChild(grid);

  return block;
}

/**
 * Render all palettes into the palettes section.
 * Clears previous output first.
 * @param {string} baseHex
 */
function renderPalettes(baseHex) {
  const section = document.getElementById('palettesSection');
  section.innerHTML = ''; // Clear previous palettes

  const palettes = generatePalettes(baseHex);

  palettes.forEach(palette => {
    const block = createPaletteBlock(palette);
    section.appendChild(block);
  });
}

/**
 * Show the empty/welcome state.
 */
function renderEmptyState() {
  const section = document.getElementById('palettesSection');
  section.innerHTML = `
    <div class="empty-state">
      <span class="empty-state-icon">🐼</span>
      <h2>Pick a color to begin</h2>
      <p>Choose your base color above and hit <strong>Generate</strong></p>
    </div>
  `;
}


// ============================================================
// SECTION 8: EVENT WIRING & INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const colorInput  = document.getElementById('baseColor');
  const hexInput    = document.getElementById('hexInput');
  const preview     = document.getElementById('colorPreview');
  const generateBtn = document.getElementById('generateBtn');

  // Sync color input → hex text + preview div
  function syncFromPicker(hex) {
    preview.style.backgroundColor = hex;
    hexInput.value = hex;
  }

  // Sync hex text → color input + preview div
  function syncFromText(hex) {
    const parsed = parseHex(hex);
    if (parsed) {
      colorInput.value = parsed;
      preview.style.backgroundColor = parsed;
    }
  }

  // Native color picker change
  colorInput.addEventListener('input', () => {
    syncFromPicker(colorInput.value);
  });

  // Hex text input — validate and sync on change
  hexInput.addEventListener('input', () => {
    syncFromText(hexInput.value);
  });

  // Enter key in hex input → trigger generate
  hexInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateBtn.click();
  });

  // Generate button click
  generateBtn.addEventListener('click', () => {
    const hex = parseHex(hexInput.value);
    if (!hex) {
      showToast('Invalid hex color!');
      hexInput.focus();
      return;
    }
    // Update everything to the normalized hex
    colorInput.value = hex;
    hexInput.value   = hex;
    preview.style.backgroundColor = hex;

    renderPalettes(hex);
  });

  // Initialize sync state
  syncFromPicker(colorInput.value);

  // Show initial empty state
  renderEmptyState();

  // Auto-generate on load with the default color so users immediately see output
  renderPalettes(colorInput.value);
  hexInput.value = colorInput.value;
});
