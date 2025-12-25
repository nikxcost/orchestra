import { QueryRequest, QueryResponse, Agent } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const queryOrchestrator = async (query: string): Promise<QueryResponse> => {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query } as QueryRequest),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to process query');
  }

  return response.json();
};

export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Backend is not healthy');
  }
  return response.json();
};

export const getAgents = async (): Promise<Agent[]> => {
  const response = await fetch(`${API_BASE_URL}/agents`);
  if (!response.ok) {
    throw new Error('Failed to fetch agents');
  }
  return response.json();
};

export const getAgent = async (agentId: string): Promise<Agent & { prompt: string }> => {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agent ${agentId}`);
  }
  return response.json();
};

export const updateAgent = async (
  agentId: string,
  data: { name: string; description: string; prompt: string; color: string }
): Promise<Agent> => {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to update agent');
  }

  return response.json();
};
