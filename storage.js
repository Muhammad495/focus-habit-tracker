const STORAGE_KEY = 'focus_habit_tracker_data';

const defaultData = () => ({
  habits: [],
  focusSessions: 0,
});

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const data = JSON.parse(raw);
    return {
      habits: Array.isArray(data.habits) ? data.habits : [],
      focusSessions: typeof data.focusSessions === 'number' ? data.focusSessions : 0,
    };
  } catch {
    return defaultData();
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function isCompletedToday(habit) {
  return habit.lastCompletedDate === getTodayKey();
}

export function getCompletedTodayCount(habits) {
  return habits.filter(isCompletedToday).length;
}

export function getTotalStreak(habits) {
  return habits.reduce((sum, h) => sum + (h.streak || 0), 0);
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const HABIT_ICONS = ['🎯', '💪', '📚', '💧', '🏃', '🧘', '✍️', '🎨', '🍎', '😴'];

export function getHabitIcon(name, index) {
  const lower = name.toLowerCase();
  if (lower.includes('спорт') || lower.includes('трен')) return '💪';
  if (lower.includes('чит') || lower.includes('учёб') || lower.includes('учеб')) return '📚';
  if (lower.includes('вод')) return '💧';
  if (lower.includes('бег') || lower.includes('ходьб')) return '🏃';
  if (lower.includes('медит')) return '🧘';
  return HABIT_ICONS[index % HABIT_ICONS.length];
}
