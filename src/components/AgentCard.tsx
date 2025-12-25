import { Agent } from '../types';
import { Pencil } from 'lucide-react';
import { agentColors } from '../design/tokens';

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
  onEdit?: (agent: Agent) => void;
}

export const AgentCard = ({ agent, isActive, onEdit }: AgentCardProps) => {
  const colorScheme = agentColors[agent.color as keyof typeof agentColors] || agentColors['bg-blue-500'];

  return (
    <div
      className={`group relative p-5 rounded-xl border transition-smooth hover-lift ${
        isActive
          ? `border-primary-300 ${colorScheme.bgLight} shadow-md`
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md'
      }`}
    >
      {onEdit && (
        <button
          onClick={() => onEdit(agent)}
          className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-smooth opacity-0 group-hover:opacity-100 focus-ring"
          title="Редактировать агента"
          aria-label="Редактировать агента"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {/* Agent icon with gradient */}
      <div className={`w-12 h-12 bg-gradient-to-br ${colorScheme.gradient} rounded-xl mb-4 flex items-center justify-center text-white font-semibold text-base shadow-sm`}>
        {agent.id.replace('agent', '')}
      </div>

      {/* Agent info */}
      <h3 className="font-semibold text-neutral-900 mb-1.5 text-sm leading-tight">
        {agent.name}
      </h3>
      <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
        {agent.description}
      </p>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-3 left-3 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};
