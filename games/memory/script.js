// Global State Variables
let targetNumber = "";
let timerInterval = null;
let settings = {
    digits: 6,
    displayTime: 0.5,
    inputTime: 7
};

// --- DOM Elements ---
const views = {
    setup: document.getElementById('state-setup'),
    exposure: document.getElementById('state-exposure'),
    input: document.getElementById('state-input'),
    result: document.getElementById('state-result')
};

// Helper to switch views
function switchView(viewName) {
    // Hide all
    Object.values(views).forEach(el => el.classList.add('d-none'));
    // Show requested
    views[viewName].classList.remove('d-none');
}

// --- Game Logic ---

function showSetup() {
    switchView('setup');
}

function startGame() {
    // 1. Read Configuration
    settings.digits = parseInt(document.getElementById('cfg-digits').value);
    settings.displayTime = parseFloat(document.getElementById('cfg-display').value);
    settings.inputTime = parseInt(document.getElementById('cfg-input').value);

    // 2. Generate Number
    // Generate a random number between 10^(n-1) and 10^n - 1
    const min = Math.pow(10, settings.digits - 1);
    const max = Math.pow(10, settings.digits) - 1;
    targetNumber = Math.floor(Math.random() * (max - min + 1) + min).toString();

    // 3. Show Exposure Phase
    const displayEl = document.getElementById('target-number');
    displayEl.innerText = targetNumber;
    switchView('exposure');

    // 4. Set Timer to hide number
    setTimeout(() => {
        startInputPhase();
    }, settings.displayTime * 1000);
}

function startInputPhase() {
    // 1. Reset Input UI
    const inputEl = document.getElementById('user-guess');
    inputEl.value = '';
    switchView('input');
    inputEl.focus(); // Auto focus for keyboard users

    // 2. Handle Countdown
    let timeLeft = settings.inputTime;
    const bar = document.getElementById('time-bar');
    const updateRate = 50; // Update every 50ms for smoothness
    
    // Clear any existing timer
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft -= (updateRate / 1000);
        
        // Update width percentage
        const percent = (timeLeft / settings.inputTime) * 100;
        bar.style.width = percent + "%";

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishGame(false, "Time's up!");
        }
    }, updateRate);
}

function submitGuess() {
    const inputEl = document.getElementById('user-guess');
    const userValue = inputEl.value;
    
    // Stop the timer immediately
    if (timerInterval) clearInterval(timerInterval);

    if (userValue === targetNumber) {
        finishGame(true);
    } else {
        finishGame(false, `You wrote ${userValue}.`);
    }
}

function finishGame(isWin, messageOverride) {
    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-message');
    
    if (isWin) {
        title.innerText = "Correct! 🎉";
        title.className = "mb-3 text-success";
        msg.innerText = `The number was indeed ${targetNumber}.`;
    } else {
        title.innerText = "Incorrect ❌";
        title.className = "mb-3 text-danger";
        // Use override message if provided (e.g. Timeout), otherwise default
        msg.innerText = messageOverride ? 
            `${messageOverride} The target was ${targetNumber}.` : 
            `The target was ${targetNumber}.`;
    }

    switchView('result');
}

function restartGame() {
    startGame();
}

// Handle "Enter" key in input field
document.getElementById('user-guess').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        submitGuess();
    }
});

