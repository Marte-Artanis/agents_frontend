import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Layout } from '@/components/common/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useEffect, useState } from 'react';

// Importar fonte Inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isRouterReady, setIsRouterReady] = useState(false);
  const noLayoutPages = ['/', '/login', '/register'];
  const shouldSkipLayout = noLayoutPages.includes(router.pathname);

  // Esperar que o router esteja pronto antes de renderizar
  useEffect(() => {
    if (router.isReady) {
      setIsRouterReady(true);
    }
  }, [router.isReady]);

  // Se o router não estiver pronto, mostrar um loader simples
  if (!isRouterReady) {
    return (
      <div className={`${inter.variable} font-sans`} style={{ 
        minHeight: '100vh', 
        background: '#1A1A1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '2rem',
          height: '2rem',
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
    <AuthProvider>
      <div className={`${inter.variable} font-sans`}>
        {shouldSkipLayout ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </div>
    </AuthProvider>
  );
} 