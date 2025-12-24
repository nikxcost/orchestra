import { QueryResponse } from '../types';
import { AGENTS } from '../config/agents';
import { CheckCircle2, RefreshCw, AlertCircle, ListChecks } from 'lucide-react';
import Markdown from 'markdown-to-jsx';

interface ResultDisplayProps {
  result: QueryResponse;
}

export const ResultDisplay = ({ result }: ResultDisplayProps) => {
  const selectedAgent = AGENTS.find((a) => a.id === result.route);

  const getStepLabel = (entry: string) => {
    if (entry.includes('Оркестратор')) return 'Оркестратор';
    if (entry.includes('Агент')) return 'Агент';
    if (entry.includes('Ревьюер')) return 'Ревьюер';
    if (entry.includes('Финальный ответ') || entry.includes('🏁')) return 'Финальный ответ';
    if (entry.includes('Итерация доработки')) return 'Доработка';
    return 'Шаг';
  };

  return (
    <div className="w-full max-w-4xl space-y-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${selectedAgent?.color || 'bg-gray-500'}`} />
          <h3 className="text-lg font-semibold text-gray-900">
            Выбран агент: {selectedAgent?.name || result.route}
          </h3>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-600 mb-1">Запрос:</p>
          <p className="text-gray-800">{result.input}</p>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm font-medium text-blue-900 mb-2">Ответ агента:</p>
          <div className="prose prose-sm max-w-none text-gray-800">
            <Markdown>{result.agent_response}</Markdown>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            {result.review_result === 'approved' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-700 font-medium">Одобрено</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-700 font-medium">Требуется доработка</span>
              </>
            )}
          </div>

          {result.iteration_count > 0 && (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                Итераций: {result.iteration_count}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Таймлайн / лог выполнения пайплайна */}
      {(result.log && result.log.length > 0) && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-5 h-5 text-gray-700" />
            <h4 className="font-semibold text-gray-800">Ход выполнения запроса (фактический таймлайн)</h4>
          </div>
          <ol className="space-y-3 text-sm text-gray-700">
            {result.log.map((entry, index) => (
              <li key={index} className="flex gap-3 items-start">
                <div className="flex flex-col items-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {index < result.log.length - 1 && (
                    <div className="w-px flex-1 bg-blue-200 mt-1" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
                    {getStepLabel(entry)}
                  </div>
                  <div className="whitespace-pre-wrap">{entry}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Старый текстовый контекст оставляем как резервный источник информации */}
      {result.context && (
        <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
            Контекст выполнения (сырой)
          </summary>
          <pre className="mt-3 text-sm text-gray-600 whitespace-pre-wrap font-mono">
            {result.context}
          </pre>
        </details>
      )}
    </div>
  );
};
