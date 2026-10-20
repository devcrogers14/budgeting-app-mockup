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
let selectedCategory = 'Home';
const requestedCategory = new URLSearchParams(location.search).get('category');
if (Object.hasOwn(categories, requestedCategory)) selectedCategory = requestedCategory;
const share = (amount, total) => `${(total ? amount / total * 100 : 0).toFixed(1)}%`;

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
  if (saved && saved.income === 300000 && (saved.goal || Array.isArray(saved.goals)) && Array.isArray(saved.accounts) && Array.isArray(saved.events)) data = saved;
} catch { /* The demo still works when browser storage is unavailable. */ }

// Keep goals created in earlier versions and share the active goal across pages.
function initializeGoals() {
  // An explicit empty list means the user deleted all goals; do not resurrect a legacy goal.
  if(!Array.isArray(data.goals))data.goals=data.goal?[data.goal]:[];
  data.goals=data.goals.filter(goal=>goal && typeof goal==='object');
  data.goals.forEach(goal=>{if(!goal.id)goal.id=newId();});
  data.goal=data.goals.find(goal=>goal.id===data.activeGoalId)||data.goals[0]||null;
  data.activeGoalId=data.goal?.id||null;
}
function removeGoal(id){
  if(!data.goals.some(goal=>goal.id===id))return false;
  data.goals=data.goals.filter(goal=>goal.id!==id);
  initializeGoals();return true;
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
  if(!goal)return 0;
  return data.accounts.filter((account) => account.type === 'savings' && (!goal.accountId || account.id === goal.accountId)).reduce((sum, account) => sum + account.balance, 0);
}
