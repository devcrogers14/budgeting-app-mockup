// All amounts are stored in cents. This is a browser-only demo.
const $ = (id) => document.getElementById(id);
const money = (cents) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = new Date();
const currentMonth = isoDate(today).slice(0, 7);
const categories = { Home: 'var(--chart-1)', Food: 'var(--chart-2)', Transport: 'var(--chart-3)', Other: 'var(--chart-4)' };
const typeNames = { checking: 'Checking', savings: 'Savings', credit: 'Credit card · amount owed' };
const storageKey = 'insert-name-budget-v1';
const newId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = null;
let selectedCategory = 'Home';
const requestedCategory = new URLSearchParams(location.search).get('category');
if (Object.hasOwn(categories, requestedCategory)) selectedCategory = requestedCategory;
const share = (amount, total) => `${(total ? amount / total * 100 : 0).toFixed(1)}%`;

// Both charts share the same clickable, keyboard-accessible slices and labels.
function drawSpendingChart(svg, totals, onSelect) {
  const ns = 'http://www.w3.org/2000/svg';
  const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
  svg.replaceChildren();
  svg.setAttribute('aria-label', `Spending by category. ${Object.entries(totals).map(([name, amount]) => `${name}: ${money(amount)}, ${share(amount, total)}`).join('. ')}`);
  const element = (tag, attributes) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };
  const point = (radius, angle) => [220 + radius * Math.cos(angle), 200 + radius * Math.sin(angle)];
  svg.append(element('circle', {cx:220, cy:200, r:108, fill:'none', stroke:'var(--subtle)', 'stroke-width':44}));
  let angle = -Math.PI / 2;
  const labels = [];
  let liftedPiece = null;
  Object.entries(totals).forEach(([name, amount]) => {
    if (!amount || !total) return;
    const sweep = amount / total * Math.PI * 2;
    const gap = Math.min(0.025, sweep / 10);
    const start = angle + gap / 2, end = angle + sweep - gap / 2, middle = angle + sweep / 2;
    const selected = name === selectedCategory;
    const liftX = Math.cos(middle) * 12;
    const liftY = Math.sin(middle) * 12 - 16;
    const outer = 129, inner = 86;
    const a = point(outer, start), b = point(outer, end), c = point(inner, end), d = point(inner, start);
    const large = end - start > Math.PI ? 1 : 0;
    const path = element('path', {
      d:`M ${a} A ${outer} ${outer} 0 ${large} 1 ${b} L ${c} A ${inner} ${inner} 0 ${large} 0 ${d} Z`,
      fill:categories[name], class:'chart-slice', role:'button', tabindex:0,
      'data-category':name, 'aria-pressed':String(name === selectedCategory),
      'aria-label':`${name}: ${money(amount)}, ${share(amount, total)}`,
    });
    const title = element('title', {}); title.textContent = `${name} · ${share(amount, total)} · ${money(amount)}`; path.append(title);
    const layer = element('g', {class:'slice-layer'});
    const piece = element('g', {class:`slice-piece${selected ? ' is-selected' : ''}`});
    piece.style.setProperty('--lift-x', `${liftX}px`);
    piece.style.setProperty('--lift-y', `${liftY}px`);
    piece.style.setProperty('--slice-color', categories[name]);
    // A stationary hit area prevents hover flicker when the visible slice lifts.
    layer.append(element('path', {d:path.getAttribute('d'), fill:'transparent', class:'slice-hit', 'aria-hidden':'true'}),piece);
    piece.append(element('path', {d:path.getAttribute('d'), fill:categories[name], class:'slice-halo', 'aria-hidden':'true'}));
    layer.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') piece.classList.add('is-hovered');
    });
    layer.addEventListener('pointerleave', () => piece.classList.remove('is-hovered'));
    const activate = () => {
      const focused = document.activeElement === path;
      selectedCategory = name; onSelect();
      if (focused) svg.querySelector(`[data-category="${name}"]`)?.focus();
    };
    layer.addEventListener('click', activate);
    path.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
    });
    piece.append(path);
    if (selected) liftedPiece = layer;
    else svg.append(layer);
    const right = Math.cos(middle) >= 0;
    labels.push({name, amount, right, middle, liftX:selected ? liftX : 0, liftY:selected ? liftY : 0, y:point(155,middle)[1]});
    if (amount / total >= 0.09) {
      const location = point(107,middle);
      const percent = element('text', {x:location[0], y:location[1], class:'slice-percent', 'text-anchor':'middle', 'dominant-baseline':'middle', fill:name === 'Food' || name === 'Transport' ? '#263e10' : '#fff', 'aria-hidden':'true'});
      percent.textContent = share(amount,total); piece.append(percent);
    }
    angle += sweep;
  });
  // Paint the raised slice last so its glow and shadow sit above the other slices.
  if (liftedPiece) svg.append(liftedPiece);
  // Keep labels for small adjacent slices apart, with leader lines to their slice.
  for (const right of [false, true]) {
    const side = labels.filter((label) => label.right === right).sort((a,b) => a.y - b.y);
    side.forEach((label,index) => { label.y = Math.max(30, label.y, index ? side[index-1].y + 40 : 30); });
    for (let index = side.length-1; index >= 0; index--) side[index].y = Math.min(side[index].y, index === side.length-1 ? 365 : side[index+1].y - 40);
    side.forEach((label) => {
      const edge = point(138,label.middle).map((value,index)=>value+(index ? label.liftY : label.liftX)), x = right ? 357 : 83;
      svg.append(element('polyline', {points:`${edge} ${right ? 345 : 95},${label.y} ${right ? 353 : 87},${label.y}`, fill:'none', stroke:'var(--input-border)', 'stroke-width':1.3, 'aria-hidden':'true'}));
      const text = element('text', {x, y:label.y-3, class:'chart-label', 'text-anchor':right ? 'start' : 'end', 'aria-hidden':'true'});
      const name = element('tspan', {x, dy:0}); name.textContent = label.name;
      const percent = element('tspan', {x, dy:18, class:'chart-label-percent'}); percent.textContent = share(label.amount,total);
      text.append(name,percent); svg.append(text);
    });
  }
}

