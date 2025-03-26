import Link from 'next/link';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Bem-vindo ao ARDA
        </h1>
        <p className={styles.subtitle}>
          Uma jornada única através das terras de Tolkien
        </p>
        <div className={styles.buttons}>
          <Link href="/register" className={styles.primaryButton}>
            Começar Jornada
          </Link>
          <Link href="/login" className={styles.secondaryButton}>
            Já tenho uma conta
          </Link>
        </div>
      </div>
    </div>
  );
} 