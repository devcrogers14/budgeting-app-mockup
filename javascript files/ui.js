function save(message) {
  try { localStorage.setItem(storageKey, JSON.stringify(data)); }
  catch { message += ' Browser storage is unavailable; changes last until you close this page.'; }
  render();
  $('status').textContent = message;
}

function dollars(id) { return Math.round(Number($(id).value) * 100); }

function render() { window.BudgetronPage?.render(); }

document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => {
  if (button.dataset.open === 'goal-dialog') {
    const adding = button.dataset.goalMode === 'add'; $('goal-dialog').dataset.mode = adding ? 'add' : 'edit';
    $('goal-input-name').value = adding ? '' : data.goal.name; $('goal-target').value = adding ? 1000 : data.goal.target / 100;
    if ($('goal-date')) $('goal-date').value = adding ? '' : data.goal.dueDate || '';
    if ($('goal-account')) $('goal-account').value = adding ? '' : data.goal.accountId || '';
  }
  if (button.dataset.open === 'payment-dialog') $('payment-date').value = isoDate(today);
  $(button.dataset.open).showModal();
}));
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));

$('reset-demo')?.addEventListener('click', () => {
  if (!confirm('Reset your demo changes to the sample account?')) return;
  data = sampleData();
  initializeGoals(); window.BudgetronPage?.reset?.();
  if ($('allocation-error')) $('allocation-error').textContent = '';
  if ($('transfer-error')) $('transfer-error').textContent = '';
  save('Demo reset.');
});
