import { useState, useEffect } from 'react';
import { Agent } from '../types';
import { X, Save } from 'lucide-react';

interface AgentEditModalProps {
  agent: Agent & { prompt: string };
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: Agent & { prompt: string }) => Promise<void>;
}

export const AgentEditModal = ({ agent, isOpen, onClose, onSave }: AgentEditModalProps) => {
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [prompt, setPrompt] = useState(agent.prompt);
  const [color, setColor] = useState(agent.color);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(agent.name);
    setDescription(agent.description);
    setPrompt(agent.prompt);
    setColor(agent.color);
  }, [agent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...agent,
        name,
        description,
        prompt,
        color
      });
      onClose();
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Ошибка при сохранении агента');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const colors = [
    { label: 'Синий', value: 'bg-blue-500' },
    { label: 'Зелёный', value: 'bg-green-500' },
    { label: 'Жёлтый', value: 'bg-yellow-500' },
    { label: 'Оранжевый', value: 'bg-orange-500' },
    { label: 'Красный', value: 'bg-red-500' },
    { label: 'Фиолетовый', value: 'bg-purple-500' },
    { label: 'Розовый', value: 'bg-pink-500' },
    { label: 'Индиго', value: 'bg-indigo-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Редактирование агента
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-mono">{agent.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-smooth focus-ring"
            disabled={isSaving}
            aria-label="Закрыть модальное окно"
          >
            <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="agent-name" className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Название агента
            </label>
            <input
              id="agent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900 transition-smooth"
              placeholder="Введите название агента"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="agent-description" className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Описание
            </label>
            <input
              id="agent-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900 transition-smooth"
              placeholder="Краткое описание агента"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-3">
              Цвет агента
            </label>
            <div className="flex gap-3 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`group relative w-14 h-14 ${c.value} rounded-xl border-3 transition-smooth hover:scale-110 focus-ring ${
                    color === c.value
                      ? 'border-neutral-900 scale-110 shadow-lg'
                      : 'border-transparent hover:shadow-md'
                  }`}
                  title={c.label}
                  aria-label={c.label}
                >
                  {color === c.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-neutral-900" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label htmlFor="agent-prompt" className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              Системный промпт
            </label>
            <textarea
              id="agent-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={16}
              className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900 font-mono text-sm transition-smooth resize-none"
              placeholder="Системный промпт для агента..."
            />
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-1.5">
              <span className="text-primary-500">ℹ️</span>
              Этот промпт определяет поведение агента при обработке запросов
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-smooth focus-ring"
            disabled={isSaving}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !description.trim() || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-smooth focus-ring"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </div>
  );
};
