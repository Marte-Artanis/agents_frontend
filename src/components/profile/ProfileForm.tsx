import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaPencilAlt } from 'react-icons/fa';
import styles from './ProfileForm.module.css';
import * as api from '@/services/api';

interface EditingFields {
  first_name: boolean;
  last_name: boolean;
  password: boolean;
}

export default function ProfileForm() {
  const { user, updateProfile } = useAuth();
  
  console.log('Dados do usuário:', user);
  console.log('Data de nascimento:', user?.birth_date);
  console.log('Tipo da data:', typeof user?.birth_date);

  const [editingFields, setEditingFields] = useState<EditingFields>({
    first_name: false,
    last_name: false,
    password: false
  });
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    current_password: '',
    new_password: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(user);

  // Busca os dados do perfil quando o componente é montado
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await api.getProfile();
        if (error) {
          console.error('Erro ao buscar perfil:', error);
          return;
        }
        setProfileData(data);
        setFormData(prev => ({
          ...prev,
          first_name: data.first_name || '',
          last_name: data.last_name || ''
        }));
      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
      }
    };

    fetchProfile();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };

  const handleEdit = (field: keyof EditingFields) => {
    setEditingFields(prev => ({
      ...prev,
      [field]: true
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (editingFields.password) {
      // Validar se a senha atual foi fornecida
      if (!formData.current_password) {
        setError('Digite sua senha atual para fazer alterações');
        return;
      }

      // Validar se a nova senha foi fornecida
      if (!formData.new_password) {
        setError('Digite a nova senha');
        return;
      }

      // Validar se a nova senha é diferente da atual
      if (formData.current_password === formData.new_password) {
        setError('A nova senha deve ser diferente da senha atual');
        return;
      }

      // Validar tamanho mínimo da senha
      if (formData.new_password.length < 6) {
        setError('A nova senha deve ter pelo menos 6 caracteres');
        return;
      }
    }

    try {
      const { error: updateError } = await updateProfile(formData);
      
      if (updateError) {
        // Tratamento específico para erro de senha incorreta
        if (updateError.includes('Senha atual incorreta')) {
          setError('A senha atual está incorreta');
          return;
        }
        throw new Error(updateError);
      }

      setEditingFields({
        first_name: false,
        last_name: false,
        password: false
      });
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || ''
      }));
      setHasChanges(false);
      setError('');
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Meu Perfil</h1>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.fieldsList}>
          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={profileData?.email || ''}
              disabled
              className={styles.input}
            />
          </div>

          {/* Nome */}
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                value={editingFields.first_name ? formData.first_name : profileData?.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={!editingFields.first_name}
                className={`${styles.input} ${editingFields.first_name ? styles.inputEditing : ''}`}
              />
              {!editingFields.first_name && (
                <button
                  onClick={() => handleEdit('first_name')}
                  className={styles.editButton}
                >
                  <FaPencilAlt />
                </button>
              )}
            </div>
          </div>

          {/* Sobrenome */}
          <div className={styles.field}>
            <label className={styles.label}>Sobrenome</label>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                value={editingFields.last_name ? formData.last_name : profileData?.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={!editingFields.last_name}
                className={`${styles.input} ${editingFields.last_name ? styles.inputEditing : ''}`}
              />
              {!editingFields.last_name && (
                <button
                  onClick={() => handleEdit('last_name')}
                  className={styles.editButton}
                >
                  <FaPencilAlt />
                </button>
              )}
            </div>
          </div>

          {/* Data de Nascimento */}
          <div className={styles.field}>
            <label className={styles.label}>Data de Nascimento</label>
            <input
              type="text"
              value={profileData?.birth_date ? formatDate(profileData.birth_date) : ''}
              disabled
              className={styles.input}
            />
          </div>

          {/* Senha */}
          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <div className={styles.inputWithIcon}>
              <input
                type="password"
                value="••••••••"
                disabled
                className={styles.input}
              />
              {!editingFields.password && (
                <button
                  onClick={() => handleEdit('password')}
                  className={styles.editButton}
                >
                  <FaPencilAlt />
                </button>
              )}
            </div>
          </div>

          {/* Campos de senha */}
          {editingFields.password && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Senha Atual</label>
                <input
                  type="password"
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                  className={`${styles.input} ${styles.inputEditing}`}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Nova Senha</label>
                <input
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  className={`${styles.input} ${styles.inputEditing}`}
                />
              </div>
            </>
          )}
        </div>

        {hasChanges && (
          <div className={styles.actions}>
            <button 
              onClick={() => {
                setEditingFields({ first_name: false, last_name: false, password: false });
                setHasChanges(false);
              }}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className={styles.saveButton}
            >
              Salvar
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 