import { useState, useEffect, useRef } from 'react';
import { QueryForm } from './components/QueryForm';
import { ResultDisplay } from './components/ResultDisplay';
import { AgentCard } from './components/AgentCard';
import { AGENTS } from './config/agents';
import { queryOrchestrator, checkHealth } from './services/api';
import type { QueryResponse, QueryHistoryItem } from './types';
import { Network, AlertCircle, Clock, History } from 'lucide-react';

function App() {
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historySectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));

    // Загружаем историю из localStorage (если есть)
    try {
      const raw = window.localStorage.getItem('orchestrator_history_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as QueryHistoryItem[];
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 3));
        }
      }
    } catch {
      // Игнорируем ошибки парсинга, работаем с пустой историей
    }
  }, []);

  const handleQuery = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await queryOrchestrator(query);
      setResult(response);
      setBackendStatus('online');

       // Обновляем историю: добавляем новый запрос/ответ и обрезаем до трёх записей
      const newItem: QueryHistoryItem = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        request: query,
        response,
      };
      const nextHistory = [newItem, ...history].slice(0, 3);
      setHistory(nextHistory);
      try {
        window.localStorage.setItem('orchestrator_history_v1', JSON.stringify(nextHistory));
      } catch {
        // Если localStorage недоступен/переполнен — просто не сохраняем, но UI не ломаем
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обработке запроса');
      setBackendStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Network className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Система оркестрации агентов
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                if (history.length === 0) return;
                setIsHistoryOpen((prev) => !prev);
                historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              disabled={history.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
            >
              <History className="w-4 h-4" />
              История
              {history.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-blue-600 text-white">
                  {history.length}
                </span>
              )}
            </button>
          </div>
          <p className="text-gray-600 text-lg">
            Интеллектуальная маршрутизация запросов к специализированным агентам
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === 'online' ? 'bg-green-500' :
              backendStatus === 'offline' ? 'bg-red-500' :
              'bg-yellow-500 animate-pulse'
            }`} />
            <span className="text-sm text-gray-600">
              Backend: {
                backendStatus === 'online' ? 'Онлайн' :
                backendStatus === 'offline' ? 'Оффлайн' :
                'Проверка...'
              }
            </span>
          </div>
        </header>

        <div className="flex flex-col md:flex-row items-start gap-6 mb-12">
          {/* Левое сайд-меню истории для desktop */}
          {isHistoryOpen && history.length > 0 && (
            <aside className="hidden md:block w-72 bg-white border border-gray-200 rounded-lg shadow-sm p-4 sticky top-6 self-start">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-700" />
                  <h2 className="text-sm font-semibold text-gray-800">История обращений</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Закрыть
                </button>
              </div>
              <ul className="space-y-2 text-sm">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setResult(item.response);
                        setError(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-left p-2 rounded border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </div>
                      <div className="font-medium text-gray-800 line-clamp-2">
                        {item.request}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Маршрут: {item.response.route || 'unknown'}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Основная колонка с формой и текущим результатом */}
          <div className="flex-1 flex flex-col items-center gap-8">
          <QueryForm onSubmit={handleQuery} isLoading={isLoading} />

          {backendStatus === 'offline' && !isLoading && (
            <div className="w-full max-w-4xl bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Backend не доступен</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Убедитесь, что backend запущен на http://localhost:8000
                </p>
                <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded">
                  cd backend{'\n'}
                  python main.py
                </pre>
              </div>
            </div>
          )}

          {error && (
            <div className="w-full max-w-4xl bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Ошибка</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="w-full max-w-4xl bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              <p className="text-blue-800 font-medium">Обработка запроса...</p>
            </div>
          )}

          {result && <ResultDisplay result={result} />}
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Доступные агенты
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {AGENTS.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isActive={result?.route === agent.id}
              />
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Как это работает</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Оркестратор анализирует ваш запрос и определяет наиболее подходящего агента</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Выбранный агент обрабатывает запрос, используя свою специализацию</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Ревьюер проверяет качество ответа</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>При необходимости запрос отправляется на доработку</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">5</span>
              <span>Вы получаете проверенный и качественный ответ</span>
            </li>
          </ol>
        </section>

        {history.length > 0 && (
          <section
            ref={historySectionRef}
            className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">История обращений (последние 3)</h2>
            </div>
            <ul className="space-y-4">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      Маршрут: {item.response.route || 'unknown'} · Статус ревью:{' '}
                      {item.response.review_result || '—'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">Запрос:</p>
                    <p className="text-sm text-gray-900">{item.request}</p>
                  </div>
                  <details className="mt-2">
                    <summary className="text-sm text-blue-700 cursor-pointer">
                      Показать детали обработки (контекст)
                    </summary>
                    <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap bg-white rounded p-2 border border-gray-200">
                      {item.response.context}
                    </pre>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
