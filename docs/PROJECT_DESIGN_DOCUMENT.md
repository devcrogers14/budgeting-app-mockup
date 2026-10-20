**Project Name:** PocketBudget

**Team/Group:** Meet n em

**Version:** 1.0

## 1 Document Version History

| Date | Version | Author | Comments |
| --- | --- | --- | --- |
| 2026-10-14 | 1.0 |  | Initial design document for the PocketBudget prototype |
| 2026-10-16 | 1.1 |  | Added AI Budget Coach (separate from MVP) and its guardrails |
| 2026-10-19 | 1.2 |  | Added C4 context, container and component diagrams, mockup screens and the runnable app demo |

## Table of Contents

- 1 Document Version History
- 2 Overview
  - 2.1 Project Description
  - 2.2 Final Deliverable
- 3 Workflow Diagram
- 4 Architecture and Process flow diagram
  - 4.1 System Context diagram
  - 4.2 Container diagram
  - 4.3 Component diagram
  - 4.4 Code diagram
  - 4.5 Mockup Screens
  - 4.6 App Demo
  - 4.7 Demo Break Tests

## 2 Overview

### 2.1 Project Description

Many students and first-job earners manage money across a paycheck, a few subscriptions and a savings goal with no single place to see it all. PocketBudget is a budgeting app that shows income, spending, bills and goals together, so a person always knows what is safe to spend.

Users set monthly limits for each spending category, log expenses and income, and see where their money goes in a donut chart. A bill calendar lists subscriptions and paydays and reminds users of upcoming payments. Savings goals forecast a finish date from real contributions, and paycheck allocation rules split income between checking, savings and investments. The prototype is a Flutter app with fictional data held in memory; bank linking, push notifications and automatic bill payment are future integrations. Separate from the MVP, a planned AI Budget Coach would propose budgeting goals that adapt to the user's spending habits, behind the guardrails described in its own section of the [Supporting analysis](SUPPORTING_ANALYSIS.md).

### 2.2 Final Deliverable

- A short report covering: the problem and the value of the solution
  - The core features and how they work: category budgets, bill calendar, savings goals with forecast dates, paycheck allocation and transfers
  - Spending views: a current-month donut chart and category budget list (daily and quarterly report views are planned)
  - A test plan: seven automated tests plus a manual walkthrough, with feedback captured on navigation, labels and totals

Requirements, MVP status, competitor research, functional design and the test plan are in the [Supporting analysis](SUPPORTING_ANALYSIS.md).

mockup and a working model of the app are also deliverables

Both are in section 4: the mockup in 4.5 Mockup Screens and the runnable demo in 4.6 App Demo.

## 3 Workflow Diagram

![PocketBudget user workflow](images/workflow.png)

## 4 Architecture and Process flow diagram

### 4.1 System Context diagram

Budgetron 3000 serves one user, a college student new to budgeting and money management. It relies on two outside systems: an Open Banking API for real-time banking information and a Notification Service that sends progress, spending and budgeting-suggestion alerts.

![Budgetron 3000 system context diagram](images/c4-system-context.png)

### 4.2 Container diagram

The Budgetron 3000 system is made of three containers. A Flutter single-page application gives the user interface, an API backend handles the business logic, and a database stores user profiles, transactions and monthly budget targets.

![Budgetron 3000 container diagram](images/c4-container.png)

### 4.3 Component diagram

The API backend is split into five components:

- **Transaction Controller:** gets raw data from the banking API and formats it.
- **Budgeting & Goals Component:** calculates current spending limits, tracks purchase categories and detects when the user goes over budget.
- **Auth Component:** handles login, registration and JWT token validation.
- **Notification Component:** packages alerts and sends them to the external notification gateway.
- **AI Component:** the chatbot for budgeting questions, specified in the AI Budget Coach section (separate from the MVP).

![Budgetron 3000 component diagram](images/c4-component.png)

### 4.4 Code diagram

Not added yet: the fourth C4 diagram (code level) goes here.

### 4.5 Mockup Screens

The CS 100 App Mock-Up sets the look of the app: a cream background, brown text, green round icons and a rounded side menu. It has eight screens across five pages: Calendar, Goal, Card Info, Pie Chart (one view per category) and Spending Info.

**Calendar:** month view with a menu, then a Today timeline of deposits, paydays and bills due.

