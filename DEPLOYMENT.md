# Инструкция по развертыванию Orchestra

## Первоначальная настройка сервера

### 1. Установка необходимого ПО
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nginx git nodejs npm
```

### 2. Клонирование проекта
```bash
cd ~
git clone <URL_вашего_репозитория> orchestra
cd orchestra
```

### 3. Настройка Python окружения
```bash
python3 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirements.txt
pip install langchain-openai langchain-core langgraph
cd ..
```

### 4. Настройка переменных окружения
```bash
# Скопировать пример и заполнить своими ключами
cp backend/.env.example backend/.env
nano backend/.env
```

Добавьте свои ключи:
```
OPENROUTER_API_KEY=ваш_ключ_здесь
MODEL_NAME=openai/gpt-4o
```

### 5. Сборка frontend
```bash
npm install
npm run build
```

### 6. Настройка systemd
```bash
sudo cp orchestra.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable orchestra
sudo systemctl start orchestra
```

### 7. Настройка nginx
```bash
# Создать папку для статики
sudo mkdir -p /var/www/orchestra

# Скопировать статику
sudo cp -r dist/* /var/www/orchestra/
sudo chown -R www-data:www-data /var/www/orchestra
sudo chmod -R 755 /var/www/orchestra

# Настроить nginx
sudo cp nginx-orchestra.conf /etc/nginx/sites-available/orchestra.conf
sudo ln -s /etc/nginx/sites-available/orchestra.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Проверка
Откройте в браузере: `http://ваш_IP_адрес`

---

## Обновление приложения

После внесения изменений в код и пуша в Git:

```bash
# На сервере запустите скрипт деплоя
cd ~/orchestra
./deploy.sh
```

Скрипт автоматически:
- Подтянет изменения из Git
- Обновит зависимости
- Пересоберет frontend
- Обновит конфигурации nginx и systemd
- Перезапустит сервисы

---

## Настройка домена (опционально)

### 1. Купить домен и привязать к серверу
Добавьте A-запись в DNS:
```
Тип: A
Имя: @
Значение: ваш_IP_адрес
```

### 2. Обновить nginx конфиг
В файле `nginx-orchestra.conf` замените:
```
server_name _;
```
на:
```
server_name ваш-домен.ru www.ваш-домен.ru;
```

### 3. Установить SSL сертификат
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

---

## Полезные команды

```bash
# Проверить статус backend
sudo systemctl status orchestra

# Посмотреть логи backend
sudo journalctl -u orchestra -f

# Проверить статус nginx
sudo systemctl status nginx

# Посмотреть логи nginx
sudo tail -f /var/log/nginx/orchestra_error.log
sudo tail -f /var/log/nginx/orchestra_access.log

# Перезапустить сервисы
sudo systemctl restart orchestra
sudo systemctl restart nginx
```
