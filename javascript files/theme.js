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


// Slide only the sidebar selection background; links still navigate immediately.
document.addEventListener('DOMContentLoaded', () => {
  const navigation = document.querySelector('nav');
  const links = [...(navigation?.querySelectorAll('a') || [])];
  const selectedLink = navigation?.querySelector('[aria-current="page"]');
  if (!navigation || !selectedLink) return;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const highlight = document.createElement('span');
  highlight.className = 'nav-selection-highlight'; highlight.setAttribute('aria-hidden','true');
  navigation.append(highlight); navigation.classList.add('has-sliding-highlight');
  const selectionStorageKey = 'budgetron-sidebar-selection-v1';

  // Measure relative to the navigation so desktop rows and phone grids both work.
  function highlightPosition(link) {
    const bounds = link.getBoundingClientRect();
    const navigationBounds = navigation.getBoundingClientRect();
    return {transform:`translate(${bounds.left-navigationBounds.left}px,${bounds.top-navigationBounds.top}px)`,width:`${bounds.width}px`,height:`${bounds.height}px`};
  }
  function placeHighlight() { Object.assign(highlight.style,highlightPosition(selectedLink)); }
  placeHighlight();
  try {
    const previousSelection = JSON.parse(sessionStorage.getItem(selectionStorageKey));
    sessionStorage.removeItem(selectionStorageKey);
    const previousLink = links[previousSelection?.index];
    if (!motionPreference.matches && previousLink && previousSelection.target === location.href && Date.now()-previousSelection.time < 10000 && previousLink !== selectedLink) {
      highlight.animate([highlightPosition(previousLink),highlightPosition(selectedLink)],{duration:180,easing:'ease-out'});
    }
  } catch { /* The selected-tab background still works without storage or animation support. */ }
  navigation.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    try { sessionStorage.setItem(selectionStorageKey,JSON.stringify({index:links.indexOf(selectedLink),target:link.href,time:Date.now()})); }
    catch { /* Page links never depend on storing animation state. */ }
  });
  new ResizeObserver(placeHighlight).observe(navigation);
  window.addEventListener('pageshow',placeHighlight);
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) highlight.getAnimations().forEach(animation=>animation.cancel());
    placeHighlight();
  });
});
