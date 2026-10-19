# Budgetron 3000 — Website mockup

A budgeting website with demo accounts, savings goals, spending charts, a payment calendar, and optional Gemini chat.

## Open the website

Double-click **index.html** for the budgeting demo. It opens the Overview page.

For AI chat, install Node.js 22 or newer, copy **.env.example** to **.env**, add your Gemini API key, then double-click **Start Budgetron.bat**. Open the local URL printed by the server. The API key stays on your computer; never commit .env.

You can also run the server from the project root:

```sh
node server/server.mjs
```


## Where files belong

Each page has its own folder and its own HTML, CSS, and JavaScript. To change a page, open its folder:

| Page | Folder | Files |
| --- | --- | --- |
| Overview | pages/overview/ | overview.html, overview.css, overview.js |
| Savings goals | pages/goals/ | goals.html, goals.css, goals.js |
| Accounts | pages/accounts/ | accounts.html, accounts.css, accounts.js |
| Spending chart | pages/spending-chart/ | spending-chart.html, spending-chart.css, spending-chart.js |
| Spending information | pages/spending/ | spending.html, spending.css, spending.js |
| Payment calendar | pages/calendar/ | calendar.html, calendar.css, calendar.js |

The root contains only the start page, launcher, documentation, and configuration.

- **shared/** — reusable styles, data/storage, transaction editing, savings-goal dialogs, chart drawing, theme controls, navigation, and AI chat.
- **server/** — the local Node.js server and Gemini API requests.
- **tests/** — server, route, and asset checks. Run node --test tests/server.test.mjs.
- **docs/FEATURES.md** — the website's feature guide.

Page scripts contain their own rendering and controls. Shared scripts load first, then the current page initializes itself. All pages share the same browser storage key, so accounts, purchases, goals, and preferences stay consistent. The browser's file-based demo and local-server demo use separate storage.

The server supports the previous page URLs and preserves their query parameters. Navigation and stylesheet/script paths also work when index.html is opened directly as a file. The server serves only the public website files; private configuration and server source stay inaccessible through HTTP.

This is a class-project mockup using pretend money. It does not connect to real banks or move funds. See docs/FEATURES.md for AI service details and limits.
