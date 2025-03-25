import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1A1A1A 0%, #2C2C2C 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header className="container-custom" style={{ position: 'relative', zIndex: 1, padding: '2rem 0' }}>
        <nav className="nav-container">
          <Link href="/" className="logo" style={{ fontSize: '1.5rem' }}>
            ARDA
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
            <Link href="/login" className="nav-link">
              Entrar
            </Link>
            <Link href="/register" className="btn-primary-small">
              Registrar
            </Link>
          </div>
        </nav>
      </header>

      {/* Conteúdo principal */}
      <main style={{ 
        minHeight: 'calc(100vh - 8rem)', // Ajustado para considerar o padding do header
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 className="heading-primary animate-fadeIn" style={{ marginBottom: '3rem' }}>
              Converse com os
              <br />
              <span style={{ 
                color: '#B8A088', 
                display: 'block', 
                marginTop: '1rem',
                fontSize: '0.9em'
              }}>
                Personagens de Tolkien
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem',
              color: 'rgba(232, 223, 216, 0.8)',
              maxWidth: '600px',
              margin: '0 auto 4rem',
              lineHeight: '1.8',
              letterSpacing: '0.01em'
            }}>
              Embarque em uma jornada única pela Terra Média, interagindo com seus personagens 
              favoritos através de conversas profundas e memoráveis.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 