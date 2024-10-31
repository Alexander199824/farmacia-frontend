import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#e0f7fa',
    fontFamily: 'Arial, sans-serif'
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '40px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center'
  },
  title: {
    color: '#333',
    fontSize: '24px',
    marginBottom: '20px'
  },
  logoutMessage: {
    color: '#ff6b6b',
    marginBottom: '15px',
    fontSize: '14px',
    textAlign: 'center'
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  buttonHover: {
    backgroundColor: '#45a049'
  }
};

const Login = ({ setAuth, logoutMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(logoutMessage || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (logoutMessage) {
      setMessage(logoutMessage);
    }
  }, [logoutMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://farmacia-backend.onrender.com/api/users/login', { username, password });
      localStorage.setItem('token', response.data.token);

      // Extraer rol y DPI del token decodificado
      const { role, dpi } = JSON.parse(atob(response.data.token.split('.')[1]));
      localStorage.setItem('role', role);
      localStorage.setItem('dpi', dpi); // Guardar el DPI del usuario

      setAuth(true);
      setMessage(''); // Limpia el mensaje después de iniciar sesión
      navigate('/dashboard');
    } catch (error) {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginForm}>
        {message && <p style={styles.logoutMessage}>{message}</p>}
        <h2 style={styles.title}>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