![Mockup: Calendar](images/mockup-calendar.png)

**Goal:** goal name and completion date, a progress chart, a progress info / AI suggestion panel and Add Goal.

![Mockup: Goal](images/mockup-goal.png)

**Card Info:** stacked bank cards; selecting one shows its details, with Add Card.

![Mockup: Card Info](images/mockup-card-info.png)

**Pie Chart:** spending split into Savings, Bills, Discretionary Purchases and Subscriptions; selecting a slice raises it and opens that category.

![Mockup: Pie Chart, Savings](images/mockup-pie-savings.png)

![Mockup: Pie Chart, Bills](images/mockup-pie-bills.png)

![Mockup: Pie Chart, Discretionary Purchases](images/mockup-pie-discretionary.png)

![Mockup: Pie Chart, Subscriptions](images/mockup-pie-subscriptions.png)

**Spending Info:** panels for monthly spending details.

![Mockup: Spending Info](images/mockup-spending-info.png)

### 4.6 App Demo

The working demo is Budgetron 3000, a browser app built from the mockup with a sample profile earning $3,000 a month. [Open the Budgetron 3000 demo](https://claude.ai/artifact/KWG9dYxdxv41tHMT6NyvAR) to run through it: no install, account or real bank is needed. Offline, double-click index.html in the MVP folder.

Changes save in the browser, and Reset demo at the bottom of each page restores the sample. Every page has a Theme menu (Cream, Sage, Ocean, Rose) and a Dark Mode switch.

| Page | What you can do |
| --- | --- |
| Overview | See income, spending and money left; savings goal progress; spending donut chart with clickable slices; recent purchases |
| Goals | Add and switch goals, edit target and completion date, pick which savings account a goal tracks, see the progress ring and a monthly savings estimate |
| Accounts | Edit monthly allocations (total capped at $3,000), connect demo accounts, view stacked demo cards, set and simulate an automatic transfer |
| Pie Chart | Select a category to see its total, share of spending and income, purchase count, average and largest purchase, and dated purchases |
| Spending Info | Monthly totals by category, all purchases and a short summary |
| Calendar | Browse months, select a day, add planned payments or unexpected purchases; purchases update the spending chart |

![Demo: Overview](images/demo-overview.png)

![Demo: Goals](images/demo-goals.png)

![Demo: Accounts](images/demo-accounts.png)

![Demo: Pie Chart](images/demo-pie-chart.png)

![Demo: Spending Info](images/demo-spending-info.png)

![Demo: Calendar](images/demo-calendar.png)

### 4.7 Demo Break Tests

31 of 35 break tests passed and 4 failed (B21, B29, B33, B34). The tests try to break the demo with bad input, extreme values, tampered links and storage, and two open tabs. They were run on 2026-10-19 with an automated browser against the demo files; failures are recorded here and the app was not changed.

| ID | Test | Expected | Actual | Pass / Fail |
| --- | --- | --- | --- | --- |
| B1 | Accounts: allocate $3,000 to Checking while Savings and Credit keep $700 and $500 (total $4,200) | Rejected with a message; nothing saved | Error shown: "Keep total allocations at or below your $3,000 income."; not saved | Pass |
| B2 | Accounts: enter -50 as an allocation and save | Blocked; nothing saved | Browser blocked the form (minimum 0); nothing saved | Pass |
| B3 | Accounts: clear an allocation box and save | Blocked; nothing saved | Blocked as a required field; nothing saved | Pass |
| B4 | Goals: save a goal whose name is only spaces | Rejected; asks for a name | Dialog stayed open asking for a name; goal still "Emergency fund" | Pass |
| B5 | Goals: set the target to $0 | Blocked; nothing saved | Blocked (minimum $0.01); nothing saved | Pass |
| B6 | Goals: set the target to -$100 | Blocked; nothing saved | Blocked (minimum $0.01); nothing saved | Pass |
| B7 | Goals: name a goal `<img src=x onerror=alert(1)>` | Shown as plain text; no code runs | Shown as plain text; no script ran | Pass |
| B8 | Goals: set a completion date in the past (2020-01-01) | Rejected or warned that the date has passed | Saved "Complete by 2020-01-01"; tip: "You have $700.00 to go. Set a future completion date to see a monthly savings estimate." | Pass |
| B9 | Goals: set a $500 target when $800 is already saved | Shows 100% and Goal reached, not 160% | Ring shows 100%; "Goal reached!" | Pass |
| B10 | Goals: set a $999,999,999 target | Amount formatted correctly; layout intact | "$800.00 saved of $999,999,999.00"; layout intact | Pass |
| B11 | Calendar: add a purchase whose description is only spaces | Rejected; asks for a description | Dialog stayed open asking for a description; nothing added | Pass |
| B12 | Calendar: add a purchase of $0 | Blocked; nothing added | Blocked by the form; nothing added | Pass |
| B13 | Calendar: add a purchase of $10.005 | Blocked; nothing added | Blocked by the form; nothing added | Pass |
| B14 | Calendar: log a $1,000,000 purchase | Totals update; shows spending is over income; nothing breaks | Income left -$998,490.00; tip says purchases exceed income; chart and layout intact | Pass |
| B15 | Calendar: name a purchase `<script>alert(1)</script>` | Shown as plain text; no code runs | Shown as plain text; no script ran | Pass |
| B16 | Calendar: add a purchase dated a year from now | Shown in that month; this month's spending unchanged | Calendar jumped to October 2027; this month still $1,490.00 | Pass |
| B17 | Accounts: transfer from Checking to Checking | Rejected with a message | Error: "Choose two different accounts." | Pass |
| B18 | Accounts: simulate a $5,000 transfer from Checking ($2,200 balance) | Rejected; balances unchanged | Error: "Not enough demo money in the source account."; Checking still $2,200.00 | Pass |
| B19 | Accounts: pay $200 to a credit card that owes $150 | Rejected; amount owed never goes below $0 | Error: "This payment is more than the credit card amount owed."; card still owes $150.00 | Pass |
| B20 | Accounts: save a transfer rule for $0 | Blocked; no rule saved | Blocked (minimum $0.01); no rule saved | Pass |
| B21 | Accounts: monthly transfer on Jan 31, simulate it twice | Next dates Feb 28, then back to Mar 31 | Next dates Feb 28, then Mar 28: the rule stays on the 28th from then on | Fail |
| B22 | Accounts: simulate a $1,000 transfer from Checking 4 times in a row | Stops when money runs out; never negative | Stopped at $200.00 with "Not enough demo money in the source account." | Pass |
| B23 | Accounts: connect a demo account whose bank name is only spaces | Rejected; asks for a name | Dialog stayed open asking for a bank name | Pass |
| B24 | Accounts: connect a demo account with a -$500 starting balance | Blocked; nothing added | Blocked (minimum $0); nothing added | Pass |
| B25 | Accounts (phone width): connect an account with a 60-letter name and no spaces | Name wraps; page does not scroll sideways | Name wraps inside the card; no sideways scroll | Pass |
| B26 | Pie Chart: open with a bad category in the link (`<script>`, `constructor`, `__proto__`) | Ignores it and shows Home | Fell back to Home; no errors | Pass |
| B27 | All pages: corrupt the saved data in browser storage, then reload | Loads sample data instead of crashing | Loaded the sample data (spent $1,490.00) | Pass |
| B28 | All pages: block browser storage (private mode) and add a purchase | App still works and warns changes will not be kept | Works; status: "Added to the calendar. Browser storage is unavailable; changes last until you close this page." | Pass |
| B29 | Two tabs: add a purchase in tab A, then save allocations in tab B that was opened earlier | Both changes kept | Purchase from tab A was erased when tab B saved | Fail |
| B30 | Any page: press Reset demo, choose Cancel, then press it again and choose OK | Cancel changes nothing; OK restores the sample | Cancel kept the data; OK restored the sample | Pass |
| B31 | All pages at 375 px phone width | No page scrolls sideways | No page scrolls sideways | Pass |
| B32 | Pie Chart: keyboard only, focus the Food slice and press Enter | Food details open | Selected Food with Enter | Pass |
| B33 | Calendar / Spending Info: fix a purchase logged with the wrong amount | Purchase can be edited or deleted | No way to edit or delete a logged purchase or bill | Fail |
| B34 | Goals / Accounts: remove a goal or demo account added by mistake | Goal or account can be deleted | No way to delete a goal or a demo account | Fail |
| B35 | All tests above: watch the browser console for script errors | No errors | No errors | Pass |
