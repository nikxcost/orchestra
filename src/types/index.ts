export interface QueryRequest {
  query: string;
}

export interface QueryResponse {
  input: string;
  route: string;
  agent_response: string;
  review_result: string;
  context: string;
  iteration_count: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  color: string;
}
