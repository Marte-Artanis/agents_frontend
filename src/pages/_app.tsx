import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

// Importar fonte Inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const noLayoutPages = ['/', '/login', '/register'];
  const shouldSkipLayout = noLayoutPages.includes(router.pathname);

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