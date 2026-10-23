// Render monthly spending, remaining income, a category donut and the selected savings goal. Uses the shared budget model and helpers loaded first by its HTML page.
// Refresh Home totals, donut selection and the three most recent purchases.
function renderHome() {
  const totals = spendingTotals();
  const spent = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
  getElement('spent').textContent = formatMoney(spent);
  getElement('remaining').textContent = formatMoney(budgetData.income - spent);
  drawSpendingChart(getElement('pie'), totals, renderHome);
  getElement('chart-legend').replaceChildren(...Object.entries(totals).map(([name, amount]) => {
    const item = document.createElement('li');
    const button = document.createElement('button'); button.type = 'button'; button.className = 'legend-button'; button.setAttribute('aria-pressed',String(name === selectedCategory));
    const swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = categories[name];
    const label = document.createElement('span'); label.textContent = `${name} · ${formatPercentage(amount,spent)}`;
    const value = document.createElement('strong'); value.textContent = formatMoney(amount);
    button.append(swatch,label,value); button.addEventListener('click',()=>{ selectedCategory=name; renderHome(); }); item.append(button); return item;
  }));
  const count = currentMonthPurchases().filter((event)=>event.category === selectedCategory).length;
  getElement('overview-chart-detail').textContent = `${selectedCategory} · ${formatMoney(totals[selectedCategory])} · ${formatPercentage(totals[selectedCategory],spent)} · ${count} ${count === 1 ? 'purchase' : 'purchases'}`;
  getElement('overview-chart-link').href = `../spending-chart/spending-chart.html?category=${encodeURIComponent(selectedCategory)}`;
  showPurchases('recent-spending', [...currentMonthPurchases()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3));
}

window.BudgetronPage = {render() {renderHome(); renderGoalSummary();}};
render();
