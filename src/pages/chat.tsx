import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Chat } from '@/components/chat';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatPage() {
  const router = useRouter();
  const [chatIdFromUrl, setChatIdFromUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { chat_id } = router.query;

    if (typeof chat_id === 'string') {
        setChatIdFromUrl(chat_id);
    } else {
        setChatIdFromUrl(undefined);
    }

    setIsLoading(false);

  }, [router.isReady, router.query]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1A1A1A'
        }}>
          Carregando...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#1A1A1A' }}>
        <Chat chatId={chatIdFromUrl} />
      </div>
    </ProtectedRoute>
  );
} 