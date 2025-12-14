This is a significant and excellent pivot. Moving to a **Static Site** architecture hosted on GitHub Pages dramatically simplifies your operations. You effectively have zero infrastructure costs, zero server maintenance, and instant deployment by just pushing code.

Since JavaScript is now allowable and necessary for logic in a static environment, we will shift the "Brain" of the application from the server to the user's browser.

Here is the revised PRD for the Static/GitHub Pages architecture.

---

#PRD: "MathHub" & Game 01 "Memory" (Static Edition)| **Version** | 2.0 |
| --- | --- |
| **Status** | Draft |
| **Core Philosophy** | Static Files, Client-Side Logic, Zero-Config Hosting |

##1. Executive SummaryWe are building a static web platform ("MathHub") hosted directly from a GitHub repository. The application requires no backend server. All game logic, routing, and state management are handled by the browser using JavaScript.

##2. Technical Architecture*Goal: No build steps. No `npm install`. Just HTML/JS files.*

* **Hosting:** GitHub Pages (Serves static files directly from the repo).
* **Tech Stack:**
* **Structure:** Semantic HTML5.
* **Style:** CSS3 (Variables for theming).
* **Logic:** Vanilla JavaScript (ES6+). No frameworks (React/Vue) to ensure the code is readable and editable without compiling.


* **Data Persistence:** Browser `localStorage`. This allows user settings and high scores to persist between visits without a database.
* **Directory Structure:**
```text
/ (root)
├── index.html        # The "Lobby"
├── css/
│   └── style.css     # Global styles
├── js/
│   └── common.js     # Shared utilities
└── games/
    └── memory/
        ├── index.html    # The Memory Game UI
        └── script.js     # Memory Game Logic

```



##3. The Framework (The "Hub")Because we don't have a server to inject headers, we will use a small JavaScript snippet to inject the global navigation into every page, or simply include it in the HTML templates.

###3.1 Global NavigationA static HTML header present on all pages:

1. **Home Icon:** Links to `/index.html`.
2. **Repo Link:** A link to the GitHub repository (optional, good for open source).

###3.2 The Lobby (`index.html`)A static list of links.

* **Card 1:** "Memory" -> Links to `/games/memory/index.html`.
* **Card 2:** "Coming Soon".

---

##4. Game Specification: "Memory"###4.1 Game Logic (Client-Side)Unlike the server version, the browser generates the number.

* *Note:* This makes the game "cheatable" if a user inspects the console, but for a casual math game, this is an acceptable trade-off for infrastructure simplicity.

###4.2 Configuration Variables (Stored in `localStorage`)The user can change these via a "Settings" modal.

| Variable | Default | Logic |
| --- | --- | --- |
| **Digit Count** | 6 | `Math.floor(Math.random() * (9 * 10^(n-1))) + 10^(n-1)` |
| **Display Time** | 0.5s | `setTimeout()` triggers the CSS class to hide the number. |
| **Input Time** | 7s | `setInterval()` updates a progress bar every 100ms. |

###4.3 User Flow & States (Single Page)The game exists in a single HTML file but toggles visibility of different `<div>` containers based on state.

####State A: The Setup (Visible on Load)* **UI:** "Start Game" Button. "Settings" Gear Icon.
* **Action:** Click Start.
* **JS Logic:**
1. Read config.
2. Generate random number `targetNumber`.
3. Inject `targetNumber` into the DOM.
4. Switch view to State B.



####State B: Exposure* **UI:** The number is visible in center screen.
* **JS Logic:**
1. Start a timer for `Display Time` (e.g., 0.5s).
2. When timer fires: Clear the number from the screen (or hide it) and switch to State C.



####State C: Input* **UI:** Input field appears and gains focus (`element.focus()`). Progress bar starts shrinking.
* **JS Logic:**
1. Start countdown timer for `Input Time`.
2. Listen for `Enter` key or "Submit" click.
3. **If Timeout:** Trigger State D (Loss).
4. **If Submit:** Compare input value to `targetNumber`. Trigger State D (Win/Loss).



####State D: Result* **UI:**
* **Win:** "Correct!" + Next Button.
* **Loss:** "Wrong. It was [X]." + Retry Button.


* **JS Logic:**
1. Update `localStorage` history (optional).
2. "Next/Retry" resets variables and goes back to State A (or immediately to State B if "Quick Play" is enabled).



---

##5. UI/UX Requirements* **Responsive:** Must work on Mobile (CSS Flexbox/Grid).
* **Keyboard:** `Enter` key must start the game and submit the answer.
* **Feedback:** Visual shake animation on incorrect answer.

---

