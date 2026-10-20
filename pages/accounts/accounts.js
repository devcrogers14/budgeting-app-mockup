function renderAccounts() {
  $('account-rows').replaceChildren(...data.accounts.map((account) => {
    const row = document.createElement('tr');
    const name = document.createElement('td'); name.textContent = account.bank;
    const type = document.createElement('small'); type.textContent = typeNames[account.type]; name.append(type);
    const balance = document.createElement('td'); balance.textContent = money(account.balance);
    const cell = document.createElement('td'); const input = document.createElement('input');
    Object.assign(input, { type: 'number', min: '0', max: '3000', step: '0.01', required: true, value: (account.allocation / 100).toFixed(2) });
    input.dataset.account = account.id; input.setAttribute('aria-label', `${account.bank} ${account.type} monthly allocation`);
    cell.append(input); row.append(name, balance, cell); return row;
  }));
  updateAllocationTotal();
  for (const id of ['transfer-from', 'transfer-to']) {
    $(id).replaceChildren(...data.accounts.filter((account) => id === 'transfer-to' || account.type !== 'credit').map((account) => new Option(`${account.bank} · ${account.type === 'credit' ? 'Credit card' : typeNames[account.type]}`, account.id)));
  }
  $('transfer-from').value = data.transfer?.from || 'checking';
  $('transfer-to').value = data.transfer?.to || 'savings';
  $('transfer-amount').value = (data.transfer?.amount || 10000) / 100;
  $('transfer-date').value = data.transfer?.date || isoDate(today);
  $('transfer-enabled').checked = data.transfer?.repeat ?? true;
  $('run-transfer').disabled = !data.transfer;
  $('transfer-status').textContent = data.transfer ? `${data.transfer.repeat ? 'Monthly' : 'One-time'} demo rule: ${money(data.transfer.amount)}. Next: ${data.transfer.date}. No real money moves.` : 'No transfer rule saved.';
  if ($('bank-cards')) {
    $('bank-cards').replaceChildren(...data.accounts.map((account, index) => {
      const card = document.createElement('button'); card.type = 'button'; card.className = 'bank-card';
      card.dataset.accountId = account.id;
      card.setAttribute('aria-label', `${account.bank} ${typeNames[account.type]} demo card`);
      const bank = document.createElement('strong'); bank.textContent = account.bank;
      const type = document.createElement('small'); type.textContent = typeNames[account.type];
      const number = document.createElement('span'); number.className = 'card-number'; number.textContent = `••••  ••••  DEMO ${index + 1}`;
      const balance = document.createElement('span'); balance.className = 'card-balance'; balance.textContent = money(account.balance);
      card.append(bank, type, number, balance);
      card.setAttribute('aria-pressed', String(data.selectedAccountId === account.id));
      card.addEventListener('click', () => {
        const focused = document.activeElement === card;
        data.selectedAccountId = account.id; save(`${account.bank} card selected.`);
        if (focused) [...$('bank-cards').children].find((item) => item.dataset.accountId === account.id)?.focus({preventScroll:true});
      });
      return card;
    }));
    const account = data.accounts.find((account) => account.id === data.selectedAccountId) || data.accounts[0];
    $('selected-card-info').textContent = `${account.bank}: ${money(account.balance)} ${account.type === 'credit' ? 'owed' : 'balance'} · ${money(account.allocation)} monthly allocation.`;
  }
}

function updateAllocationTotal() {
  const total = [...$('account-rows').querySelectorAll('input')].reduce((sum, input) => sum + Math.round(Number(input.value) * 100), 0);
  $('allocation-total').textContent = `${money(total)} allocated · ${money(data.income - total)} unallocated`;
}

$('allocation-form')?.addEventListener('input', updateAllocationTotal);
$('allocation-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const inputs = [...$('account-rows').querySelectorAll('input')];
  const amounts = inputs.map((input) => Math.round(Number(input.value) * 100));
  if (amounts.some((value) => !Number.isFinite(value) || value < 0) || amounts.reduce((a, b) => a + b, 0) > data.income) { $('allocation-error').textContent = 'Keep total allocations at or below your $3,000 income.'; return; }
  inputs.forEach((input, index) => { data.accounts.find((account) => account.id === input.dataset.account).allocation = amounts[index]; });
  $('allocation-error').textContent = ''; save('Monthly allocations saved.');
});
$('account-form')?.addEventListener('submit', (event) => {
  event.preventDefault(); const bank = $('bank-name').value.trim();
  if (!bank) { $('bank-name').setCustomValidity('Enter a bank name.'); $('bank-name').reportValidity(); return; }
  data.accounts.push({ id: newId(), bank, type: $('account-type').value, balance: dollars('account-balance'), allocation: 0 });
  $('account-dialog').close(); event.target.reset(); save('Demo account connected.');
});
$('bank-name')?.addEventListener('input', () => $('bank-name').setCustomValidity(''));
$('transfer-form')?.addEventListener('submit', (event) => {
  event.preventDefault(); $('transfer-error').textContent = '';
  if ($('transfer-from').value === $('transfer-to').value) { $('transfer-error').textContent = 'Choose two different accounts.'; return; }
  data.transfer = { from: $('transfer-from').value, to: $('transfer-to').value, amount: dollars('transfer-amount'), date: $('transfer-date').value, repeat: $('transfer-enabled').checked };
  save('Demo transfer rule saved.');
});
$('run-transfer')?.addEventListener('click', () => {
  const rule = data.transfer; if (!rule) return;
  const from = data.accounts.find((account) => account.id === rule.from);
  const to = data.accounts.find((account) => account.id === rule.to);
  $('transfer-error').textContent = '';
  if (from.balance < rule.amount) { $('transfer-error').textContent = 'Not enough demo money in the source account.'; return; }
  if (to.type === 'credit' && to.balance < rule.amount) { $('transfer-error').textContent = 'This payment is more than the credit card amount owed.'; return; }
  from.balance -= rule.amount; to.balance += to.type === 'credit' ? -rule.amount : rule.amount;
  if (rule.repeat) {
    const [year, month, day] = rule.date.split('-').map(Number);
    // Clamp to the last day when the next month is shorter.
    const lastDay = new Date(year, month + 1, 0).getDate();
    rule.date = isoDate(new Date(year, month, Math.min(day, lastDay)));
  } else data.transfer = null;
  save('Demo transfer completed. Mock balances updated; no real money moved.');
});

window.BudgetronPage = {render:renderAccounts};
render();