function sampleData() {
  const date = (day) => isoDate(new Date(today.getFullYear(), today.getMonth(), day));
  return {
    income: 300000,
    goal: { name: 'Emergency fund', target: 100000 },
    accounts: [
      { id: 'checking', bank: 'Example Bank', type: 'checking', balance: 220000, allocation: 180000 },
      { id: 'savings', bank: 'Example Bank', type: 'savings', balance: 80000, allocation: 70000 },
      { id: 'credit', bank: 'Second Bank', type: 'credit', balance: 15000, allocation: 50000 },
    ],
    events: [
      { id: 'rent', name: 'Rent', amount: 120000, date: date(1), kind: 'purchase', category: 'Home' },
      { id: 'food', name: 'Groceries', amount: 18000, date: date(Math.max(1, today.getDate() - 2)), kind: 'purchase', category: 'Food' },
      { id: 'gas', name: 'Gas', amount: 6500, date: date(Math.max(1, today.getDate() - 1)), kind: 'purchase', category: 'Transport' },
      { id: 'other', name: 'Unplanned purchase', amount: 4500, date: date(today.getDate()), kind: 'purchase', category: 'Other' },
      { id: 'phone', name: 'Phone bill', amount: 4500, date: date(today.getDate() + 3), kind: 'planned', category: 'Other' },
      { id: 'insurance', name: 'Insurance', amount: 9000, date: date(today.getDate() + 7), kind: 'planned', category: 'Other' },
    ],
    transfer: null,
  };
}

let data = sampleData();
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && saved.income === 300000 && saved.goal && Array.isArray(saved.accounts) && Array.isArray(saved.events)) data = saved;
} catch { /* The demo still works when browser storage is unavailable. */ }

// Keep goals created in earlier versions and share the active goal across pages.
function initializeGoals() {
  if (!Array.isArray(data.goals) || !data.goals.length) data.goals = [data.goal];
  data.goals.forEach((goal) => { if (!goal.id) goal.id = newId(); });
  data.goal = data.goals.find((goal) => goal.id === data.activeGoalId) || data.goals[0];
  data.activeGoalId = data.goal.id;
}
initializeGoals();

function purchases() {
  return data.events.filter((event) => event.kind === 'purchase' && event.date.startsWith(currentMonth));
}
function spendingTotals() {
  const totals = Object.fromEntries(Object.keys(categories).map((name) => [name, 0]));
  purchases().forEach((event) => { totals[event.category] += event.amount; });
  return totals;
}
function goalSavings(goal) {
  return data.accounts.filter((account) => account.type === 'savings' && (!goal.accountId || account.id === goal.accountId)).reduce((sum, account) => sum + account.balance, 0);
}
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
      const [year,month] = current.date.split('-').map(Number);
      visibleMonth = new Date(year,month-1,1); selectedDate = null;
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

function save(message) {
  try { localStorage.setItem(storageKey, JSON.stringify(data)); }
  catch { message += ' Browser storage is unavailable; changes last until you close this page.'; }
  render();
  $('status').textContent = message;
}

