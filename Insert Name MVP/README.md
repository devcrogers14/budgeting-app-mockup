# Budgetron 3000™ — Budgeting MVP

A simple budgeting mockup with a sample profile earning **$3,000 per month**. The cream background, brown text, green icons, rounded navigation, and page layouts are inspired by **CS 100 App Mock-Up.pdf**.

## Open it

Double-click **index.html**. No installation, account, or internet connection is needed.

Use the navigation links to switch pages. **Dark Mode** is at the top of every page. Choose **Cream, Sage, Ocean, or Rose** from the Theme menu; every theme supports light and dark mode. Both choices are remembered across pages and browser restarts. The first visit follows your device's light/dark preference.

## Features

- **Page transitions:** Tabs slide smoothly between pages. Normal browser links, Back/Forward, and reduced-motion preferences are supported.
- **Calendar hover:** Dates show a contrasting grey highlight when hovered or focused, in both light and dark mode.

- **Goals page:** Add and switch between savings goals, edit targets, set optional completion dates, and track a progress ring. Each goal can follow all savings accounts or one selected savings account. The selected goal also appears on Overview. Goals track balances; they do not reserve money, so goals following the same account share its progress. The next-step panel calculates a rough monthly savings estimate; it is not an AI service.
- **Spending pie chart:** Both charts have clickable slices, visible category labels, and percentages to one decimal place. Select a slice with the mouse, or use Tab and Enter/Space. The example starts with $1,490 spent and $1,510 left from income.
- **Raised slices:** Hover over a slice to lift it with a soft glow and shadow; moving away lowers it. Click to keep it selected and raised while viewing its details. Its percentage moves with it. The effect follows your theme and respects reduced-motion preferences.
- **Account allocations:** Edit the monthly amount planned for each account, then save. The total cannot exceed $3,000. Planning allocations does not move money.
- **Multiple accounts:** Start with checking ($2,200), savings ($800), and a credit card ($150 owed). Add more pretend checking, savings, or credit card accounts using “Connect demo account.”
- **Card view:** Stacked illustrative cards lift and tilt with a soft shadow and shine on mouse hover, like a wallet. Click or use the keyboard to select a card and keep it raised while viewing its balance and monthly allocation. The effect supports dark mode and reduced motion. No real card numbers are stored.
- **Automatic transfer mockup:** Expand “Automatic transfer,” choose accounts, an amount, and a date, and save the rule. “Simulate transfer” updates the fake balances and advances a monthly rule. Transfers to a credit card reduce the amount owed. Nothing runs in the background or moves real money.
- **Payment calendar:** View planned payments, purchases, and the next demo transfer. Select a day, use Today, or show All events. Add future bills or unexpected purchases. Purchases update the current-month spending chart; planned payments do not count as spending. Calendar entries do not change bank balances.
- **Pie Chart page:** Select a slice or category to see its amount, share of total spending, purchase count, average purchase, largest purchase, share of monthly income, and dated purchase details. Colors follow your selected theme. The original Home, Food, Transport, and Other categories are preserved from the sample budget. The Overview chart also lets you select slices and open the matching details page.
- **Spending Info page:** See totals, category amounts, recorded purchases, and a short summary calculated from your data.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Overview: income, savings goal, and spending chart |
| `goals.html` | Goals: edit your savings target and track progress |
| `accounts.html` | Account allocations, demo connections, and transfers |
| `calendar.html` | Payment calendar and purchase entry |
| `pie.html` | Interactive spending chart and category details |
| `spending.html` | Monthly spending totals and purchase list |
| `styles.css` | Simple layout, colors, and phone layout |
| `app.js` | Sample data, pie chart, form actions, calendar, and browser storage |
| `navigation.js` | Smooth page transitions |
| `theme.js` | Dark mode toggle and saved theme preference |
| `README.md` | This feature guide |

Changes are stored in the current browser when browser storage is available. Use “Reset demo” to restore the example. Saving may behave differently when opened as a local file in different browsers. This is a class-project mockup: no real bank connections, passwords, payment processing, or automatic transfers.

The PDF is used as a visual reference. Its blank panels are filled with the working demo features above. The app uses the name “Budgetron 3000™” and retains the $3,000 sample income, separate pages, and dark mode. The branding uses a small robot wordmark and the ™ symbol. It uses plain HTML, CSS, JavaScript, and inline vector icons; no framework or downloads are needed.
