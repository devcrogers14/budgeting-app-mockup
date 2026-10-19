// Keep query parameters when the start page is opened as a local file.
location.replace(new URL('../pages/overview/overview.html'+location.search+location.hash,document.currentScript.src));
