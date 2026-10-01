import { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idInstance.trim() && apiTokenInstance.trim()) {
      onLogin(idInstance.trim(), apiTokenInstance.trim());
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Вход в GREEN-API</h2>
        <p>Введите ваши учетные данные для подключения к MAX</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>idInstance</label>
            <input
              type="text"
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              placeholder="Например: 1101000000"
              required
            />
          </div>
          <div className="input-group">
            <label>apiTokenInstance</label>
            <input
              type="password"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              placeholder="Ваш API токен"
              required
            />
          </div>
          <button type="submit" className="login-btn">Подключиться</button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;