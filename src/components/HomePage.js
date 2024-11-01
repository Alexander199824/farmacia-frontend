import React, { useState, useEffect } from 'react';
import '../css/homePage.css';
import axios from 'axios';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [clientDPI, setClientDPI] = useState('');
  const [cartVisible, setCartVisible] = useState(false);
  const [quantities, setQuantities] = useState({});

  const baseURL = 'https://farmacia-backend.onrender.com/api';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseURL}/products`);
        const productsWithImages = response.data.map((product) => ({
          ...product,
          image: `data:image/jpeg;base64,${btoa(
            new Uint8Array(product.image.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          )}`,
        }));
        setProducts(productsWithImages);
        setFilteredProducts(productsWithImages);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  const handleQuantityChange = (productId, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }));
  };

  const addToCart = (product) => {
    const quantity = parseInt(quantities[product.id] || 1, 10);
    const newItems = Array(quantity).fill(product);
    setCart((prevCart) => [...prevCart, ...newItems]);
    setTotalAmount((prevTotal) => prevTotal + product.price * quantity);
  };

  const handlePurchase = async () => {
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
      await axios.post(`${baseURL}/invoices/create`, invoiceData);
      alert('Purchase successful!');
      setCart([]);
      setTotalAmount(0);
      setClientDPI('');
      setCartVisible(false);
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Failed to complete the purchase');
    }
  };

  return (
    <div>
      <header>
        <h1>Mi Farmacia Online</h1>
        <div className="cart-icon" onClick={() => setCartVisible(!cartVisible)}>
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
      </div>
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>Precio: Q{product.price}</p> {/* Cambiado a símbolo de quetzal */}
              <input
                type="number"
                min="1"
                value={quantities[product.id] || 1}
                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                className="quantity-input"
              />
              <button onClick={() => addToCart(product)} className="add-to-cart-button">
                Agregar al carrito
              </button>
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
                {item.name} - Q{item.price}
              </li>
            ))}
          </ul>
          <p>Total a pagar: Q{totalAmount}</p>
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
