# Budgetron 3000™ — Feature Guide

Updated October 23, 2026. This is a class-project budgeting MVP using pretend money, with optional real AI chat.

## Open the app

- **Budget demo:** double-click `index.html` to open Home.
- **AI chat:** install Node.js 22 or newer, copy `.env.example` to `.env` if needed, and set `GEMINI_API_KEY` to your own [Google AI Studio key](https://aistudio.google.com/apikey). Keep an existing `.env` and its key private.
- Double-click **Start Budgetron.bat**. It starts the local server and opens the app in Brave when available. Keep the server window open. If the browser does not open, use the printed URL, normally `http://127.0.0.1:3000`.
- Alternatively, run `node server/server.mjs` from the project folder. The launcher can also use the Node runtime bundled with Codex on this computer.

Saving a new key in `.env` does not require restarting. Changing `PORT` requires restarting and using the new printed URL. AI chat cannot run through GitHub Pages, VS Code Live Server, or a double-clicked HTML file alone.

## Pages and features

| Page | What users can do |
| --- | --- |
| **Home** | See monthly income, purchase totals, income left, the selected savings goal, an interactive spending chart, and the three most recent purchases. |
| **Goals** | Add, select, edit, or delete goals. Set a target, optional date, and either one savings account or all savings accounts. View a progress ring and a calculated monthly savings estimate. Deleting asks for confirmation; deleting the last goal leaves an empty state after reload. |
| **Accounts** | View checking, savings, and credit card demo accounts. Add pretend accounts, select floating wallet cards, adjust monthly allocations, and save or simulate a transfer rule. Allocations cannot exceed the $3,000 income. |
| **Pie Chart** | Select a spending category to see its amount, percentage, purchase count, average and largest purchase, share of income, and dated transaction details. |
| **Transactions** | See this month's purchases and planned payments, category totals, and a calculated spending summary. Add transactions through the calendar form, or edit/delete existing records. |
| **Calendar** | Navigate months, select a day, jump to Today, or show All events for the visible month. Add planned payments or unexpected purchases. See the next scheduled demo transfer alongside other events. |

The sample profile has **$3,000 monthly income**, **$2,200 checking**, **$800 savings**, and **$150 credit card debt**. Initial purchases total **$1,490**, leaving **$1,510** of monthly income after recorded spending.

### Transactions and money rules

Use **Edit** or **Delete** on recent purchases, transaction lists, category details, or calendar entries. Edit the description, amount, date, category, or purchase/planned type. Delete asks for confirmation. Spending totals, charts, and calendar entries refresh together.

Only purchases in the current month count as spending. Planned payments and calendar entries do not change account balances. Allocations plan money without moving it. Goals follow savings balances without reserving money, so goals tracking the same accounts share progress. Deleting a goal preserves all money records.

**Simulate transfer** changes pretend balances only. Credit card payments reduce the amount owed. A repeating rule advances to the next month, clamping the date for shorter months; a one-time rule clears after simulation. Transfers never run automatically in the background.

### Appearance and navigation

- Pages use a simple 120 ms, 6 px entry slide with normal browser navigation. There is no exit-animation wait, advanced transition mode, or transition settings control. Reduced-motion preferences disable the slide. Ask Budgetron stays above page content. See [TRANSITIONS.md](TRANSITIONS.md) for the CSS location.
- Choose **Cream, Sage, Ocean, or Rose** and toggle **Dark Mode** on any page. Choices are remembered; the initial mode follows the device preference.
- Both spending charts show category labels and percentages. Hover lifts a slice with a glow and shadow; clicking keeps it selected. Tab and Enter/Space also select slices.
- Wallet cards lift and tilt on hover or remain raised when selected.
- Calendar dates show contrasting hover/focus colors. Text actions provide hover and keyboard-focus feedback.
- Responsive layouts adapt to smaller screens.

## Ask Budgetron

The floating **Ask Budgetron** button opens Gemini chat with rounded suggested-question cards, a message box, **New Chat**, and conversation history retained within the browser tab across pages. Connection errors explain how to start the local server; failed replies offer retry.

Drag the button with a mouse or touch. Its position is remembered across pages and reloads and adjusts to screen resizing. Keyboard users can focus it and press **Alt + an arrow key** to move it.

Open chat → **Position & visibility**:

- **Show only on Home** hides the button on every other page. It always remains available on Home, where users can turn the other pages back on.
- **Reset position** returns it to its default corner.

**Include my sample budget** sends a fresh snapshot of income, category totals, accounts, goals, recent purchases, upcoming payments, and the transfer rule. Turn it off to ask app-help questions without sharing the snapshot. Questions must still concern Budgetron or budgeting within this app.

The assistant explains app features and the tracked budget. It cannot edit records, connect banks, move money, or browse the web. Off-topic replies are replaced with a fixed app-focused message. Server-side instructions and structured-response validation reduce off-topic answers but do not guarantee model behavior.

Messages and any included snapshot are sent to Google. AI replies can be wrong. Model availability, quotas, pricing, and data handling depend on the Google project and service terms; consult [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and [API key setup](https://ai.google.dev/gemini-api/docs/api-key). The model is configurable through `GEMINI_MODEL`; the app does not enable billing or switch models automatically.

## Saving, setup, and limits

Budget changes are stored in this browser when storage is available. Local files and the local-server website use separate storage; changing browser, origin, or file location can also change which saved demo is loaded. The app has no sign-in or cross-device budget sync.

**Reset demo** restores the sample budget after confirmation. Theme settings, chat display preferences, and tab conversation history are separate from budget data. **New Chat** clears the conversation history.

The app uses plain HTML, CSS, JavaScript, inline SVG icons, and a dependency-free Node server. Source files contain purpose and logic comments with descriptive shared helpers. See [README.md](../README.md) for the folder layout.

The local server keeps the API key outside browser code, blocks private files and server source, validates requests, and limits chat to 10 requests per minute. Use sample data. There are no real bank connections, stored bank passwords, payment processing, or real automatic transfers.

## Verification

Run `node --test` from the project root. There are **15 individual checks** across three files; Node reports **16** because it also counts the parent server test group.

| Test file | Coverage |
| --- | --- |
| `tests/goal-state.test.mjs` | Five checks for goal selection/deletion, preservation of money records, empty-state persistence, and migration of older saves. |
| `tests/chat-policy.test.mjs` | Five checks for accepting valid replies, rejecting malformed/off-topic output, and separating untrusted snapshots from trusted instructions. |
| `tests/server.test.mjs` | Five checks for page assets, legacy URLs, private-file protection, chat response contracts, and invalid/cross-site requests. |

Separate browser checks verified all six pages, mouse/touch dragging, position persistence, keyboard movement, Home-only visibility/restoration, position reset, phone bounds, chat layering during page switches, Back navigation, reduced-motion behavior, and the browser-to-server chat flow using a simulated provider reply. These browser checks are separate from `node --test`; simulated replies do not verify a live Gemini call or require an API key.
