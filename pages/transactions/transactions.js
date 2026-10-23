// Render current-month purchases/planned payments and show spending totals and category comparisons. Uses the shared budget model and helpers loaded first by its HTML page.
// Show spending totals and all current-month transactions, including planned payments.
function renderTransactionsPage() {
  const totals = spendingTotals(); const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
  getElement('spending-total').textContent = formatMoney(total); getElement('spending-left').textContent = formatMoney(budgetData.income - total);
  getElement('spending-breakdown').replaceChildren(...Object.entries(totals).map(([name, amount]) => {
    const row = document.createElement('div'); row.className = 'stat-line';
    const label = document.createElement('span'); label.textContent = name;
    const value = document.createElement('strong'); value.textContent = formatMoney(amount); row.append(label, value); return row;
  }));
  const [largest, amount] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  getElement('spending-tip').textContent = total ? `${largest} is your largest spending category at ${formatMoney(amount)}. ${budgetData.income >= total ? `You have ${formatMoney(budgetData.income - total)} of this month's income left after recorded purchases.` : `Recorded purchases exceed your monthly income by ${formatMoney(total - budgetData.income)}.`}` : 'No purchases recorded this month. Log a purchase from the Calendar page to get started.';
  showPurchases('all-spending', budgetData.events.filter(event=>event.date.startsWith(currentMonth)));
}

window.BudgetronPage = {render:renderTransactionsPage};
render();
