let tg = null;

export function initTelegram() {
  tg = window.Telegram?.WebApp;

  if (!tg) {
    return {
      userId: 'local',
      username: 'друг',
      isTelegram: false,
    };
  }

  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0f1117');
  tg.setBackgroundColor('#0f1117');

  const user = tg.initDataUnsafe?.user;

  return {
    userId: user?.id?.toString() || 'unknown',
    username: user?.first_name || user?.username || 'друг',
    isTelegram: true,
  };
}

export function haptic(type = 'light') {
  if (!tg?.HapticFeedback) return;

  const map = {
    light: () => tg.HapticFeedback.impactOccurred('light'),
    medium: () => tg.HapticFeedback.impactOccurred('medium'),
    heavy: () => tg.HapticFeedback.impactOccurred('heavy'),
    success: () => tg.HapticFeedback.notificationOccurred('success'),
    error: () => tg.HapticFeedback.notificationOccurred('error'),
    warning: () => tg.HapticFeedback.notificationOccurred('warning'),
    selection: () => tg.HapticFeedback.selectionChanged(),
  };

  (map[type] || map.light)();
}

export function showMainButton(text, onClick) {
  if (!tg?.MainButton) return;

  tg.MainButton.setText(text);
  tg.MainButton.show();
  tg.MainButton.onClick(onClick);
}

export function hideMainButton() {
  if (!tg?.MainButton) return;
  tg.MainButton.hide();
  tg.MainButton.offClick();
}

export function getTelegram() {
  return tg;
}
