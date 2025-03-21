'use client';

import { useRouter } from 'next/navigation';
import CharacterSelectionForm from '../../components/CharacterSelectionForm';
import { ChatFormData } from '../../types';

export default function SelectPage() {
    const router = useRouter();

    const handleSubmit = (data: ChatFormData) => {
        // Armazenar os dados no localStorage para recuperar na página de chat
        localStorage.setItem('chatFormData', JSON.stringify(data));
        router.push('/chat');
    };

    return (
        <main className="min-h-screen bg-white">
            <CharacterSelectionForm onSubmit={handleSubmit} />
        </main>
    );
} 