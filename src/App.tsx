import { useState, useEffect } from 'react';
import { QueryForm } from './components/QueryForm';
import { ResultDisplay } from './components/ResultDisplay';
import { AgentCard } from './components/AgentCard';
import { AgentEditModal } from './components/AgentEditModal';
import { ToastProvider } from './components/Toast';
import { ResponseSkeleton } from './components/Skeleton';
import { queryOrchestrator, checkHealth, getAgents, getAgent, updateAgent } from './services/api';
import type { QueryResponse, QueryHistoryItem, Agent } from './types';
import { MessageSquare, Plus, Menu, X } from 'lucide-react';

function App() {
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentToEdit, setAgentToEdit] = useState<(Agent & { prompt: string }) | null>(null);

  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));

    // Загружаем агентов из backend
    getAgents()
      .then((data) => setAgents(data))
      .catch((err) => console.error('Failed to load agents:', err));

    try {
      const raw = window.localStorage.getItem('orchestrator_history_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as QueryHistoryItem[];
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch {
      // Игнорируем ошибки
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

      const newItem: QueryHistoryItem = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        request: query,
        response,
      };
      const nextHistory = [newItem, ...history];
      setHistory(nextHistory);
      try {
        window.localStorage.setItem('orchestrator_history_v1', JSON.stringify(nextHistory));
      } catch {
        // Игнорируем
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обработке запроса');
      setBackendStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setResult(null);
    setError(null);
  };

  const handleHistoryClick = (item: QueryHistoryItem) => {
    setResult(item.response);
    setError(null);
  };

  const handleEditAgent = async (agent: Agent) => {
    try {
      // Загружаем полные данные агента включая промпт
      const fullAgent = await getAgent(agent.id);
      setAgentToEdit(fullAgent);
    } catch (err) {
      console.error('Failed to load agent details:', err);
      alert('Не удалось загрузить данные агента');
    }
  };

  const handleSaveAgent = async (updatedAgent: Agent & { prompt: string }) => {
    try {
      await updateAgent(updatedAgent.id, {
        name: updatedAgent.name,
        description: updatedAgent.description,
        prompt: updatedAgent.prompt,
        color: updatedAgent.color,
      });

      // Обновляем список агентов
      const updatedAgents = await getAgents();
      setAgents(updatedAgents);

      setAgentToEdit(null);
    } catch (err) {
      console.error('Failed to save agent:', err);
      throw err;
    }
  };

  const handleCloseModal = () => {
    setAgentToEdit(null);
  };

  return (
    <ToastProvider>
    <div className="flex h-screen bg-neutral-50 text-neutral-900">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-72' : 'w-0'
        } bg-neutral-900 text-white transition-all duration-300 ease-in-out overflow-hidden flex flex-col shadow-2xl`}
      >
        <div className="p-4 border-b border-neutral-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 transition-smooth focus-ring"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-semibold">Новый чат</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {history.length > 0 ? (
            <div className="space-y-1.5">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full text-left px-3 py-3 rounded-xl hover:bg-neutral-800 transition-smooth group"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-500 group-hover:text-neutral-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-200 truncate group-hover:text-white">
                        {item.request}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center mt-12 px-4">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-neutral-700" />
              <p className="text-sm text-neutral-500">
                История пуста
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-neutral-800/50 rounded-lg">
            <div className={`w-2.5 h-2.5 rounded-full ${
              backendStatus === 'online' ? 'bg-success-500 shadow-lg shadow-success-500/50' :
              backendStatus === 'offline' ? 'bg-error-500 shadow-lg shadow-error-500/50' :
              'bg-warning-500 animate-pulse'
            }`} />
            <span className="text-xs font-medium text-neutral-400">
              {backendStatus === 'online' ? 'Онлайн' :
               backendStatus === 'offline' ? 'Оффлайн' :
               'Проверка...'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 hover:bg-neutral-100 rounded-xl transition-smooth focus-ring"
            aria-label={isSidebarOpen ? 'Закрыть сайдбар' : 'Открыть сайдбар'}
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-neutral-600" />
            ) : (
              <Menu className="w-5 h-5 text-neutral-600" />
            )}
          </button>
          <h1 className="text-xl font-bold text-neutral-900 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Orchestra
          </h1>
          <span className="text-sm text-neutral-500 font-medium">
            Оркестратор агентов
          </span>
        </header>

        {/* Chat area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-neutral-50 to-white">
          {!result && !isLoading && !error ? (
            // Welcome screen
            <div className="h-full flex items-start justify-center px-4 pt-20 pb-12 overflow-y-auto">
              <div className="max-w-5xl w-full animate-fadeIn">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 mb-6 shadow-xl">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-neutral-900 mb-3">
                    Система оркестрации агентов
                  </h2>
                  <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                    Интеллектуальная маршрутизация запросов к специализированным AI-агентам
                  </p>
                </div>

                {/* Agent cards */}
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
                    <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider px-4">
                      Доступные агенты
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {agents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        isActive={false}
                        onEdit={handleEditAgent}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Messages area
            <div className="max-w-4xl mx-auto px-6 py-10">
              {error && (
                <div className="mb-8 p-5 bg-error-50 border-2 border-error-200 rounded-2xl animate-slideUp">
                  <p className="text-sm text-error-800 font-medium">{error}</p>
                  {backendStatus === 'offline' && (
                    <p className="text-xs text-error-700 mt-3 bg-error-100 px-3 py-2 rounded-lg font-mono">
                      Backend не запущен. Выполните: <code className="font-bold">python backend/main.py</code>
                    </p>
                  )}
                </div>
              )}

              {isLoading && (
                <div className="mb-8">
                  <ResponseSkeleton />
                </div>
              )}

              {result && <ResultDisplay result={result} />}
            </div>
          )}
        </main>

        {/* Input area */}
        <div className="border-t border-neutral-200 bg-white shadow-2xl">
          <div className="max-w-4xl mx-auto px-6 py-5">
            {result ? (
              // Показываем кнопку "Новый чат" после получения результата
              <button
                onClick={handleNewChat}
                className="w-full px-6 py-4 bg-neutral-900 text-white text-base font-semibold rounded-2xl hover:bg-neutral-700 hover:shadow-lg transition-smooth flex items-center justify-center gap-2.5 focus-ring"
                style={{ minHeight: '60px' }}
              >
                <Plus className="w-5 h-5" />
                Новый чат
              </button>
            ) : (
              // Показываем форму ввода, если нет результата
              <QueryForm onSubmit={handleQuery} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>

      {/* Agent Edit Modal */}
      {agentToEdit && (
        <AgentEditModal
          agent={agentToEdit}
          isOpen={true}
          onClose={handleCloseModal}
          onSave={handleSaveAgent}
        />
      )}
    </div>
    </ToastProvider>
  );
}

export default App;
