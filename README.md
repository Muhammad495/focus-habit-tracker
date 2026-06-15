# Focus & Habit Tracker

Минималистичное Telegram Mini App для отслеживания привычек и Pomodoro-таймера.

## Структура проекта

```
focus-habit-tracker/
├── index.html          # Главная страница (4 экрана)
├── css/
│   └── style.css       # Стили (тёмная тема)
├── js/
│   ├── app.js          # Точка входа, навигация, UI
│   ├── habits.js       # Логика привычек
│   ├── timer.js        # Pomodoro таймер
│   ├── storage.js      # localStorage
│   └── telegram.js     # Telegram WebApp API
├── package.json        # Скрипт для локального сервера
└── README.md
```

## Функции

- **Трекер привычек** — создание, отметка выполнения, streak
- **Фокус-таймер** — 25 мин работа / 5 мин отдых
- **Статистика** — прогресс за день, общий streak, фокус-сессии
- **Telegram** — приветствие по имени, haptic feedback
- **Хранение** — localStorage (данные сохраняются между сессиями)

## Локальный запуск

### Вариант 1: Python (без установки зависимостей)

```bash
cd focus-habit-tracker
python3 -m http.server 8080
```

Откройте: http://localhost:8080

### Вариант 2: npx serve

```bash
cd focus-habit-tracker
npx serve . -p 8080
```

### Вариант 3: npm script

```bash
cd focus-habit-tracker
npm install
npm start
```

> **Важно:** Mini App нужно открывать через HTTPS. Для локальной разработки используйте ngrok (см. ниже).

## Подключение к Telegram (BotFather)

### Шаг 1: Создайте бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Введите имя бота (например: `Focus Habit Tracker`)
4. Введите username (например: `my_focus_habit_bot`)
5. Сохраните **токен бота** — он понадобится, если добавите backend

### Шаг 2: Настройте Mini App

1. В BotFather отправьте `/mybots`
2. Выберите вашего бота → **Bot Settings** → **Menu Button**
3. Укажите:
   - **Button text:** `Открыть приложение` (или любой текст)
   - **Web App URL:** URL вашего приложения (HTTPS!)

Или через команду:

```
/newapp
```

Выберите бота и укажите URL приложения.

### Шаг 3: Задеплойте приложение (HTTPS обязателен)

Telegram Mini App **не работает** с `http://localhost`. Нужен публичный HTTPS URL.

**Бесплатные варианты:**

| Сервис | Как задеплоить |
|--------|----------------|
| [Vercel](https://vercel.com) | `npx vercel --prod` |
| [Netlify](https://netlify.com) | Drag & drop папку или `npx netlify deploy` |
| [GitHub Pages](https://pages.github.com) | Push в репозиторий, включить Pages |
| [Cloudflare Pages](https://pages.cloudflare.com) | Подключить репозиторий |

**Локальная разработка через ngrok:**

```bash
# Терминал 1
python3 -m http.server 8080

# Терминал 2
ngrok http 8080
```

Скопируйте HTTPS URL из ngrok (например `https://abc123.ngrok.io`) и вставьте в BotFather.

### Шаг 4: Настройте Menu Button

В BotFather:

```
/mybots → [ваш бот] → Bot Settings → Menu Button → Configure menu button
```

- **URL:** `https://ваш-домен.com` (или ngrok URL)
- **Button text:** `🎯 Focus Tracker`

### Шаг 5: Откройте Mini App

1. Откройте чат с вашим ботом в Telegram
2. Нажмите кнопку **Menu** (≡) внизу слева от поля ввода
3. Или отправьте `/start` — если настроена кнопка Web App в сообщении

## Добавление кнопки Web App в /start (опционально)

Если хотите кнопку прямо в сообщении, создайте простого бота на Python:

```python
# bot.py — минимальный пример
import os
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

TOKEN = os.environ["BOT_TOKEN"]
WEBAPP_URL = os.environ["WEBAPP_URL"]  # https://ваш-домен.com

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[KeyboardButton(
        text="🎯 Открыть Focus Tracker",
        web_app=WebAppInfo(url=WEBAPP_URL)
    )]]
    await update.message.reply_text(
        "Привет! Нажми кнопку, чтобы открыть приложение:",
        reply_markup=ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    )

app = Application.builder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.run_polling()
```

```bash
pip install python-telegram-bot
export BOT_TOKEN="ваш_токен"
export WEBAPP_URL="https://ваш-домен.com"
python bot.py
```

## Данные пользователя

Все данные хранятся в `localStorage` браузера:

```json
{
  "habits": [
    {
      "id": "abc123",
      "name": "спорт",
      "streak": 5,
      "lastCompletedDate": "2026-06-15",
      "createdAt": "2026-06-10"
    }
  ],
  "focusSessions": 12
}
```

Ключ: `focus_habit_tracker_data`

## Telegram WebApp API

Приложение использует:

- `Telegram.WebApp.ready()` — инициализация
- `Telegram.WebApp.expand()` — разворот на весь экран
- `initDataUnsafe.user` — имя и ID пользователя
- `HapticFeedback` — вибрация при действиях

Вне Telegram приложение работает в режиме демо с именем «друг».

## Экраны

| Экран | Описание |
|-------|----------|
| Home | Приветствие, быстрая статистика, топ-3 привычки |
| Привычки | Полный список, отметка выполнения, удаление |
| Таймер | Pomodoro 25/5, Start/Pause/Reset |
| Статистика | Прогресс, streak, фокус-сессии |

## Лицензия

MIT — свободное использование.
