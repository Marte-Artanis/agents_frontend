// Tipos de Dados
export interface ChatFormData {
    character: string;
    historicalPeriod: string;
    historicalFactor: string;
    language: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Tipos de API
export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

// Tipos de Request
export interface ChatRequest {
    character: string;
    prompt: string;
    historical_period: string;
    historical_factors: string;
    language: string;
    session_id: string;
}

// Tipos de Response
export interface ChatResponse {
    response: string;
    session_id: string;
    messages: ChatMessage[];
}

export interface SessionResponse {
    session_id: string;
    status: 'active';
}

export interface CharacterData {
    name: string;
    description: string;
} 