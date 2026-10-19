function renderSpendingPage() {
  const totals = spendingTotals(); const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
  $('spending-total').textContent = money(total); $('spending-left').textContent = money(data.income - total);
  $('spending-breakdown').replaceChildren(...Object.entries(totals).map(([name, amount]) => {
    const row = document.createElement('div'); row.className = 'stat-line';
    const label = document.createElement('span'); label.textContent = name;
    const value = document.createElement('strong'); value.textContent = money(amount); row.append(label, value); return row;
  }));
  const [largest, amount] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  $('spending-tip').textContent = total ? `${largest} is your largest spending category at ${money(amount)}. ${data.income >= total ? `You have ${money(data.income - total)} of this month's income left after recorded purchases.` : `Recorded purchases exceed your monthly income by ${money(total - data.income)}.`}` : 'No purchases recorded this month. Log a purchase from the Calendar page to get started.';
  showPurchases('all-spending', purchases());
}

window.BudgetronPage = {render:renderSpendingPage};
render();
