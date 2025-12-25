# ⚡ Быстрая настройка безопасности (2 минуты)

## 1. Генерируем API ключ

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Скопируйте результат (например: `a1b2c3d4e5f6...`)

---

## 2. Backend `.env`

Создайте/обновите `backend/.env`:

```bash
cd backend
cp .env.example .env
nano .env  # или любой редактор
```

Добавьте:

```env
OPENROUTER_API_KEY=ваш_openrouter_ключ
MODEL_NAME=openai/gpt-4o
API_KEY=ключ_из_шага_1
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 3. Frontend `.env`

Создайте `.env` в корне проекта:

```bash
cd ..  # вернуться в корень
cp .env.example .env
nano .env
```

Добавьте:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=тот_же_ключ_из_шага_1
```

⚠️ **ВАЖНО:** `VITE_API_KEY` = `API_KEY` (должны совпадать!)

---

## 4. Запуск

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
npm run dev
```

---

## ✅ Проверка

Backend покажет:

```
✅ API_KEY configured successfully
```

Если видите `⚠️  API_KEY not set!` - проверьте `.env` файлы.

---

**Готово!** Все уязвимости закрыты. 🎉

Подробности: [SECURITY_UPGRADE.md](SECURITY_UPGRADE.md)
