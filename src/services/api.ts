import { QueryRequest, QueryResponse } from '../types';

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
