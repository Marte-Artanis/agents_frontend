import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/characters');
      }
    } catch (error: any) {
      // Caso aconteça algum erro inesperado
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1A1A1A 0%, #2C2C2C 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        border: '1px solid rgba(184, 160, 136, 0.1)',
        padding: '3rem',
        width: '100%',
        maxWidth: '480px'
      }}>
        <h1 style={{
          color: '#B8A088',
          fontFamily: 'Cinzel, serif',
          fontSize: '2.5rem',
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          Faça login
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <div>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: '#E8DFD8',
                fontSize: '0.875rem'
              }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(184, 160, 136, 0.2)',
                borderRadius: '0.5rem',
                color: '#E8DFD8',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: '#E8DFD8',
                fontSize: '0.875rem'
              }}
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(184, 160, 136, 0.2)',
                borderRadius: '0.5rem',
                color: '#E8DFD8',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: isLoading ? '#8B7B6A' : '#B8A088',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#1A1A1A',
              fontSize: '1rem',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '1rem',
              opacity: isLoading ? 0.7 : 1,
              position: 'relative'
            }}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: 'rgba(232, 223, 216, 0.8)',
          fontSize: '0.875rem'
        }}>
          Não tem uma conta?{' '}
          <Link 
            href="/register" 
            style={{
              color: '#B8A088',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s ease'
            }}
          >
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  );
} 