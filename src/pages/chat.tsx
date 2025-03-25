import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Chat from '@/components/Chat';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ChatFormData } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ChatFormData | null>(null);

  useEffect(() => {
    if (router.isReady) {
      const { character, historicalPeriod, historicalFactor, language } = router.query;
      
      if (!character || !historicalPeriod || !historicalFactor || !language) {
        router.push('/characters');
        return;
      }

      setFormData({
        character: character as string,
        historicalPeriod: historicalPeriod as string,
        historicalFactor: historicalFactor as string,
        language: language as string
      });
    }
  }, [router.isReady, router.query]);

  if (!formData) {
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

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        background: '#1A1A1A',
        position: 'relative'
      }}>
        {/* Efeito de fundo */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/images/stars.png")',
          opacity: 0.3,
          pointerEvents: 'none'
        }} />
        
        <Chat formData={formData} />
      </div>
    </ProtectedRoute>
  );
} 