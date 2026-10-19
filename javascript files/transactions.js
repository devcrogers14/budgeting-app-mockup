function transactionActions(record) {
  const actions = document.createElement('div'); actions.className = 'transaction-actions';
  if (!record.id || !data.events.some((item) => item.id === record.id)) return actions;
  const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'text-button'; edit.textContent = 'Edit'; edit.setAttribute('aria-label', `Edit ${record.name}`);
  edit.addEventListener('click', () => openTransactionEditor(record.id));
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'text-button delete-transaction'; remove.textContent = 'Delete'; remove.setAttribute('aria-label', `Delete ${record.name}`);
  remove.addEventListener('click', () => {
    if (!confirm(`Delete "${record.name}"? It will be removed from the calendar and spending charts.`)) return;
    data.events = data.events.filter((item) => item.id !== record.id);
    save('Transaction deleted. Calendar and spending totals updated.');
  });
  actions.append(edit, remove); return actions;
}

function openTransactionEditor(id) {
  let dialog = $('transaction-editor');
  if (!dialog) {
    dialog = document.createElement('dialog'); dialog.id = 'transaction-editor'; dialog.setAttribute('aria-labelledby', 'transaction-editor-title');
    dialog.innerHTML = `<form id="transaction-edit-form"><h2 id="transaction-editor-title">Edit Transaction</h2>
      <label>Description<input id="tx-name" maxlength="60" required></label>
      <label>Amount ($)<input id="tx-amount" type="number" min="0.01" max="1000000000" step="0.01" required></label>
      <label>Date<input id="tx-date" type="date" required></label>
      <label>Type<select id="tx-kind"><option value="purchase">Purchase</option><option value="planned">Planned Payment</option></select></label>
      <label>Category<select id="tx-category"><option>Home</option><option>Food</option><option>Transport</option><option>Other</option></select></label>
      <p class="small">Only purchases count toward spending. Editing a transaction does not move money between accounts.</p>
      <div class="button-row"><button type="button" class="secondary" id="tx-cancel">Cancel</button><button type="submit">Save Changes</button></div></form>`;
    document.body.append(dialog);
    $('tx-cancel').addEventListener('click', () => dialog.close());
    $('tx-name').addEventListener('input', () => $('tx-name').setCustomValidity(''));
    $('transaction-edit-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const name = $('tx-name').value.trim();
      if (!name) { $('tx-name').setCustomValidity('Enter a description.'); $('tx-name').reportValidity(); return; }
      const amount = Math.round(Number($('tx-amount').value) * 100);
      if (!Number.isSafeInteger(amount) || amount <= 0) return;
      const current = data.events.find((item) => item.id === dialog.dataset.transactionId);
      if (!current) { dialog.close(); return; }
      Object.assign(current, {name, amount, date:$('tx-date').value, kind:$('tx-kind').value, category:$('tx-category').value});
      window.BudgetronPage?.transactionChanged?.(current);
      dialog.close(); save('Transaction updated. Calendar and spending totals updated.');
    });
  }
  const record = data.events.find((item) => item.id === id); if (!record) return;
  dialog.dataset.transactionId = id;
  $('tx-name').setCustomValidity(''); $('tx-name').value = record.name;
  $('tx-amount').value = (record.amount/100).toFixed(2); $('tx-date').value = record.date;
  $('tx-kind').value = record.kind; $('tx-category').value = record.category;
  dialog.showModal();
}

function showPurchases(id, items) {
  if (!$(id)) return;
  $(id).replaceChildren(...[...items].sort((a, b) => b.date.localeCompare(a.date)).map((event) => {
    const item = document.createElement('li'); const title = document.createElement('div'); title.className = 'payment-title';
    const name = document.createElement('span'); name.textContent = event.name;
    const amount = document.createElement('span'); amount.textContent = money(event.amount); title.append(name, amount);
    const detail = document.createElement('small'); detail.textContent = `${event.date} · ${event.category}`;
    item.append(title, detail, transactionActions(event)); return item;
  }));
  if (!items.length) { const item = document.createElement('li'); item.textContent = 'No purchases here this month.'; $(id).append(item); }
}
