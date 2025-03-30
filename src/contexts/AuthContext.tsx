import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import * as api from '../services/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ error?: string; success?: boolean }>;
  register: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    birth_date: Date;
  }) => Promise<{ error?: string; success?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (userData: {
    first_name: string;
    last_name: string;
    current_password: string;
    new_password?: string;
  }) => Promise<{ error?: string; success?: boolean }>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se já tem token no localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data, error } = await api.getCurrentUser();
      if (error) throw new Error(error);
      
      setUser(data);
      setToken(localStorage.getItem('token'));
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    birth_date: Date;
  }): Promise<{ error?: string; success?: boolean }> => {
    try {
      const { data, error } = await api.register(userData);
      if (error) return { error };

      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { 
        error: error.message === 'Failed to fetch' 
          ? 'Erro de conexão com o servidor. Verifique sua internet.'
          : 'Erro ao registrar usuário'
      };
    }
  };

  const login = async (email: string, password: string): Promise<{ error?: string; success?: boolean }> => {
    try {
      console.log('AuthContext: Iniciando login...');
      const { data, error } = await api.login({ email, password });
      
      console.log('AuthContext: Resposta do login:', { data, error });
      
      if (error) {
        console.error('AuthContext: Erro no login:', error);
        return { error };
      }

      if (!data || !data.token) {
        console.error('AuthContext: Token não recebido');
        return { error: 'Token não recebido do servidor' };
      }

      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      console.error('AuthContext: Erro inesperado:', error);
      return { 
        error: error.message === 'Failed to fetch' 
          ? 'Erro de conexão com o servidor. Verifique sua internet.'
          : 'Email ou senha incorretos'
      };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      router.push('/login');
    }
  };

  const updateProfile = async (userData: {
    first_name: string;
    last_name: string;
    current_password: string;
    new_password?: string;
  }): Promise<{ error?: string; success?: boolean }> => {
    try {
      const { data, error } = await api.updateProfile(userData);
      if (error) return { error };

      setUser(data);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return { error: 'Erro ao atualizar perfil' };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        register,
        logout, 
        updateProfile,
        isLoading,
        isAuthenticated: !!user && !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 