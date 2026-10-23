// Budget-state regression checks using an isolated browser-like storage context. Confirm that deleting goals preserves money records and survives reloading.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createContext,runInContext} from 'node:vm';
const source=await readFile(new URL('../javascript%20files/state.js',import.meta.url),'utf8');
// Load the budget script in an isolated VM so tests can inspect state without a real browser.
function state(saved){
  const storage=new Map(saved?[['insert-name-budget-v1',JSON.stringify(saved)]]:[]);
  const context=createContext({URLSearchParams,location:{search:''},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}});
  runInContext(source,context);
  return {read:()=>JSON.parse(runInContext('JSON.stringify(budgetData)',context)),run:code=>runInContext(code,context)};
}
test('deleting the selected goal selects another and preserves all money records',()=>{
  const model=state();
  model.run("budgetData.goals.push({id:'second',name:'Holiday',target:200000});");
  const before=model.read();
  assert.equal(model.run('removeGoal(budgetData.activeGoalId)'),true);
  const after=model.read();
  assert.equal(after.activeGoalId,'second');assert.equal(after.goal.name,'Holiday');
  assert.deepEqual(after.accounts,before.accounts);assert.deepEqual(after.events,before.events);assert.equal(after.income,before.income);
});
test('deleting a different goal preserves the selected goal',()=>{
  const model=state();const before=model.read();
  model.run("budgetData.goals.push({id:'second',name:'Holiday',target:200000});removeGoal('second');");
  assert.equal(model.read().activeGoalId,before.activeGoalId);
});
test('deleting the final goal survives saving and reloading without recreating it',()=>{
  const model=state();const before=model.read();
  model.run('removeGoal(budgetData.activeGoalId)');
  const empty=model.read();
  assert.deepEqual(empty.goals,[]);assert.equal(empty.goal,null);assert.equal(empty.activeGoalId,null);
  const reloaded=state(empty).read();
  assert.deepEqual(reloaded.goals,[]);assert.equal(reloaded.goal,null);assert.equal(reloaded.activeGoalId,null);
  assert.deepEqual(reloaded.accounts,before.accounts);assert.deepEqual(reloaded.events,before.events);
});
test('deleting a missing goal makes no changes',()=>{
  const model=state();const before=model.read();assert.equal(model.run("removeGoal('missing')"),false);assert.deepEqual(model.read(),before);
});
test('older saved budgets with a single legacy goal migrate without data loss',()=>{
  const seed=state().read();delete seed.goals;delete seed.activeGoalId;
  const migrated=state(seed).read();assert.equal(migrated.goals.length,1);assert.equal(migrated.goal.name,seed.goal.name);assert.deepEqual(migrated.accounts,seed.accounts);
});
