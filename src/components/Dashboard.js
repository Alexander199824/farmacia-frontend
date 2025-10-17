/**
 * @author Alexander Echeverria
 * @file src/components/Dashboard.js
 * @description Dashboard principal mejorado con visualización correcta de estadísticas
 * @location src/components/Dashboard.js
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Workers from './workers.js';
import Products from './Products.js';
import Users from './Users.js';
import Invoices from './Invoices.js';
import Invoiceslist from './InvoiceList.js';
import Batches from './Batches.js';
import Statistics from './Statistics.js';
import AuditLog from './AuditLog.js';
import Alerts from './Alerts.js';
import Suppliers from './Suppliers.js';
import '../css/dashboard.css';

const Dashboard = ({ setAuth }) => {
  const [role, setRole] = useState('');
  const [dpi, setDpi] = useState('');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [content, setContent] = useState('Inicio');
  const [userName, setUserName] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    products: 0,
    batches: 0,
    orders: 0,
    users: 0,
    workers: 0,
    lowStock: 0,
    expiring: 0,
    totalRevenue: 0
  });
  
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
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
      fetchUserInfo(token);
      fetchDashboardStats(token, storedRole);
    }
  }, [navigate]);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get(
        `${baseURL}/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserName(response.data.name || getRoleDisplayName(localStorage.getItem('role')));
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUserName(getRoleDisplayName(localStorage.getItem('role')));
    }
  };

  const fetchDashboardStats = async (token, userRole) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Obtener productos
      const productsRes = await axios.get(`${baseURL}/products`);
      const products = productsRes.data;
      const lowStock = products.filter(p => p.stock < 10).length;

      let stats = {
        products: products.length,
        lowStock: lowStock,
        batches: 0,
        orders: 0,
        users: 0,
        workers: 0,
        expiring: 0,
        totalRevenue: 0
      };

      // Para administradores y vendedores
      if (userRole === 'administrador' || userRole === 'vendedor') {
        try {
          // Obtener lotes
          const batchesRes = await axios.get(`${baseURL}/batches`, { headers });
          stats.batches = batchesRes.data.batches?.length || batchesRes.data.length || 0;

          // Obtener lotes por vencer
          const expiringRes = await axios.get(`${baseURL}/batches/expiring?days=30`, { headers });
          stats.expiring = expiringRes.data.batches?.length || expiringRes.data.length || 0;

          // Obtener recibos/pedidos
          const ordersRes = await axios.get(`${baseURL}/invoices`, { headers });
          const orders = ordersRes.data || [];
          stats.orders = orders.length;
          
          // Calcular ingresos totales
          stats.totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
        } catch (error) {
          console.error('Error fetching additional stats:', error);
        }
      }

      // Solo para administradores
      if (userRole === 'administrador') {
        try {
          // Obtener usuarios
          const usersRes = await axios.get(`${baseURL}/users`, { headers });
          stats.users = usersRes.data.length || 0;

          // Obtener trabajadores
          const workersRes = await axios.get(`${baseURL}/workers`, { headers });
          stats.workers = workersRes.data.length || 0;
        } catch (error) {
          console.error('Error fetching users/workers stats:', error);
        }
      }

      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('dpi');
    
    if (typeof setAuth === 'function') {
      setAuth(false);
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
      id: 'Centro de Alertas',
      title: 'ALERTAS',
      icon: 'fas fa-bell',
      roles: ['administrador', 'vendedor']
    },
    {
      id: 'Gestionar Productos',
      title: 'PRODUCTOS',
      icon: 'fas fa-pills',
      roles: ['administrador', 'vendedor']
    },
    {
      id: 'Gestionar Proveedores',
      title: 'PROVEEDORES',
      icon: 'fas fa-truck',
      roles: ['administrador']
    },
    {
      id: 'Gestionar Lotes',
      title: 'LOTES',
      icon: 'fas fa-boxes',
      roles: ['administrador', 'vendedor']
    },
    {
      id: 'Registrar Ventas',
      title: 'VENTAS',
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
      id: 'Ver Pedidos',
      title: 'PEDIDOS',
      icon: 'fas fa-file-invoice',
      roles: ['administrador', 'vendedor']
    },
    {
      id: 'Ver Estadisticas',
      title: 'REPORTES',
      icon: 'fas fa-chart-bar',
      roles: ['administrador']
    },
    {
      id: 'Auditoria Sistema',
      title: 'AUDITORÍA',
      icon: 'fas fa-clipboard-list',
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
        <div className="nav-header">
          <div className="logo-container">
            <img src={logoPath} alt="Logo" className="nav-logo" />
            <div className="company-info">
              <h3>{companyName}</h3>
              <span className="user-role">{getRoleDisplayName(role)}</span>
            </div>
          </div>
        </div>
        
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
        <header className="topbar">
          <div className="topbar-left">
            <button className="nav-toggle" onClick={toggleNav}>
              <i className={`fas ${isNavVisible ? 'fa-times' : 'fa-bars'}`}></i>
              <span>{isNavVisible ? 'Cerrar' : 'Menú'}</span>
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
                <span className="notification-badge">{dashboardStats.expiring + dashboardStats.lowStock}</span>
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

        <main className="content-area">
          {content === 'Inicio' && (
            <div className="welcome-section">
              <div className="welcome-header">
                <h1>{getWelcomeMessage()}, {userName}!</h1>
                <p>Bienvenido al panel de administración de {companyName}</p>
              </div>
              
              <div className="stats-grid">
                <div className="stat-card" onClick={() => showContent('Gestionar Productos')}>
                  <div className="stat-icon">
                    <i className="fas fa-pills"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Productos</h3>
                    <p>Total en inventario</p>
                    <span className="stat-number">{dashboardStats.products}</span>
                  </div>
                </div>

                {role === 'administrador' && (
                  <>
                    <div className="stat-card" onClick={() => showContent('Gestionar Usuarios')}>
                      <div className="stat-icon">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Usuarios</h3>
                        <p>Registrados en sistema</p>
                        <span className="stat-number">{dashboardStats.users}</span>
                      </div>
                    </div>

                    <div className="stat-card" onClick={() => showContent('Gestionar Trabajadores')}>
                      <div className="stat-icon">
                        <i className="fas fa-user-tie"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Trabajadores</h3>
                        <p>Personal activo</p>
                        <span className="stat-number">{dashboardStats.workers}</span>
                      </div>
                    </div>
                  </>
                )}

                {(role === 'administrador' || role === 'vendedor') && (
                  <>
                    <div className="stat-card" onClick={() => showContent('Gestionar Lotes')}>
                      <div className="stat-icon">
                        <i className="fas fa-boxes"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Lotes</h3>
                        <p>Control de vencimientos</p>
                        <span className="stat-number">{dashboardStats.batches}</span>
                      </div>
                    </div>
                    
                    <div className="stat-card" onClick={() => showContent('Ver Pedidos')}>
                      <div className="stat-icon">
                        <i className="fas fa-file-invoice"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Pedidos</h3>
                        <p>Total registrados</p>
                        <span className="stat-number">{dashboardStats.orders}</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-dollar-sign"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Ingresos</h3>
                        <p>Total acumulado</p>
                        <span className="stat-number">Q{dashboardStats.totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="stat-card alert-card" onClick={() => showContent('Centro de Alertas')}>
                      <div className="stat-icon">
                        <i className="fas fa-exclamation-triangle"></i>
                      </div>
                      <div className="stat-info">
                        <h3>Alertas</h3>
                        <p>Requieren atención</p>
                        <span className="stat-number">{dashboardStats.lowStock + dashboardStats.expiring}</span>
                      </div>
                    </div>
                  </>
                )}
                
                {role === 'cliente' && (
                  <div className="stat-card" onClick={() => navigate('/')}>
                    <div className="stat-icon">
                      <i className="fas fa-shopping-bag"></i>
                    </div>
                    <div className="stat-info">
                      <h3>Tienda</h3>
                      <p>Comprar productos</p>
                      <span className="stat-number">Ir</span>
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
                      <button className="action-btn" onClick={() => showContent('Gestionar Lotes')}>
                        <i className="fas fa-boxes"></i>
                        Nuevo Lote
                      </button>
                      <button className="action-btn" onClick={() => showContent('Ver Estadisticas')}>
                        <i className="fas fa-chart-bar"></i>
                        Ver Reportes
                      </button>
                      <button className="action-btn" onClick={() => showContent('Gestionar Usuarios')}>
                        <i className="fas fa-user-plus"></i>
                        Agregar Usuario
                      </button>
                    </>
                  )}
                  
                  {role === 'vendedor' && (
                    <>
                      <button className="action-btn" onClick={() => showContent('Registrar Ventas')}>
                        <i className="fas fa-cash-register"></i>
                        Nueva Venta
                      </button>
                      <button className="action-btn" onClick={() => showContent('Ver Pedidos')}>
                        <i className="fas fa-file-invoice"></i>
                        Ver Pedidos
                      </button>
                      <button className="action-btn" onClick={() => showContent('Centro de Alertas')}>
                        <i className="fas fa-bell"></i>
                        Ver Alertas
                      </button>
                    </>
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
          {content === 'Gestionar Lotes' && <Batches />}
          {content === 'Centro de Alertas' && <Alerts />}
          {content === 'Gestionar Usuarios' && <Users />}
          {content === 'Gestionar Proveedores' && <Suppliers />}
          {content === 'Registrar Ventas' && <Invoices />}
          {content === 'Ver Pedidos' && <Invoiceslist />}
          {content === 'Ver Estadisticas' && <Statistics />}
          {content === 'Auditoria Sistema' && <AuditLog />}
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