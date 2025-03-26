import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './styles.module.css';

export function RegisterForm() {
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
      const formattedData = {
        ...formData,
        birth_date: formData.birth_date
      };

      const response = await fetch('http://localhost:8001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao registrar');
      }

      router.push('/login');
    } catch (error: any) {
      console.error('Erro:', error);
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
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>
          Crie sua conta
        </h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <div className={styles.gridContainer}>
            <div>
              <label htmlFor="first_name" className={styles.label}>
                Nome
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div>
              <label htmlFor="last_name" className={styles.label}>
                Sobrenome
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div>
            <label htmlFor="birth_date" className={styles.label}>
              Data de Nascimento
            </label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              required
              value={formData.birth_date}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div>
            <label htmlFor="password" className={styles.label}>
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.button}>
            Criar conta
          </button>
        </form>

        <p className={styles.registerText}>
          Já tem uma conta?{' '}
          <Link href="/login" className={styles.link}>
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
} 