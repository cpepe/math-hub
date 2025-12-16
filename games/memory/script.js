// Global State Variables
let targetNumber = "";
let timerInterval = null;     // Used for the Input Phase Countdown (setInterval)
let displayTimeout = null;    // Used for the Exposure/Retry Display Timer (setTimeout)
let settings = {
    digits: 6,
    displayTime: 0.5,
    inputTime: 7
};
// Scoring Variables
let guessAttempt = 0;         // Tracks attempts in the current round (1 = first guess)
const BASE_POINTS = 10;
const SCORE_KEY = 'mathhubSessionScore'; // localStorage key for total score

// --- DOM Element References ---
const views = {
    setup: document.getElementById('state-setup'),
    exposure: document.getElementById('state-exposure'),
    input: document.getElementById('state-input'),
    result: document.getElementById('state-result')
};
const scoreDisplay = document.getElementById('session-score-display');
// ASSUMPTION: The retry feedback element is a persistent, but hidden, part of the HTML for cleaner state management.
const feedbackElement = document.getElementById('retry-feedback') || document.createElement('div');


// --- Score Management Functions (NO CHANGE) ---
function getSessionScore() {
    return parseInt(localStorage.getItem(SCORE_KEY) || 0);
}

function updateSessionScore(points) {
    const currentScore = getSessionScore();
    const newScore = currentScore + points;
    localStorage.setItem(SCORE_KEY, newScore);
    scoreDisplay.innerText = newScore;
}

function displayCurrentScore() {
    scoreDisplay.innerText = getSessionScore();
}

function resetScore() {
    // 1. Confirm with the user before resetting
    if (!confirm("Are you sure you want to reset your total score? This cannot be undone.")) {
        return;
    }

    // 2. Clear the value in localStorage
    localStorage.removeItem(SCORE_KEY);

    // 3. Update the display to show 0
    displayCurrentScore();

    // Optional: Provide visual feedback (e.g., flash the button green)
    const resetButton = document.querySelector('.btn-outline-danger');
    resetButton.classList.remove('btn-outline-danger');
    resetButton.classList.add('btn-success');
    resetButton.innerText = 'Score Reset!';

    setTimeout(() => {
        resetButton.classList.remove('btn-success');
        resetButton.classList.add('btn-outline-danger');
        resetButton.innerText = 'Reset Score';
    }, 1500);
}

// --- Helper to switch views ---
function switchView(viewName) {
    // Hide all views
    Object.values(views).forEach(el => el.classList.add('d-none'));

    // Hide the feedback element on major transitions
    feedbackElement.classList.add('d-none');

    // Show the requested view
    views[viewName].classList.remove('d-none');
}

// --- Phase A: Setup & Start ---
function showSetup() {
    if (timerInterval) clearInterval(timerInterval);
    if (displayTimeout) clearTimeout(displayTimeout);

    switchView('setup');
}

function startGame() {
    guessAttempt = 0;

    // 1. Read Configuration (NO CHANGE)
    settings.digits = parseInt(document.getElementById('cfg-digits').value);
    settings.displayTime = parseFloat(document.getElementById('cfg-display').value);
    settings.inputTime = parseInt(document.getElementById('cfg-input').value);

    // 2. Generate Number (NO CHANGE)
    const min = Math.pow(10, settings.digits - 1);
    const max = Math.pow(10, settings.digits) - 1;
    targetNumber = Math.floor(Math.random() * (max - min + 1) + min).toString();

    // Start the first exposure phase
    startExposurePhase();
}

// --- Phase B: Exposure (Initial or Retry) ---
function startExposurePhase() {
    // Ensure we are in the exposure view and the number is displayed
    const displayEl = document.getElementById('target-number');
    displayEl.innerText = targetNumber;

    switchView('exposure'); // *** CRITICAL FIX: Ensure ALL other views (including 'input') are hidden. ***

    document.getElementById('skip-button').classList.remove('d-none');

    if (displayTimeout) clearTimeout(displayTimeout);

    // Set timer to transition to input phase
    displayTimeout = setTimeout(() => {
        startInputPhase();
    }, settings.displayTime);
}

