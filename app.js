import { initTelegram, haptic } from './telegram.js';
import {
  addHabit,
  deleteHabit,
  toggleHabitComplete,
  renderHabitsList,
  getStats,
  refreshStreaks,
} from './habits.js';
import { initTimer, stopTimerOnLeave } from './timer.js';

const tgUser = initTelegram();

const screens = {
  home: document.getElementById('screen-home'),
  habits: document.getElementById('screen-habits'),
  timer: document.getElementById('screen-timer'),
  stats: document.getElementById('screen-stats'),
};

const els = {
  greeting: document.getElementById('greeting'),
  homeHabitsList: document.getElementById('home-habits-list'),
  homeEmpty: document.getElementById('home-empty'),
  homeCompleted: document.getElementById('home-completed'),
  homeStreak: document.getElementById('home-streak'),
  habitsList: document.getElementById('habits-list'),
  habitsEmpty: document.getElementById('habits-empty'),
  statCompletedToday: document.getElementById('stat-completed-today'),
  statTotalHabits: document.getElementById('stat-total-habits'),
  statTotalStreak: document.getElementById('stat-total-streak'),
  statFocusSessions: document.getElementById('stat-focus-sessions'),
  topStreaks: document.getElementById('top-streaks'),
  modalOverlay: document.getElementById('modal-overlay'),
  habitInput: document.getElementById('habit-input'),
};

let currentScreen = 'home';

function init() {
  els.greeting.textContent = `Привет, ${tgUser.username}!`;

  initNavigation();
  initModal();
  initHabitActions();
  initTimer({ onSessionComplete: updateAllUI });

  refreshStreaks();
  updateAllUI();
}

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const screen = btn.dataset.screen;
      navigateTo(screen);
      haptic('selection');
    });
  });

  document.getElementById('btn-go-timer')?.addEventListener('click', () => {
    navigateTo('timer');
    haptic('light');
  });

  document.getElementById('btn-add-habit-home')?.addEventListener('click', openModal);
  document.getElementById('btn-add-habit')?.addEventListener('click', openModal);
}

function navigateTo(screen) {
  if (currentScreen === 'timer' && screen !== 'timer') {
    stopTimerOnLeave();
  }

  currentScreen = screen;

  Object.entries(screens).forEach(([key, el]) => {
    el?.classList.toggle('active', key === screen);
  });

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.screen === screen);
  });

  if (screen === 'stats') updateStats();
}

function initModal() {
  document.getElementById('btn-modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('btn-modal-save')?.addEventListener('click', saveHabit);

  els.modalOverlay?.addEventListener('click', (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });

  els.habitInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveHabit();
  });
}

function openModal() {
  els.modalOverlay?.classList.remove('hidden');
  els.habitInput.value = '';
  setTimeout(() => els.habitInput?.focus(), 100);
  haptic('light');
}

function closeModal() {
  els.modalOverlay?.classList.add('hidden');
  els.habitInput?.blur();
}

function saveHabit() {
  const name = els.habitInput?.value.trim();
  if (!name) {
    haptic('error');
    els.habitInput?.focus();
    return;
  }

  addHabit(name);
  closeModal();
  updateAllUI();
}

function initHabitActions() {
  const handleClick = (e) => {
    const card = e.target.closest('.habit-card');
    if (!card) return;

    const id = card.dataset.id;
    const action = e.target.closest('[data-action]')?.dataset.action;

    if (action === 'complete') {
      toggleHabitComplete(id);
      updateAllUI();
    } else if (action === 'delete') {
      deleteHabit(id);
      updateAllUI();
    }
  };

  els.homeHabitsList?.addEventListener('click', handleClick);
  els.habitsList?.addEventListener('click', handleClick);
}

function updateAllUI() {
  const stats = getStats();
  const { habits } = stats;

  renderHabitsList(els.homeHabitsList, habits.slice(0, 3), { compact: true, showDelete: false });
  renderHabitsList(els.habitsList, habits, { showDelete: true });

  els.homeEmpty?.classList.toggle('hidden', habits.length > 0);
  els.habitsEmpty?.classList.toggle('hidden', habits.length > 0);

  els.homeCompleted.textContent = stats.completedToday;
  els.homeStreak.textContent = stats.totalStreak;

  if (currentScreen === 'stats') updateStats();
}

function updateStats() {
  const stats = getStats();

  els.statCompletedToday.textContent = stats.completedToday;
  els.statTotalHabits.textContent = stats.totalHabits;
  els.statTotalStreak.textContent = stats.totalStreak;
  els.statFocusSessions.textContent = stats.focusSessions;

  const sorted = [...stats.habits].sort((a, b) => b.streak - a.streak).slice(0, 5);

  if (!els.topStreaks) return;

  if (sorted.length === 0) {
    els.topStreaks.innerHTML = '<p class="empty-state" style="padding:20px">Нет данных</p>';
    return;
  }

  els.topStreaks.innerHTML = sorted
    .map(
      (h) => `
      <div class="top-streak-item">
        <span class="top-streak-item__name">${escapeHtml(h.name)}</span>
        <span class="top-streak-item__value">🔥 ${h.streak}</span>
      </div>
    `
    )
    .join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
