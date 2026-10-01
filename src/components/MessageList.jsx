import { useEffect, useRef } from 'react';
import './MessageList.css';

const MessageList = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">Нет сообщений. Напишите первым!</div>
      ) : (
        messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message-bubble ${msg.isOutgoing ? 'outgoing' : 'incoming'}`}
          >
            <div className="message-text">{msg.text}</div>
            <div className="message-time">{msg.timestamp}</div>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;