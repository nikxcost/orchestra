import { useState, useEffect } from 'react';
import { QueryForm } from './components/QueryForm';
import { ResultDisplay } from './components/ResultDisplay';
import { AgentCard } from './components/AgentCard';
import { AGENTS } from './config/agents';
import { queryOrchestrator, checkHealth } from './services/api';
import { QueryResponse } from './types';
import { Network, AlertCircle } from 'lucide-react';

function App() {
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const handleQuery = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await queryOrchestrator(query);
      setResult(response);
      setBackendStatus('online');
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <Network className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Система оркестрации агентов
            </h1>
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

        <div className="flex flex-col items-center gap-8 mb-12">
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
            <div className="w-full max-w-4xl bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              <p className="text-blue-800 font-medium">
                Обработка запроса... Ожидаем полный лог работы оркестратора и агентов.
              </p>
            </div>
          )}

          {result && <ResultDisplay result={result} />}
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
      </div>
    </div>
  );
}

export default App;
