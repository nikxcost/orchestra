import { QueryRequest, QueryResponse, Agent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Helper function to get headers with API key
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add API key if configured
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  return headers;
};

export const queryOrchestrator = async (query: string): Promise<QueryResponse> => {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: getHeaders(),
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
  const response = await fetch(`${API_BASE_URL}/agents`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch agents');
  }
  return response.json();
};

export const getAgent = async (agentId: string): Promise<Agent & { prompt: string }> => {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
    headers: getHeaders(),
  });
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
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to update agent');
  }

  return response.json();
};
