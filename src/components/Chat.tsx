import { useState } from 'react';
import { ChatFormData, ChatMessage } from '../types';
import { sendMessage } from '../services/api';

interface ChatProps {
    formData: ChatFormData;
    onBack: () => void;
}

export default function Chat({ formData, onBack }: ChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || loading) return;

        const newUserMessage: ChatMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputMessage('');
        setLoading(true);

        try {
            const response = await sendMessage({
                character: formData.character,
                prompt: inputMessage,
                historical_period: formData.historicalPeriod,
                historical_factors: formData.historicalFactor,
                language: formData.language
            });

            if (response.error) throw new Error(response.error);

            const newAssistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newAssistantMessage]);
        } catch (error) {
            // Adicionar mensagem de erro ao chat
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="flex items-center mb-4">
                <button
                    onClick={onBack}
                    className="mr-4 p-2 hover:bg-gray-100 rounded-full"
                >
                    ←
                </button>
                <h2 className="text-xl font-bold">
                    Conversando com {formData.character}
                </h2>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <span className="text-xs opacity-75 mt-1 block">
                                {message.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        loading || !inputMessage.trim()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                >
                    Enviar
                </button>
            </form>
        </div>
    );
} 