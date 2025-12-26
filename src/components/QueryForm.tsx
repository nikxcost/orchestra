import { useState } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

interface QueryFormProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export const QueryForm = ({ onSubmit, isLoading }: QueryFormProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isLoading) {
        onSubmit(query);
        setQuery('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`relative rounded-2xl border-2 transition-smooth ${
          isFocused
            ? 'border-primary-500 shadow-lg shadow-primary-100 dark:shadow-primary-900/30'
            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
        } ${isLoading ? 'bg-neutral-50 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-800'}`}
      >
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Отправьте сообщение агенту..."
          disabled={isLoading}
          rows={1}
          aria-label="Введите ваш запрос"
          className="w-full px-5 py-4 pr-14 bg-transparent resize-none focus:outline-none disabled:text-neutral-400 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          style={{
            minHeight: '56px',
            maxHeight: '200px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          aria-label="Отправить сообщение"
          className={`absolute right-2 bottom-2 p-2.5 rounded-xl transition-smooth focus-ring ${
            query.trim() && !isLoading
              ? 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 shadow-md'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Shift + Enter для новой строки</span>
        </div>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          {query.length > 0 && `${query.length} символов`}
        </span>
      </div>
    </form>
  );
};
