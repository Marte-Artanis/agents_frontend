import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Layout } from '@/components/common/Layout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Importar fonte Inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Componente de loading que usa o tema escuro
function LoadingScreen() {
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

// Wrapper que gerencia a autenticação e loading
function AppWrapper({ Component, pageProps, router }: AppProps & { router: any }) {
  const { user, isLoading } = useAuth();
  const [isRouterReady, setIsRouterReady] = useState(false);
  const noLayoutPages = ['/', '/login', '/register'];
  const shouldSkipLayout = noLayoutPages.includes(router.pathname);
  const isPublicRoute = noLayoutPages.includes(router.pathname);

  useEffect(() => {
    if (router.isReady) {
      setIsRouterReady(true);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!isLoading && !user && !isPublicRoute) {
      router.push('/login');
    }
    if (!isLoading && user && router.pathname === '/') {
      router.push('/characters');
    }
  }, [isLoading, user, router.pathname, isPublicRoute]);

  // Mostra loading enquanto verifica autenticação ou router
  if (isLoading || !isRouterReady) {
    return <LoadingScreen />;
  }

  // Se não estiver autenticado e não for rota pública, não renderiza nada
  if (!user && !isPublicRoute) {
    return <LoadingScreen />;
  }

  return (
    <div className={`${inter.variable} font-sans`}>
      {shouldSkipLayout ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </div>
  );
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <AppWrapper {...props} />
    </AuthProvider>
  );
} 