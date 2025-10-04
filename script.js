/* Stopwatch logic:
   - Uses Date.now() to compute elapsed time for accuracy.
   - startTime: timestamp when timer started (adjusted when resuming)
   - elapsed: milliseconds elapsed while paused or currently running
   - intervalId: the setInterval identifier (null when stopped)
*/

const displayHMS = document.getElementById('hms');
const displayMS = document.getElementById('ms');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const resetBtn = document.getElementById('reset');
const lapBtn = document.getElementById('lap');
const lapsList = document.getElementById('laps');
const themeToggle = document.getElementById('themeToggle');

let startTime = 0;     // timestamp when started
let elapsed = 0;       // elapsed time in ms (accumulated)
let intervalId = null; // interval reference

// Helper: pad numbers with leading zeros
function pad(number, digits = 2) {
  return String(number).padStart(digits, '0');
}

// Format milliseconds into "HH:MM:SS" and ".mmm"
function formatTime(msTotal) {
  const hours = Math.floor(msTotal / 3600000);
  const minutes = Math.floor((msTotal % 3600000) / 60000);
  const seconds = Math.floor((msTotal % 60000) / 1000);
  const milliseconds = msTotal % 1000;
  return {
    hms: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    ms: `.${pad(milliseconds,3)}`
  };
}

// Update display based on elapsed value
function updateDisplayFromElapsed() {
  const { hms, ms } = formatTime(elapsed);
  displayHMS.textContent = hms;
  displayMS.textContent = ms;
}

// Called repeatedly by setInterval when running
function tick() {
  elapsed = Date.now() - startTime;
  updateDisplayFromElapsed();
}

/* START:
   - If timer already running, return (prevents multiple timers).
   - If resuming, offset startTime so we continue from previous elapsed.
*/
function startTimer() {
  if (intervalId !== null) return; // already running
  startTime = Date.now() - elapsed; // handle resume
  // update frequently to show milliseconds (here every 50ms is smooth & efficient)
  intervalId = setInterval(tick, 50);
  // immediate update for snappy UI
  tick();
}

/* STOP:
   - Clears interval and keeps elapsed value so timer can be resumed */
function stopTimer() {
  if (intervalId === null) return; // already stopped
  clearInterval(intervalId);
  intervalId = null;
  elapsed = Date.now() - startTime; // finalize elapsed
  updateDisplayFromElapsed();
}

/* RESET:
   - Stops timer and clears elapsed and laps */
function resetTimer() {
  clearInterval(intervalId);
  intervalId = null;
  startTime = 0;
  elapsed = 0;
  updateDisplayFromElapsed();
  // clear laps
  lapsList.innerHTML = '';
}

/* LAP:
   - Records the current formatted time into the laps list */
function recordLap() {
  // if timer hasn't started and there is no elapsed time, ignore
  if (elapsed === 0) return;
  const { hms, ms } = formatTime(elapsed);
  const li = document.createElement('li');
  li.textContent = `${hms}${ms}`;
  // put newest on top
  lapsList.insertBefore(li, lapsList.firstChild);
}

/* Theme toggle: adds/removes 'dark' on body */
function toggleTheme() {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? 'Light' : 'Dark';
}

/* Button event listeners */
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);
lapBtn.addEventListener('click', recordLap);
themeToggle.addEventListener('click', toggleTheme);

/* Keyboard shortcuts (optional):
   - Space toggles start/stop
   - 'L' records lap
   - 'R' resets
*/
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (intervalId === null) startTimer(); else stopTimer();
  } else if (e.key.toLowerCase() === 'l') {
    recordLap();
  } else if (e.key.toLowerCase() === 'r') {
    resetTimer();
  }
});

// Initialize display (00:00:00.000)
updateDisplayFromElapsed();
