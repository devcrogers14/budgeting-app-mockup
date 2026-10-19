// Native page transitions keep the sidebar in place; local files use a slide fallback.
(() => {
  const main=document.querySelector('main');
  const nav=document.querySelector('nav');
  if(!main || !nav)return;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const key='budgetron-page-transition';
  const nativeTransitions=location.protocol!=='file:' && 'onpagereveal' in window && CSS.supports('view-transition-name','budget-page');
  let leaving=false;
  let exitAnimation;

  function enter(){
    let saved;
    try{
      saved=JSON.parse(sessionStorage.getItem(key));
      if(!saved || saved.target!==location.href || Date.now()-saved.time>10000)return;
      sessionStorage.removeItem(key);
    }catch{return;}
    document.documentElement.style.setProperty('--page-direction',saved.direction===-1?'-1':'1');
    if(reducedMotion.matches || nativeTransitions || !main.animate)return;
    main.animate([
      {opacity:0,transform:`translateX(${saved.direction*64}px)`},
      {opacity:1,transform:'translateX(0)'},
    ],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  enter();

  nav.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download'))return;
    const destination=new URL(link.href);
    const current=new URL(location.href);
    if(destination.protocol!==current.protocol || destination.host!==current.host)return;
    if(destination.href===current.href){event.preventDefault();return;}
    if(reducedMotion.matches)return;
    if(leaving){event.preventDefault();return;}
    const links=[...nav.querySelectorAll('a')];
    const direction=links.indexOf(link)>=links.indexOf(nav.querySelector('[aria-current="page"]'))?1:-1;
    document.documentElement.style.setProperty('--page-direction',String(direction));
    try{sessionStorage.setItem(key,JSON.stringify({target:destination.href,direction,time:Date.now()}));}catch{}
    // Let the browser take snapshots of both documents for a continuous transition.
    if(nativeTransitions)return;
    if(!main.animate)return;
    event.preventDefault();
    leaving=true;
    exitAnimation=main.animate([
      {opacity:1,transform:'translateX(0)'},
      {opacity:0,transform:`translateX(${-direction*48}px)`},
    ],{duration:200,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
    exitAnimation.finished.catch(()=>{}).then(()=>location.assign(destination.href));
  });
  window.addEventListener('pageshow',event=>{
    if(!event.persisted)return;
    leaving=false;
    exitAnimation?.cancel();
    exitAnimation=undefined;
    enter();
  });
})();
