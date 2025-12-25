#!/bin/bash

# Скрипт деплоя Orchestra на сервер

echo "🚀 Начинаем деплой Orchestra..."

# Переходим в папку проекта
cd /root/orchestra || exit 1

# Подтягиваем последние изменения из Git
echo "📥 Получаем изменения из Git..."
git pull origin main

# Активируем виртуальное окружение
source venv/bin/activate

# Обновляем зависимости Python (если изменились)
echo "📦 Обновляем Python зависимости..."
cd backend
pip install -r requirements.txt --upgrade
cd ..

# Обновляем зависимости Node.js (если изменились)
echo "📦 Обновляем Node.js зависимости..."
npm install

# Собираем frontend
echo "🔨 Собираем React frontend..."
npm run build

# Обновляем конфигурацию systemd (если изменилась)
echo "⚙️ Обновляем конфигурацию systemd..."
sudo cp orchestra.service /etc/systemd/system/
sudo systemctl daemon-reload

# Обновляем конфигурацию nginx (если изменилась)
echo "⚙️ Обновляем конфигурацию nginx..."
sudo cp nginx-orchestra.conf /etc/nginx/sites-available/orchestra.conf
sudo nginx -t

# Копируем новый build в /var/www/orchestra
echo "📂 Копируем файлы frontend..."
sudo rm -rf /var/www/orchestra/*
sudo cp -r dist/* /var/www/orchestra/
sudo chown -R www-data:www-data /var/www/orchestra
sudo chmod -R 755 /var/www/orchestra

# Перезапускаем backend
echo "🔄 Перезапускаем FastAPI backend..."
sudo systemctl restart orchestra

# Перезапускаем nginx
echo "🔄 Перезапускаем nginx..."
sudo systemctl restart nginx

echo "✅ Деплой завершён успешно!"
echo "🌐 Приложение доступно по адресу: http://109.69.22.56"
