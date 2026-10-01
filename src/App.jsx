import { useState, useEffect, useRef } from 'react';
import LoginForm from './components/LoginForm';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('greenApiCredentials');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState({}); // { chatId: [messages] }

  const credentialsRef = useRef(credentials);
  useEffect(() => {
    credentialsRef.current = credentials;
  }, [credentials]);

  const handleLogin = (idInstance, apiTokenInstance) => {
    const creds = { idInstance, apiTokenInstance };
    setCredentials(creds);
    localStorage.setItem('greenApiCredentials', JSON.stringify(creds));
  };

  const handleLogout = () => {
    setCredentials(null);
    localStorage.removeItem('greenApiCredentials');
    setChats([]);
    setMessages({});
    setActiveChatId(null);
  };

  const createNewChat = (phoneNumber) => {
    const chatId = `${phoneNumber}@c.us`; // Для MAX может быть @max.ru, уточните в документации
    if (!chats.find(c => c.chatId === chatId)) {
      setChats(prev => [...prev, { chatId, phoneNumber }]);
    }
    setActiveChatId(chatId);
  };

  const sendMessage = async (chatId, text) => {
    if (!credentialsRef.current) return;
    const { idInstance, apiTokenInstance } = credentialsRef.current;
    
    const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
    const body = {
      chatId: chatId,
      message: text
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        // Добавляем сообщение локально
        const newMessage = {
          id: Date.now().toString(),
          text: text,
          isOutgoing: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), newMessage]
        }));
      } else {
        console.error('Failed to send message');
        alert('Ошибка отправки сообщения. Проверьте данные.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Получение сообщений (Polling)
  useEffect(() => {
    if (!credentials) return;

    const intervalId = setInterval(async () => {
      const { idInstance, apiTokenInstance } = credentialsRef.current;
      
      try {
        const response = await fetch(`https://api.green-api.com/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`);
        const data = await response.json();

        if (data && data.body) {
          const { receiptId, body } = data;
          
          // Удаляем уведомление из очереди
          await fetch(`https://api.green-api.com/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`, {
            method: 'DELETE'
          });

          // Обрабатываем входящее сообщение
          if (body.typeWebhook === 'incomingMessageReceived') {
            const senderPhone = body.senderData.sender.split('@')[0];
            const chatId = body.senderData.sender;
            const messageText = body.messageData?.textMessageData?.textMessage || 'Неподдерживаемый тип сообщения';

            // Добавляем чат, если его нет
            setChats(prev => {
              if (!prev.find(c => c.chatId === chatId)) {
                return [...prev, { chatId, phoneNumber: senderPhone }];
              }
              return prev;
            });

            // Добавляем сообщение
            const newMessage = {
              id: body.idMessage,
              text: messageText,
              isOutgoing: false,
              timestamp: new Date(body.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => ({
              ...prev,
              [chatId]: [...(prev[chatId] || []), newMessage]
            }));
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Опрос каждые 5 секунд

    return () => clearInterval(intervalId);
  }, [credentials]);

  if (!credentials) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <ChatWindow
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        createNewChat={createNewChat}
        messages={messages[activeChatId] || []}
        sendMessage={sendMessage}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;