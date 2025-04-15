import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useState, useEffect } from 'react';

// Interface para os dados do personagem vindos da API
interface CharacterInfo {
  name: string;
  description: string;
  // Adicionar outros campos se a API retornar mais dados úteis
}

export default function CharactersPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [characters, setCharacters] = useState<CharacterInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar lista de personagens
  useEffect(() => {
    const fetchCharacters = async () => {
      if (!token) {
        // Não deveria acontecer devido ao ProtectedRoute, mas para segurança
        setError('Autenticação necessária.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8001/characters', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Erro ao buscar personagens: ${response.status}`);
        }
        const data = await response.json();
        console.log("Dados brutos recebidos de /characters:", data);

        // *** CORREÇÃO: Transformar o objeto recebido em array ***
        let characterArray: CharacterInfo[] = [];
        // Verificar se data é um objeto e não nulo
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            characterArray = Object.entries(data).map(([name, details]) => ({
              name: name, // A chave é o nome
              // Assumindo que a descrição está em details.description
              // Ajuste 'details.description' se a chave for diferente!
              description: (details as any)?.description || 'Descrição não disponível'
            }));
            console.log("Array transformado a partir do objeto:", characterArray);
        } else if (Array.isArray(data)) {
            // Caso a API retorne um array diretamente (manter compatibilidade)
            console.warn("API /characters retornou um array diretamente, usando-o.")
            characterArray = data;
        } else {
          // Se não for objeto nem array, é um formato inesperado
          console.error("API /characters não retornou um objeto ou array:", data);
          throw new Error('Formato de resposta inesperado do servidor.');
        }

        // Se a transformação resultou em um array (pode ser vazio)
        setCharacters(characterArray);
        setError(null);

      } catch (err: any) {
        console.error("Erro ao buscar personagens:", err);
        setError(err.message || 'Não foi possível carregar os personagens.');
        setCharacters([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [token]);

  const handleAdvance = () => {
    router.push('/chat');
  };

  const characterNames = Array.isArray(characters) && characters.length > 0 
                         ? characters.map(c => c.name).join(', ') 
                         : '';

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        background: '#1A1A1A',
        color: '#E8DFD8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem' 
      }}>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#B8A088' }}>Prepare-se para a Conversa</h1>
        
        {isLoading && (
          <p style={{ fontSize: '1.1rem' }}>Carregando personagens...</p>
        )}

        {error && (
          <p style={{ fontSize: '1.1rem', color: '#FF6B6B' }}>Erro: {error}</p>
        )}

        {!isLoading && !error && characterNames && (
          <p style={{
             fontSize: '1.3rem', 
             textAlign: 'center', 
             maxWidth: '600px', 
             lineHeight: '1.6',
             marginBottom: '2.5rem' 
            }}>
            Escolha entre falar com figuras lendárias como <strong style={{ color: '#B8A088' }}>{characterNames}</strong> e muitas outras.
          </p>
        )}

        {!isLoading && (
            <button 
                onClick={handleAdvance}
                disabled={!!error}
                style={{
                    background: error ? '#555' : '#B8A088',
                    color: error ? '#999' : '#1A1A1A',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '1rem 2.5rem',
                    fontSize: '1.2rem',
                    cursor: error ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => !error && (e.currentTarget.style.backgroundColor = '#A08C78')}
                onMouseOut={(e) => !error && (e.currentTarget.style.backgroundColor = '#B8A088')}
            >
                {error ? 'Erro ao Carregar' : 'Avançar para o Chat'}
            </button>
        )}
      </div>
    </ProtectedRoute>
  );
} 