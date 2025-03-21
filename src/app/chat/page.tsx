'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '../../components/Chat';
import { ChatFormData } from '../../types';

export default function ChatPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<ChatFormData | null>(null);

    useEffect(() => {
        // Recuperar os dados do localStorage
        const savedData = localStorage.getItem('chatFormData');
        
        if (!savedData) {
            // Se não houver dados, redirecionar para a página de seleção
            router.replace('/select');
            return;
        }

        try {
            const parsedData = JSON.parse(savedData) as ChatFormData;
            setFormData(parsedData);
        } catch (error) {
            // Se houver erro ao parsear os dados, redirecionar para a página de seleção
            router.replace('/select');
        }
    }, [router]);

    const handleBack = () => {
        // Limpar os dados ao voltar
        localStorage.removeItem('chatFormData');
        router.push('/select');
    };

    if (!formData) {
        return null; // ou um componente de loading
    }

    return (
        <main className="min-h-screen bg-white">
            <Chat formData={formData} onBack={handleBack} />
        </main>
    );
} 