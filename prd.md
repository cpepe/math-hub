#PRD: "MathHub" Platform| **Version** | 2.3 (Current) |
| --- | --- |
| **Status** | Memory Game Complete / Operator Madness Defined |
| **Core Philosophy** | Static Files, Client-Side Logic, Operational Simplicity |
| **Hosting** | GitHub Pages (Zero Backend Server) |

---

##1. Executive Summary
The MathHub platform is a web-based educational tool hosted entirely as a static site (HTML, CSS, Vanilla JS). All game logic, state, and scoring are handled within the user's browser, eliminating infrastructure costs. The primary goal of this version is to finalize the core "Memory" game functionality and define the scope for the next game, "Operator Madness."

---

##2. Technical Architecture & Data Model| Component | Technology | Role |
| --- | --- | --- |
| **Hosting** | GitHub Pages | Zero server cost/maintenance. |
| **Core Logic** | Vanilla JavaScript (ES6+) | Handles game flow, timers, and scoring. |
| **Styling** | Bootstrap 5 (via CDN) | Consistent, professional, responsive UI. |
| **Data Persistence** | `localStorage` | Used to store the global `sessionScore` and user game configurations. |

###Global Scoring (Client-Side)
The total score is stored under the key `mathhubSessionScore` in `localStorage` and accumulates across all games played within the session.

---

##3. Game Specification: "Memory" (Game 01)
###3.1 Core Mechanics| Variable | Default | Description |
| --- | --- | --- |
| **Digit Count (N)** | 6 | Length of the randomly generated target number. |
| **Display Time (T_{display})** | 0.5s | Time the number is visible. |
| **Input Time (T_{input})** | 7s | Time allocated for the user to submit their guess. |

###3.2 User Flow and State Transitions
The game transitions strictly between four distinct, visually isolated states, ensuring the memory number is never visible during the input phase.

| State/Feature | Logic | Rationale |
| --- | --- | --- |
| **Setup (A)** | User configures settings and starts. |  |
| **Exposure (B)** | Displays the `targetNumber` for T_{display}. |  |
| **Feature: Skip Display** | A **"Got it"** button is available in State B. Clicking it immediately cancels T_{display} and transitions to State C. | User control, encourages faster action. |
| **Input (C)** | Input field and T_{input} timer are active. |  |
| **Result (D)** | Displays the outcome (Win/Loss). |  |

###3.3 Scoring and Retry System
The game implements a diminishing points system and a structured retry mechanic upon failure.

####Scoring Logic
* **Base Points:** 10 points for a correct answer.
* **Penalty:** -1 point penalty for *each* failed guess (or timeout) before a successful guess.
* **Minimum Reward:** 1 point.
* **Score Reset:** A **"Reset Score"** button is provided next to the score display to manually clear `localStorage.removeItem('mathhubSessionScore')`.

####Retry (Re-Exposure) MechanicOn an incorrect guess or timeout in State C:

1. The `guessAttempt` counter is incremented.
2. If the accumulated penalty would drop the score to 0 or below, the game ends (State D, Loss).
3. The game switches to the **Exposure State (B)**, redisplaying the `targetNumber` for the full T_{display} time.
4. After re-exposure, the game returns to the **Input State (C)** with a fresh T_{input} timer.
5. A non-intrusive **Bootstrap Alert** provides inline feedback (e.g., "Time out! Penalty applied. Re-exposing number...").

---

##4. Game Specification: "Operator Madness" (Game 02)
###4.1 Game Concept
The user must formulate a mathematical expression using a set of provided operands and arithmetic operators that evaluates to a specific target number.

###4.2 Game Elements and Constraints
| Element | Range | Constraint |
| --- | --- | --- |
| **Operand Group (4)** | Integers 1 to 32 | **Must be used exactly once** in the equation. |
| **Target Number (1)** | Integer 1 to 50 | The final equation result must equal this number. |
| **Operators** | +, -, *, / | Standard order of operations (PEMDAS/BODMAS) applies. |

###4.3 Implementation Requirements
1. **Generation:** The game will randomly select the 4 operands and 1 target number based on the defined ranges.
2. **Input:** The user enters the full equation string into a single text input field (e.g., `(2 + 10) / 4`).
3. **Validation:** Upon submission, the JavaScript must perform three checks:
a.  **Result Check:** Does the equation evaluate to the Target Number?
b.  **Syntax Check:** Is the equation structurally valid (e.g., no division by zero, matched parentheses)?
c.  **Usage Check:** Are the original four operands included in the equation **exactly once**?

###Next Step
**We are now ready to begin development on the "Operator Madness" game. Shall we start by creating the base HTML structure and the JavaScript functions for number generation and input validation?**
