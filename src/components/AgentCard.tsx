import { Agent } from '../types';
import { Pencil } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
  onEdit?: (agent: Agent) => void;
}

export const AgentCard = ({ agent, isActive, onEdit }: AgentCardProps) => {
  return (
    <div
      className={`relative p-4 rounded-lg border transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {onEdit && (
        <button
          onClick={() => onEdit(agent)}
          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Редактировать агента"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      <div className={`w-10 h-10 ${agent.color} rounded-lg mb-3 flex items-center justify-center text-white text-sm font-semibold`}>
        {agent.id.replace('agent', '')}
      </div>
      <h3 className="font-medium text-gray-900 mb-1 text-sm">{agent.name}</h3>
      <p className="text-xs text-gray-600 leading-relaxed">{agent.description}</p>
    </div>
  );
};
