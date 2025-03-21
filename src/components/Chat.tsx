import { useState } from 'react';
import { ChatFormData, ChatMessage } from '../types';
import { sendMessage } from '../services/api';
import './Chat.css';

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
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <button
                    onClick={onBack}
                    className="back-button"
                >
                    ←
                </button>
                <h2 className="chat-title">
                    Conversando com {formData.character}
                </h2>
            </div>

            {/* Chat Messages */}
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.role}`}
                    >
                        <div className={`message-bubble ${message.role}`}>
                            <p className="message-content">{message.content}</p>
                            <span className="message-timestamp">
                                {message.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="loading-indicator">
                        <div className="loading-dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="input-form">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="message-input"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="send-button"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
} 