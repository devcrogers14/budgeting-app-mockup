let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = null;

function monthEvents() {
  const month = isoDate(visibleMonth).slice(0, 7);
  const events = data.events.filter((event) => event.date.startsWith(month));
  if (data.transfer && data.transfer.date.startsWith(month)) {
    events.push({ name: 'Demo transfer', amount: data.transfer.amount, date: data.transfer.date, kind: 'transfer' });
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
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

window.BudgetronPage = {
  render:renderCalendar,
  reset() {visibleMonth = new Date(today.getFullYear(),today.getMonth(),1); selectedDate = null;},
  transactionChanged(record) {const [year,month]=record.date.split('-').map(Number); visibleMonth=new Date(year,month-1,1); selectedDate=null;}
};
render();
if ($('payment-dialog') && ['purchase','transaction'].includes(new URLSearchParams(location.search).get('add'))) {
  $('payment-date').value = isoDate(today); $('payment-kind').value = 'purchase'; $('payment-dialog').showModal();
}
