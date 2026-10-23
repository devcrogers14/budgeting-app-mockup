# Budgetron 3000 — Website mockup

A budgeting website with demo accounts, savings goals, spending charts, a payment calendar, and optional Gemini chat.

## Open the website

Double-click **index.html** for the budgeting demo. It opens the Home page.

For AI chat, install Node.js 22 or newer, copy **.env.example** to **.env**, add your Gemini API key, then double-click **Start Budgetron.bat**. The launcher opens the local website in Brave once the server is ready. Keep the server window open while chatting. If it does not open automatically, use the printed local URL. The API key stays on your computer; never commit .env.

You can also run the server from the project root:

```sh
node server/server.mjs
```


## Where files belong

Each page has its own folder and its own HTML, CSS, and JavaScript. To change a page, open its folder:

| Page | Folder | Files |
| --- | --- | --- |
| Home | pages/home/ | home.html, home.css, home.js |
| Savings goals | pages/goals/ | goals.html, goals.css, goals.js |
| Accounts | pages/accounts/ | accounts.html, accounts.css, accounts.js |
| Spending chart | pages/spending-chart/ | spending-chart.html, spending-chart.css, spending-chart.js |
| Transactions | pages/transactions/ | transactions.html, transactions.css, transactions.js |
| Payment calendar | pages/calendar/ | calendar.html, calendar.css, calendar.js |

The root contains only the start page, launcher, documentation, and configuration.

- **css files/** — reusable layout, themes, and chat styles.
- **javascript files/** — data/storage, transaction editing, savings-goal dialogs, chart drawing, theme controls, navigation, and AI chat.
- **server/** — the local Node.js server and Gemini API requests.
- **tests/** — server, route, and asset checks. Run node --test.
- **docs/FEATURES.md** — the website's feature guide.

Page scripts contain their own rendering and controls. Reusable scripts load first, then the current page initializes itself. All pages share the same browser storage key, so accounts, purchases, goals, and preferences stay consistent. The browser's file-based demo and local-server demo use separate storage.

The server supports the previous page URLs and preserves their query parameters. Navigation and stylesheet/script paths also work when index.html is opened directly as a file. The server serves only the public website files; private configuration and server source stay inaccessible through HTTP.

This is a class-project mockup using pretend money. It does not connect to real banks or move funds. See docs/FEATURES.md for AI service details and limits.


## Budgetron chat scope

Budgetron helps only with this app and the budget tracked in it: accounts, spending, allocations, goals, calendar entries, and using its features. Off-topic questions receive a fixed reply directing the user back to those topics. Mixed requests receive help with only their app-budget portion.

The server owns the policy in `server/chat-policy.mjs`, requests a structured scope decision with each answer, and validates it before returning text. It discards answers marked outside scope and rejects malformed output. Budget snapshots are supplied as untrusted reference data, separately from the trusted system instructions. These model-based guardrails reduce off-topic replies; they are not a mathematical guarantee against every possible prompt.


Goal deletion asks for confirmation and never changes account balances. Deleting the final goal leaves an empty state that persists after reload. Transactions lists both current-month purchases and planned payments; only purchases count as spending. Text-only actions underline and show a pointer on hover, with equivalent keyboard-focus feedback.


## Moving and hiding Ask Budgetron

Drag the Ask Budgetron button with a mouse or touch. Its position is remembered across pages and reloads and stays within the screen when its size changes. Keyboard users can focus the button and press Alt + an arrow key to move it.

Open the chat and expand **Position & visibility** to choose **Show only on Home** or **Reset position**. Home always keeps the button available, so you can turn other pages back on there.

## Reading the source

Every source file starts with a purpose comment. JavaScript functions explain their main responsibility; HTML comments identify assets, navigation, content and dialogs; CSS comments identify layout and responsive overrides. `budgetData` is the shared demo model, `getElement(id)` finds an HTML element, `formatMoney(cents)` displays dollars, `readAmountInCents(id)` reads a money input, and `currentMonthPurchases()` excludes planned payments from spending. Browser storage keys, HTML IDs and saved-data field names stay consistent so existing demo data keeps working.
