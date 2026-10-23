// Shared interface actions: save the budget, refresh the current page, open/close dialogs and reset demo data. Each page registers its render function as window.BudgetronPage.
// Persist the budget, rerender the active page and announce the result in the status message.
function save(message) {
  try { localStorage.setItem(storageKey, JSON.stringify(budgetData)); }
  catch { message += ' Browser storage is unavailable; changes last until you close this page.'; }
  render();
  getElement('status').textContent = message;
}

// Read a dollar input and round it to integer cents before storing it.

function readAmountInCents(id) { return Math.round(Number(getElement(id).value) * 100); }

// Call the current page renderer if the page has registered one.

function render() { window.BudgetronPage?.render(); }

document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => {
  if (button.dataset.open === 'goal-dialog') {
    const adding = button.dataset.goalMode === 'add' || !budgetData.goal; getElement('goal-dialog').dataset.mode = adding ? 'add' : 'edit';
    getElement('goal-input-name').value = adding ? '' : budgetData.goal.name; getElement('goal-target').value = adding ? 1000 : budgetData.goal.target / 100;
    if (getElement('goal-date')) getElement('goal-date').value = adding ? '' : budgetData.goal.dueDate || '';
    if (getElement('goal-account')) getElement('goal-account').value = adding ? '' : budgetData.goal.accountId || '';
  }
  if (button.dataset.open === 'payment-dialog') getElement('payment-date').value = isoDate(today);
  getElement(button.dataset.open).showModal();
}));
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));

getElement('reset-demo')?.addEventListener('click', () => {
  if (!confirm('Reset your demo changes to the sample account?')) return;
  budgetData = sampleData();
  initializeGoals(); window.BudgetronPage?.reset?.();
  if (getElement('allocation-error')) getElement('allocation-error').textContent = '';
  if (getElement('transfer-error')) getElement('transfer-error').textContent = '';
  save('Demo reset.');
});
