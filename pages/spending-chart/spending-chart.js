function renderPiePage() {
  const totals = spendingTotals();
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
  drawSpendingChart($('spending-donut'), totals, renderPiePage);
  $('chart-total').textContent = money(total);
  $('chart-categories').replaceChildren(...Object.entries(totals).map(([name, amount]) => {
    const button = document.createElement('button'); button.type = 'button'; button.setAttribute('aria-pressed', String(name === selectedCategory));
    const swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = categories[name];
    const label = document.createElement('span'); label.textContent = name;
    const percent = document.createElement('span'); percent.textContent = share(amount,total);
    button.append(swatch, label, percent);
    button.addEventListener('click', () => { selectedCategory = name; renderPiePage(); });
    return button;
  }));
  $('category-name').textContent = selectedCategory;
  $('category-amount').textContent = money(totals[selectedCategory]);
  $('category-share').textContent = `${share(totals[selectedCategory],total)} of this month's spending`;
  const items = purchases().filter((event) => event.category === selectedCategory);
  $('category-stats').replaceChildren(...[
    ['Purchases',items.length],
    ['Average Purchase',money(items.length ? Math.round(totals[selectedCategory]/items.length) : 0)],
    ['Largest Purchase',money(items.length ? Math.max(...items.map((item)=>item.amount)) : 0)],
    ['Share of Income',share(totals[selectedCategory],data.income)],
  ].map(([label,value])=>{ const row=document.createElement('div'); row.className='stat-line'; const name=document.createElement('span');name.textContent=label;const amount=document.createElement('strong');amount.textContent=value;row.append(name,amount);return row; }));
  showPurchases('category-purchases', items);
}

window.BudgetronPage = {render:renderPiePage};
render();
