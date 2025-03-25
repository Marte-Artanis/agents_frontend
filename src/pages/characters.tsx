import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import CharacterSelectionForm from '@/components/CharacterSelectionForm';
import { ChatFormData } from '@/types';

export default function Characters() {
  const router = useRouter();
  const { token } = useAuth();

  const handleSubmit = (formData: ChatFormData) => {
    router.push({
      pathname: '/chat',
      query: formData
    });
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