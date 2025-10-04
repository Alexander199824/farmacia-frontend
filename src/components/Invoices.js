import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const Invoices = () => {
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  
  const [formData, setFormData] = useState({
    clientDPI: '',
    clientName: '',
    clientId: null,
    paymentMethod: '',
    paid: false,
    items: [],
  });
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [product, setProduct] = useState({ id: '', name: '', price: 0, quantity: 1 });
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({ dpi: '', name: '' });

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    fetchSellerInfo();
  }, []);

  useEffect(() => {
    if (productSearch) {
      fetchProductSuggestions(productSearch);
    } else {
      setProductSuggestions([]);
    }
  }, [productSearch]);

  const fetchSellerInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No hay sesión activa. Por favor inicie sesión.');
        return;
      }

      const response = await axios.get(
        `${baseURL}/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSellerInfo({
        dpi: response.data.dpi,
        name: response.data.name
      });
    } catch (error) {
      setMessage('Error al obtener información del vendedor.');
      console.error('Error:', error);
    }
  };

  const fetchClientName = async (dpi) => {
    try {
      const response = await axios.get(`${baseURL}/clients/by-dpi/${dpi}`);
      setFormData((prevData) => ({ 
        ...prevData, 
        clientName: response.data.name,
        clientId: response.data.id
      }));
    } catch (error) {
      setMessage('Cliente no encontrado o error en la conexión.');
    }
  };

  const fetchProductSuggestions = async (search) => {
    try {
      const response = await axios.get(`${baseURL}/products?search=${search}`);
      setProductSuggestions(response.data);
    } catch (error) {
      setMessage('Error al obtener productos.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'clientDPI') {
      fetchClientName(value);
    }
  };

  const handleProductChange = (e) => {
    setProductSearch(e.target.value);
    setMessage('');
  };

  const selectProduct = (selectedProduct) => {
    setProduct({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: parseFloat(selectedProduct.price),
      quantity: 1,
    });
    setProductSearch('');
    setProductSuggestions([]);
  };

  const addProduct = () => {
    const newItem = { ...product, totalPrice: product.price * product.quantity };
    setFormData((prevFormData) => ({
      ...prevFormData,
      items: [...prevFormData.items, newItem],
    }));
    setTotal((prevTotal) => prevTotal + newItem.totalPrice);
    setProduct({ id: '', name: '', price: 0, quantity: 1 });
  };

  const removeProduct = (index) => {
    const itemToRemove = formData.items[index];
    setFormData((prevFormData) => {
      const updatedItems = prevFormData.items.filter((_, i) => i !== index);
      return { ...prevFormData, items: updatedItems };
    });
    setTotal((prevTotal) => prevTotal - itemToRemove.totalPrice);
  };

  const handleQuantityChange = (e) => {
    setProduct({ ...product, quantity: Number(e.target.value) });
  };

  const createInvoice = async (paymentIntentId = null) => {
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
            productId: item.id,
            quantity: item.quantity,
            unitPrice: parseFloat(item.price).toFixed(2),
          })),
          ...(paymentIntentId && { paymentIntentId }),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Factura creada exitosamente.");
      setFormData({
        clientDPI: '',
        clientName: '',
        clientId: null,
        paymentMethod: '',
        paid: false,
        items: [],
      });
      setTotal(0);
    } catch (error) {
      throw new Error(`Error al guardar la factura: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      setMessage('El procesador de pagos no está disponible.');
      return false;
    }

    setLoading(true);
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
            productId: item.id,
            quantity: item.quantity,
            unitPrice: parseFloat(item.price).toFixed(2),
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { clientSecret } = paymentIntentResponse.data;

      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: formData.clientName,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent.id;
    } catch (error) {
      throw new Error(`Error en el pago: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.paymentMethod === 'stripe') {
        const paymentIntentId = await handleStripePayment();
        if (paymentIntentId) {
          await createInvoice(paymentIntentId);
        }
      } else {
        await createInvoice();
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Registrar Venta</h2>
      
      {message && <div style={styles.messageBox}>{message}</div>}

      <div style={styles.infoBox}>
        <p><strong>Vendedor:</strong> {sellerInfo.name}</p>
        <p><strong>DPI del Vendedor:</strong> {sellerInfo.dpi}</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formBlock}>
          <label>DPI del Cliente:</label>
          <input
            type="text"
            name="clientDPI"
            value={formData.clientDPI}
            onChange={handleInputChange}
            placeholder="DPI del Cliente"
            style={styles.input}
          />
        </div>

        <div style={styles.formBlock}>
          <label>Nombre del Cliente:</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            placeholder="Nombre del cliente"
            style={styles.input}
            readOnly
          />
        </div>

        <div style={styles.formBlock}>
          <label>Buscar Producto:</label>
          <input
            type="text"
            value={productSearch}
            onChange={handleProductChange}
            placeholder="Buscar producto"
            style={styles.input}
          />
          {productSuggestions.length > 0 && (
            <ul style={styles.suggestionsList}>
              {productSuggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  onClick={() => selectProduct(suggestion)}
                  style={styles.suggestionItem}
                >
                  {suggestion.name} - ${suggestion.price}
                </li>
              ))}
            </ul>
          )}
        </div>

        {product.id && (
          <div style={styles.formBlock}>
            <input
              type="number"
              value={product.quantity}
              onChange={handleQuantityChange}
              placeholder="Cantidad"
              style={styles.input}
            />
            <button
              type="button"
              onClick={addProduct}
              style={styles.addButton}
            >
              Agregar producto
            </button>
          </div>
        )}

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>${(item.price || 0).toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>${(item.totalPrice || 0).toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => removeProduct(index)}
                    style={styles.removeButton}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={styles.total}>Total a Pagar: ${total.toFixed(2)}</h3>

        <div style={styles.formBlock}>
          <label>Método de Pago:</label>
          <div style={styles.paymentButtons}>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'stripe' })}
              style={{ ...styles.paymentButton, backgroundColor: '#6f42c1' }}
            >
              Stripe
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
              style={{ ...styles.paymentButton, backgroundColor: '#28a745' }}
            >
              Efectivo
            </button>
          </div>
        </div>

        {formData.paymentMethod === 'stripe' && (
          <div style={styles.formBlock}>
            <label>Datos de la Tarjeta:</label>
            <CardElement />
          </div>
        )}

        <div style={styles.formBlock}>
          <label>¿Pagado?</label>
          <input
            type="checkbox"
            name="paid"
            checked={formData.paid}
            onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
            style={styles.checkbox}
          />
        </div>

        <button
          type="submit"
          style={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Enviar factura'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: 'auto',
    padding: '20px',
  },
  heading: {
    textAlign: 'center',
  },
  infoBox: {
    marginBottom: '20px',
  },
  messageBox: {
    backgroundColor: '#f8d7da',
    padding: '10px',
    marginBottom: '10px',
    color: '#721c24',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formBlock: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    margin: '5px 0',
  },
  suggestionsList: {
    border: '1px solid #ccc',
    padding: '5px',
    listStyleType: 'none',
  },
  suggestionItem: {
    padding: '5px 10px',
    cursor: 'pointer',
  },
  addButton: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  removeButton: {
    padding: '5px 10px',
    color: 'white',
    backgroundColor: '#dc3545',
    border: 'none',
    cursor: 'pointer',
  },
  total: {
    textAlign: 'right',
    marginBottom: '20px',
  },
  paymentButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  paymentButton: {
    color: 'white',
    padding: '10px',
    border: 'none',
    cursor: 'pointer',
  },
  checkbox: {
    marginLeft: '10px',
  },
  submitButton: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default Invoices;