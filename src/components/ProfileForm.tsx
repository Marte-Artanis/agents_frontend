import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaPencilAlt } from 'react-icons/fa';
import styles from './ProfileForm.module.css';

interface EditingFields {
  first_name: boolean;
  last_name: boolean;
  password: boolean;
}

export default function ProfileForm() {
  const { user } = useAuth();
  
  // Adicionando console.logs para debug
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
    if (editingFields.password && !formData.current_password) {
      setError('Digite sua senha atual para fazer alterações');
      return;
    }

    try {
      const response = await fetch('http://localhost:8001/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erro ao atualizar perfil');
      }

      setEditingFields({
        first_name: false,
        last_name: false,
        password: false
      });
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
              value={user?.email || ''}
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
                value={editingFields.first_name ? formData.first_name : user?.first_name || ''}
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
                value={editingFields.last_name ? formData.last_name : user?.last_name || ''}
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
              value={user?.birth_date ? formatDate(user.birth_date) : ''}
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