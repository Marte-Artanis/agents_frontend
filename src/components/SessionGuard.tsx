import { useSession } from '../hooks/useSession';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SessionGuardProps {
    children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
    const { isLoading, isValid } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isValid) {
            router.push('/');
        }
    }, [isLoading, isValid, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!isValid) {
        return null; // Vai redirecionar no useEffect
    }

    return <>{children}</>;
} 