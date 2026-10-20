function renderHome() {
  const totals = spendingTotals();
  const spent = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
  $('spent').textContent = money(spent);
  $('remaining').textContent = money(data.income - spent);
  drawSpendingChart($('pie'), totals, renderHome);
  $('chart-legend').replaceChildren(...Object.entries(totals).map(([name, amount]) => {
    const item = document.createElement('li');
    const button = document.createElement('button'); button.type = 'button'; button.className = 'legend-button'; button.setAttribute('aria-pressed',String(name === selectedCategory));
    const swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = categories[name];
    const label = document.createElement('span'); label.textContent = `${name} · ${share(amount,spent)}`;
    const value = document.createElement('strong'); value.textContent = money(amount);
    button.append(swatch,label,value); button.addEventListener('click',()=>{ selectedCategory=name; renderHome(); }); item.append(button); return item;
  }));
  const count = purchases().filter((event)=>event.category === selectedCategory).length;
  $('overview-chart-detail').textContent = `${selectedCategory} · ${money(totals[selectedCategory])} · ${share(totals[selectedCategory],spent)} · ${count} ${count === 1 ? 'purchase' : 'purchases'}`;
  $('overview-chart-link').href = `../spending-chart/spending-chart.html?category=${encodeURIComponent(selectedCategory)}`;
  showPurchases('recent-spending', [...purchases()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3));
}

window.BudgetronPage = {render() {renderHome(); renderGoalSummary();}};
render();
