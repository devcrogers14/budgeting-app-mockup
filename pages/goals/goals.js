function renderGoalsPage(){
  renderGoalSummary();
  $('goal-list').replaceChildren(...data.goals.map(goal=>{
    const item=document.createElement('li');
    const button=document.createElement('button');button.type='button';button.textContent=goal.name;
    button.setAttribute('aria-pressed',String(goal.id===data.activeGoalId));
    const detail=document.createElement('small');detail.textContent=`${money(goalSavings(goal))} of ${money(goal.target)}`;button.append(detail);
    button.addEventListener('click',()=>{data.goal=goal;data.activeGoalId=goal.id;save('Goal selected.');});
    item.append(button);return item;
  }));
  const goal=data.goal;
  const remove=$('delete-goal');remove.hidden=!goal;remove.disabled=!goal;
  if(!goal){
    $('goal-deadline').textContent='';
    $('goal-source').textContent='Your savings balances are unchanged.';
    $('goal-ring').style.background='var(--subtle)';
    $('goal-ring').setAttribute('aria-label','No savings goal selected');
    $('goal-percentage').textContent='—';
    $('goal-tip').textContent='Add a savings goal, choose a target, and optionally set a completion date.';
    return;
  }
  remove.setAttribute('aria-label',`Delete goal: ${goal.name}`);
  const savings=goalSavings(goal);
  $('goal-deadline').textContent=goal.dueDate?`Complete by ${goal.dueDate}`:'Set a date when you are ready.';
  const account=data.accounts.find(account=>account.id===goal.accountId);
  $('goal-source').textContent=account?`Tracking ${account.bank} savings.`:'Tracking all demo savings accounts.';
  const percent=Math.min(savings/goal.target*100,100);
  $('goal-ring').style.background=`conic-gradient(var(--chart-2) ${percent}%,var(--subtle) 0)`;
  $('goal-ring').setAttribute('aria-label',`${Math.round(percent)} percent of ${goal.name} saved`);
  $('goal-percentage').textContent=`${Math.round(percent)}%`;
  const left=Math.max(0,goal.target-savings);
  const due=goal.dueDate?new Date(`${goal.dueDate}T12:00:00`):null;
  const months=due?Math.max(1,Math.ceil((due-today)/(1000*60*60*24*30))):0;
  $('goal-tip').textContent=left===0?'You reached your target. You can keep saving or set your next goal.':due&&due>today?`Save about ${money(Math.ceil(left/months))} each month to reach your target by ${goal.dueDate}.`:`You have ${money(left)} to go. Set a future completion date to see a monthly savings estimate.`;
}

let goalPendingDeletion=null;
$('delete-goal').addEventListener('click',()=>{
  if(!data.goal)return;
  goalPendingDeletion=data.goal.id;
  $('delete-goal-description').textContent=`Delete “${data.goal.name}” from your savings goals?`;
  $('delete-goal-dialog').showModal();
});
$('confirm-delete-goal').addEventListener('click',()=>{
  const removed=removeGoal(goalPendingDeletion);goalPendingDeletion=null;
  $('delete-goal-dialog').close();
  if(!removed)return;
  save('Savings goal deleted. Your account balances are unchanged.');
  (document.querySelector('#goal-list [aria-pressed="true"]')||document.querySelector('.goal-add'))?.focus();
});
window.BudgetronPage={render:renderGoalsPage};
render();
