// Render the detailed spending donut, selected-category statistics and related purchases. Uses the shared budget model and helpers loaded first by its HTML page.
// Refresh the chart and purchase statistics for the selected category.
function renderPiePage() {
  const totals = spendingTotals();
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
  drawSpendingChart(getElement('spending-donut'), totals, renderPiePage);
  getElement('chart-total').textContent = formatMoney(total);
  getElement('chart-categories').replaceChildren(...Object.entries(totals).map(([name, amount]) => {
    const button = document.createElement('button'); button.type = 'button'; button.setAttribute('aria-pressed', String(name === selectedCategory));
    const swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = categories[name];
    const label = document.createElement('span'); label.textContent = name;
    const percent = document.createElement('span'); percent.textContent = formatPercentage(amount,total);
    button.append(swatch, label, percent);
    button.addEventListener('click', () => { selectedCategory = name; renderPiePage(); });
    return button;
  }));
  getElement('category-name').textContent = selectedCategory;
  getElement('category-amount').textContent = formatMoney(totals[selectedCategory]);
  getElement('category-share').textContent = `${formatPercentage(totals[selectedCategory],total)} of this month's spending`;
  const items = currentMonthPurchases().filter((event) => event.category === selectedCategory);
  getElement('category-stats').replaceChildren(...[
    ['Purchases',items.length],
    ['Average Purchase',formatMoney(items.length ? Math.round(totals[selectedCategory]/items.length) : 0)],
    ['Largest Purchase',formatMoney(items.length ? Math.max(...items.map((item)=>item.amount)) : 0)],
    ['Share of Income',formatPercentage(totals[selectedCategory],budgetData.income)],
  ].map(([label,value])=>{ const row=document.createElement('div'); row.className='stat-line'; const name=document.createElement('span');name.textContent=label;const amount=document.createElement('strong');amount.textContent=value;row.append(name,amount);return row; }));
  showPurchases('category-purchases', items);
}

window.BudgetronPage = {render:renderPiePage};
render();
