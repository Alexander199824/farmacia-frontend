// CustomerModal.js
import React, { useState } from 'react';

const CustomerModal = ({ onClose, onConfirmPurchase, cartItems }) => {
  const [customerData, setCustomerData] = useState({ username: '', password: '' });
  const [isFinalConsumer, setIsFinalConsumer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [shippingAddress, setShippingAddress] = useState('');

  const handleConfirm = () => {
    onConfirmPurchase({
      ...customerData,
      paymentMethod,
      shippingMethod,
      cardDetails: paymentMethod === 'tarjeta' ? cardDetails : null,
      shippingAddress: shippingMethod === 'domicilio' ? shippingAddress : null,
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Completar Compra</h2>
        
        <label>
          <input
            type="checkbox"
            checked={isFinalConsumer}
            onChange={() => setIsFinalConsumer(!isFinalConsumer)}
          />
          Comprar como Consumidor Final
        </label>

        {!isFinalConsumer && (
          <>
            <input
              type="text"
              placeholder="Usuario"
              value={customerData.username}
              onChange={(e) => setCustomerData({ ...customerData, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={customerData.password}
              onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })}
            />
          </>
        )}

        <label>Método de Pago:</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">Selecciona una opción</option>
          <option value="tarjeta">Tarjeta de Crédito</option>
          <option value="efectivo">Efectivo</option>
        </select>

        {/* Detalles de tarjeta solo si elige Tarjeta de Crédito */}
        {paymentMethod === 'tarjeta' && (
          <div className="payment-details">
            <label>Número de Tarjeta:</label>
            <input
              type="text"
              placeholder="Número de Tarjeta"
              value={cardDetails.cardNumber}
              onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
            />
            <label>Fecha de Expiración:</label>
            <input
              type="text"
              placeholder="MM/AA"
              value={cardDetails.expiry}
              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
            />
            <label>CVV:</label>
            <input
              type="text"
              placeholder="CVV"
              value={cardDetails.cvv}
              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
            />
          </div>
        )}

        <label>Método de Envío:</label>
        <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
          <option value="">Selecciona una opción</option>
          <option value="domicilio">Envío a Domicilio</option>
          <option value="recoger">Recoger en Tienda</option>
        </select>

        {/* Dirección de envío solo si elige Envío a Domicilio */}
        {shippingMethod === 'domicilio' && (
          <div className="shipping-details">
            <label>Dirección de Envío:</label>
            <input
              type="text"
              placeholder="Dirección Completa"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />
          </div>
        )}

        {/* Resumen de Productos */}
        <div className="product-summary">
          <h3>Resumen de Productos</h3>
          {cartItems.map((item) => (
            <div key={item.id}>
              <p>{item.name} x {item.quantity} = Q{item.price * item.quantity}</p>
            </div>
          ))}
          <p><strong>Total: Q{cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}</strong></p>
        </div>

        <button className="confirm" onClick={handleConfirm}>Confirmar Compra</button>
        <button className="cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default CustomerModal;
