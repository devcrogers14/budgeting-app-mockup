function renderGoalSummary() {
  const savings = goalSavings(data.goal);
  $('goal-name').textContent = data.goal.name;
  $('goal-progress').textContent = `${money(savings)} saved of ${money(data.goal.target)}`;
  $('goal-bar').value = Math.min(savings / data.goal.target * 100, 100);
  $('goal-remaining').textContent = savings >= data.goal.target ? 'Goal reached!' : `${money(data.goal.target - savings)} to go`;

  if ($('goal-account')) {
    $('goal-account').replaceChildren(new Option('All savings accounts', ''), ...data.accounts.filter((account) => account.type === 'savings').map((account) => new Option(`${account.bank} · Savings`, account.id)));
    $('goal-account').value = data.goal.accountId || '';
  }
}

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
