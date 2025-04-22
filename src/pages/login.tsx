// import { LoginForm } from '@/components/auth'; // Importação antiga via index.ts
import { LoginForm } from '@/components/auth/LoginForm'; // Importação direta do arquivo

export default function LoginPage() {
  return <LoginForm />;
} 