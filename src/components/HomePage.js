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
  const [loading, setLoading] = useState(true);

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://farmacia-backend.onrender.com/api';
  const companyName = process.env.REACT_APP_COMPANY_NAME || 'Dispensario Santa Elizabeth Seton';
  const companySlogan = process.env.REACT_APP_COMPANY_SLOGAN || 'Tu salud es nuestra prioridad';
  const logoPath = process.env.REACT_APP_LOGO_PATH || '/images/logo.png';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [baseURL]);

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
    <div className="homepage-container">
      {/* Header Principal */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={logoPath} alt="Logo" className="company-logo" />
            <div className="company-info">
              <h1>{companyName}</h1>
              <p className="slogan">{companySlogan}</p>
            </div>
          </div>
          
          <nav className="main-nav">
            <ul>
              <li>
                <a href="/login" className="login-btn">
                  <i className="fas fa-user"></i> 
                  <span>Iniciar Sesión</span>
                </a>
              </li>
              <li className="cart-container" onClick={() => setCartVisible(!cartVisible)}>
                <div className="cart-icon">
                  <img src={cartImage} alt="Carrito de Compras" className="cart-image" />
                  {totalItemsInCart > 0 && <span className="cart-count">{totalItemsInCart}</span>}
                </div>
                <span className="cart-text">Carrito</span>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Bienvenido a {companyName}</h2>
          <p>Encuentra todos los medicamentos y productos farmacéuticos que necesitas</p>
          <div className="search-hero">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Buscar productos, medicamentos..."
              className="search-input-hero"
            />
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main className="main-content">
        <div className="products-header">
          <h3>Nuestros Productos</h3>
          <p>Explora nuestra amplia gama de medicamentos y productos de salud</p>
        </div>

        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="low-stock-badge">Pocas unidades</span>
                    )}
                    {product.stock === 0 && (
                      <span className="out-stock-badge">Agotado</span>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-description">{product.description}</p>
                    <div className="price-stock">
                      <span className="product-price">Q{product.price}</span>
                      <span className="product-stock">{product.stock} disponibles</span>
                    </div>
                  </div>
                  
                  <div className="product-actions">
                    <div className="quantity-selector">
                      <label>Cantidad:</label>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantities[product.id] || 1}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        className="quantity-input"
                        disabled={product.stock === 0}
                      />
                    </div>
                    <button 
                      onClick={() => addToCart(product)} 
                      className={`add-to-cart-btn ${product.stock === 0 ? 'disabled' : ''}`}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">
                <i className="fas fa-search"></i>
                <h4>No se encontraron productos</h4>
                <p>Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${cartVisible ? 'cart-visible' : ''}`}>
        <div className="cart-header">
          <h3>Carrito de Compras</h3>
          <button 
            className="close-cart" 
            onClick={() => setCartVisible(false)}
          >
            ×
          </button>
        </div>
        
        <div className="cart-content">
          {Object.keys(cart).length === 0 ? (
            <div className="empty-cart">
              <i className="fas fa-shopping-cart"></i>
              <p>Tu carrito está vacío</p>
              <span>Agrega productos para comenzar</span>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {Object.values(cart).map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-info">
                      <h5>{item.name}</h5>
                      <p>Q{item.price}</p>
                      <div className="cart-item-controls">
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value, 10))}
                          className="cart-quantity-input"
                        />
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="remove-item-btn"
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      Q{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="cart-total">
                  <strong>Total: Q{totalAmount.toFixed(2)}</strong>
                </div>
                <button onClick={handlePurchase} className="checkout-btn">
                  Proceder al Pago
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Customer Modal */}
      {showCustomerModal && (
        <CustomerModal
          onClose={() => setShowCustomerModal(false)}
          cartItems={Object.values(cart)}
          totalAmount={totalAmount}
          clearCart={clearCart}
        />
      )}

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-section">
            <img src={logoPath} alt="Logo" className="footer-logo" />
            <h4>{companyName}</h4>
            <p>{companySlogan}</p>
          </div>
          <div className="footer-section">
            <h5>Información</h5>
            <ul>
              <li><a href="/login">Portal de Empleados</a></li>
              <li><a href="/">Catálogo de Productos</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 {companyName}. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Overlay for cart */}
      {cartVisible && <div className="cart-overlay" onClick={() => setCartVisible(false)}></div>}
    </div>
  );
};

export default HomePage;