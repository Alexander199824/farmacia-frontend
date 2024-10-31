import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Workers from './workers.js';
import Products from './Products.js';
import Users from './Users.js';
import Invoices from './Invoices.js'; // Importación de Invoices
import '../css/dashboard.css';

const Dashboard = ({ setAuth }) => {
  const [role, setRole] = useState('');
  const [dpi, setDpi] = useState('');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [content, setContent] = useState('Inicio');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedDpi = localStorage.getItem('dpi');

    if (!token) {
      navigate('/login');
    } else {
      setRole(storedRole);
      setDpi(storedDpi);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('dpi');
    setAuth(false);
    navigate('/homePage');
  };

  const showContent = (content) => {
    setContent(content);
  };

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  return (
    <div className="container">
      <div className={`navigation ${isNavVisible ? 'visible' : 'hidden'}`}>
        <div className="circle-container">
          <div className="image-circle"></div>
        </div>
        
        <ul>
          <li>
            <a href="#" onClick={() => showContent('Inicio')}>
              <span className="title">INICIO</span>
            </a>
          </li>
          {(role === 'administrador' || role === 'vendedor') && (
            <>
              <li>
                <a href="#" onClick={() => showContent('Gestionar Productos')}>
                  <span className="title">PRODUCTOS</span>
                </a>
              </li>
              <li>
                <a href="#" onClick={() => showContent('Registrar Ventas')}>
                  <span className="title">REGISTRAR VENTAS</span>
                </a>
              </li>
            </>
          )}
          {role === 'administrador' && (
            <>
              <li>
                <a href="#" onClick={() => showContent('Gestionar Usuarios')}>
                  <span className="title">USUARIOS</span>
                </a>
              </li>
              <li>
                <a href="#" onClick={() => showContent('Gestionar Trabajadores')}>
                  <span className="title">TRABAJADORES</span>
                </a>
              </li>
              <li>
                <a href="#" onClick={() => showContent('Ver Reportes')}>
                  <span className="title">REPORTES</span>
                </a>
              </li>
            </>
          )}
          {role === 'cliente' && (
            <li>
              <a href="#" onClick={() => showContent('Mis Compras')}>
                <span className="title">MIS COMPRAS</span>
              </a>
            </li>
          )}
        </ul>
        
        <div className="logout" onClick={handleLogout}>
          <span className="title">SALIR</span>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="toggle" onClick={toggleNav}>
            <span>MENÚ</span>
          </div>
          <div className="search">
            <label>
              <input type="text" placeholder="BUSCAR" />
            </label>
          </div>
          <div className="username">{dpi || 'DPI no disponible'}</div>
        </div>

        <div className="content" id="contentSpace">
          {content === 'Inicio' && (
            <div>
              <h1>Dashboard - {role}</h1>
              <p>Bienvenido, {role === 'administrador' ? 'Administrador' : role === 'vendedor' ? 'Vendedor' : 'Cliente'}</p>
            </div>
          )}
          {content === 'Gestionar Trabajadores' && <Workers />}
          {content === 'Gestionar Productos' && <Products />}
          {content === 'Gestionar Usuarios' && <Users />}
          {content === 'Registrar Ventas' && <Invoices />} {/* Renderizar Invoices en Registrar Ventas */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
