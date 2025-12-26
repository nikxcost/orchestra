import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Светлая тема' },
    { value: 'dark' as const, icon: Moon, label: 'Тёмная тема' },
    { value: 'system' as const, icon: Monitor, label: 'Системная' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            p-2 rounded-lg transition-all duration-200 touch-manipulation
            ${theme === value
              ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }
          `}
          title={label}
          aria-label={label}
          aria-pressed={theme === value}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};
