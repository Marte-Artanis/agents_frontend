import { ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8001';

// Função auxiliar para pegar o token
const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Não autenticado');
    return token;
};

// Função auxiliar para fazer requisições autenticadas
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sessão expirada');
    }
    
    return response;
};

// Funções de Autenticação
export const register = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    birth_date: Date;
}) => {
    try {
        // Formatar a data para ISO string
        const formattedData = {
            ...userData,
            birth_date: userData.birth_date.toISOString()
        };

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formattedData),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao registrar usuário');
        }

        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        return { data };
    } catch (error: any) {
        console.error('Erro no registro:', error);
        return { 
            error: error.message || 'Erro ao registrar usuário'
        };
    }
};

export const login = async (credentials: { email: string; password: string }) => {
    try {
        console.log('Tentando login com:', { email: credentials.email });
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log('Resposta do servidor:', { status: response.status, data });

        if (!response.ok) {
            // Verifica se o erro está relacionado à conexão com o banco de dados
            if (data.detail?.includes('connection to server') || 
                data.detail?.includes('psycopg2.OperationalError')) {
                throw new Error('Erro de conexão com o servidor. Por favor, tente novamente em alguns instantes.');
            }
            throw new Error(data.detail || 'Credenciais inválidas');
        }

        if (data.token) {
            localStorage.setItem('token', data.token);
            return { data, success: true };
        } else {
            throw new Error('Token não recebido do servidor');
        }
    } catch (error: any) {
        console.error('Erro detalhado:', error);
        
        // Se for um erro de rede (offline/servidor inacessível)
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            return {
                error: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
                success: false
            };
        }
        
        return { 
            error: error.message || 'Erro ao fazer login',
            success: false
        };
    }
};

export const logout = async () => {
    try {
        await authenticatedFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
        localStorage.removeItem('token');
        return { success: true };
    } catch (error) {
        return { error: 'Erro ao fazer logout' };
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao obter usuário atual' };
    }
};

// Funções de Sessão
export const createSession = async () => {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/new-session`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao criar sessão' };
    }
};

export const validateSession = async (sessionId: string) => {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/session/${sessionId}`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao validar sessão' };
    }
};

export const deleteSession = async (sessionId: string) => {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/session/${sessionId}`, {
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
        const response = await authenticatedFetch(`${API_BASE_URL}/characters`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao carregar personagens' };
    }
};

export const fetchHistoricalPeriods = async (character: string) => {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/characters/historical-periods/${character}`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao carregar períodos históricos' };
    }
};

export const fetchHistoricalFactors = async (character: string) => {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/characters/historical-factors/${character}`);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao carregar fatores históricos' };
    }
};

export const fetchLanguages = async () => {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/characters/languages`);
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
    session_id?: string;
}) => {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            body: JSON.stringify(chatData),
        });

        if (response.status === 400) {
            throw new Error('Dados inválidos');
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Erro ao enviar mensagem' };
    }
};

// Função de Perfil
export const updateProfile = async (userData: {
    first_name: string;
    last_name: string;
    current_password: string;
    new_password?: string;
}) => {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: 'Erro ao atualizar perfil' };
    }
}; 