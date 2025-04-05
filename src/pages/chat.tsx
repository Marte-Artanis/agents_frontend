import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Chat } from '@/components/chat';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ChatFormData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ChatFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const loadChatData = async () => {
      if (!router.isReady || !token) return;
      
      setIsLoading(true);

      // Verificar se há um chat_id nas query params
      const { chat_id } = router.query;
      
      if (chat_id) {
        // Se houver chat_id, buscar os dados do chat
        try {
          const response = await fetch(`http://localhost:8001/chat/${chat_id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Erro ao carregar dados do chat: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Converter o formato da API para o formato usado pelo componente
          setFormData({
            character: data.character_name || 'Personagem',
            historicalPeriod: data.historical_period || '',
            historicalFactor: data.historical_factors || '',
            language: data.language || 'Português'
          });
        } catch (error) {
          console.error('Erro ao carregar dados do chat:', error);
          // Não redirecionamos aqui, apenas mostramos um estado de erro
        }
      } else {
        // Formato antigo, verificar se há character e outros params
        const { character, historicalPeriod, historicalFactor, language } = router.query;
        
        if (character && historicalPeriod && historicalFactor && language) {
          setFormData({
            character: character as string,
            historicalPeriod: historicalPeriod as string,
            historicalFactor: historicalFactor as string,
            language: language as string
          });
        }
      }
      
      setIsLoading(false);
    };

    loadChatData();
  }, [router.isReady, router.query, token]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1A1A1A'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '2px solid #B8A088',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Se não estiver carregando e não houver formData (e houver chat_id), significa que o chat não foi encontrado
  if (!formData && router.query.chat_id) {
    return (
      <ProtectedRoute>
        <div style={{ 
          minHeight: '100vh', 
          background: '#1A1A1A', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#E8DFD8',
          padding: '2rem'
        }}>
          <h2>Chat não encontrado</h2>
          <p>O chat solicitado não existe ou não foi possível carregá-lo.</p>
          <button 
            onClick={() => router.push('/characters')}
            style={{
              background: '#B8A088',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              marginTop: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Voltar para personagens
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  // Se não tiver formData nem chat_id, redirecionar para characters
  if (!formData && !router.query.chat_id) {
    if (typeof window !== 'undefined') {
      router.push('/characters');
    }
    return null;
  }

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#1A1A1A' }}>
        {formData && <Chat formData={formData} chatId={router.query.chat_id as string} />}
      </div>
    </ProtectedRoute>
  );
} 