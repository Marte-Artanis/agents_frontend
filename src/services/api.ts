import { ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8001';

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

export const sendMessage = async (chatData: {
    character: string;
    prompt: string;
    historical_period: string;
    historical_factors: string;
    language: string;
}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(chatData),
        });
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao enviar mensagem' };
    }
}; 