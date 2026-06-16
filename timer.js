import { incrementFocusSessions } from './habits.js';
import { haptic } from './telegram.js';

const MODES = {
  focus: { duration: 25 * 60, label: 'Режим фокуса', color: 'focus' },
  break: { duration: 5 * 60, label: 'Перерыв', color: 'break' },
};

const CIRCUMFERENCE = 2 * Math.PI * 54;

let mode = 'focus';
let totalSeconds = MODES.focus.duration;
let remainingSeconds = totalSeconds;
let intervalId = null;
let isRunning = false;
let onSessionComplete = null;

const els = {};

export function initTimer(callbacks = {}) {
  onSessionComplete = callbacks.onSessionComplete;

  els.display = document.getElementById('timer-display');
  els.label = document.getElementById('timer-label');
  els.progress = document.getElementById('timer-progress');
  els.btnStartPause = document.getElementById('btn-start-pause');
  els.btnReset = document.getElementById('btn-reset');
  els.btnSkip = document.getElementById('btn-skip');
  els.modeFocus = document.getElementById('mode-focus');
  els.modeBreak = document.getElementById('mode-break');

  if (els.progress) {
    els.progress.style.strokeDasharray = CIRCUMFERENCE;
  }

  els.btnStartPause?.addEventListener('click', toggleTimer);
  els.btnReset?.addEventListener('click', resetTimer);
  els.btnSkip?.addEventListener('click', skipTimer);
  els.modeFocus?.addEventListener('click', () => setMode('focus'));
  els.modeBreak?.addEventListener('click', () => setMode('break'));

  updateDisplay();
}

function setMode(newMode) {
  if (isRunning) return;
  haptic('selection');

  mode = newMode;
  totalSeconds = MODES[mode].duration;
  remainingSeconds = totalSeconds;

  els.modeFocus?.classList.toggle('active', mode === 'focus');
  els.modeBreak?.classList.toggle('active', mode === 'break');
  els.label.textContent = MODES[mode].label;
  els.progress?.classList.toggle('break-mode', mode === 'break');

  updateDisplay();
}

function toggleTimer() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  isRunning = true;
  els.btnStartPause.textContent = 'PAUSE';
  haptic('medium');

  intervalId = setInterval(() => {
    remainingSeconds -= 1;

    if (remainingSeconds <= 0) {
      completeSession();
      return;
    }

    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(intervalId);
  intervalId = null;
  els.btnStartPause.textContent = 'START';
  haptic('light');
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = totalSeconds;
  updateDisplay();
  haptic('light');
}

function skipTimer() {
  pauseTimer();
  remainingSeconds = 0;
  completeSession();
}

function completeSession() {
  pauseTimer();

  if (mode === 'focus') {
    haptic('success');
    incrementFocusSessions();
    onSessionComplete?.();
    setMode('break');
    startTimer();
  } else {
    haptic('success');
    setMode('focus');
  }
}

function updateDisplay() {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const text = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (els.display) els.display.textContent = text;

  if (els.progress) {
    const progress = remainingSeconds / totalSeconds;
    els.progress.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  }
}

export function stopTimerOnLeave() {
  if (isRunning) pauseTimer();
}
