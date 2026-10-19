# Budgetron 3000™ — Budgeting MVP

A simple budgeting mockup with a sample profile earning **$3,000 per month**. The cream background, brown text, green icons, rounded navigation, and page layouts are inspired by **CS 100 App Mock-Up.pdf**.

## Open it

For the budgeting demo alone, double-click **index.html**. For real AI chat:

1. Get your own Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Open **.env** in this project and replace `PASTE_YOUR_KEY_HERE` after `GEMINI_API_KEY=` with your key. Save the file. Keep `.env` private.
3. Double-click **Start Budgetron.bat**. It opens the website in Brave after the local server is ready; leave its window open. It uses Node.js 22 or newer (or the Node runtime installed with Codex on this computer).
4. Open **http://127.0.0.1:3000** and click **Ask Budgetron**.

The key is read on each chat request, so saving `.env` does not require restarting the server. If port 3000 is busy, change `PORT` in `.env`, restart the launcher, and open the URL it prints.

The server website and a double-clicked HTML file use separate browser storage. Your original file-based demo data is retained at its old location; the local-server version starts with its own sample profile.

Use the navigation links to switch pages. **Dark Mode** is at the top of every page. Choose **Cream, Sage, Ocean, or Rose** from the Theme menu; every theme supports light and dark mode. Both choices are remembered across pages and browser restarts. The first visit follows your device's light/dark preference.

## Features

- **Page transitions:** Tabs slide smoothly between pages. Normal browser links, Back/Forward, and reduced-motion preferences are supported.
- **Calendar hover:** Dates show a contrasting grey highlight when hovered or focused, in both light and dark mode.

- **Transaction editing:** Use Edit or Delete beside a purchase or planned payment in the calendar, spending list, category details, or recent activity. Edit the description, amount, date, category, or purchase/planned type. Totals, charts, and calendar dates update together. Delete asks for confirmation. Changes affect demo records; they do not move money.
- **Real AI chat:** The floating Ask Budgetron button opens a Gemini-powered conversation with suggested questions, conversation history for this browser tab, New Chat, and an option to include the current sample budget. The snapshot includes income, spending totals, accounts, savings goals, recent purchases, and upcoming bills. The AI can explain and suggest, but cannot edit transactions or move money. Use the Edit/Delete controls for changes.
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

Changes are stored in the current browser when browser storage is available. Use “Reset demo” to restore the example. Saving may behave differently when opened as a local file in different browsers. This is a class-project mockup: no real bank connections, passwords, payment processing, or automatic transfers.

The PDF is used as a visual reference. Its blank panels are filled with the working demo features above. The app uses the name “Budgetron 3000™” and retains the $3,000 sample income, separate pages, and dark mode. The branding uses a small robot wordmark and the ™ symbol. It uses plain HTML, CSS, JavaScript, inline vector icons, and a small dependency-free Node.js server for real AI. No framework or package installation is needed.


## AI service and limits

The default model is `gemini-3.5-flash-lite`. Its availability, free-tier quotas, and pricing are controlled by Google; see [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and [API key setup](https://ai.google.dev/gemini-api/docs/api-key). Stay on your Google project's free tier if you do not want paid usage. The app does not enable billing or switch to a paid model automatically.

When you send a chat message, that message and any included sample budget snapshot are sent to Google. Free-tier content may be used to improve Google's products. Keep the sample data for this demo and avoid sharing real banking credentials. Turn off Include my sample budget to ask general questions without the snapshot. Replies are generated by AI and can be wrong.

The server binds only to this computer. It blocks access to `.env` and server source files, keeps API credentials outside browser JavaScript, limits message sizes, and limits chat to 10 requests per minute. This is a local class demo, not a public production service. A missing key or exhausted provider quota shows an error; the app never pretends a canned answer is real AI.


See [the project README](../README.md) for the current file layout and setup.


## Budgetron chat scope

Budgetron helps only with this app and the budget tracked in it: accounts, spending, allocations, goals, calendar entries, and using its features. Off-topic questions receive a fixed reply directing the user back to those topics. Mixed requests receive help with only their app-budget portion.

The server owns the policy in `server/chat-policy.mjs`, requests a structured scope decision with each answer, and validates it before returning text. It discards answers marked outside scope and rejects malformed output. Budget snapshots are supplied as untrusted reference data, separately from the trusted system instructions. These model-based guardrails reduce off-topic replies; they are not a mathematical guarantee against every possible prompt.