// --- Feature: Skip Display Time ---
function skipDisplay() {
    if (displayTimeout) {
        clearTimeout(displayTimeout);
    }

    document.getElementById('skip-button').classList.add('d-none');

    startInputPhase();
}

// --- Phase C: Input ---
function startInputPhase() {
    // 1. Switch to Input View
    switchView('input'); // *** CRITICAL FIX: Switch to input view, hiding exposure. ***

    // 2. Reset Input UI
    const inputEl = document.getElementById('user-guess');
    inputEl.value = '';
    inputEl.focus();

    // 3. Handle Countdown Timer
    let timeLeft = settings.inputTime;
    const bar = document.getElementById('time-bar');
    const updateRate = 50;

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft -= (updateRate / 1000);

        const percent = (timeLeft / settings.inputTime) * 100;
        bar.style.width = percent + "%";

        if (timeLeft <= 0) {
            clearInterval(timerInterval);

            // Time out is a failure, initiates re-exposure phase
            guessAttempt++;
            const penalty = guessAttempt - 1;

            if (BASE_POINTS - penalty <= 0) {
                finishGame(false, `Time out! Max penalty reached on attempt ${guessAttempt}.`);
                return;
            }

            feedbackElement.innerText = `Time out! You lose ${penalty + 1} point${penalty > 0 ? 's' : ''} potential. Re-exposing number...`;
            feedbackElement.classList.remove('d-none');

            startExposurePhase();
        }
    }, updateRate);
}

// --- Phase C: Submission ---
function submitGuess() {
    const inputEl = document.getElementById('user-guess');
    const userValue = inputEl.value.trim();

    if (timerInterval) clearInterval(timerInterval);

    if (userValue.length === 0) {
        // Use inline feedback instead of alert
        feedbackElement.innerText = "Please enter a guess.";
        feedbackElement.classList.remove('d-none');
        startInputPhase(); // restart timer
        return;
    }

    guessAttempt++;

    if (userValue === targetNumber) {
        // Successful guess, calculate score
        const pointsEarned = Math.max(1, BASE_POINTS - (guessAttempt - 1));
        finishGame(true, `You earned ${pointsEarned} points!`);
    } else {
        // Incorrect guess, penalize and move to re-exposure phase
        const penalty = guessAttempt - 1;

        // If the penalty reaches max points, game over.
        if (BASE_POINTS - penalty <= 0) {
            finishGame(false, `Incorrect guess: ${userValue}. Max penalty reached on attempt ${guessAttempt}.`);
            return;
        }

        feedbackElement.innerText = `Incorrect guess: ${userValue}. Penalty applied. The number will now briefly re-display.`;
        feedbackElement.classList.remove('d-none');

        startExposurePhase();
    }
}

// --- Phase D: Result ---
function finishGame(isWin, messageOverride) {
    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-message');

    if (timerInterval) clearInterval(timerInterval);
    if (displayTimeout) clearTimeout(displayTimeout);

    if (isWin) {
        const pointsMatch = messageOverride.match(/\d+/);
        const points = pointsMatch ? parseInt(pointsMatch[0]) : 0;

        updateSessionScore(points);

        title.innerText = "Correct! 🎉";
        title.className = "mb-3 text-success";
        msg.innerText = `${messageOverride} The number was ${targetNumber}.`;
    } else {
        title.innerText = "Game Over ❌";
        title.className = "mb-3 text-danger";
        msg.innerText = `${messageOverride}`;
    }

    switchView('result');
}

function restartGame() {
    startGame();
}

// --- Event Listener: Submit on Enter Key ---
document.getElementById('user-guess').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        submitGuess();
    }
});

// Initialize game on page load
displayCurrentScore();
showSetup();
