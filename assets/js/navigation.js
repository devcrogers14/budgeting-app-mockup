// Slide the content between pages while keeping ordinary links and history.
(() => {
  const main = document.querySelector('main');
  const nav = document.querySelector('nav');
  if (!main || !nav) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'budgetron-page-transition';
  let leaving = false;
  const enter = () => {
    if (reducedMotion.matches || !main.animate) return;
    let direction = 1;
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (!saved || saved.target !== location.href || Date.now() - saved.time > 10000) return;
      direction = saved.direction;
      sessionStorage.removeItem(key);
    } catch { return; }
    main.animate([
      { opacity:0, transform:`translateX(${direction * 24}px)` },
      { opacity:1, transform:'translateX(0)' }
    ], { duration:260, easing:'cubic-bezier(.2,.7,.2,1)' });
  };
  enter();
  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    if (reducedMotion.matches || !main.animate) return;
    const destination = new URL(link.href);
    const current = new URL(location.href);
    if (destination.protocol !== current.protocol || destination.host !== current.host) return;
    if (destination.href === current.href) { event.preventDefault(); return; }
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    const links = [...nav.querySelectorAll('a')];
    const active = nav.querySelector('[aria-current="page"]');
    const direction = links.indexOf(link) >= links.indexOf(active) ? 1 : -1;
    const animation = main.animate([
      { opacity:1, transform:'translateX(0)' },
      { opacity:0, transform:`translateX(${-direction * 20}px)` }
    ], { duration:150, easing:'ease-in', fill:'forwards' });
    animation.finished.catch(() => {}).then(() => {
      try { sessionStorage.setItem(key, JSON.stringify({ target:destination.href, direction, time:Date.now() })); } catch { /* Navigation still works without storage. */ }
      location.assign(destination.href);
    });
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      leaving = false;
      main.getAnimations().forEach((animation) => animation.cancel());
    }
  });
})();
