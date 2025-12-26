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

  // Get display number - limit to 2 characters for consistent sizing
  const displayId = agent.id.replace('agent', '').slice(0, 2);

  return (
    <div
      className={`group relative p-5 rounded-xl border transition-smooth hover-lift min-h-[160px] flex flex-col ${
        isActive
          ? `border-primary-300 dark:border-primary-700 ${colorScheme.bgLight} shadow-md`
          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-md'
      }`}
    >
      {onEdit && (
        <button
          onClick={() => onEdit(agent)}
          className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-smooth opacity-0 group-hover:opacity-100 focus-ring"
          title="Редактировать агента"
          aria-label="Редактировать агента"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {/* Agent icon with gradient */}
      <div className={`w-10 h-10 bg-gradient-to-br ${colorScheme.gradient} rounded-lg mb-3 flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0`}>
        {displayId}
      </div>

      {/* Agent info */}
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1.5 text-sm leading-tight">
          {agent.name}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
          {agent.description}
        </p>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-3 left-3 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};
