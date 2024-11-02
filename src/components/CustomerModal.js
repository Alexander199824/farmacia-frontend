import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const CustomerModal = ({ onClose, cartItems, totalAmount = 0, clearCart }) => { // Añadido clearCart como prop
  const [customerData, setCustomerData] = useState({ username: '', password: '', clientDPI: '' });
  const [isFinalConsumer, setIsFinalConsumer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const stripe = useStripe();
  const elements = useElements();
  const baseURL = 'https://farmacia-backend.onrender.com/api/payments';

  const handleConfirm = async () => {
    if (!stripe || !elements) {
      alert('Stripe no está cargado aún. Por favor, intenta de nuevo más tarde.');
      return;
    }

    setLoading(true);

    try {
      // Convertir totalAmount a número y manejar valores inválidos
      const amountInCents = Math.round(Number(totalAmount) * 100);
      if (isNaN(amountInCents) || amountInCents <= 0) {
        throw new Error('TotalAmount no es un número válido');
      }

      const paymentIntentData = {
        amount: amountInCents,
        clientId: customerData.id || 1,
        sellerDPI: '1234567890123',
        clientDPI: customerData.clientDPI,
        paymentMethod: 'stripe',
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: parseFloat(item.price).toFixed(2), // Asegura formato decimal
        })),
      };

      console.log('Datos enviados a /create-payment-intent:', paymentIntentData);

      // Solicita el intento de pago al backend
      const { data: { clientSecret } } = await axios.post(`${baseURL}/create-payment-intent`, paymentIntentData);

      console.log('Client Secret recibido:', clientSecret);

      if (paymentMethod === 'tarjeta') {
        const card = elements.getElement(CardElement);

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: card,
            billing_details: {
              name: customerData.username,
            },
          },
        });

        console.log('Resultado de confirmación de pago:', result);

        if (result.error) {
          alert(`Error en el pago: ${result.error.message}`);
        } else if (result.paymentIntent.status === 'succeeded') {
          // Crear la factura en el backend tras el pago exitoso
          await axios.post(`${baseURL}/create-invoice`, {
            clientId: customerData.id || 1,
            sellerDPI: '1234567890123',
            clientDPI: customerData.clientDPI,
            paymentMethod: 'stripe',
            items: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              unitPrice: parseFloat(item.price).toFixed(2),
              totalPrice: parseFloat(item.price * item.quantity).toFixed(2)
            })),
          });
          alert('Pago realizado con éxito y factura creada. ¡Gracias por tu compra!');
          clearCart(); // Llama a clearCart después de la compra
        }
      } else {
        alert('Compra realizada con éxito usando método de pago alternativo.');
        clearCart(); // Llama a clearCart después de la compra
      }

      onClose();
    } catch (error) {
      console.error('Error en el proceso de compra:', error);
      alert('Hubo un problema al procesar la compra.');
    } finally {
      setLoading(false);
    }
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
            <input
              type="text"
              placeholder="DPI del Cliente"
              value={customerData.clientDPI}
              onChange={(e) => setCustomerData({ ...customerData, clientDPI: e.target.value })}
            />
          </>
        )}

        <label>Método de Pago:</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">Selecciona una opción</option>
          <option value="tarjeta">Tarjeta de Crédito</option>
          <option value="efectivo">Efectivo</option>
        </select>

        {paymentMethod === 'tarjeta' && (
          <div className="payment-details">
            <CardElement />
          </div>
        )}

        <label>Método de Envío:</label>
        <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
          <option value="">Selecciona una opción</option>
          <option value="domicilio">Envío a Domicilio</option>
          <option value="recoger">Recoger en Tienda</option>
        </select>

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

        <div className="product-summary">
          <h3>Resumen de Productos</h3>
          {cartItems.map((item) => (
            <div key={item.id}>
              <p>{item.name} x {item.quantity} = Q{item.price * item.quantity}</p>
            </div>
          ))}
          <p><strong>Total: Q{cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}</strong></p>
        </div>

        <button className="confirm" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar Compra'}
        </button>
        <button className="cancel" onClick={onClose} disabled={loading}>Cancelar</button>
      </div>
    </div>
  );
};

export default CustomerModal;
