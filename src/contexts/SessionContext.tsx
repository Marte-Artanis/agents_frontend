'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createSession, validateSession } from '../services/api';

interface SessionContextType {
    sessionId: string | null;
    isLoading: boolean;
    isValid: boolean;
    resetSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);

    // Inicializar sessão
    useEffect(() => {
        const initSession = async () => {
            try {
                // Se já tiver uma sessão, verifica se é válida
                if (sessionId) {
                    const validationResponse = await validateSession(sessionId);
                    if (validationResponse.data) {
                        setIsValid(true);
                        setIsLoading(false);
                        return;
                    }
                }

                // Se não tiver sessão ou a sessão for inválida, cria uma nova
                const response = await createSession();
                if (response.data) {
                    setSessionId(response.data.session_id);
                    setIsValid(true);
                }
            } catch (error) {
                console.error('Erro ao inicializar sessão:', error);
                setIsValid(false);
            } finally {
                setIsLoading(false);
            }
        };

        initSession();
    }, []); // Executa apenas na montagem do componente

    // Verificar sessão periodicamente
    useEffect(() => {
        if (!sessionId) return;

        const checkSession = async () => {
            try {
                const response = await validateSession(sessionId);
                const isValidSession = Boolean(response.data);
                setIsValid(isValidSession);
                
                // Se a sessão não for mais válida, limpa o estado
                if (!isValidSession) {
                    setSessionId(null);
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
                setIsValid(false);
                setSessionId(null);
            }
        };

        const interval = setInterval(checkSession, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [sessionId]);

    const resetSession = async () => {
        try {
            const response = await createSession();
            if (response.data) {
                setSessionId(response.data.session_id);
                setIsValid(true);
            }
        } catch (error) {
            console.error('Erro ao criar nova sessão:', error);
            setIsValid(false);
        }
    };

    return (
        <SessionContext.Provider value={{ sessionId, isLoading, isValid, resetSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession deve ser usado dentro de um SessionProvider');
    }
    return context;
} 