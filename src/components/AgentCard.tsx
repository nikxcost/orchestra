import { Agent } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
}

export const AgentCard = ({ agent, isActive }: AgentCardProps) => {
  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
          : 'border-gray-200 bg-white'
      }`}
    >
      {isActive && (
        <div className="absolute -top-2 -right-2">
          <CheckCircle2 className="w-6 h-6 text-blue-500 bg-white rounded-full" />
        </div>
      )}
      <div className={`w-12 h-12 ${agent.color} rounded-lg mb-3 flex items-center justify-center text-white font-bold`}>
        {agent.id.replace('agent', '')}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{agent.name}</h3>
      <p className="text-sm text-gray-600">{agent.description}</p>
    </div>
  );
};
