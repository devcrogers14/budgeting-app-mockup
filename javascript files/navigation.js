// Animate navigation between separate HTML pages while preserving normal browser links and reduced-motion preferences. Session storage carries the animation direction to the destination.
// Native page transitions keep the sidebar in place; local files use a slide fallback.
(() => {
  const mainContent=document.querySelector('main');
  const navigation=document.querySelector('nav');
  if(!mainContent || !navigation)return;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const transitionStorageKey='budgetron-page-transition';
  const nativeTransitions=location.protocol!=='file:' && 'onpagereveal' in window && CSS.supports('view-transition-name','budget-page');
  let isLeaving=false;
  let exitAnimation;

  // Restore the intended slide direction when arriving at a page or returning from browser history.

  function enter(){
    let savedTransition;
    try{
      savedTransition=JSON.parse(sessionStorage.getItem(transitionStorageKey));
      if(!savedTransition || savedTransition.target!==location.href || Date.now()-savedTransition.time>10000)return;
      sessionStorage.removeItem(transitionStorageKey);
    }catch{return;}
    document.documentElement.style.setProperty('--page-direction',savedTransition.direction===-1?'-1':'1');
    if(reducedMotion.matches || nativeTransitions || !mainContent.animate)return;
    mainContent.animate([
      {transform:`translateX(${savedTransition.direction*64}px)`},
      {transform:'translateX(0)'},
    ],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  enter();

  navigation.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download'))return;
    const destination=new URL(link.href);
    const current=new URL(location.href);
    if(destination.protocol!==current.protocol || destination.host!==current.host)return;
    if(destination.href===current.href){event.preventDefault();return;}
    if(reducedMotion.matches)return;
    if(isLeaving){event.preventDefault();return;}
    const links=[...navigation.querySelectorAll('a')];
    const direction=links.indexOf(link)>=links.indexOf(navigation.querySelector('[aria-current="page"]'))?1:-1;
    document.documentElement.style.setProperty('--page-direction',String(direction));
    try{sessionStorage.setItem(transitionStorageKey,JSON.stringify({target:destination.href,direction,time:Date.now()}));}catch{}
    // Let the browser take snapshots of both documents for a continuous transition.
    if(nativeTransitions)return;
    if(!mainContent.animate)return;
    event.preventDefault();
    isLeaving=true;
    exitAnimation=mainContent.animate([
      {transform:'translateX(0)'},
      {transform:`translateX(${-direction*48}px)`},
    ],{duration:200,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
    exitAnimation.finished.catch(()=>{}).then(()=>location.assign(destination.href));
  });
  window.addEventListener('pageshow',event=>{
    if(!event.persisted)return;
    isLeaving=false;
    exitAnimation?.cancel();
    exitAnimation=undefined;
    enter();
  });
})();
