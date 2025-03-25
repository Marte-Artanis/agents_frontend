import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    birth_date: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Formata a data para enviar apenas a data sem o horário
      const formattedData = {
        ...formData,
        birth_date: formData.birth_date // O input type="date" já retorna no formato YYYY-MM-DD
      };

      console.log('Enviando dados:', formattedData);

      const response = await fetch('http://localhost:8001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta:', errorData);
        throw new Error(errorData.detail || 'Erro ao registrar');
      }

      router.push('/login');
    } catch (error) {
      console.error('Erro completo:', error);
      setError('Erro ao criar conta. Tente novamente.');
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
          Crie sua conta
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
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label 
                htmlFor="first_name" 
                style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#E8DFD8',
                  fontSize: '0.875rem'
                }}
              >
                Nome
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
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
                htmlFor="last_name" 
                style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#E8DFD8',
                  fontSize: '0.875rem'
                }}
              >
                Sobrenome
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
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
          </div>

          <div>
            <label 
              htmlFor="birth_date" 
              style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                color: '#E8DFD8',
                fontSize: '0.875rem'
              }}
            >
              Data de Nascimento
            </label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              required
              value={formData.birth_date}
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
            style={{
              width: '100%',
              padding: '1rem',
              background: '#B8A088',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#1A1A1A',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '1rem'
            }}
          >
            CRIAR CONTA
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#E8DFD8',
          fontSize: '0.875rem'
        }}>
          Já tem uma conta?{' '}
          <Link href="/login" style={{
            color: '#B8A088',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
} 