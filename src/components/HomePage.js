
import React, { useState, useEffect } from 'react';
import '../css/homePage.css';
import axios from 'axios';
import cartImage from '../imagenes/shoppingcart_77968.png';
import CustomerModal from './CustomerModal';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || {});
  const [totalAmount, setTotalAmount] = useState(0);
  const [cartVisible, setCartVisible] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const baseURL = 'https://farmacia-backend.onrender.com/api';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseURL}/products`);
        const productsWithImages = response.data.map((product) => ({
          ...product,
          image: product.image && product.image.data 
            ? `data:image/jpeg;base64,${btoa(
                new Uint8Array(product.image.data).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  ''
                )
              )}`
            : 'https://via.placeholder.com/150x150?text=Sin+Imagen'
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

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    const calculatedTotal = Object.values(cart).reduce(
      (sum, product) => sum + (parseFloat(product.price) * product.quantity), 0
    );
    setTotalAmount(calculatedTotal);
  }, [cart]);

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('cart');
  };

  const handleQuantityChange = (productId, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: parseInt(quantity, 10) || 1,
    }));
  };

  const addToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > product.stock) {
      alert(`No hay suficiente stock para ${product.name}. Stock disponible: ${product.stock}`);
      return;
    }
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[product.id]) {
        newCart[product.id].quantity += quantity;
      } else {
        newCart[product.id] = { ...product, quantity };
      }
      return newCart;
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[productId]) {
        if (quantity > newCart[productId].stock) {
          alert(`No hay suficiente stock para ${newCart[productId].name}. Stock disponible: ${newCart[productId].stock}`);
          return prevCart;
        }
        newCart[productId].quantity = quantity;
      }
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const { [productId]: removedItem, ...remainingCart } = prevCart;
      return remainingCart;
    });
  };

  const handlePurchase = () => {
    if (Object.keys(cart).length === 0) {
      alert('Aún no tienes nada en el carrito');
    } else {
      setShowCustomerModal(true);
    }
  };

  const totalItemsInCart = Object.values(cart).reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  return (
    <div>
      <header>
        <h1>Mi Farmacia Online</h1>
      </header>
      <nav>
        <ul>
          <li><a href="/login"><i className="fas fa-user"></i> Login</a></li>
          <li className="cart-icon" onClick={() => setCartVisible(!cartVisible)}>
            <img src={cartImage} alt="Carrito de Compras" className="cart-image" />
            {totalItemsInCart > 0 && <span className="cart-count">{totalItemsInCart}</span>}
          </li>
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
              <p>Precio: Q{product.price}</p>
              <p>Stock: {product.stock}</p>
              <input
                type="number"
                min="1"
                max={product.stock}
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

      <div className={`cart ${cartVisible ? 'cart-visible' : ''}`}>
        <h2>Carrito de Compras</h2>
        {Object.keys(cart).length === 0 ? (
          <p>Aún no tienes nada en el carrito</p>
        ) : (
          <ul>
            {Object.values(cart).map((item) => (
              <li key={item.id}>
                {item.name} - Q{item.price} x 
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value, 10))}
                  className="cart-quantity-input"
                />
                = Q{parseFloat(item.price) * item.quantity}
                <button onClick={() => removeFromCart(item.id)} className="remove-item-button">Eliminar</button>
              </li>
            ))}
          </ul>
        )}
        <p>Total a pagar: Q{totalAmount}</p>
        <button onClick={handlePurchase} className="purchase-button">Realizar Compra</button>
      </div>
      
      {showCustomerModal && (
        <CustomerModal
          onClose={() => setShowCustomerModal(false)}
          cartItems={Object.values(cart)}
          totalAmount={totalAmount}
          clearCart={clearCart}
        />
      )}

      <footer>
        <p>&copy; 2025 Mi Farmacia Online. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default HomePage;
