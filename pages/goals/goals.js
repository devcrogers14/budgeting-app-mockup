function renderGoalsPage() {
  renderGoalSummary();
  const savings = goalSavings(data.goal);
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
}

window.BudgetronPage = {render:renderGoalsPage};
render();
