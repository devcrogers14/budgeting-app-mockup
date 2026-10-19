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
  const toggle = document.getElementById('theme-toggle');
  const updateToggle = () => {
    toggle.setAttribute('aria-pressed', String(currentTheme === 'dark'));
    toggle.title = currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  };
  updateToggle();
  const picker = document.getElementById('color-theme');
  picker.value = currentPalette;
  picker.addEventListener('change', () => {
    currentPalette = picker.value;
    document.documentElement.dataset.palette = currentPalette;
    try { localStorage.setItem(paletteKey, currentPalette); }
    catch { /* Palette changes remain usable for this page. */ }
  });
  toggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = currentTheme;
    updateToggle();
    try { localStorage.setItem(themeKey, currentTheme); }
    catch { /* Theme changes remain usable for this page. */ }
  });
});
