// Shared savings-goal summary and Add/Edit form. Savings progress comes from the selected savings account(s), rather than a separate reserved balance.
// Update goal progress and form account choices from the shared budget.
function renderGoalSummary() {
  const goal=budgetData.goal;
  const savings=goalSavings(goal);
  getElement('goal-name').textContent=goal?goal.name:'No savings goals yet';
  getElement('goal-progress').textContent=goal?`${formatMoney(savings)} saved of ${formatMoney(goal.target)}`:'Add a goal to start tracking your savings.';
  getElement('goal-bar').hidden=!goal;
  getElement('goal-bar').value=goal?Math.min(savings/goal.target*100,100):0;
  getElement('goal-remaining').textContent=goal?(savings>=goal.target?'Goal reached!':`${formatMoney(goal.target-savings)} to go`):'';
  document.querySelectorAll('[data-goal-action="edit"]').forEach(button=>{
    button.textContent=goal?'Edit goal':'+ Add goal';
    button.dataset.goalMode=goal?'edit':'add';
  });
  if(getElement('goal-account')){
    getElement('goal-account').replaceChildren(new Option('All savings accounts',''),...budgetData.accounts.filter(account=>account.type==='savings').map(account=>new Option(`${account.bank} · Savings`,account.id)));
    getElement('goal-account').value=goal?.accountId||'';
  }
}

getElement('goal-form')?.addEventListener('submit',event=>{
  event.preventDefault();
  const name=getElement('goal-input-name').value.trim();
  if(!name){getElement('goal-input-name').setCustomValidity('Enter a goal name.');getElement('goal-input-name').reportValidity();return;}
  const goal={name,target:readAmountInCents('goal-target'),dueDate:getElement('goal-date')?.value||'',accountId:getElement('goal-account')?.value||''};
  if(getElement('goal-dialog').dataset.mode==='add'||!budgetData.goal){
    goal.id=newId();budgetData.goals.push(goal);budgetData.goal=goal;budgetData.activeGoalId=goal.id;
  }else Object.assign(budgetData.goal,goal);
  getElement('goal-dialog').close();save('Savings goal saved.');
});
getElement('goal-input-name')?.addEventListener('input',()=>getElement('goal-input-name').setCustomValidity(''));
