#!/bin/bash

# Скрипт для проверки статуса backend и просмотра логов
# Запускать на СЕРВЕРЕ (109.69.22.56)

echo "🔍 Проверка статуса backend..."
echo ""

# Проверка systemd сервиса
echo "1️⃣  Статус systemd сервиса:"
sudo systemctl status orchestra --no-pager -l | tail -20
echo ""

# Проверка процесса
echo "2️⃣  Процессы Python (backend):"
ps aux | grep "python.*main.py" | grep -v grep
echo ""

# Проверка логов приложения
echo "3️⃣  Последние логи приложения (logs/app.log):"
if [ -f /root/orchestra/backend/logs/app.log ]; then
    tail -30 /root/orchestra/backend/logs/app.log
else
    echo "⚠️  Файл логов не найден"
fi
echo ""

# Проверка переменных окружения
echo "4️⃣  Проверка .env файла:"
if [ -f /root/orchestra/backend/.env ]; then
    echo "✓ Файл .env существует"
    echo "OPENROUTER_API_KEY: $(grep OPENROUTER_API_KEY /root/orchestra/backend/.env | cut -c1-30)..."
    echo "MODEL_NAME: $(grep MODEL_NAME /root/orchestra/backend/.env)"
    echo "API_KEY: $(grep "^API_KEY=" /root/orchestra/backend/.env | cut -c1-20)..."
else
    echo "❌ Файл .env не найден!"
fi
echo ""

# Тест запроса
echo "5️⃣  Тестовый запрос к /query:"
curl -s -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $(grep '^API_KEY=' /root/orchestra/backend/.env | cut -d'=' -f2)" \
  -d '{"query":"Привет"}' | head -100
echo ""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Для просмотра логов в реальном времени:"
echo "  tail -f /root/orchestra/backend/logs/app.log"
echo ""
echo "Для перезапуска backend:"
echo "  sudo systemctl restart orchestra"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
