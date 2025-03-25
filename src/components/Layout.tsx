import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function Layout({ children, hideNav = false }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1A1A1A 0%, #2C2C2C 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Efeito de fundo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url("/images/stars.png")',
        opacity: 0.3
      }} className="animate-pulse-slow"></div>
      
      {/* Navegação */}
      {!hideNav && (
        <header className="container-custom" style={{ position: 'relative', zIndex: 2 }}>
          <nav className="nav-container">
            <Link href="/" className="logo">
              ARDA
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {user ? (
                <>
                  <Link href="/characters" className="nav-link">
                    Personagens
                  </Link>
                  <Link href="/profile" className="nav-link">
                    Perfil
                  </Link>
                  <button 
                    onClick={logout} 
                    className="btn-primary-small"
                    style={{
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="nav-link">
                    Entrar
                  </Link>
                  {!isHomePage && (
                    <Link href="/register" className="btn-primary-small">
                      Começar Jornada
                    </Link>
                  )}
                </>
              )}
            </div>
          </nav>
        </header>
      )}

      {/* Conteúdo principal */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
} 