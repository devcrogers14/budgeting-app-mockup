// Keep query parameters when the start page is opened as a local file.
location.replace(new URL('../pages/home/home.html'+location.search+location.hash,document.currentScript.src));
