// Restore light/dark mode and color palette before paint, then connect the page controls. These preferences use their own localStorage entries.
// Apply the theme before the page appears, then connect the header toggle.
const themeKey = 'insert-name-theme';
let currentTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
try {
  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme === 'dark' || savedTheme === 'light') currentTheme = savedTheme;
} catch { /* The toggle still works without browser storage. */ }
document.documentElement.dataset.theme = currentTheme;
const paletteKey = 'insert-name-palette';
const palettes = ['cream', 'sage', 'ocean', 'rose'];
let currentPalette = 'cream';
try {
  const savedPalette = localStorage.getItem(paletteKey);
  if (palettes.includes(savedPalette)) currentPalette = savedPalette;
} catch { /* The selected palette still works for this page. */ }
document.documentElement.dataset.palette = currentPalette;

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const updateToggle = () => {
    themeToggle.setAttribute('aria-pressed', String(currentTheme === 'dark'));
    themeToggle.title = currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  };
  updateToggle();
  const palettePicker = document.getElementById('color-theme');
  palettePicker.value = currentPalette;
  palettePicker.addEventListener('change', () => {
    currentPalette = palettePicker.value;
    document.documentElement.dataset.palette = currentPalette;
    try { localStorage.setItem(paletteKey, currentPalette); }
    catch { /* Palette changes remain usable for this page. */ }
  });
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = currentTheme;
    updateToggle();
    try { localStorage.setItem(themeKey, currentTheme); }
    catch { /* Theme changes remain usable for this page. */ }
  });
});
