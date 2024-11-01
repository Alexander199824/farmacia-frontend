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
  toggleLink: {
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px'
  }
};

const Login = ({ setAuth, logoutMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dpi, setDpi] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null); // Estado para la imagen
  const [isLoginMode, setIsLoginMode] = useState(true);
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
      
      // Guarda el token solo en el login, no en el registro
      localStorage.setItem('token', response.data.token);
      const { role, dpi } = JSON.parse(atob(response.data.token.split('.')[1]));
      localStorage.setItem('role', role);
      localStorage.setItem('dpi', dpi);

      setAuth(true);
      setMessage('');
      navigate('/dashboard');
    } catch (error) {
      alert('Credenciales incorrectas');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('role', 'cliente');
      formData.append('userType', 'cliente');
      formData.append('dpi', dpi);
      formData.append('name', name);
      formData.append('birthDate', '1990-01-01'); // Puedes hacer esto un campo de entrada si es necesario
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      if (image) {
        formData.append('image', image); // Solo envía la imagen si existe
      }

      // Realiza el registro de usuario y cliente
      await axios.post('https://farmacia-backend.onrender.com/api/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await axios.post('https://farmacia-backend.onrender.com/api/clients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Cuenta de cliente creada con éxito. Inicia sesión ahora.');
      setIsLoginMode(true);
    } catch (error) {
      console.error('Error al registrar cliente:', error.response?.data || error.message);
      alert(`Error al registrar cliente: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginForm}>
        {message && <p style={styles.logoutMessage}>{message}</p>}
        <h2 style={styles.title}>{isLoginMode ? 'Iniciar Sesión' : 'Registrar Cliente'}</h2>
        <form onSubmit={isLoginMode ? handleLogin : handleRegister}>
          {!isLoginMode && (
            <>
              <input
                type="text"
                placeholder="Nombre Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="DPI"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Dirección"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={styles.input}
              />
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])} // Guardar imagen seleccionada
                style={styles.input}
              />
            </>
          )}
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            {isLoginMode ? 'Login' : 'Registrar'}
          </button>
        </form>
        <p style={styles.toggleLink} onClick={() => setIsLoginMode(!isLoginMode)}>
          {isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
        </p>
      </div>
    </div>
  );
};

export default Login;
