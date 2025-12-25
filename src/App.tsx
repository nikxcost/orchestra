import { useState, useEffect } from 'react';
import { QueryForm } from './components/QueryForm';
import { ResultDisplay } from './components/ResultDisplay';
import { AgentCard } from './components/AgentCard';
import { AgentEditModal } from './components/AgentEditModal';
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
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
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
      setEditingAgent(agent);
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
      setEditingAgent(null);
    } catch (err) {
      console.error('Failed to save agent:', err);
      throw err;
    }
  };

  const handleCloseModal = () => {
    setAgentToEdit(null);
    setEditingAgent(null);
  };

  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Новый чат</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {history.length > 0 ? (
            <div className="space-y-1">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">
                        {item.request}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center mt-8">
              История пуста
            </p>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === 'online' ? 'bg-green-500' :
              backendStatus === 'offline' ? 'bg-red-500' :
              'bg-yellow-500'
            }`} />
            <span className="text-gray-400">
              {backendStatus === 'online' ? 'Онлайн' :
               backendStatus === 'offline' ? 'Оффлайн' :
               'Проверка...'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Оркестратор агентов
          </h1>
        </header>

        {/* Chat area */}
        <main className="flex-1 overflow-y-auto">
          {!result && !isLoading && !error ? (
            // Welcome screen
            <div className="h-full flex items-center justify-center px-4">
              <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Система оркестрации агентов
                  </h2>
                  <p className="text-gray-600">
                    Интеллектуальная маршрутизация запросов к специализированным агентам
                  </p>
                </div>

                {/* Agent cards */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
                    Доступные агенты
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
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
            <div className="max-w-3xl mx-auto px-4 py-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                  {backendStatus === 'offline' && (
                    <p className="text-xs text-red-600 mt-2">
                      Убедитесь, что backend запущен: <code className="bg-red-100 px-1 rounded">python backend/main.py</code>
                    </p>
                  )}
                </div>
              )}

              {isLoading && (
                <div className="mb-6 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {result && <ResultDisplay result={result} />}
            </div>
          )}
        </main>

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 py-4">
            {result ? (
              // Показываем кнопку "Новый чат" после получения результата
              <button
                onClick={handleNewChat}
                className="w-full px-4 py-3 bg-gray-900 text-white text-base font-medium rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                style={{ minHeight: '52px' }}
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
  );
}

export default App;
