import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/login.css';

const Login = ({ setAuth, logoutMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dpi, setDpi] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [message, setMessage] = useState(logoutMessage || '');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://farmacia-backend.onrender.com/api';
  const companyName = process.env.REACT_APP_COMPANY_NAME || 'Dispensario Santa Elizabeth Seton';
  const logoPath = process.env.REACT_APP_LOGO_PATH || '/images/logo.png';

  useEffect(() => {
    if (logoutMessage) {
      setMessage(logoutMessage);
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setMessage(''), 5000);
    }
  }, [logoutMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/users/login`, { username, password });
      
      localStorage.setItem('token', response.data.token);
      const { role, dpi } = JSON.parse(atob(response.data.token.split('.')[1]));
      localStorage.setItem('role', role);
      localStorage.setItem('dpi', dpi);

      setAuth(true);
      setMessage('');
      navigate('/dashboard');
    } catch (error) {
      setMessage('Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('role', 'cliente');
      formData.append('userType', 'cliente');
      formData.append('dpi', dpi);
      formData.append('name', name);
      formData.append('birthDate', '1990-01-01');
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      if (image) {
        formData.append('image', image);
      }

      await axios.post(`${baseURL}/users/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await axios.post(`${baseURL}/clients`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
      setIsLoginMode(true);
      // Limpiar formulario
      resetForm();
    } catch (error) {
      console.error('Error al registrar cliente:', error.response?.data || error.message);
      setMessage(`Error al registrar: ${error.response?.data?.message || 'Intenta nuevamente'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder para futura implementación de Google OAuth
    setMessage('La autenticación con Google estará disponible próximamente.');
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setName('');
    setDpi('');
    setEmail('');
    setPhone('');
    setAddress('');
    setImage(null);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setMessage('');
    resetForm();
  };

  return (
    <div className="login-container">
      {/* Background Image */}
      <div className="login-background"></div>
      
      {/* Header */}
      <header className="login-header">
        <div className="header-content">
          <img src={logoPath} alt="Logo" className="login-logo" />
          <h1>{companyName}</h1>
          <a href="/" className="back-home">← Volver al inicio</a>
        </div>
      </header>

      {/* Main Login Content */}
      <div className="login-content">
        <div className="login-card">
          <div className="card-header">
            <h2>{isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
            <p className="card-subtitle">
              {isLoginMode 
                ? 'Accede a tu portal de empleado' 
                : 'Regístrate como cliente'}
            </p>
          </div>

          {/* Alert Messages */}
          {message && (
            <div className={`alert ${message.includes('Error') || message.includes('incorrectas') ? 'alert-error' : 'alert-success'}`}>
              <i className={`fas ${message.includes('Error') || message.includes('incorrectas') ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
              {message}
            </div>
          )}

          {/* Login/Register Form */}
          <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="login-form">
            {!isLoginMode && (
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    placeholder="Ingresa tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>DPI *</label>
                  <input
                    type="text"
                    placeholder="Número de DPI"
                    value={dpi}
                    onChange={(e) => setDpi(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {!isLoginMode && (
              <div className="form-row">
                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    placeholder="Número de teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {!isLoginMode && (
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  placeholder="Dirección completa"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input"
                />
              </div>
            )}

            {!isLoginMode && (
              <div className="form-group">
                <label>Foto de Perfil (Opcional)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="file-input"
                    id="profile-image"
                  />
                  <label htmlFor="profile-image" className="file-input-label">
                    <i className="fas fa-camera"></i>
                    {image ? image.name : 'Seleccionar imagen'}
                  </label>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Usuario *</label>
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Contraseña *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Procesando...
                </>
              ) : (
                isLoginMode ? 'Iniciar Sesión' : 'Registrarse'
              )}
            </button>
          </form>

          {/* Divider */}
          {isLoginMode && (
            <div className="divider">
              <span>o continúa con</span>
            </div>
          )}

          {/* Google Login Button */}
          {isLoginMode && (
            <button 
              type="button" 
              className="google-btn"
              onClick={handleGoogleLogin}
            >
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="google-icon"
              />
              Continuar con Google
            </button>
          )}

          {/* Toggle Mode */}
          <div className="toggle-section">
            <p>
              {isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button 
                type="button" 
                className="toggle-btn"
                onClick={toggleMode}
              >
                {isLoginMode ? 'Regístrate aquí' : 'Iniciar sesión'}
              </button>
            </p>
          </div>

          {/* Help Section */}
          <div className="help-section">
            {isLoginMode ? (
              <>
                <p><strong>¿Necesitas ayuda?</strong></p>
                <ul>
                  <li>• Los empleados deben usar sus credenciales proporcionadas por el administrador</li>
                  <li>• Los clientes pueden registrarse desde esta página</li>
                  <li>• Si olvidas tu contraseña, contacta al administrador</li>
                </ul>
              </>
            ) : (
              <>
                <p><strong>Al registrarte:</strong></p>
                <ul>
                  <li>• Podrás realizar compras en línea</li>
                  <li>• Tendrás acceso al historial de compras</li>
                  <li>• Recibirás notificaciones sobre productos</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;