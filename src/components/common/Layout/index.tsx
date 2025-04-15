import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import styles from './styles.module.css';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  return (
    <div className={styles.container}>
      {/* Efeito de fundo */}
      <div className={`${styles.backgroundEffect} animate-pulse-slow`}></div>
      
      {/* Navegação */}
      {!hideNav && (
        <header className="container-custom" style={{ position: 'relative', zIndex: 2 }}>
          <nav className="nav-container">
            <Link href="/" className="logo" style={{ cursor: 'pointer' }}>
              ARDA
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {user ? (
                <>
                  <Link href="/characters" className="nav-link">
                    Personagens
                  </Link>
                  <Link href="/chat" className="nav-link">
                    Chat
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