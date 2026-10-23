// Render a month of payments and purchases, filter events by day and handle adding calendar entries. Uses the shared budget model and helpers loaded first by its HTML page.
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = null;

// Collect this month's calendar entries plus any scheduled demo transfer.

function monthEvents() {
  const month = isoDate(visibleMonth).slice(0, 7);
  const events = budgetData.events.filter((event) => event.date.startsWith(month));
  if (budgetData.transfer && budgetData.transfer.date.startsWith(month)) {
    events.push({ name: 'Demo transfer', amount: budgetData.transfer.amount, date: budgetData.transfer.date, kind: 'transfer' });
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

// Rebuild day buttons and the event list, preserving the selected day filter.

function renderCalendar() {
  getElement('month-title').textContent = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const events = monthEvents();
  const days = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  getElement('calendar-grid').replaceChildren();
  for (let index = 0; index < visibleMonth.getDay(); index++) getElement('calendar-grid').append(document.createElement('span'));
  for (let day = 1; day <= days; day++) {
    const date = isoDate(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
    const onDay = events.filter((event) => event.date === date);
    const cell = document.createElement('button'); cell.type = 'button'; cell.className = `day${date === isoDate(today) ? ' today' : ''}`; cell.textContent = day;
    cell.setAttribute('aria-pressed', String(date === selectedDate));
    cell.setAttribute('aria-label', `${date}${onDay.length ? ': ' + onDay.map((event) => `${event.name}, ${formatMoney(event.amount)}`).join('; ') : ', no payments'}`);
    cell.addEventListener('click', () => { selectedDate = date; renderCalendar(); });
    const dots = document.createElement('div'); dots.className = 'day-dots'; dots.setAttribute('aria-hidden', 'true');
    for (const kind of new Set(onDay.map((event) => event.kind === 'purchase' ? 'purchase' : 'planned'))) {
      const dot = document.createElement('span'); dot.className = `dot${kind === 'purchase' ? ' unexpected' : ''}`; dots.append(dot);
    }
    cell.append(dots); const item = document.createElement('div'); item.setAttribute('role', 'listitem'); item.append(cell); getElement('calendar-grid').append(item);
  }
  if (getElement('events-title')) getElement('events-title').textContent = selectedDate === isoDate(today) ? 'Today' : selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {month:'short',day:'numeric'}) : 'This month';
  const displayedEvents = selectedDate ? events.filter((event) => event.date === selectedDate) : events;
  getElement('payment-list').replaceChildren(...displayedEvents.map((event) => {
    const item = document.createElement('li'); const title = document.createElement('div'); title.className = 'payment-title';
    const name = document.createElement('span'); name.textContent = event.name;
    const amount = document.createElement('span'); amount.textContent = formatMoney(event.amount); title.append(name, amount);
    const detail = document.createElement('small'); detail.textContent = `${event.date} · ${event.kind === 'purchase' ? 'Purchase' : event.kind === 'transfer' ? 'Demo transfer' : 'Planned payment'}`;
    item.append(title, detail, transactionActions(event)); return item;
  }));
  if (!displayedEvents.length) { const item = document.createElement('li'); item.textContent = selectedDate ? 'No payments or purchases on this day.' : 'No payments or purchases this month.'; getElement('payment-list').append(item); }
}

getElement('payment-form')?.addEventListener('submit', (event) => {
  event.preventDefault(); const name = getElement('payment-name').value.trim();
  if (!name) { getElement('payment-name').setCustomValidity('Enter a description.'); getElement('payment-name').reportValidity(); return; }
  const date = getElement('payment-date').value;
  budgetData.events.push({ id: newId(), name, amount: readAmountInCents('payment-amount'), date, kind: getElement('payment-kind').value, category: getElement('payment-category').value });
  const [year, month] = date.split('-').map(Number); visibleMonth = new Date(year, month - 1, 1);
  selectedDate = null;
  getElement('payment-dialog').close(); event.target.reset(); save('Added to the calendar.');
});
getElement('payment-name')?.addEventListener('input', () => getElement('payment-name').setCustomValidity(''));
getElement('previous-month')?.addEventListener('click', () => { visibleMonth.setMonth(visibleMonth.getMonth() - 1); selectedDate = null; renderCalendar(); });
getElement('next-month')?.addEventListener('click', () => { visibleMonth.setMonth(visibleMonth.getMonth() + 1); selectedDate = null; renderCalendar(); });
getElement('calendar-today')?.addEventListener('click', () => { visibleMonth = new Date(today.getFullYear(),today.getMonth(),1); selectedDate = isoDate(today); renderCalendar(); });
getElement('calendar-all')?.addEventListener('click', () => { selectedDate = null; renderCalendar(); });

window.BudgetronPage = {
  render:renderCalendar,
  reset() {visibleMonth = new Date(today.getFullYear(),today.getMonth(),1); selectedDate = null;},
  transactionChanged(record) {const [year,month]=record.date.split('-').map(Number); visibleMonth=new Date(year,month-1,1); selectedDate=null;}
};
render();
if (getElement('payment-dialog') && ['purchase','transaction'].includes(new URLSearchParams(location.search).get('add'))) {
  getElement('payment-date').value = isoDate(today); getElement('payment-kind').value = 'purchase'; getElement('payment-dialog').showModal();
}
