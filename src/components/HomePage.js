// src/components/HomePage.js
import React from 'react';
import '../css/homePage.css';

const HomePage = () => (
  <div>
    <header>
      <h1>Mi Farmacia Online</h1>
    </header>
    <nav>
      <ul>
        <li><a href="#">Inicio</a></li>
        <li><a href="#">Productos</a></li>
        <li><a href="#">Promociones</a></li>
        <li><a href="#">Salud</a></li>
        <li><a href="#">Nosotros</a></li>
        <li><a href="/login"><i className="fas fa-user"></i> Login</a></li>
      </ul>
    </nav>
    <div className="search-bar">
      <input type="text" placeholder="Buscar productos..." />
      <button>Buscar</button>
    </div>
    <div className="main-content">
      <div className="product">
        <h2>Producto Destacado</h2>
        <p>Descripción del producto y sus beneficios.</p>
        <button>Comprar</button>
      </div>
    </div>
    <footer>
      <p>&copy; 2024 Mi Farmacia Online. Todos los derechos reservados.</p>
    </footer>
  </div>
);

export default HomePage;
