// Render and select savings goals, estimate monthly saving needs, and confirm goal deletion. Uses the shared budget model and helpers loaded first by its HTML page.
// Update the goal list and progress details, including the no-goals state.
function renderGoalsPage(){
  renderGoalSummary();
  getElement('goal-list').replaceChildren(...budgetData.goals.map(goal=>{
    const item=document.createElement('li');
    const button=document.createElement('button');button.type='button';button.textContent=goal.name;
    button.setAttribute('aria-pressed',String(goal.id===budgetData.activeGoalId));
    const detail=document.createElement('small');detail.textContent=`${formatMoney(goalSavings(goal))} of ${formatMoney(goal.target)}`;button.append(detail);
    button.addEventListener('click',()=>{budgetData.goal=goal;budgetData.activeGoalId=goal.id;save('Goal selected.');});
    item.append(button);return item;
  }));
  const goal=budgetData.goal;
  const deleteGoalButton=getElement('delete-goal');deleteGoalButton.hidden=!goal;deleteGoalButton.disabled=!goal;
  if(!goal){
    getElement('goal-deadline').textContent='';
    getElement('goal-source').textContent='Your savings balances are unchanged.';
    getElement('goal-ring').style.background='var(--subtle)';
    getElement('goal-ring').setAttribute('aria-label','No savings goal selected');
    getElement('goal-percentage').textContent='—';
    getElement('goal-tip').textContent='Add a savings goal, choose a target, and optionally set a completion date.';
    return;
  }
  deleteGoalButton.setAttribute('aria-label',`Delete goal: ${goal.name}`);
  const savings=goalSavings(goal);
  getElement('goal-deadline').textContent=goal.dueDate?`Complete by ${goal.dueDate}`:'Set a date when you are ready.';
  const account=budgetData.accounts.find(account=>account.id===goal.accountId);
  getElement('goal-source').textContent=account?`Tracking ${account.bank} savings.`:'Tracking all demo savings accounts.';
  const goalPercentage=Math.min(savings/goal.target*100,100);
  getElement('goal-ring').style.background=`conic-gradient(var(--chart-2) ${goalPercentage}%,var(--subtle) 0)`;
  getElement('goal-ring').setAttribute('aria-label',`${Math.round(goalPercentage)} percent of ${goal.name} saved`);
  getElement('goal-percentage').textContent=`${Math.round(goalPercentage)}%`;
  const amountRemaining=Math.max(0,goal.target-savings);
  const goalDueDate=goal.dueDate?new Date(`${goal.dueDate}T12:00:00`):null;
  const monthsRemaining=goalDueDate?Math.max(1,Math.ceil((goalDueDate-today)/(1000*60*60*24*30))):0;
  getElement('goal-tip').textContent=amountRemaining===0?'You reached your target. You can keep saving or set your next goal.':goalDueDate&&goalDueDate>today?`Save about ${formatMoney(Math.ceil(amountRemaining/monthsRemaining))} each month to reach your target by ${goal.dueDate}.`:`You have ${formatMoney(amountRemaining)} to go. Set a future completion date to see a monthly savings estimate.`;
}

let goalPendingDeletion=null;
getElement('delete-goal').addEventListener('click',()=>{
  if(!budgetData.goal)return;
  goalPendingDeletion=budgetData.goal.id;
  getElement('delete-goal-description').textContent=`Delete “${budgetData.goal.name}” from your savings goals?`;
  getElement('delete-goal-dialog').showModal();
});
getElement('confirm-delete-goal').addEventListener('click',()=>{
  const removed=removeGoal(goalPendingDeletion);goalPendingDeletion=null;
  getElement('delete-goal-dialog').close();
  if(!removed)return;
  save('Savings goal deleted. Your account balances are unchanged.');
  (document.querySelector('#goal-list [aria-pressed="true"]')||document.querySelector('.goal-add'))?.focus();
});
window.BudgetronPage={render:renderGoalsPage};
render();
