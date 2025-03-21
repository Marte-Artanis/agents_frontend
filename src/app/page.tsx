'use client';

import { useState } from 'react';
import CharacterSelectionForm from '../components/CharacterSelectionForm';
import Chat from '../components/Chat';
import { ChatFormData } from '../types';

export default function Home() {
    const [chatData, setChatData] = useState<ChatFormData | null>(null);

    const handleFormSubmit = (data: ChatFormData) => {
        setChatData(data);
    };

    const handleBackToSelection = () => {
        setChatData(null);
    };

    return (
        <main className="min-h-screen bg-white">
            {chatData ? (
                <Chat formData={chatData} onBack={handleBackToSelection} />
            ) : (
                <CharacterSelectionForm onSubmit={handleFormSubmit} />
            )}
        </main>
    );
}
