#!/bin/bash

# Скрипт проверки корректности развертывания Orchestra

echo "🔍 Проверка развертывания Orchestra..."
echo ""

SERVER="http://109.69.22.56"
ERRORS=0

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Проверка health endpoint через /api/
echo "1️⃣  Проверка API health endpoint (/api/health)..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -H "Origin: $SERVER" "$SERVER/api/health")
HTTP_CODE="${HEALTH_RESPONSE: -3}"
BODY="${HEALTH_RESPONSE%???}"

if [ "$HTTP_CODE" == "200" ] && echo "$BODY" | grep -q "healthy"; then
    echo -e "   ${GREEN}✓${NC} API health endpoint работает (HTTP $HTTP_CODE)"
else
    echo -e "   ${RED}✗${NC} API health endpoint не отвечает (HTTP $HTTP_CODE)"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Проверка CORS заголовков
echo "2️⃣  Проверка CORS заголовков..."
CORS_HEADERS=$(curl -s -I -H "Origin: $SERVER" "$SERVER/api/health" | grep -i "access-control")
if echo "$CORS_HEADERS" | grep -q "access-control-allow-origin"; then
    echo -e "   ${GREEN}✓${NC} CORS заголовки настроены"
    echo "   $CORS_HEADERS" | sed 's/^/   /'
else
    echo -e "   ${RED}✗${NC} CORS заголовки отсутствуют"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Проверка frontend
echo "3️⃣  Проверка frontend..."
FRONTEND_RESPONSE=$(curl -s -w "%{http_code}" "$SERVER/")
HTTP_CODE="${FRONTEND_RESPONSE: -3}"
BODY="${FRONTEND_RESPONSE%???}"

if [ "$HTTP_CODE" == "200" ] && echo "$BODY" | grep -q "Orchestra"; then
    echo -e "   ${GREEN}✓${NC} Frontend доступен (HTTP $HTTP_CODE)"

    # Проверяем правильный ли API URL в JS
    JS_FILE=$(echo "$BODY" | grep -o 'src="/assets/index-[^"]*\.js"' | sed 's/src="\(.*\)"/\1/')
    if [ -n "$JS_FILE" ]; then
        echo "   Проверяем JS файл: $JS_FILE"
        API_URL=$(curl -s "$SERVER$JS_FILE" | grep -o 'API_BASE_URL="[^"]*"' | head -1)
        if echo "$API_URL" | grep -q "$SERVER/api"; then
            echo -e "   ${GREEN}✓${NC} API URL настроен правильно: $API_URL"
        else
            echo -e "   ${YELLOW}⚠${NC}  API URL: $API_URL (ожидалось: $SERVER/api)"
        fi
    fi
else
    echo -e "   ${RED}✗${NC} Frontend недоступен (HTTP $HTTP_CODE)"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Проверка cache headers для HTML
echo "4️⃣  Проверка cache заголовков для HTML..."
CACHE_HEADERS=$(curl -s -I "$SERVER/" | grep -i "cache-control")
if echo "$CACHE_HEADERS" | grep -q "no-cache\|no-store"; then
    echo -e "   ${GREEN}✓${NC} Cache для HTML отключен"
    echo "   $CACHE_HEADERS" | sed 's/^/   /'
else
    echo -e "   ${YELLOW}⚠${NC}  Cache headers для HTML могут вызывать проблемы"
    echo "   $CACHE_HEADERS" | sed 's/^/   /'
fi
echo ""

# 5. Проверка доступности с мобильного
echo "5️⃣  Рекомендации для тестирования с мобильного:"
echo "   📱 Откройте на телефоне: $SERVER"
echo "   🧹 Очистите кэш браузера (Settings -> Clear browsing data)"
echo "   🔄 Обновите страницу с принудительным обновлением (hard refresh)"
echo "   🔍 Проверьте console в browser dev tools на наличие ошибок"
echo ""

# Итоговый результат
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Все проверки пройдены успешно!${NC}"
    echo ""
    echo "Если на телефоне всё ещё показывается ошибка:"
    echo "1. Очистите кэш браузера на телефоне"
    echo "2. Попробуйте режим инкогнито/приватный режим"
    echo "3. Проверьте, что телефон подключен к интернету"
    echo "4. Убедитесь, что можете открыть $SERVER в браузере телефона"
else
    echo -e "${RED}✗ Обнаружено ошибок: $ERRORS${NC}"
    echo "Пожалуйста, исправьте ошибки и повторите проверку"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
