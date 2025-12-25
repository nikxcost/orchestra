#!/bin/bash

# Скрипт для тестирования query endpoint
# Можно запускать локально для проверки сервера

SERVER="${1:-http://109.69.22.56}"
API_KEY="CNRaeNw0q5XIMQJNN_9nC8O3X1l5HUT2sD83MXd68xk"

echo "🧪 Тестирование backend на $SERVER"
echo ""

# Тест 1: Health check
echo "1️⃣  Health check:"
HEALTH=$(curl -s "$SERVER/api/health")
if echo "$HEALTH" | grep -q "healthy"; then
    echo "   ✓ Health check OK: $HEALTH"
else
    echo "   ✗ Health check FAILED"
    exit 1
fi
echo ""

# Тест 2: Agents endpoint
echo "2️⃣  Agents endpoint:"
AGENTS=$(curl -s -H "X-API-Key: $API_KEY" "$SERVER/api/agents")
AGENT_COUNT=$(echo "$AGENTS" | grep -o '"id"' | wc -l)
if [ "$AGENT_COUNT" -gt 0 ]; then
    echo "   ✓ Agents endpoint OK ($AGENT_COUNT agents)"
else
    echo "   ✗ Agents endpoint FAILED"
    exit 1
fi
echo ""

# Тест 3: Query endpoint
echo "3️⃣  Query endpoint:"
echo "   Отправка запроса..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST "$SERVER/api/query" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"query":"Привет, как дела?"}')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "   HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✓ Query endpoint OK"
    echo "$BODY" | head -20
elif [ "$HTTP_CODE" = "500" ]; then
    echo "   ✗ Internal Server Error"
    echo "   Response: $BODY"
    echo ""
    echo "   Возможные причины:"
    echo "   1. OPENROUTER_API_KEY не установлен или неверный"
    echo "   2. MODEL_NAME указывает на несуществующую модель"
    echo "   3. Проблема с langchain/langgraph"
    echo "   4. Ошибка в orchestrator.py"
    echo ""
    echo "   Для диагностики на сервере запустите:"
    echo "   ssh root@109.69.22.56"
    echo "   cd /root/orchestra"
    echo "   ./check-backend-logs.sh"
elif [ "$HTTP_CODE" = "429" ]; then
    echo "   ⚠ Rate limit exceeded (10 requests/minute)"
else
    echo "   ✗ Unexpected error: $BODY"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Все тесты пройдены!"
else
    echo "❌ Тесты не прошли. Проверьте логи на сервере."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
