import { Agent } from '../types';

export const AGENTS: Agent[] = [
  {
    id: 'agent1',
    name: 'Агент вопросов',
    description: 'Генерация уточняющих вопросов для стейкхолдеров',
    color: 'bg-blue-500',
  },
  {
    id: 'agent2',
    name: 'Агент требований',
    description: 'Специалист по сбору и анализу требований',
    color: 'bg-green-500',
  },
  {
    id: 'agent3',
    name: 'Агент документации',
    description: 'Специалист по технической документации',
    color: 'bg-yellow-500',
  },
  {
    id: 'agent4',
    name: 'Агент моделирования',
    description: 'Специалист по моделированию процессов',
    color: 'bg-orange-500',
  },
  {
    id: 'agent5',
    name: 'Бизнес-аналитик',
    description: 'Специалист по общему бизнес-анализу',
    color: 'bg-red-500',
  },
];
