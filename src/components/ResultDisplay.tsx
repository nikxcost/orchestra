import { QueryResponse } from '../types';
import { User, Bot, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, RotateCw } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { useState } from 'react';

interface ResultDisplayProps {
  result: QueryResponse;
}

export const ResultDisplay = ({ result }: ResultDisplayProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* User message */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0 shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 pt-2">
          <p className="text-neutral-900 text-base leading-relaxed">{result.input}</p>
        </div>
      </div>

      {/* Agent response */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 pt-2">
          {/* Response content */}
          <div className="prose prose-neutral max-w-none">
            <Markdown
              options={{
                overrides: {
                  h1: { props: { className: 'text-2xl font-bold text-neutral-900 mt-6 mb-3' } },
                  h2: { props: { className: 'text-xl font-bold text-neutral-900 mt-5 mb-2.5' } },
                  h3: { props: { className: 'text-lg font-semibold text-neutral-900 mt-4 mb-2' } },
                  p: { props: { className: 'text-neutral-700 leading-relaxed mb-3' } },
                  ul: { props: { className: 'list-disc list-outside ml-5 mb-3 space-y-1.5 text-neutral-700' } },
                  ol: { props: { className: 'list-decimal list-outside ml-5 mb-3 space-y-1.5 text-neutral-700' } },
                  code: { props: { className: 'bg-neutral-100 text-neutral-900 px-1.5 py-0.5 rounded text-sm font-mono' } },
                  pre: { props: { className: 'bg-neutral-900 text-neutral-100 p-4 rounded-xl overflow-x-auto my-4 shadow-inner' } },
                  blockquote: { props: { className: 'border-l-4 border-primary-500 pl-4 italic text-neutral-600 my-4' } },
                  a: { props: { className: 'text-primary-600 hover:text-primary-700 underline decoration-primary-300 hover:decoration-primary-500 transition-colors' } },
                },
              }}
            >
              {result.agent_response}
            </Markdown>
          </div>

          {/* Details toggle button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-6 flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-smooth px-3 py-2 rounded-lg hover:bg-neutral-100 focus-ring"
            aria-expanded={showDetails}
          >
            {showDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              {showDetails ? 'Скрыть детали' : 'Показать детали выполнения'}
            </span>
          </button>

          {/* Expanded details */}
          {showDetails && (
            <div className="mt-5 space-y-4 animate-slideUp">
              {/* Route info card */}
              <div className="card-elevated p-5">
                <h4 className="text-sm font-semibold text-neutral-900 mb-4">Информация о выполнении</h4>

                <div className="space-y-3">
                  {/* Route */}
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                    <span className="text-sm font-medium text-neutral-600">Маршрут</span>
                    <span className="text-sm text-neutral-900 font-mono bg-neutral-100 px-2 py-1 rounded">
                      {result.route}
                    </span>
                  </div>

                  {/* Review status */}
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                    <span className="text-sm font-medium text-neutral-600">Статус ревью</span>
                    <span className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-full ${
                      result.review_result === 'approved'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-warning-100 text-warning-700'
                    }`}>
                      {result.review_result === 'approved' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Одобрено
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          Требует доработки
                        </>
                      )}
                    </span>
                  </div>

                  {/* Iterations */}
                  {result.iteration_count > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-neutral-600">Итераций</span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                        <RotateCw className="w-3.5 h-3.5" />
                        {result.iteration_count}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Execution log */}
              {result.log && result.log.length > 0 && (
                <div className="card-elevated p-5">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-4">Ход выполнения</h4>
                  <div className="space-y-4">
                    {result.log.map((entry, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-primary-100" />
                          {index < result.log.length - 1 && (
                            <div className="w-0.5 flex-1 bg-primary-200 my-1.5" style={{ minHeight: '24px' }} />
                          )}
                        </div>
                        <div className="flex-1 pb-1">
                          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                            {entry}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw context */}
              {result.context && (
                <div className="card-elevated p-5">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-3">Контекст выполнения</h4>
                  <pre className="text-xs text-neutral-600 whitespace-pre-wrap font-mono overflow-x-auto bg-neutral-50 p-4 rounded-lg">
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
