// Shared budget model: sample accounts, browser storage, date/currency helpers and spending totals. All stored money is integer cents; divide by 100 only when displaying dollars.
// All amounts are stored in cents. This is a browser-only demo.
const getElement = (id) => document.getElementById(id);
const formatMoney = (cents) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
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
const formatPercentage = (amount, total) => `${(total ? amount / total * 100 : 0).toFixed(1)}%`;

// Build a fresh $3,000 demo budget using dates relative to the current month.

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

let budgetData = sampleData();
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && saved.income === 300000 && (saved.goal || Array.isArray(saved.goals)) && Array.isArray(saved.accounts) && Array.isArray(saved.events)) budgetData = saved;
} catch { /* The demo still works when browser storage is unavailable. */ }

// Keep goals created in earlier versions and share the active goal across pages.
// Migrate older single-goal saves and choose a valid active goal, preserving an explicitly empty list.
function initializeGoals() {
  // An explicit empty list means the user deleted all goals; do not resurrect a legacy goal.
  if(!Array.isArray(budgetData.goals))budgetData.goals=budgetData.goal?[budgetData.goal]:[];
  budgetData.goals=budgetData.goals.filter(goal=>goal && typeof goal==='object');
  budgetData.goals.forEach(goal=>{if(!goal.id)goal.id=newId();});
  budgetData.goal=budgetData.goals.find(goal=>goal.id===budgetData.activeGoalId)||budgetData.goals[0]||null;
  budgetData.activeGoalId=budgetData.goal?.id||null;
}
// Remove only the matching goal, then select a remaining goal without changing balances.
function removeGoal(id){
  if(!budgetData.goals.some(goal=>goal.id===id))return false;
  budgetData.goals=budgetData.goals.filter(goal=>goal.id!==id);
  initializeGoals();return true;
}
initializeGoals();

// Return recorded purchases in the current month; planned payments do not count as spending.

function currentMonthPurchases() {
  return budgetData.events.filter((event) => event.kind === 'purchase' && event.date.startsWith(currentMonth));
}
// Sum current-month purchase amounts by chart category, in cents.
function spendingTotals() {
  const totals = Object.fromEntries(Object.keys(categories).map((name) => [name, 0]));
  currentMonthPurchases().forEach((event) => { totals[event.category] += event.amount; });
  return totals;
}
// Add balances from savings accounts followed by this goal; overlapping goals share those balances.
function goalSavings(goal) {
  if(!goal)return 0;
  return budgetData.accounts.filter((account) => account.type === 'savings' && (!goal.accountId || account.id === goal.accountId)).reduce((sum, account) => sum + account.balance, 0);
}
