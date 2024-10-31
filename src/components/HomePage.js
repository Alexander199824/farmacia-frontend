// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import '../css/homePage.css';
import axios from 'axios';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [clientDPI, setClientDPI] = useState('');
  const [cartVisible, setCartVisible] = useState(false);

  // URL base del backend
  const backendUrl = 'https://farmacia-backend.onrender.com';

  // Toggle visibility of the cart
  const toggleCartVisibility = () => setCartVisible(!cartVisible);

  // Fetch products based on search term
  const handleSearch = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/products?search=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Add product to cart
  const addToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
    setTotalAmount((prevTotal) => prevTotal + product.price);
  };

  // Handle purchase creation
  const handlePurchase = async () => {
    if (!clientDPI) {
      alert("Por favor, ingrese el DPI del cliente antes de realizar la compra.");
      return;
    }

    try {
      const invoiceData = {
        clientDPI,
        totalAmount,
        items: cart.map((product) => ({
          productId: product.id,
          quantity: 1,
          unitPrice: product.price,
        })),
      };
      await axios.post(`${backendUrl}/api/invoices/create`, invoiceData);
      alert('¡Compra realizada con éxito!');
      setCart([]);
      setTotalAmount(0);
      setClientDPI('');
      setCartVisible(false); // Hide cart after purchase
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Hubo un problema al completar la compra');
    }
  };

  return (
    <div>
      <header>
        <h1>Mi Farmacia Online</h1>
        {/* Cart Icon with Product Count */}
        <div className="cart-icon" onClick={toggleCartVisibility}>
          <i className="fas fa-shopping-cart"></i>
          {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
        </div>
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
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar productos..."
        />
        <button onClick={handleSearch}>Buscar</button>
      </div>
      <div className="main-content">
        {searchResults.length > 0 ? (
          searchResults.map((product) => (
            <div key={product.id} className="product">
              <img
                src={`data:image/jpeg;base64,${product.image}`}
                alt={product.name}
                className="product-image"
              />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>Precio: ${product.price}</p>
              <button onClick={() => addToCart(product)}>Agregar al carrito</button>
            </div>
          ))
        ) : (
          <p>No hay productos que coincidan con la búsqueda.</p>
        )}
      </div>
      {cartVisible && (
        <div className="cart">
          <h2>Carrito de Compras</h2>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.name} - ${item.price}
              </li>
            ))}
          </ul>
          <p>Total a pagar: ${totalAmount.toFixed(2)}</p>
          <input
            type="text"
            value={clientDPI}
            onChange={(e) => setClientDPI(e.target.value)}
            placeholder="Ingrese DPI del cliente"
          />
          <button onClick={handlePurchase}>Realizar Compra</button>
        </div>
      )}
      <footer>
        <p>&copy; 2024 Mi Farmacia Online. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default HomePage;
