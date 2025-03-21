export interface ChatFormData {
    character: string;
    historicalPeriod: string;
    historicalFactor: string;
    language: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
} 