function dollars(id) { return Math.round(Number($(id).value) * 100); }
function monthEvents() {
  const month = isoDate(visibleMonth).slice(0, 7);
  const events = data.events.filter((event) => event.date.startsWith(month));
  if (data.transfer && data.transfer.date.startsWith(month)) {
    events.push({ name: 'Demo transfer', amount: data.transfer.amount, date: data.transfer.date, kind: 'transfer' });
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

function render() {
  if ($('overview')) renderOverview();
  if ($('goal-name')) renderGoal();
  if ($('accounts')) renderAccounts();
  if ($('calendar')) renderCalendar();
  if ($('pie-page')) renderPiePage();
  if ($('spending-page')) renderSpendingPage();
}

function renderOverview() {
  const totals = spendingTotals();
  const spent = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
  $('spent').textContent = money(spent);
  $('remaining').textContent = money(data.income - spent);
  drawSpendingChart($('pie'), totals, renderOverview);
  $('chart-legend').replaceChildren(...Object.entries(totals).map(([name, amount]) => {
    const item = document.createElement('li');
    const button = document.createElement('button'); button.type = 'button'; button.className = 'legend-button'; button.setAttribute('aria-pressed',String(name === selectedCategory));
    const swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = categories[name];
    const label = document.createElement('span'); label.textContent = `${name} · ${share(amount,spent)}`;
    const value = document.createElement('strong'); value.textContent = money(amount);
    button.append(swatch,label,value); button.addEventListener('click',()=>{ selectedCategory=name; renderOverview(); }); item.append(button); return item;
  }));
  const count = purchases().filter((event)=>event.category === selectedCategory).length;
  $('overview-chart-detail').textContent = `${selectedCategory} · ${money(totals[selectedCategory])} · ${share(totals[selectedCategory],spent)} · ${count} ${count === 1 ? 'purchase' : 'purchases'}`;
  $('overview-chart-link').href = `pie.html?category=${encodeURIComponent(selectedCategory)}`;
  showPurchases('recent-spending', [...purchases()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3));
}

function renderGoal() {
  const savings = goalSavings(data.goal);
  $('goal-name').textContent = data.goal.name;
  $('goal-progress').textContent = `${money(savings)} saved of ${money(data.goal.target)}`;
  $('goal-bar').value = Math.min(savings / data.goal.target * 100, 100);
  $('goal-remaining').textContent = savings >= data.goal.target ? 'Goal reached!' : `${money(data.goal.target - savings)} to go`;
  if ($('goal-list')) {
    $('goal-list').replaceChildren(...data.goals.map((goal) => {
      const item = document.createElement('li'); const button = document.createElement('button');
      button.type = 'button'; button.textContent = goal.name; button.setAttribute('aria-pressed', String(goal.id === data.activeGoalId));
      const detail = document.createElement('small'); detail.textContent = `${money(goalSavings(goal))} of ${money(goal.target)}`; button.append(detail);
      button.addEventListener('click', () => { data.goal = goal; data.activeGoalId = goal.id; save('Goal selected.'); });
      item.append(button); return item;
    }));
    $('goal-deadline').textContent = data.goal.dueDate ? `Complete by ${data.goal.dueDate}` : 'Set a date when you are ready.';
    const account = data.accounts.find((account) => account.id === data.goal.accountId);
    $('goal-source').textContent = account ? `Tracking ${account.bank} savings.` : 'Tracking all demo savings accounts.';
    const percent = Math.min(savings / data.goal.target * 100, 100);
    $('goal-ring').style.background = `conic-gradient(var(--chart-2) ${percent}%,var(--subtle) 0)`;
    $('goal-ring').setAttribute('aria-label', `${Math.round(percent)} percent of ${data.goal.name} saved`);
    $('goal-percentage').textContent = `${Math.round(percent)}%`;
    const left = Math.max(0, data.goal.target - savings);
    const due = data.goal.dueDate ? new Date(`${data.goal.dueDate}T12:00:00`) : null;
    const months = due ? Math.max(1, Math.ceil((due - today) / (1000 * 60 * 60 * 24 * 30))) : 0;
    $('goal-tip').textContent = left === 0 ? 'You reached your target. You can keep saving or set your next goal.' : due && due > today ? `Save about ${money(Math.ceil(left / months))} each month to reach your target by ${data.goal.dueDate}.` : `You have ${money(left)} to go. Set a future completion date to see a monthly savings estimate.`;
  }
  if ($('goal-account')) {
    $('goal-account').replaceChildren(new Option('All savings accounts', ''), ...data.accounts.filter((account) => account.type === 'savings').map((account) => new Option(`${account.bank} · Savings`, account.id)));
    $('goal-account').value = data.goal.accountId || '';
  }
}

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

function renderCalendar() {
  $('month-title').textContent = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const events = monthEvents();
  const days = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  $('calendar-grid').replaceChildren();
  for (let index = 0; index < visibleMonth.getDay(); index++) $('calendar-grid').append(document.createElement('span'));
  for (let day = 1; day <= days; day++) {
    const date = isoDate(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
    const onDay = events.filter((event) => event.date === date);
    const cell = document.createElement('button'); cell.type = 'button'; cell.className = `day${date === isoDate(today) ? ' today' : ''}`; cell.textContent = day;
    cell.setAttribute('aria-pressed', String(date === selectedDate));
    cell.setAttribute('aria-label', `${date}${onDay.length ? ': ' + onDay.map((event) => `${event.name}, ${money(event.amount)}`).join('; ') : ', no payments'}`);
    cell.addEventListener('click', () => { selectedDate = date; renderCalendar(); });
    const dots = document.createElement('div'); dots.className = 'day-dots'; dots.setAttribute('aria-hidden', 'true');
    for (const kind of new Set(onDay.map((event) => event.kind === 'purchase' ? 'purchase' : 'planned'))) {
      const dot = document.createElement('span'); dot.className = `dot${kind === 'purchase' ? ' unexpected' : ''}`; dots.append(dot);
    }
    cell.append(dots); const item = document.createElement('div'); item.setAttribute('role', 'listitem'); item.append(cell); $('calendar-grid').append(item);
  }
  if ($('events-title')) $('events-title').textContent = selectedDate === isoDate(today) ? 'Today' : selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {month:'short',day:'numeric'}) : 'This month';
  const displayedEvents = selectedDate ? events.filter((event) => event.date === selectedDate) : events;
  $('payment-list').replaceChildren(...displayedEvents.map((event) => {
    const item = document.createElement('li'); const title = document.createElement('div'); title.className = 'payment-title';
    const name = document.createElement('span'); name.textContent = event.name;
    const amount = document.createElement('span'); amount.textContent = money(event.amount); title.append(name, amount);
    const detail = document.createElement('small'); detail.textContent = `${event.date} · ${event.kind === 'purchase' ? 'Purchase' : event.kind === 'transfer' ? 'Demo transfer' : 'Planned payment'}`;
    item.append(title, detail, transactionActions(event)); return item;
  }));
  if (!displayedEvents.length) { const item = document.createElement('li'); item.textContent = selectedDate ? 'No payments or purchases on this day.' : 'No payments or purchases this month.'; $('payment-list').append(item); }
}

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

$('goal-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('goal-input-name').value.trim();
  if (!name) { $('goal-input-name').setCustomValidity('Enter a goal name.'); $('goal-input-name').reportValidity(); return; }
  const goal = { name, target:dollars('goal-target'), dueDate:$('goal-date')?.value || '', accountId:$('goal-account')?.value || '' };
  if ($('goal-dialog').dataset.mode === 'add') {
    goal.id = newId(); data.goals.push(goal); data.goal = goal; data.activeGoalId = goal.id;
  } else Object.assign(data.goal, goal);
  $('goal-dialog').close(); save('Savings goal updated.');
});
$('goal-input-name')?.addEventListener('input', () => $('goal-input-name').setCustomValidity(''));
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
$('payment-form')?.addEventListener('submit', (event) => {
  event.preventDefault(); const name = $('payment-name').value.trim();
  if (!name) { $('payment-name').setCustomValidity('Enter a description.'); $('payment-name').reportValidity(); return; }
  const date = $('payment-date').value;
  data.events.push({ id: newId(), name, amount: dollars('payment-amount'), date, kind: $('payment-kind').value, category: $('payment-category').value });
  const [year, month] = date.split('-').map(Number); visibleMonth = new Date(year, month - 1, 1);
  selectedDate = null;
  $('payment-dialog').close(); event.target.reset(); save('Added to the calendar.');
});
$('payment-name')?.addEventListener('input', () => $('payment-name').setCustomValidity(''));
$('previous-month')?.addEventListener('click', () => { visibleMonth.setMonth(visibleMonth.getMonth() - 1); selectedDate = null; renderCalendar(); });
$('next-month')?.addEventListener('click', () => { visibleMonth.setMonth(visibleMonth.getMonth() + 1); selectedDate = null; renderCalendar(); });
$('calendar-today')?.addEventListener('click', () => { visibleMonth = new Date(today.getFullYear(),today.getMonth(),1); selectedDate = isoDate(today); renderCalendar(); });
$('calendar-all')?.addEventListener('click', () => { selectedDate = null; renderCalendar(); });
$('reset-demo')?.addEventListener('click', () => {
  if (!confirm('Reset your demo changes to the sample account?')) return;
  data = sampleData(); visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  initializeGoals(); selectedDate = null;
  if ($('allocation-error')) $('allocation-error').textContent = '';
  if ($('transfer-error')) $('transfer-error').textContent = '';
  save('Demo reset.');
});
render();
if ($('payment-dialog') && new URLSearchParams(location.search).get('add') === 'purchase') {
  $('payment-date').value = isoDate(today); $('payment-kind').value = 'purchase'; $('payment-dialog').showModal();
}
