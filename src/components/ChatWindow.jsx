import { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const ChatWindow = ({ 
  chats, 
  activeChatId, 
  setActiveChatId, 
  createNewChat, 
  messages, 
  sendMessage,
  onLogout 
}) => {
  const [newPhone, setNewPhone] = useState('');
  const [isAddingChat, setIsAddingChat] = useState(false);

  const handleCreateChat = (e) => {
    e.preventDefault();
    if (newPhone.trim()) {
      createNewChat(newPhone.trim());
      setNewPhone('');
      setIsAddingChat(false);
    }
  };

  return (
    <div className="chat-layout">
      {/* Сайдбар */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Чаты</h3>
          <button className="logout-btn" onClick={onLogout} title="Выйти">🚪</button>
        </div>
        
        <div className="chat-list">
          {chats.map(chat => (
            <div 
              key={chat.chatId} 
              className={`chat-item ${activeChatId === chat.chatId ? 'active' : ''}`}
              onClick={() => setActiveChatId(chat.chatId)}
            >
              <div className="avatar">{chat.phoneNumber.slice(-2)}</div>
              <div className="chat-info">
                <span className="phone">{chat.phoneNumber}</span>
                <span className="last-msg">Нажмите, чтобы открыть</span>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          {isAddingChat ? (
            <form onSubmit={handleCreateChat} className="add-chat-form">
              <input
                type="text"
                placeholder="Номер телефона"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                autoFocus
              />
              <button type="submit">OK</button>
              <button type="button" onClick={() => setIsAddingChat(false)}>X</button>
            </form>
          ) : (
            <button className="new-chat-btn" onClick={() => setIsAddingChat(true)}>
              + Новый чат
            </button>
          )}
        </div>
      </div>

      {/* Область чата */}
      <div className="chat-area">
        {activeChatId ? (
          <>
            <div className="chat-header">
              <div className="avatar">{activeChatId.split('@')[0].slice(-2)}</div>
              <h4>{activeChatId.split('@')[0]}</h4>
            </div>
            <MessageList messages={messages} />
            <MessageInput onSend={(text) => sendMessage(activeChatId, text)} />
          </>
        ) : (
          <div className="empty-state">
            <p>Выберите чат или создайте новый, чтобы начать общение</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;