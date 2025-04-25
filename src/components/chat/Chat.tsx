import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Chat.module.css';
import Modal from '@/components/common/Modal/Modal';
import CharacterSelectionForm from './CharacterSelectionForm';
import modalStyles from '@/components/common/Modal/styles.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Definir ChatFormData aqui também
interface ChatFormData {
  character: string;
  historicalPeriod: string;
  historicalFactor: string;
  language: string;
}

// Definir um tipo para os detalhes do chat carregados
interface ChatDetails extends ChatFormData {
  chat_id: string;
}

interface ChatProps {
  chatId?: string; // Renomear para initialChatId abaixo
}

export default function Chat({ chatId: initialChatId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading geral (mensagens, detalhes)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chats, setChats] = useState<any[]>([]); // Lista da sidebar
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);
  const [isLoadingChats, setIsLoadingChats] = useState(false); // Loading da sidebar
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null); // Estado para detalhes do chat ativo
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { token } = useAuth();
  const router = useRouter();

  // Mover o Ref para o nível superior
  const activeChatIdRef = useRef(activeChatId);

  // Mover o useEffect que atualiza o Ref para o nível superior
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Carregar a lista de chats inicial
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
        // Ordenar por data se disponível
        if (data.length > 0 && data[0].last_updated) {
          data.sort((a: any, b: any) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());
        }
        setChats(data);

        // Se temos um initialChatId vindo da URL, definir como ativo
        if (initialChatId && data.some((chat: any) => chat.chat_id === initialChatId)) {
            console.log(`Setting initial active chat from URL: ${initialChatId}`);
            setActiveChatId(initialChatId);
        } else if (!initialChatId && data.length > 0) {
            // Se não veio ID na URL mas temos chats, opcionalmente ativar o primeiro
            // console.log(`No initial chat ID from URL, activating the first in list: ${data[0].chat_id}`);
            // setActiveChatId(data[0].chat_id);
        } else {
             // Se não veio ID na URL e não há chats, ou o ID da URL não está na lista
             if (initialChatId) {
                 console.warn(`Initial chat ID ${initialChatId} from URL not found in fetched chat list.`);
                 // Poderia redirecionar ou limpar a URL?
                 // router.replace('/chat', undefined, { shallow: true });
             }
             setActiveChatId(null); // Garantir que nenhum chat está ativo
        }

      } catch (error) {
        console.error('Erro ao carregar chats:', error);
        setChats([]); // Limpar chats em caso de erro
        setActiveChatId(null);
      } finally {
        setIsLoadingChats(false);
      }
    };
    
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, initialChatId]); // Depender do initialChatId também para reavaliar se ele mudar


  // Carregar detalhes e mensagens do chat ativo
  useEffect(() => {
    console.log(`[useEffect activeChatId] Triggered. activeChatId: ${activeChatId}, token exists: ${!!token}`);

    if (!activeChatId || !token) {
        console.log('[useEffect activeChatId] Condition not met. Clearing messages and details.');
        setMessages([]);
        setChatDetails(null);
        setIsLoading(false);
        return;
    }

    // Se for um chat novo (placeholder), não buscar do backend
    if (activeChatId.startsWith('new-')) {
        console.log('[useEffect activeChatId] New chat placeholder, skipping backend fetch.');
        setIsLoading(false);
        return;
    }

    const loadActiveChatDetails = async () => {
      console.log(`[useEffect activeChatId] Running loadActiveChatDetails for chat: ${activeChatId}`);
      setIsLoading(true);
      setMessages([]);
      setChatDetails(null);

      try {
        console.log(`[useEffect activeChatId] Fetching: /chat/${activeChatId}`);
        const response = await fetch(`http://localhost:8001/chat/${activeChatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(`[useEffect activeChatId] Fetch response status: ${response.status}`);

        if (!response.ok) {
          // ... (tratamento de erro 404 e outros como antes) ...
           if (response.status === 404) {
             console.warn(`[useEffect activeChatId] Chat com ID ${activeChatId} não encontrado (404).`);
             setMessages([]);
             setChatDetails(null);
             // Opcional: Remover da lista local, limpar URL, etc.
             setChats(prev => prev.filter(c => c.chat_id !== activeChatId));
             setActiveChatId(null);
             router.replace('/chat', undefined, { shallow: true });
           } else {
             let errorDetail = 'Erro desconhecido';
             try {
                const errorData = await response.json();
                errorDetail = errorData.detail || `Status ${response.status}`;
             } catch {
                 errorDetail = `Status ${response.status}`;
             }
             console.error(`[useEffect activeChatId] Erro ao carregar dados do chat: ${errorDetail}`);
             throw new Error(`Erro ao carregar dados do chat: ${errorDetail}`);
           }
        } else {
          const data = await response.json();
          console.log('[useEffect activeChatId] Fetch successful. Data received:', data);

          // Atualizar o estado chatDetails
          const loadedDetails: ChatDetails = {
            chat_id: activeChatId, // Garantir que o ID está aqui
            character: data.character_name || 'Personagem Desconhecido',
            historicalPeriod: data.historical_period || '',
            historicalFactor: data.historical_factors || '',
            language: data.language || 'Português'
          };
          console.log('[useEffect activeChatId] Setting chatDetails:', loadedDetails);
          setChatDetails(loadedDetails);

          // Carregar mensagens
          if (data.messages && Array.isArray(data.messages)) {
             const mappedMessages = data.messages.map((msg: any) => ({
               role: msg.role || (msg.is_user ? 'user' : 'assistant'),
               content: msg.content,
               timestamp: msg.timestamp || new Date().toISOString()
             }));
             console.log(`[useEffect activeChatId] Setting ${mappedMessages.length} messages.`);
             setMessages(mappedMessages);
          } else {
            console.log('[useEffect activeChatId] No messages found. Setting empty messages array.');
            setMessages([]);
          }
        }
      } catch (error) {
        console.error('[useEffect activeChatId] CATCH block error:', error);
        setMessages([]);
        setChatDetails(null); // Limpar detalhes em caso de erro
      } finally {
        console.log('[useEffect activeChatId] FINALLY block. Setting isLoading to false.');
        setIsLoading(false);
      }
    };

    loadActiveChatDetails();

    return () => {
        console.log(`[useEffect activeChatId] Cleanup function for activeChatId: ${activeChatId}`);
    };

  }, [activeChatId, token, router]); // Adicionar router para que o replace funcione no 404

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
    setTimeout(() => {
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);


  // Enviar mensagem
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !chatDetails) {
        console.warn('Submit prevented: No input, loading, or no chat details.');
        return;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      // Construir payload com os dados do chat
      const payload = {
        character: chatDetails.character,
        prompt: currentInput,
        historical_period: chatDetails.historicalPeriod,
        historical_factors: chatDetails.historicalFactor,
        language: chatDetails.language,
        session_id: chatDetails.chat_id.startsWith('new-') ? undefined : chatDetails.chat_id
      };

      console.log("Sending message payload:", payload);
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setMessages(prev => prev.filter(msg => msg.timestamp !== userMessage.timestamp));
        setInputMessage(currentInput);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro ao enviar mensagem: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received message response:", data);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      // Se for um chat novo (primeira mensagem), atualizar com o ID real
      if (chatDetails.chat_id.startsWith('new-') && data.chat_id) {
        const newChatId = data.chat_id;
        
        // Atualizar URL
        const url = `/chat?chat_id=${newChatId}`;
        window.history.replaceState({ path: url }, '', url);
        
        // Atualizar detalhes do chat com ID real
        setChatDetails(prev => prev ? { ...prev, chat_id: newChatId } : null);

        // Adicionar à lista de chats
        setChats(prev => [{
          chat_id: newChatId,
          character_name: chatDetails.character,
          historical_period: chatDetails.historicalPeriod,
          historical_factors: chatDetails.historicalFactor,
          language: chatDetails.language,
          last_updated: new Date().toISOString()
        }, ...prev]);
      }

      // Adicionar resposta do assistente
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro no handleSubmit:', error);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  // Criar um NOVO chat (via Modal)
  const handleNewChat = async (newChatFormData: ChatFormData) => {
    setIsModalOpen(false);
    console.log("Iniciando novo chat com:", newChatFormData);

    // Apenas salvar os dados no estado
    setChatDetails({
        chat_id: `new-${Date.now()}`, // ID temporário só pra referência
        character: newChatFormData.character,
        historicalPeriod: newChatFormData.historicalPeriod,
        historicalFactor: newChatFormData.historicalFactor,
        language: newChatFormData.language
    });

    // Limpar mensagens
    setMessages([]);
  };

  // Função para deletar um chat
  const handleDeleteChat = async (chatIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Tentando deletar chat:", chatIdToDelete);

    try {
      const response = await fetch(`http://localhost:8001/chat/${chatIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro ao deletar chat: ${response.status}`);
      }

      console.log("Chat deletado com sucesso:", chatIdToDelete);
      setChats(prev => prev.filter(chat => chat.chat_id !== chatIdToDelete));

      if (activeChatId === chatIdToDelete) {
        setActiveChatId(null);
        // setChatDetails(null); // Já será limpo pelo useEffect
        // setMessages([]); // Já será limpo pelo useEffect
        router.replace('/chat', undefined, { shallow: true }); // Limpar URL
      }

    } catch (error) {
      console.error("Erro ao deletar chat:", error);
    }
  };

  const loadChat = (chatIdToLoad: string) => {
      if (chatIdToLoad === activeChatId) {
          console.log("Chat já está ativo:", chatIdToLoad);
          return;
      }
      console.log("Selecionando chat:", chatIdToLoad);
      const url = `/chat?chat_id=${chatIdToLoad}`;
      // Usar replaceState talvez seja melhor para não poluir histórico com cliques na lista
      window.history.replaceState({ path: url }, '', url);
      setActiveChatId(chatIdToLoad); // Dispara o useEffect
  };

  // Listener para o evento popstate (navegação do navegador)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const urlParams = new URLSearchParams(window.location.search);
      const chatIdFromUrl = urlParams.get('chat_id');
      console.log("Evento Popstate - Chat ID da URL:", chatIdFromUrl);

      const currentChatId = activeChatIdRef.current; // Usar ref para valor atual

      if (chatIdFromUrl && chatIdFromUrl !== currentChatId) {
        console.log("Atualizando activeChatId via Popstate para:", chatIdFromUrl);
        setActiveChatId(chatIdFromUrl); // Atualiza o estado, que dispara useEffect
      } else if (!chatIdFromUrl && currentChatId) {
        console.log("URL não tem mais chat_id, limpando chat ativo.");
        setActiveChatId(null); // Atualiza o estado, que dispara useEffect
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Manter array vazio para adicionar/remover listener apenas uma vez


  // JSX
  return (
    // Manter a classe mainContainer se ela existir e for usada para layout geral
    <div className={styles.mainContainer || styles.chatContainer}> 
      {/* Sidebar */}
      <div className={styles.sidebar}>
          {/* ... (Header da Sidebar e botão Novo como antes) ... */}
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Seus Chats</h2>
            <button 
              className={styles.newChatButton}
              onClick={() => setIsModalOpen(true)}
            >
              {/* Ícone + */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Novo</span>
            </button>
          </div>
        
          {/* Lista de Chats */}
          <div className={styles.chatList}>
            {isLoadingChats ? (
              <div className={styles.loadingChats}>Carregando...</div>
            ) : chats.length === 0 ? (
              <div className={styles.noChats}>
                <p>Você ainda não tem chats.</p>
                <button 
                  className={styles.createFirstChatButton}
                  onClick={() => setIsModalOpen(true)} // Abrir modal
                >
                  Criar seu primeiro chat
                </button>
              </div>
            ) : (
              chats.map((chat) => (
                // Usar loadChat no onClick do item da lista
                <div 
                  key={chat.chat_id}
                  className={`${styles.chatItem} ${chat.chat_id === activeChatId ? styles.chatItemActive : ''}`}
                  onClick={() => loadChat(chat.chat_id)} 
                >
                  <div className={styles.chatInfo}>
                     <div className={styles.chatName}>{chat.character_name || `Chat ${chat.chat_id.substring(0, 6)}`}</div>
                     {/* Opcional: Exibir data */}
                     <div className={styles.chatMeta}>
                       {chat.last_updated ? new Date(chat.last_updated).toLocaleDateString() : ''}
                     </div>
                  </div>
                  <button 
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteChat(chat.chat_id, e)}
                    title="Excluir chat"
                  >
                    {/* Ícone Lixeira */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-4 5v6m-4-6v6m-4-8v13a2 2 0 002 2h10a2 2 0 002-2V11H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      
      {/* Área Principal do Chat */}
      <div className={styles.chatContainer}> 
          {/* Renderização condicional da área principal */}
          {isLoading && !chatDetails && (
              // Loading inicial ou ao trocar de chat
              // Aplicar estilos de centralização semelhantes ao noChatSelected
              <div className={styles.noChatSelected} style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  {/* Adicionar um spinner/indicador de loading aqui */}
                  <div className={styles.loadingSpinner}></div> 
                  <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Carregando chat...</p>
              </div>
          )}
          
          {!activeChatId && !isLoading && (
              // Nenhum chat selecionado e não está carregando - Centralizado
              <div className={styles.noChatSelected} style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#E8DFD8' }}>Bem-vindo!</h1>
                  <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#A0A0A0' }}>Selecione um chat na lista à esquerda ou crie um novo para começar.</p>
                  <button 
                    onClick={() => setIsModalOpen(true)} 
                    className={styles.newChatButtonLarge} // Usar um estilo existente ou criar um novo
                    style={{ 
                       background: '#B8A088', color: '#1A1A1A', border: 'none',
                       borderRadius: '0.5rem', padding: '0.8rem 1.8rem', fontSize: '1.1rem',
                       cursor: 'pointer', fontWeight: 'bold', 
                       transition: 'background-color 0.3s ease' 
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#A08C78')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#B8A088')}
                  >
                      + Criar Novo Chat
                  </button>
              </div>
          )}

          {activeChatId && chatDetails && (
            // Mostrar chat ativo se tivermos ID e detalhes carregados
            <>
              {/* Cabeçalho do Chat - Usar chatDetails */}
              <div className={styles.chatHeader}>
                {/* Botão Voltar Removido */}
                <h1 className={styles.chatTitle}>
                    {`Conversa com ${chatDetails.character}`}
                </h1>
                {/* Opcional: Mostrar detalhes do período/fator/idioma */}
                 <p className={styles.historicalContext}>
                     {chatDetails.historicalPeriod} {chatDetails.historicalFactor && `- ${chatDetails.historicalFactor}`} ({chatDetails.language})
                 </p>
              </div>

              {/* Mensagens */}
              <div className={styles.messagesContainer}>
                 {messages.length === 0 && !isLoading && (
                     <div className={styles.noMessages}>
                         Envie a primeira mensagem para começar.
                     </div>
                 )}
                 {messages.map((message, index) => (
                    <div key={`${message.timestamp}-${index}`} className={`${styles.message} ${styles[message.role]}`}>
                       <div className={`${styles.messageBubble} ${styles[message.role]}`}>
                         <div className={styles.messageContent}>{message.content}</div>
                         <span className={styles.messageTimestamp}>
                           {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                    </div>
                 ))}
                 {/* Loading de resposta do assistente (isLoading E chatDetails existe) */}
                 {isLoading && chatDetails && (
                     <div className={`${styles.message} ${styles.assistant} ${styles.loading}`}>
                         <div className={`${styles.messageBubble} ${styles.assistant}`}>
                             <div className={styles.loadingDots}> <div/><div/><div/> </div>
                         </div>
                     </div>
                 )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem - Usar chatDetails no placeholder */}
              <form onSubmit={handleSubmit} className={styles.inputForm}>
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any); // Cast necessário ou criar handler específico
                    }
                  }}
                  placeholder={`Converse com ${chatDetails.character}...`}
                  className={styles.messageInput}
                  disabled={isLoading || !activeChatId} // Desabilitar se estiver carregando ou nenhum chat ativo
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading || !activeChatId}
                  className={styles.sendButton}
                >
                   {/* Ícone Enviar */} 
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                   </svg>
                </button>
              </form>
            </>
          )}
        </div>

      {/* Modal para Novo Chat - Adicionar de volta */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {/* Garantir que modalStyles.modalContent e modalStyles.modalTitle estão aplicados */}
          <div className={modalStyles.modalContent}> 
             <h2 className={modalStyles.modalTitle}>Criar Novo Chat</h2>
              <CharacterSelectionForm
                 onSubmit={handleNewChat}
                 token={token || ''} 
              />
              {/* Adicionar um botão fechar visual se não estiver no componente Modal */}
              {/* <button onClick={() => setIsModalOpen(false)} className={modalStyles.closeButton}>Fechar</button> */}
          </div>
        </Modal>
      )}

    </div> // Fim do container principal
  );
} 