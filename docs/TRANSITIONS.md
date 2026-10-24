# Simple page entry

The app uses one simple **120 ms, 6 px entry slide**. Page links navigate normally without an exit-animation wait or browser snapshot overlay. Device reduced-motion preferences disable the slide.

The code is at the top of `css files/styles.css`, under **Simple page entry only**. Adjust the duration or distance there if needed. There is no advanced mode or transition settings control; the former settings/navigation JavaScript has been removed.

Ask Budgetron uses its regular fixed layers above page content. See [FEATURES.md](FEATURES.md) for app features.

The sidebar also has a 180 ms sliding selection background. Its code is in `javascript files/theme.js`, with `.nav-selection-highlight` styles in the shared stylesheet. It animates only on the arriving page, never delays a link, adapts to the mobile navigation grid, and respects reduced motion. Sidebar links do not underline on hover or keyboard focus.
