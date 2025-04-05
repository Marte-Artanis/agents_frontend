import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ChatFormData } from '@/types';
import styles from './Chat.module.css';
import Modal from '@/components/common/Modal';
import CharacterSelectionForm from './CharacterSelectionForm';
import modalStyles from '@/components/common/Modal.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatProps {
  formData: ChatFormData;
  chatId?: string; // Opcional para compatibilidade com versões anteriores
}

export default function Chat({ formData, chatId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId || null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { token } = useAuth();
  const router = useRouter();

  // Carregar a lista de chats
  useEffect(() => {
    const loadChats = async () => {
      if (!token) return;
      
      setIsLoadingChats(true);
      try {
        const response = await fetch('http://localhost:8001/chats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Erro ao carregar chats');
        
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Erro ao carregar chats:', error);
      } finally {
        setIsLoadingChats(false);
      }
    };
    
    loadChats();
  }, [token]);

  // Carregar mensagens do chat atual quando o chatId mudar
  useEffect(() => {
    if (!chatId || !token) return;
    
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8001/chat/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Erro ao carregar mensagens');
        
        const data = await response.json();
        
        // Verificar se há mensagens para exibir
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages.map((msg: any) => ({
            role: msg.role || (msg.is_user ? 'user' : 'assistant'),
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString()
          })));
        } else {
          setMessages([]);
        }

        // Se recebemos um novo chat_id e não tínhamos um antes, atualiza a URL
        if (data.chat_id && !chatId) {
          // Atualizar URL sem recarregar a página usando history API
          const url = `/chat?chat_id=${data.chat_id}`;
          window.history.pushState({}, '', url);
          setActiveChatId(data.chat_id);
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [chatId, token]);

  // Função para ajustar altura do textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  // Ajustar altura quando o input mudar
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  // Scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enviar mensagem
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const payload = {
        character: formData.character,
        prompt: inputMessage,
        historical_period: formData.historicalPeriod,
        historical_factors: formData.historicalFactor,
        language: formData.language
      };
      
      // Adicionar chat_id se estiver disponível
      if (chatId) {
        payload['chat_id'] = chatId;
      }
      
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao enviar mensagem');
      }

      const data = await response.json();
      
      // Se recebemos um novo chat_id e não tínhamos um antes, atualiza a URL
      if (data.chat_id && !chatId) {
        // Atualizar URL sem recarregar a página usando history API
        const url = `/chat?chat_id=${data.chat_id}`;
        window.history.pushState({}, '', url);
        setActiveChatId(data.chat_id);
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async (formData: ChatFormData) => {
    setIsModalOpen(false);
    
    try {
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          character: formData.character,
          prompt: 'Olá!',
          historical_period: formData.historicalPeriod,
          historical_factors: formData.historicalFactor,
          language: formData.language
        })
      });

      if (!response.ok) throw new Error('Erro ao criar chat');

      const data = await response.json();
      
      // Criar um novo chat para adicionar à lista
      const newChat = {
        chat_id: data.chat_id,
        character_name: formData.character,
        historical_period: formData.historicalPeriod,
        historical_factors: formData.historicalFactor,
        language: formData.language,
        last_updated: new Date().toISOString()
      };
      
      // Adicionar o novo chat à lista
      setChats(prev => [newChat, ...prev]);
      
      // Atualizar URL sem recarregar a página usando history API
      const url = `/chat?chat_id=${data.chat_id}`;
      window.history.pushState({}, '', url);
      
      setActiveChatId(data.chat_id);
      
      // Carregar o novo chat sem recarregar a página
      loadChat(data.chat_id);
    } catch (error) {
      console.error('Erro ao criar chat:', error);
    }
  };

  // Função para deletar um chat
  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Impedir que o clique propague para o item da lista
    
    console.log("Deletando chat:", chatId);
    
    // Remover imediatamente o chat da lista na UI
    const newChats = chats.filter(chat => chat.chat_id !== chatId);
    setChats(newChats);
    
    // Se o chat atual foi deletado, voltar para a lista de personagens ou mostrar o primeiro chat disponível
    if (chatId === activeChatId) {
      if (newChats.length > 0) {
        // Se ainda há chats, selecione o primeiro
        setActiveChatId(newChats[0].chat_id);
        loadChat(newChats[0].chat_id);
        // Atualizar URL sem recarregar a página
        const url = `/chat?chat_id=${newChats[0].chat_id}`;
        window.history.pushState({}, '', url);
      } else {
        // Se não houver mais chats, voltar para a página de personagens
        router.push('/characters');
      }
    }
    
    // Fazer a chamada para o backend para deletar o chat
    try {
      const response = await fetch(`http://localhost:8001/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Resposta do servidor:", response.status, response.ok);
      
      if (!response.ok) {
        console.error('Erro ao deletar chat no servidor');
        // Se o backend falhar, podemos mostrar uma mensagem, mas não precisamos restaurar o chat na UI
      }
    } catch (error) {
      console.error('Erro ao deletar chat:', error);
    }
  };

  const loadChat = async (chatId: string) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8001/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao carregar mensagens');
      
      const data = await response.json();
      
      // Verificar se há mensagens para exibir
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages.map((msg: any) => ({
          role: msg.role || (msg.is_user ? 'user' : 'assistant'),
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString()
        })));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lidar com navegação do navegador (voltar/avançar)
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const chatIdFromUrl = urlParams.get('chat_id');
      
      if (chatIdFromUrl && chatIdFromUrl !== activeChatId) {
        setActiveChatId(chatIdFromUrl);
        loadChat(chatIdFromUrl);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeChatId]);

  return (
    <div className={styles.mainContainer}>
      {/* Modal para seleção de personagem */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Novo Chat</h2>
            <div className={modalStyles.modalInnerContent}>
              <CharacterSelectionForm 
                token={token} 
                onSubmit={handleNewChat} 
              />
            </div>
          </div>
        </Modal>
      )}
      
      {/* Sidebar com lista de chats */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Seus Chats</h2>
          <button 
            className={styles.newChatButton}
            onClick={() => setIsModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Novo</span>
          </button>
        </div>
        
        <div className={styles.chatList}>
          {isLoadingChats ? (
            <div className={styles.loadingChats}>
              <span>Carregando chats</span>
              <div className={styles.loadingChat}>
                <div className={styles.loadingChatDots}>
                  <div className={styles.loadingChatDot}></div>
                  <div className={styles.loadingChatDot}></div>
                  <div className={styles.loadingChatDot}></div>
                </div>
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className={styles.noChats}>
              <p>Você ainda não tem chats.</p>
              <button 
                className={styles.createFirstChatButton}
                onClick={() => setIsModalOpen(true)}
              >
                Criar seu primeiro chat
              </button>
            </div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.chat_id}
                className={`${styles.chatItem} ${chat.chat_id === activeChatId ? styles.chatItemActive : ''}`}
              >
                <div 
                  className={styles.chatInfo}
                  onClick={() => {
                    setActiveChatId(chat.chat_id);
                    
                    // Atualizar URL sem recarregar a página usando history API
                    const url = `/chat?chat_id=${chat.chat_id}`;
                    window.history.pushState({}, '', url);
                    
                    // Carregar as mensagens do chat
                    loadChat(chat.chat_id);
                  }}
                >
                  <div className={styles.chatName}>{chat.character_name}</div>
                  <div className={styles.chatMeta}>
                    {new Date(chat.last_updated).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  className={styles.deleteButton}
                  onClick={(e) => handleDeleteChat(chat.chat_id, e)}
                  title="Excluir chat"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-4 5v6m-4-6v6m-4-8v13a2 2 0 002 2h10a2 2 0 002-2V11H6" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Container principal do chat */}
      <div className={styles.chatContainer}>
        {/* Cabeçalho */}
        <div className={styles.chatHeader}>
          <button
            onClick={() => router.push('/characters')}
            className={styles.backButton}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8A088" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className={styles.chatTitle}>
            {activeChatId ? 
              `Conversa com ${chats.find(c => c.chat_id === activeChatId)?.character_name || formData.character}` :
              `Conversa com ${formData.character}`
            }
          </h1>
        </div>

        {/* Container de mensagens */}
        <div className={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div key={index} className={`${styles.message} ${styles[message.role]}`}>
              <div className={`${styles.messageBubble} ${styles[message.role]}`}>
                <div className={styles.messageContent}>{message.content}</div>
                <span className={styles.messageTimestamp}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={styles.loadingIndicator}>
              <div className={styles.loadingDots}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulário de input */}
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Digite sua mensagem... (Shift + Enter para nova linha)"
            className={styles.messageInput}
            disabled={isLoading}
            rows={1}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={styles.sendButton}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
} 