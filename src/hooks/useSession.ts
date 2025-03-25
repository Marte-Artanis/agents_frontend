import { useState, useEffect } from 'react';
import { createSession, validateSession } from '../services/api';

export function useSession() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);

    // Inicializar sessão
    useEffect(() => {
        const initSession = async () => {
            try {
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
    }, []); // Roda apenas na montagem do componente

    // Verificar sessão periodicamente
    useEffect(() => {
        if (!sessionId) return;

        const checkSession = async () => {
            try {
                const response = await validateSession(sessionId);
                setIsValid(Boolean(response.data));
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
                setIsValid(false);
            }
        };

        // Verifica a cada 5 minutos
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

    return {
        sessionId,
        isLoading,
        isValid,
        resetSession
    };
} 