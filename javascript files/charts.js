function drawSpendingChart(svg, totals, onSelect) {
  const ns = 'http://www.w3.org/2000/svg';
  const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
  svg.replaceChildren();
  svg.setAttribute('aria-label', `Spending by category. ${Object.entries(totals).map(([name, amount]) => `${name}: ${money(amount)}, ${share(amount, total)}`).join('. ')}`);
  const element = (tag, attributes) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };
  const point = (radius, angle) => [220 + radius * Math.cos(angle), 200 + radius * Math.sin(angle)];
  svg.append(element('circle', {cx:220, cy:200, r:108, fill:'none', stroke:'var(--subtle)', 'stroke-width':44}));
  let angle = -Math.PI / 2;
  const labels = [];
  let liftedPiece = null;
  Object.entries(totals).forEach(([name, amount]) => {
    if (!amount || !total) return;
    const sweep = amount / total * Math.PI * 2;
    const gap = Math.min(0.025, sweep / 10);
    const start = angle + gap / 2, end = angle + sweep - gap / 2, middle = angle + sweep / 2;
    const selected = name === selectedCategory;
    const liftX = Math.cos(middle) * 12;
    const liftY = Math.sin(middle) * 12 - 16;
    const outer = 129, inner = 86;
    const a = point(outer, start), b = point(outer, end), c = point(inner, end), d = point(inner, start);
    const large = end - start > Math.PI ? 1 : 0;
    const path = element('path', {
      d:`M ${a} A ${outer} ${outer} 0 ${large} 1 ${b} L ${c} A ${inner} ${inner} 0 ${large} 0 ${d} Z`,
      fill:categories[name], class:'chart-slice', role:'button', tabindex:0,
      'data-category':name, 'aria-pressed':String(name === selectedCategory),
      'aria-label':`${name}: ${money(amount)}, ${share(amount, total)}`,
    });
    const title = element('title', {}); title.textContent = `${name} · ${share(amount, total)} · ${money(amount)}`; path.append(title);
    const layer = element('g', {class:'slice-layer'});
    const piece = element('g', {class:`slice-piece${selected ? ' is-selected' : ''}`});
    piece.style.setProperty('--lift-x', `${liftX}px`);
    piece.style.setProperty('--lift-y', `${liftY}px`);
    piece.style.setProperty('--slice-color', categories[name]);
    // A stationary hit area prevents hover flicker when the visible slice lifts.
    layer.append(element('path', {d:path.getAttribute('d'), fill:'transparent', class:'slice-hit', 'aria-hidden':'true'}),piece);
    piece.append(element('path', {d:path.getAttribute('d'), fill:categories[name], class:'slice-halo', 'aria-hidden':'true'}));
    layer.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') piece.classList.add('is-hovered');
    });
    layer.addEventListener('pointerleave', () => piece.classList.remove('is-hovered'));
    const activate = () => {
      const focused = document.activeElement === path;
      selectedCategory = name; onSelect();
      if (focused) svg.querySelector(`[data-category="${name}"]`)?.focus();
    };
    layer.addEventListener('click', activate);
    path.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
    });
    piece.append(path);
    if (selected) liftedPiece = layer;
    else svg.append(layer);
    const right = Math.cos(middle) >= 0;
    labels.push({name, amount, right, middle, liftX:selected ? liftX : 0, liftY:selected ? liftY : 0, y:point(155,middle)[1]});
    if (amount / total >= 0.09) {
      const location = point(107,middle);
      const percent = element('text', {x:location[0], y:location[1], class:'slice-percent', 'text-anchor':'middle', 'dominant-baseline':'middle', fill:name === 'Food' || name === 'Transport' ? '#263e10' : '#fff', 'aria-hidden':'true'});
      percent.textContent = share(amount,total); piece.append(percent);
    }
    angle += sweep;
  });
  // Paint the raised slice last so its glow and shadow sit above the other slices.
  if (liftedPiece) svg.append(liftedPiece);
  // Keep labels for small adjacent slices apart, with leader lines to their slice.
  for (const right of [false, true]) {
    const side = labels.filter((label) => label.right === right).sort((a,b) => a.y - b.y);
    side.forEach((label,index) => { label.y = Math.max(30, label.y, index ? side[index-1].y + 40 : 30); });
    for (let index = side.length-1; index >= 0; index--) side[index].y = Math.min(side[index].y, index === side.length-1 ? 365 : side[index+1].y - 40);
    side.forEach((label) => {
      const edge = point(138,label.middle).map((value,index)=>value+(index ? label.liftY : label.liftX)), x = right ? 357 : 83;
      svg.append(element('polyline', {points:`${edge} ${right ? 345 : 95},${label.y} ${right ? 353 : 87},${label.y}`, fill:'none', stroke:'var(--input-border)', 'stroke-width':1.3, 'aria-hidden':'true'}));
      const text = element('text', {x, y:label.y-3, class:'chart-label', 'text-anchor':right ? 'start' : 'end', 'aria-hidden':'true'});
      const name = element('tspan', {x, dy:0}); name.textContent = label.name;
      const percent = element('tspan', {x, dy:18, class:'chart-label-percent'}); percent.textContent = share(label.amount,total);
      text.append(name,percent); svg.append(text);
    });
  }
}
