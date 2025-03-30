import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import CharacterSelectionForm from '@/components/chat/CharacterSelectionForm';
import { ChatFormData } from '@/types';

export default function Characters() {
  const router = useRouter();
  const { token } = useAuth();

  const handleSubmit = async (formData: ChatFormData) => {
    try {
      await router.replace({
        pathname: '/chat',
        query: formData
      });
    } catch (error) {
      console.error('Erro ao navegar para o chat:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        background: '#1A1A1A',
        color: '#E8DFD8'
      }}>
        <CharacterSelectionForm onSubmit={handleSubmit} token={token} />
      </div>
    </ProtectedRoute>
  );
} 