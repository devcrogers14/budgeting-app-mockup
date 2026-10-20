function renderGoalSummary() {
  const goal=data.goal;
  const savings=goalSavings(goal);
  $('goal-name').textContent=goal?goal.name:'No savings goals yet';
  $('goal-progress').textContent=goal?`${money(savings)} saved of ${money(goal.target)}`:'Add a goal to start tracking your savings.';
  $('goal-bar').hidden=!goal;
  $('goal-bar').value=goal?Math.min(savings/goal.target*100,100):0;
  $('goal-remaining').textContent=goal?(savings>=goal.target?'Goal reached!':`${money(goal.target-savings)} to go`):'';
  document.querySelectorAll('[data-goal-action="edit"]').forEach(button=>{
    button.textContent=goal?'Edit goal':'+ Add goal';
    button.dataset.goalMode=goal?'edit':'add';
  });
  if($('goal-account')){
    $('goal-account').replaceChildren(new Option('All savings accounts',''),...data.accounts.filter(account=>account.type==='savings').map(account=>new Option(`${account.bank} · Savings`,account.id)));
    $('goal-account').value=goal?.accountId||'';
  }
}

$('goal-form')?.addEventListener('submit',event=>{
  event.preventDefault();
  const name=$('goal-input-name').value.trim();
  if(!name){$('goal-input-name').setCustomValidity('Enter a goal name.');$('goal-input-name').reportValidity();return;}
  const goal={name,target:dollars('goal-target'),dueDate:$('goal-date')?.value||'',accountId:$('goal-account')?.value||''};
  if($('goal-dialog').dataset.mode==='add'||!data.goal){
    goal.id=newId();data.goals.push(goal);data.goal=goal;data.activeGoalId=goal.id;
  }else Object.assign(data.goal,goal);
  $('goal-dialog').close();save('Savings goal saved.');
});
$('goal-input-name')?.addEventListener('input',()=>$('goal-input-name').setCustomValidity(''));
