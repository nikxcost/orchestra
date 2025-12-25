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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Редактирование агента: {agent.id}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название агента
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Название агента"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Краткое описание агента"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цвет
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-12 h-12 ${c.value} rounded-lg border-2 transition-all ${
                    color === c.value
                      ? 'border-gray-900 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Системный промпт
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Системный промпт для агента..."
            />
            <p className="mt-2 text-xs text-gray-500">
              Этот промпт определяет поведение агента при обработке запросов
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSaving}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !description.trim() || !prompt.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};
