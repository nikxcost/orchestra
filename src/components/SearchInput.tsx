import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({ value, onChange, placeholder = 'Поиск...' }: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear and blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onChange('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  return (
    <div
      className={`
        relative flex items-center gap-2
        px-3 py-2.5
        rounded-xl
        border
        transition-all duration-200
        ${isFocused
          ? 'bg-neutral-800 border-neutral-600 ring-2 ring-primary-500/30'
          : 'bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600'
        }
      `}
    >
      <Search className="w-4 h-4 text-neutral-500 flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-neutral-200 placeholder-neutral-500 outline-none min-w-0"
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="p-1 rounded-md hover:bg-neutral-700 text-neutral-500 hover:text-neutral-300 transition-colors touch-manipulation"
          aria-label="Очистить поиск"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {!value && !isFocused && (
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-neutral-500 bg-neutral-700/50 border border-neutral-600">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
    </div>
  );
};
