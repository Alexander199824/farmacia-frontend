import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Invoices = ({ sellerDPI }) => {
  const [formData, setFormData] = useState({
    clientDPI: '',
    clientName: '',
    paymentMethod: '',
    paid: false,
    items: [],
  });
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [product, setProduct] = useState({ id: '', name: '', price: 0, quantity: 1 });
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');

  // Obtener el nombre del cliente por DPI
  const fetchClientName = async (dpi) => {
    try {
      const response = await axios.get(`https://farmacia-backend.onrender.com/api/clients/by-dpi/${dpi}`);
      setFormData((prevData) => ({ ...prevData, clientName: response.data.name }));
    } catch (error) {
      setMessage('Cliente no encontrado o error en la conexión.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'clientDPI') {
      fetchClientName(value); // Buscar el nombre del cliente automáticamente al ingresar el DPI
    }
  };

  const handleProductChange = (e) => {
    setProductSearch(e.target.value);
    setMessage(''); // Limpiar mensaje
  };

  const selectProduct = (selectedProduct) => {
    setProduct({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('https://farmacia-backend.onrender.com/api/invoices', { ...formData, sellerDPI }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Factura creada exitosamente.");
      setFormData({
        clientDPI: '',
        clientName: '',
        paymentMethod: '',
        paid: false,
        items: [],
      });
      setTotal(0);
    } catch (error) {
      setMessage(`Error al guardar la factura: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Registrar Venta</h2>
      
      {message && <div style={styles.messageBox}>{message}</div>}

      <div style={styles.infoBox}>
        <p><strong>DPI del Vendedor:</strong> {sellerDPI}</p>
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
                <li key={suggestion.id} onClick={() => selectProduct(suggestion)} style={styles.suggestionItem}>
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
            <button type="button" onClick={addProduct} style={styles.addButton}>Agregar producto</button>
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
                <td>${item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>${item.totalPrice.toFixed(2)}</td>
                <td>
                  <button onClick={() => removeProduct(index)} style={styles.removeButton}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={styles.total}>Total a Pagar: ${total.toFixed(2)}</h3>

        <div style={styles.formBlock}>
          <label>Método de Pago:</label>
          <div style={styles.paymentButtons}>
            <button onClick={() => setFormData({ ...formData, paymentMethod: 'paypal' })} style={{ ...styles.paymentButton, backgroundColor: '#007bff' }}>PayPal</button>
            <button onClick={() => setFormData({ ...formData, paymentMethod: 'stripe' })} style={{ ...styles.paymentButton, backgroundColor: '#6f42c1' }}>Stripe</button>
            <button onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })} style={{ ...styles.paymentButton, backgroundColor: '#28a745' }}>Efectivo</button>
          </div>
        </div>

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

        <button type="submit" style={styles.submitButton}>Enviar factura</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: 'auto',
    padding: '20px',
    backgroundColor: '#f4f4f4',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
  },
  messageBox: {
    padding: '10px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoBox: {
    marginBottom: '20px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f1f1f1',
    textAlign: 'center',
  },
  formBlock: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  addButton: {
    marginTop: '10px',
    padding: '8px',
    backgroundColor: '#28a745',
    color: '#fff',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  },
  paymentButtons: {
    display: 'flex',
    gap: '10px',
  },
  paymentButton: {
    flex: 1,
    padding: '10px 12px',
    color: '#fff',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  table: {
    width: '100%',
    marginTop: '20px',
    borderCollapse: 'collapse',
  },
  removeButton: {
    padding: '5px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  total: {
    marginTop: '20px',
    textAlign: 'right',
    fontSize: '18px',
  },
  submitButton: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
  },
};

export default Invoices;
