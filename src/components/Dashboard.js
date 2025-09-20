import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Workers from './workers.js';
import Products from './Products.js';
import Users from './Users.js';
import Invoices from './Invoices.js';
import Invoiceslist from './InvoiceList.js';
import HomePage from './HomePage.js';
import '../css/dashboard.css';

const Dashboard = ({ setAuth }) => {
  const [role, setRole] = useState('');
  const [dpi, setDpi] = useState('');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [content, setContent] = useState('Inicio');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const companyName = process.env.REACT_APP_COMPANY_NAME || 'Dispensario Santa Elizabeth Seton';
  const logoPath = process.env.REACT_APP_LOGO_PATH || '/images/logo.png';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedDpi = localStorage.getItem('dpi');

    if (!token) {
      navigate('/login');
    } else {
      setRole(storedRole);
      setDpi(storedDpi);
      
      // Obtener información del usuario
      fetchUserInfo();
    }
  }, [navigate]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      // Aquí podrías hacer una llamada a la API para obtener más información del usuario
      // Por ahora, usaremos el rol para mostrar información
      setUserName(role === 'administrador' ? 'Administrador' : role === 'vendedor' ? 'Vendedor' : 'Cliente');
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('dpi');
    
    if (typeof setAuth === 'function') {
      setAuth(false);
    } else {
      console.error("setAuth is not defined as a function.");
    }
    navigate('/');
  };

  const showContent = (selectedContent) => {
    setContent(selectedContent);
  };

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'administrador': 'Administrador',
      'vendedor': 'Vendedor',
      'cliente': 'Cliente'
    };
    return roleNames[role] || role;
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const menuItems = [
    {
      id: 'Inicio',
      title: 'INICIO',
      icon: 'fas fa-home',
      roles: ['administrador', 'vendedor', 'cliente']
    },
    {
      id: 'Gestionar Productos',
      title: 'PRODUCTOS',
      icon: 'fas fa-pills',
      roles: ['administrador', 'vendedor']
    },
    {
      id: 'Registrar Ventas',
      title: 'REGISTRAR VENTAS',
      icon: 'fas fa-cash-register',
      roles: ['administrador', 'vendedor']
    },
    {
      id: 'Gestionar Usuarios',
      title: 'USUARIOS',
      icon: 'fas fa-users',
      roles: ['administrador']
    },
    {
      id: 'Gestionar Trabajadores',
      title: 'TRABAJADORES',
      icon: 'fas fa-user-tie',
      roles: ['administrador']
    },
    {
      id: 'Ver Facturas',
      title: 'FACTURAS',
      icon: 'fas fa-file-invoice',
      roles: ['administrador']
    },
    {
      id: 'Ver Reportes',
      title: 'REPORTES',
      icon: 'fas fa-chart-bar',
      roles: ['administrador']
    },
    {
      id: 'Mis Compras',
      title: 'MIS COMPRAS',
      icon: 'fas fa-shopping-bag',
      roles: ['cliente']
    }
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="dashboard-container">
      {/* Navigation Sidebar */}
      <div className={`navigation ${isNavVisible ? 'visible' : 'hidden'}`}>
        {/* Logo and Company Info */}
        <div className="nav-header">
          <div className="logo-container">
            <img src={logoPath} alt="Logo" className="nav-logo" />
            <div className="company-info">
              <h3>{companyName}</h3>
              <span className="user-role">{getRoleDisplayName(role)}</span>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <nav className="nav-menu">
          <ul>
            {visibleMenuItems.map((item) => (
              <li key={item.id} className={content === item.id ? 'active' : ''}>
                <a href="#" onClick={() => showContent(item.id)}>
                  <i className={item.icon}></i>
                  <span className="menu-title">{item.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Logout Button */}
        <div className="nav-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="user-details">
              <span className="user-name">{userName}</span>
              <span className="user-dpi">DPI: {dpi}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>SALIR</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`main-content ${isNavVisible ? '' : 'expanded'}`}>
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="nav-toggle" onClick={toggleNav}>
              <i className={`fas ${isNavVisible ? 'fa-times' : 'fa-bars'}`}></i>
              <span>{isNavVisible ? 'Cerrar Menú' : 'Abrir Menú'}</span>
            </button>
            <div className="breadcrumb">
              <span>Dashboard</span>
              <i className="fas fa-chevron-right"></i>
              <span>{content}</span>
            </div>
          </div>
          
          <div className="topbar-right">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Buscar..." />
            </div>
            
            <div className="user-menu">
              <div className="notifications">
                <i className="fas fa-bell"></i>
                <span className="notification-badge">3</span>
              </div>
              
              <div className="user-profile">
                <img src={logoPath} alt="Profile" className="profile-avatar" />
                <div className="profile-info">
                  <span className="profile-name">{userName}</span>
                  <span className="profile-role">{getRoleDisplayName(role)}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area">
          {content === 'Inicio' && (
            <div className="welcome-section">
              <div className="welcome-header">
                <h1>{getWelcomeMessage()}, {userName}!</h1>
                <p>Bienvenido al panel de administración de {companyName}</p>
              </div>
              
              <div className="stats-grid">
                {role === 'administrador' && (
                  <>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-pills"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Productos</h3>
                        <p>Gestionar inventario</p>
                        <span className="stat-number">250+</span>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Usuarios</h3>
                        <p>Administrar accesos</p>
                        <span className="stat-number">45</span>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-file-invoice"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Facturas</h3>
                        <p>Ventas del mes</p>
                        <span className="stat-number">158</span>
                      </div>
                    </div>
                  </>
                )}
                
                {role === 'vendedor' && (
                  <>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-cash-register"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Ventas Hoy</h3>
                        <p>Transacciones realizadas</p>
                        <span className="stat-number">12</span>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-pills"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Productos</h3>
                        <p>Disponibles para venta</p>
                        <span className="stat-number">250+</span>
                      </div>
                    </div>
                  </>
                )}
                
                {role === 'cliente' && (
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-shopping-bag"></i>
                    </div>
                    <div className="stat-info">
                      <h3>Mis Compras</h3>
                      <p>Historial de pedidos</p>
                      <span className="stat-number">8</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="quick-actions">
                <h3>Acciones Rápidas</h3>
                <div className="action-buttons">
                  {role === 'administrador' && (
                    <>
                      <button className="action-btn" onClick={() => showContent('Gestionar Productos')}>
                        <i className="fas fa-plus"></i>
                        Agregar Producto
                      </button>
                      <button className="action-btn" onClick={() => showContent('Ver Facturas')}>
                        <i className="fas fa-file-invoice"></i>
                        Ver Facturas
                      </button>
                    </>
                  )}
                  
                  {role === 'vendedor' && (
                    <button className="action-btn" onClick={() => showContent('Registrar Ventas')}>
                      <i className="fas fa-cash-register"></i>
                      Nueva Venta
                    </button>
                  )}
                  
                  {role === 'cliente' && (
                    <button className="action-btn" onClick={() => navigate('/')}>
                      <i className="fas fa-shopping-cart"></i>
                      Ir a Tienda
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {content === 'Gestionar Trabajadores' && <Workers />}
          {content === 'Gestionar Productos' && <Products />}
          {content === 'Gestionar Usuarios' && <Users />}
          {content === 'Registrar Ventas' && <Invoices />}
          {content === 'Ver Facturas' && <Invoiceslist />}
          {content === 'Ver Reportes' && (
            <div className="reports-section">
              <h2>Reportes y Análisis</h2>
              <p>Esta sección estará disponible próximamente con gráficos y estadísticas detalladas.</p>
            </div>
          )}
          {content === 'Mis Compras' && (
            <div className="purchases-section">
              <h2>Mis Compras</h2>
              <p>Aquí podrás ver el historial de todas tus compras realizadas.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;