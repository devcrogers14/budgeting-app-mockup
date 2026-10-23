// Render demo bank cards and allocations; validate and simulate transfers between pretend accounts. Uses the shared budget model and helpers loaded first by its HTML page.
// Refresh bank cards, allocation rows and transfer controls from current account data.
function renderAccounts() {
  getElement('account-rows').replaceChildren(...budgetData.accounts.map((account) => {
    const row = document.createElement('tr');
    const name = document.createElement('td'); name.textContent = account.bank;
    const type = document.createElement('small'); type.textContent = typeNames[account.type]; name.append(type);
    const balance = document.createElement('td'); balance.textContent = formatMoney(account.balance);
    const cell = document.createElement('td'); const input = document.createElement('input');
    Object.assign(input, { type: 'number', min: '0', max: '3000', step: '0.01', required: true, value: (account.allocation / 100).toFixed(2) });
    input.dataset.account = account.id; input.setAttribute('aria-label', `${account.bank} ${account.type} monthly allocation`);
    cell.append(input); row.append(name, balance, cell); return row;
  }));
  updateAllocationTotal();
  for (const id of ['transfer-from', 'transfer-to']) {
    getElement(id).replaceChildren(...budgetData.accounts.filter((account) => id === 'transfer-to' || account.type !== 'credit').map((account) => new Option(`${account.bank} · ${account.type === 'credit' ? 'Credit card' : typeNames[account.type]}`, account.id)));
  }
  getElement('transfer-from').value = budgetData.transfer?.from || 'checking';
  getElement('transfer-to').value = budgetData.transfer?.to || 'savings';
  getElement('transfer-amount').value = (budgetData.transfer?.amount || 10000) / 100;
  getElement('transfer-date').value = budgetData.transfer?.date || isoDate(today);
  getElement('transfer-enabled').checked = budgetData.transfer?.repeat ?? true;
  getElement('run-transfer').disabled = !budgetData.transfer;
  getElement('transfer-status').textContent = budgetData.transfer ? `${budgetData.transfer.repeat ? 'Monthly' : 'One-time'} demo rule: ${formatMoney(budgetData.transfer.amount)}. Next: ${budgetData.transfer.date}. No real money moves.` : 'No transfer rule saved.';
  if (getElement('bank-cards')) {
    getElement('bank-cards').replaceChildren(...budgetData.accounts.map((account, index) => {
      const card = document.createElement('button'); card.type = 'button'; card.className = 'bank-card';
      card.dataset.accountId = account.id;
      card.setAttribute('aria-label', `${account.bank} ${typeNames[account.type]} demo card`);
      const bank = document.createElement('strong'); bank.textContent = account.bank;
      const type = document.createElement('small'); type.textContent = typeNames[account.type];
      const number = document.createElement('span'); number.className = 'card-number'; number.textContent = `••••  ••••  DEMO ${index + 1}`;
      const balance = document.createElement('span'); balance.className = 'card-balance'; balance.textContent = formatMoney(account.balance);
      card.append(bank, type, number, balance);
      card.setAttribute('aria-pressed', String(budgetData.selectedAccountId === account.id));
      card.addEventListener('click', () => {
        const focused = document.activeElement === card;
        budgetData.selectedAccountId = account.id; save(`${account.bank} card selected.`);
        if (focused) [...getElement('bank-cards').children].find((item) => item.dataset.accountId === account.id)?.focus({preventScroll:true});
      });
      return card;
    }));
    const account = budgetData.accounts.find((account) => account.id === budgetData.selectedAccountId) || budgetData.accounts[0];
    getElement('selected-card-info').textContent = `${account.bank}: ${formatMoney(account.balance)} ${account.type === 'credit' ? 'owed' : 'balance'} · ${formatMoney(account.allocation)} monthly allocation.`;
  }
}

// Preview allocations without saving them or changing account balances.

function updateAllocationTotal() {
  const total = [...getElement('account-rows').querySelectorAll('input')].reduce((sum, input) => sum + Math.round(Number(input.value) * 100), 0);
  getElement('allocation-total').textContent = `${formatMoney(total)} allocated · ${formatMoney(budgetData.income - total)} unallocated`;
}

getElement('allocation-form')?.addEventListener('input', updateAllocationTotal);
getElement('allocation-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const inputs = [...getElement('account-rows').querySelectorAll('input')];
  const amounts = inputs.map((input) => Math.round(Number(input.value) * 100));
  if (amounts.some((value) => !Number.isFinite(value) || value < 0) || amounts.reduce((a, b) => a + b, 0) > budgetData.income) { getElement('allocation-error').textContent = 'Keep total allocations at or below your $3,000 income.'; return; }
  inputs.forEach((input, index) => { budgetData.accounts.find((account) => account.id === input.dataset.account).allocation = amounts[index]; });
  getElement('allocation-error').textContent = ''; save('Monthly allocations saved.');
});
getElement('account-form')?.addEventListener('submit', (event) => {
  event.preventDefault(); const bank = getElement('bank-name').value.trim();
  if (!bank) { getElement('bank-name').setCustomValidity('Enter a bank name.'); getElement('bank-name').reportValidity(); return; }
  budgetData.accounts.push({ id: newId(), bank, type: getElement('account-type').value, balance: readAmountInCents('account-balance'), allocation: 0 });
  getElement('account-dialog').close(); event.target.reset(); save('Demo account connected.');
});
getElement('bank-name')?.addEventListener('input', () => getElement('bank-name').setCustomValidity(''));
getElement('transfer-form')?.addEventListener('submit', (event) => {
  event.preventDefault(); getElement('transfer-error').textContent = '';
  if (getElement('transfer-from').value === getElement('transfer-to').value) { getElement('transfer-error').textContent = 'Choose two different accounts.'; return; }
  budgetData.transfer = { from: getElement('transfer-from').value, to: getElement('transfer-to').value, amount: readAmountInCents('transfer-amount'), date: getElement('transfer-date').value, repeat: getElement('transfer-enabled').checked };
  save('Demo transfer rule saved.');
});
getElement('run-transfer')?.addEventListener('click', () => {
  const transferRule = budgetData.transfer; if (!transferRule) return;
  const sourceAccount = budgetData.accounts.find((account) => account.id === transferRule.from);
  const destinationAccount = budgetData.accounts.find((account) => account.id === transferRule.to);
  getElement('transfer-error').textContent = '';
  if (sourceAccount.balance < transferRule.amount) { getElement('transfer-error').textContent = 'Not enough demo money in the source account.'; return; }
  if (destinationAccount.type === 'credit' && destinationAccount.balance < transferRule.amount) { getElement('transfer-error').textContent = 'This payment is more than the credit card amount owed.'; return; }
  sourceAccount.balance -= transferRule.amount; destinationAccount.balance += destinationAccount.type === 'credit' ? -transferRule.amount : transferRule.amount;
  if (transferRule.repeat) {
    const [year, month, day] = transferRule.date.split('-').map(Number);
    // Clamp to the last day when the next month is shorter.
    const lastDay = new Date(year, month + 1, 0).getDate();
    transferRule.date = isoDate(new Date(year, month, Math.min(day, lastDay)));
  } else budgetData.transfer = null;
  save('Demo transfer completed. Mock balances updated; no real money moved.');
});

window.BudgetronPage = {render:renderAccounts};
render();
