// Global State Variables
let operands = [];       // The 4 numbers the user must use
let target = 0;          // The target result number
const SCORE_KEY = 'mathhubSessionScore';
const POINTS_PER_WIN = 10;

// --- DOM References (Declared but not assigned until init) ---
let operandGroupEl;
let targetEl;
let inputEl;
let feedbackEl;
let scoreDisplay;
let resultModalInstance;
let modalBody;
let startCardEl;
let gameContentEl;


// --- DOM Element Initialization ---
function getDOMElements() {
    // 1. Assign ALL DOM References
    operandGroupEl = document.getElementById('operand-group');
    targetEl = document.getElementById('target-container');
    inputEl = document.getElementById('equation-input');
    feedbackEl = document.getElementById('feedback-message');
    scoreDisplay = document.getElementById('session-score-display');
    startCardEl = document.getElementById('start-card');
    gameContentEl = document.getElementById('game-content');

    // 2. Assign Modal Instance
    const resultModalEl = document.getElementById('resultModal');
    resultModalInstance = resultModalEl ? new bootstrap.Modal(resultModalEl) : null;
    modalBody = document.getElementById('modal-body-content');

    // 3. Set up the Enter key listener after the input element is found
    if (inputEl) {
        inputEl.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitEquation();
            }
        });
    }
}


// --- Score Management ---
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
    if(scoreDisplay) scoreDisplay.innerText = getSessionScore();
}

// --- Helper Functions ---

function hideFeedback() {
    if(feedbackEl) {
        feedbackEl.classList.add('d-none');
        feedbackEl.innerHTML = '';
    }
}

function showFeedback(message, isError = true) {
    if (!feedbackEl) return;
    feedbackEl.classList.remove('d-none');
    feedbackEl.classList.remove(isError ? 'alert-success' : 'alert-danger');
    feedbackEl.classList.add(isError ? 'alert-danger' : 'alert-success');
    feedbackEl.innerHTML = message;
}

/**
 * Renders the operand chips.
 */
function renderOperands() {
    if (!operandGroupEl) return;
    operandGroupEl.innerHTML = '';
    operands.forEach((num, index) => {
        const chip = document.createElement('span');
        chip.className = 'operand-chip';
        chip.id = `operand-${index}`;
        chip.innerText = num;
        operandGroupEl.appendChild(chip);
    });
}

// --- Game Initialization (Starts on button click) ---

function startGame() {
    // 1. Show the Game Content and Hide the Start Card
    if (startCardEl) startCardEl.classList.add('d-none');
    if (gameContentEl) gameContentEl.classList.remove('d-none');

    // 2. Generate Numbers
    operands = [];
    // Generate 4 numbers from 1 to 32
    for (let i = 0; i < 4; i++) {
        operands.push(Math.floor(Math.random() * 32) + 1);
    }
    // Generate 1 target number from 1 to 50
    target = Math.floor(Math.random() * 50) + 1;

    // 3. Render UI
    renderOperands();
    var old = document.getElementById('target-goal');
    if(old) { old.remove(); }
    if(targetEl){
      const chip = document.createElement('span');
      chip.className = 'operand-chip';
      chip.id = `target-goal`;
      chip.innerText = target;
      targetEl.appendChild(chip);
      //targetEl.innerText = target;
    }
    if(inputEl) inputEl.value = '';
    if(inputEl) inputEl.focus();
    hideFeedback();
}

// --- Validation and Submission ---

function submitEquation() {
    if (!inputEl) return;

    hideFeedback();
    const equation = inputEl.value.trim();
    if (!equation) {
        showFeedback("Please enter an equation.", true);
        return;
    }

    // --- Validation Step 1: Check Operand Usage ---
    const usedOperands = equation.match(/\d+/g) || []; // Extract all numbers from the string

    // Convert to arrays of strings for easy comparison
    const requiredOperandsStr = operands.map(String).sort();
    const usedOperandsStr = usedOperands.sort();

    // Check if the counts match
    if (requiredOperandsStr.length !== usedOperandsStr.length) {
        showFeedback(`Incorrect usage count. You must use exactly ${requiredOperandsStr.length} numbers. Found ${usedOperandsStr.length}.`, true);
        return;
    }

    // Check if the numbers themselves match the required set (order doesn't matter)
    if (requiredOperandsStr.join(',') !== usedOperandsStr.join(',')) {
        showFeedback("You must use the exact numbers provided in the group.", true);
        return;
    }

    // --- Validation Step 2: Evaluate the Expression (Syntax & Result) ---
    let result;
    try {
        // NOTE: eval() is necessary here to run the mathematical expression.
        // Safety note remains: it's used only for controlled numerical input.
        result = eval(equation);

        // Basic check for division by zero resulting in infinity
        if (!isFinite(result)) {
            throw new Error("Result is non-finite (division by zero or other mathematical error).");
        }

    } catch (e) {
        // Catches syntax errors (unmatched parentheses, etc.) or mathematical errors.
        showFeedback(`Equation Error: ${e.message}`, true);
        return;
    }

    // --- Validation Step 3: Check Final Result ---
    // Use loose tolerance for floating point numbers if needed, but for integers, exact match is best
    const finalResult = Math.round(result * 1000) / 1000; // Round to 3 decimals to avoid minor float errors

    if (finalResult === target) {
        handleWin(equation, finalResult);
    } else {
        showFeedback(`Equation evaluated to ${finalResult}. The target is ${target}. Keep trying!`, true);
    }
}


function handleWin(equation, result) {
    // 1. Update Score
    updateSessionScore(POINTS_PER_WIN);

    // 2. Show Modal
    if (!modalBody || !resultModalInstance) return;

    modalBody.innerHTML = `
        <h4 class="text-success">Success! 🎉</h4>
        <p>Your equation: <code>${equation}</code></p>
        <p>Evaluates to: <strong>${result}</strong></p>
        <p class="fs-4">You earned ${POINTS_PER_WIN} points!</p>
        <p class="text-muted small">Your total score is now ${getSessionScore()} points.</p>
    `;
    resultModalInstance.show();
}
