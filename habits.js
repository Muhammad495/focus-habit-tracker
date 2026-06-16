import {
  loadData,
  saveData,
  getTodayKey,
  isCompletedToday,
  getCompletedTodayCount,
  getTotalStreak,
  generateId,
  getHabitIcon,
} from './storage.js';
import { haptic } from './telegram.js';

function calcStreak(lastDate, currentStreak) {
  if (!lastDate) return 0;

  const today = getTodayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (lastDate === today) return currentStreak;
  if (lastDate === yesterdayKey) return currentStreak;
  return 0;
}

export function addHabit(name) {
  const data = loadData();
  const habit = {
    id: generateId(),
    name: name.trim(),
    streak: 0,
    lastCompletedDate: null,
    createdAt: getTodayKey(),
  };
  data.habits.push(habit);
  saveData(data);
  haptic('success');
  return habit;
}

export function deleteHabit(id) {
  const data = loadData();
  data.habits = data.habits.filter((h) => h.id !== id);
  saveData(data);
  haptic('light');
}

export function toggleHabitComplete(id) {
  const data = loadData();
  const habit = data.habits.find((h) => h.id === id);
  if (!habit) return data;

  const today = getTodayKey();

  if (isCompletedToday(habit)) {
    habit.lastCompletedDate = null;
    habit.streak = Math.max(0, habit.streak - 1);
    haptic('light');
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    if (habit.lastCompletedDate === yesterdayKey) {
      habit.streak += 1;
    } else if (!habit.lastCompletedDate) {
      habit.streak = 1;
    } else {
      habit.streak = 1;
    }

    habit.lastCompletedDate = today;
    haptic('success');
  }

  saveData(data);
  return data;
}

export function refreshStreaks() {
  const data = loadData();
  let changed = false;

  data.habits.forEach((habit) => {
    const valid = calcStreak(habit.lastCompletedDate, habit.streak);
    if (valid !== habit.streak && !isCompletedToday(habit)) {
      habit.streak = valid;
      changed = true;
    }
  });

  if (changed) saveData(data);
  return data;
}

export function renderHabitCard(habit, index, { compact = false, showDelete = true } = {}) {
  const done = isCompletedToday(habit);
  const icon = getHabitIcon(habit.name, index);

  return `
    <div class="habit-card ${done ? 'habit-card--done' : ''}" data-id="${habit.id}">
      <div class="habit-card__icon">${icon}</div>
      <div class="habit-card__info">
        <div class="habit-card__name">${escapeHtml(habit.name)}</div>
        <div class="habit-card__streak">🔥 <strong>${habit.streak}</strong> ${pluralDays(habit.streak)}</div>
      </div>
      <div class="habit-card__actions">
        <button class="btn-complete ${done ? 'btn-complete--done' : ''}" data-action="complete" aria-label="Выполнить">
          ✔
        </button>
        ${showDelete && !compact ? `<button class="btn-delete" data-action="delete" aria-label="Удалить">✕</button>` : ''}
      </div>
    </div>
  `;
}

export function renderHabitsList(container, habits, options = {}) {
  if (!container) return;

  if (habits.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = habits
    .map((h, i) => renderHabitCard(h, i, options))
    .join('');
}

export function getStats() {
  const data = refreshStreaks();
  return {
    completedToday: getCompletedTodayCount(data.habits),
    totalHabits: data.habits.length,
    totalStreak: getTotalStreak(data.habits),
    focusSessions: data.focusSessions,
    habits: data.habits,
  };
}

export function incrementFocusSessions() {
  const data = loadData();
  data.focusSessions += 1;
  saveData(data);
  return data.focusSessions;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function pluralDays(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return 'дней подряд';
  if (mod10 === 1) return 'день подряд';
  if (mod10 >= 2 && mod10 <= 4) return 'дня подряд';
  return 'дней подряд';
}
