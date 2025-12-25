import { QueryResponse } from '../types';
import { User, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { useState } from 'react';

interface ResultDisplayProps {
  result: QueryResponse;
}

export const ResultDisplay = ({ result }: ResultDisplayProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-6">
      {/* User message */}
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 pt-1">
          <p className="text-gray-900">{result.input}</p>
        </div>
      </div>

      {/* Agent response */}
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 pt-1">
          <div className="prose prose-sm max-w-none text-gray-900">
            <Markdown
              options={{
                overrides: {
                  h1: { props: { className: 'text-xl font-bold mt-4 mb-2' } },
                  h2: { props: { className: 'text-lg font-bold mt-3 mb-2' } },
                  h3: { props: { className: 'text-base font-bold mt-2 mb-1' } },
                  p: { props: { className: 'mb-2' } },
                  ul: { props: { className: 'list-disc list-inside mb-2 space-y-1' } },
                  ol: { props: { className: 'list-decimal list-inside mb-2 space-y-1' } },
                  code: { props: { className: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono' } },
                  pre: { props: { className: 'bg-gray-100 p-3 rounded-lg overflow-x-auto my-2' } },
                  blockquote: { props: { className: 'border-l-4 border-gray-300 pl-4 italic my-2' } },
                },
              }}
            >
              {result.agent_response}
            </Markdown>
          </div>

          {/* Details toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>
              {showDetails ? 'Скрыть детали' : 'Показать детали выполнения'}
            </span>
          </button>

          {/* Expanded details */}
          {showDetails && (
            <div className="mt-4 space-y-4">
              {/* Route info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Маршрут:</span>
                  <span className="text-sm text-gray-900 font-mono">{result.route}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Статус ревью:</span>
                  <span className={`text-sm font-medium ${
                    result.review_result === 'approved'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}>
                    {result.review_result === 'approved' ? 'Одобрено' : 'Требует доработки'}
                  </span>
                </div>
                {result.iteration_count > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Итераций:</span>
                    <span className="text-sm text-gray-900">{result.iteration_count}</span>
                  </div>
                )}
              </div>

              {/* Execution log */}
              {result.log && result.log.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Ход выполнения:</h4>
                  <div className="space-y-3">
                    {result.log.map((entry, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                          {index < result.log.length - 1 && (
                            <div className="w-0.5 flex-1 bg-blue-200 my-1" style={{ minHeight: '20px' }} />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw context */}
              {result.context && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Контекст выполнения:</h4>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto">
                    {result.context}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
