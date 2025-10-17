/**
 * @author Alexander Echeverria
 * @file src/components/Invoices.js
 * @description Componente mejorado para registrar ventas y pedidos
 * @location src/components/Invoices.js
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import '../css/invoices.css';

const Invoices = () => {
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  
  const [formData, setFormData] = useState({
    clientDPI: '',
    clientName: '',
    clientId: null,
    paymentMethod: 'cash',
    items: [],
  });
  
  const [productSearch, setProductSearch] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({ dpi: '', name: '', id: null });
  const [showProductList, setShowProductList] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    fetchSellerInfo();
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (productSearch.trim()) {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowProductList(true);
    } else {
      setFilteredProducts([]);
      setShowProductList(false);
    }
  }, [productSearch, allProducts]);

  useEffect(() => {
    const calculatedTotal = formData.items.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0
    );
    setTotal(calculatedTotal);
  }, [formData.items]);

  const fetchSellerInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No hay sesión activa. Por favor inicie sesión.');
        return;
      }

      const response = await axios.get(
        `${baseURL}/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSellerInfo({
        dpi: response.data.dpi,
        name: response.data.name,
        id: response.data.id
      });
    } catch (error) {
      console.error('Error al obtener información del vendedor:', error);
      setMessage('Error al obtener información del vendedor. Verifique su sesión.');
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(`${baseURL}/products`);
      setAllProducts(response.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setMessage('Error al cargar productos.');
    }
  };

  const fetchClientByDPI = async (dpi) => {
    if (!dpi || dpi.length < 13) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${baseURL}/clients/by-dpi/${dpi}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setFormData(prev => ({ 
        ...prev, 
        clientName: response.data.name,
        clientId: response.data.id
      }));
      setMessage('');
    } catch (error) {
      setFormData(prev => ({ ...prev, clientName: '', clientId: null }));
      setMessage('Cliente no encontrado. Verifique el DPI ingresado.');
    }
  };

  const handleDPIChange = (e) => {
    const dpi = e.target.value;
    setFormData({ ...formData, clientDPI: dpi });
    if (dpi.length === 13) {
      fetchClientByDPI(dpi);
    }
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setProductSearch(product.name);
    setShowProductList(false);
  };

  const addProductToCart = () => {
    if (!selectedProduct) {
      setMessage('Por favor seleccione un producto.');
      return;
    }

    if (quantity <= 0) {
      setMessage('La cantidad debe ser mayor a 0.');
      return;
    }

    if (quantity > selectedProduct.stock) {
      setMessage(`Stock insuficiente. Disponible: ${selectedProduct.stock}`);
      return;
    }

    const existingItemIndex = formData.items.findIndex(
      item => item.productId === selectedProduct.id
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...formData.items];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > selectedProduct.stock) {
        setMessage(`Stock insuficiente. Disponible: ${selectedProduct.stock}`);
        return;
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity;
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      const newItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: quantity,
        unitPrice: parseFloat(selectedProduct.price),
        stock: selectedProduct.stock
      };
      setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }

    setSelectedProduct(null);
    setProductSearch('');
    setQuantity(1);
    setMessage('Producto agregado al carrito.');
    setTimeout(() => setMessage(''), 3000);
  };

  const removeFromCart = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const updateCartQuantity = (index, newQuantity) => {
    const updatedItems = [...formData.items];
    const item = updatedItems[index];
    
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    if (newQuantity > item.stock) {
      setMessage(`Stock insuficiente para ${item.productName}. Disponible: ${item.stock}`);
      return;
    }
    
    updatedItems[index].quantity = newQuantity;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      setMessage('El procesador de pagos no está disponible.');
      return null;
    }

    const token = localStorage.getItem('token');

    try {
      const paymentIntentResponse = await axios.post(
        `${baseURL}/payments/create-payment-intent`,
        {
          amount: Math.round(total * 100),
          clientId: formData.clientId,
          sellerDPI: sellerInfo.dpi,
          clientDPI: formData.clientDPI,
          paymentMethod: 'stripe',
          items: formData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toFixed(2),
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { clientSecret } = paymentIntentResponse.data;
      const card = elements.getElement(CardElement);
      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: { name: formData.clientName },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent.id;
    } catch (error) {
      throw new Error(`Error en el pago: ${error.message}`);
    }
  };

  const createOrder = async (paymentIntentId = null) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${baseURL}/invoices/create`,
        {
          clientId: formData.clientId,
          sellerDPI: sellerInfo.dpi,
          clientDPI: formData.clientDPI,
          paymentMethod: formData.paymentMethod,
          items: formData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toFixed(2),
          })),
          ...(paymentIntentId && { paymentIntentId }),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('✅ Pedido registrado exitosamente.');
      
      // Resetear formulario
      setFormData({
        clientDPI: '',
        clientName: '',
        clientId: null,
        paymentMethod: 'cash',
        items: [],
      });
      setTotal(0);
      
      // Recargar productos
      fetchAllProducts();
    } catch (error) {
      throw new Error(`Error al guardar el pedido: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!formData.clientDPI || !formData.clientId) {
        throw new Error('Debe ingresar un cliente válido.');
      }

      if (formData.items.length === 0) {
        throw new Error('Debe agregar al menos un producto.');
      }

      if (formData.paymentMethod === 'stripe') {
        const paymentIntentId = await handleStripePayment();
        if (paymentIntentId) {
          await createOrder(paymentIntentId);
        }
      } else {
        await createOrder();
      }
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoices-container">
      <div className="invoices-header">
        <div>
          <h2>Registrar Nueva Venta</h2>
          <p>Complete los datos del cliente y agregue productos al pedido</p>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-error' : message.includes('✅') ? 'alert-success' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="seller-info-card">
        <div className="seller-icon">
          <i className="fas fa-user-tie"></i>
        </div>
        <div>
          <p><strong>Vendedor:</strong> {sellerInfo.name || 'Cargando...'}</p>
          <p><strong>DPI:</strong> {sellerInfo.dpi || 'Cargando...'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Información del Cliente</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>DPI del Cliente *</label>
              <input
                type="text"
                value={formData.clientDPI}
                onChange={handleDPIChange}
                placeholder="Ingrese 13 dígitos"
                maxLength="13"
                required
                className="form-input"
              />
              <small>Ingrese el DPI completo para buscar el cliente</small>
            </div>
            <div className="form-group">
              <label>Nombre del Cliente</label>
              <input
                type="text"
                value={formData.clientName}
                placeholder="Se cargará automáticamente"
                readOnly
                className="form-input readonly"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Buscar y Agregar Productos</h3>
          <div className="product-search-section">
            <div className="search-input-group">
              <i className="fas fa-search"></i>
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar producto por nombre o descripción..."
                className="form-input search-input"
              />
            </div>
            
            {showProductList && filteredProducts.length > 0 && (
              <div className="product-suggestions">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="product-suggestion-item"
                    onClick={() => selectProduct(product)}
                  >
                    <div className="product-suggestion-info">
                      <h5>{product.name}</h5>
                      <p>{product.description}</p>
                      <div className="product-suggestion-details">
                        <span className="price">Q{product.price}</span>
                        <span className={`stock ${product.stock < 10 ? 'low' : ''}`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedProduct && (
              <div className="selected-product-card">
                <div className="selected-product-info">
                  <h4>{selectedProduct.name}</h4>
                  <p>Precio: Q{selectedProduct.price}</p>
                  <p>Stock disponible: {selectedProduct.stock}</p>
                </div>
                <div className="quantity-control">
                  <label>Cantidad:</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    max={selectedProduct.stock}
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    onClick={addProductToCart}
                    className="btn-add-to-cart"
                  >
                    <i className="fas fa-plus"></i> Agregar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Carrito de Compra</h3>
          {formData.items.length === 0 ? (
            <div className="empty-cart">
              <i className="fas fa-shopping-cart"></i>
              <p>No hay productos en el carrito</p>
            </div>
          ) : (
            <div className="cart-table-container">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unit.</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>Q{item.unitPrice.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(index, parseInt(e.target.value) || 0)}
                          min="1"
                          max={item.stock}
                          className="cart-quantity-input"
                        />
                      </td>
                      <td className="subtotal">Q{(item.quantity * item.unitPrice).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="btn-remove"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="3"><strong>TOTAL</strong></td>
                    <td className="total-amount" colSpan="2">
                      <strong>Q{total.toFixed(2)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Método de Pago</h3>
          <div className="payment-methods">
            <label className={`payment-option ${formData.paymentMethod === 'cash' ? 'active' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={formData.paymentMethod === 'cash'}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              />
              <div className="payment-content">
                <i className="fas fa-money-bill-wave"></i>
                <span>Efectivo</span>
              </div>
            </label>

            <label className={`payment-option ${formData.paymentMethod === 'stripe' ? 'active' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={formData.paymentMethod === 'stripe'}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              />
              <div className="payment-content">
                <i className="fas fa-credit-card"></i>
                <span>Tarjeta (Stripe)</span>
              </div>
            </label>
          </div>

          {formData.paymentMethod === 'stripe' && (
            <div className="card-input-section">
              <label>Información de la Tarjeta</label>
              <div className="card-element-wrapper">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': { color: '#aab7c4' },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={loading || formData.items.length === 0}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Procesando...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                Registrar Pedido
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Invoices;