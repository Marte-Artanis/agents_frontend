import { ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8001';

// Funções de Sessão
export const createSession = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/new-session`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao criar sessão' };
    }
};

export const validateSession = async (sessionId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao validar sessão' };
    }
};

export const deleteSession = async (sessionId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao deletar sessão' };
    }
};

// Funções de Dados
export const fetchCharacterData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/characters`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao carregar personagens' };
    }
};

export const fetchHistoricalPeriods = async (character: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/historical-periods/${character}`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao carregar períodos históricos' };
    }
};

export const fetchHistoricalFactors = async (character: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/historical-factors/${character}`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao carregar fatores históricos' };
    }
};

export const fetchLanguages = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/languages`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao carregar idiomas' };
    }
};

// Função de Chat
export const sendMessage = async (chatData: {
    character: string;
    prompt: string;
    historical_period: string;
    historical_factors: string;
    language: string;
    session_id: string;
}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(chatData),
        });

        if (response.status === 400) {
            throw new Error('Sessão inválida ou expirada');
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Erro ao enviar mensagem' };
    }
}; 