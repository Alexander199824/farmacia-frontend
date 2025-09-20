import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import '../css/customerModal.css';

const CustomerModal = ({ onClose, cartItems, totalAmount = 0, clearCart }) => {
  const [customerData, setCustomerData] = useState({ username: '', password: '', clientDPI: '' });
  const [isFinalConsumer, setIsFinalConsumer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const stripe = useStripe();
  const elements = useElements();
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://farmacia-backend.onrender.com/api';
  const companyName = process.env.REACT_APP_COMPANY_NAME || 'Dispensario Santa Elizabeth Seton';

  const handleConfirm = async () => {
    if (!stripe || !elements) {
      alert('Stripe no está cargado aún. Por favor, intenta de nuevo más tarde.');
      return;
    }

    if (!paymentMethod) {
      alert('Por favor selecciona un método de pago.');
      return;
    }

    if (!shippingMethod) {
      alert('Por favor selecciona un método de envío.');
      return;
    }

    if (shippingMethod === 'domicilio' && !shippingAddress.trim()) {
      alert('Por favor ingresa la dirección de envío.');
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
        paymentMethod: paymentMethod === 'tarjeta' ? 'stripe' : 'cash',
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: parseFloat(item.price).toFixed(2),
        })),
      };

      console.log('Datos enviados a /create-payment-intent:', paymentIntentData);

      if (paymentMethod === 'tarjeta') {
        // Solicita el intento de pago al backend
        const { data: { clientSecret } } = await axios.post(`${baseURL}/payments/create-payment-intent`, paymentIntentData);

        console.log('Client Secret recibido:', clientSecret);

        const card = elements.getElement(CardElement);

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: card,
            billing_details: {
              name: customerData.username || 'Cliente',
            },
          },
        });

        console.log('Resultado de confirmación de pago:', result);

        if (result.error) {
          alert(`Error en el pago: ${result.error.message}`);
        } else if (result.paymentIntent.status === 'succeeded') {
          // Crear la factura en el backend tras el pago exitoso
          await axios.post(`${baseURL}/payments/create-invoice`, {
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
          alert('¡Pago realizado con éxito! Tu pedido será procesado pronto.');
          clearCart();
        }
      } else {
        // Pago en efectivo - crear factura directamente
        await axios.post(`${baseURL}/payments/create-invoice`, {
          clientId: customerData.id || 1,
          sellerDPI: '1234567890123',
          clientDPI: customerData.clientDPI,
          paymentMethod: 'cash',
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: parseFloat(item.price).toFixed(2),
            totalPrice: parseFloat(item.price * item.quantity).toFixed(2)
          })),
        });
        alert('¡Pedido confirmado! Puedes pagar en efectivo al recibir tu pedido.');
        clearCart();
      }

      onClose();
    } catch (error) {
      console.error('Error en el proceso de compra:', error);
      alert('Hubo un problema al procesar la compra. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!isFinalConsumer && (!customerData.username || !customerData.clientDPI)) {
        alert('Por favor completa todos los campos requeridos.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!paymentMethod) {
        alert('Por favor selecciona un método de pago.');
        return;
      }
    }
    if (currentStep === 3) {
      if (!shippingMethod) {
        alert('Por favor selecciona un método de envío.');
        return;
      }
      if (shippingMethod === 'domicilio' && !shippingAddress.trim()) {
        alert('Por favor ingresa la dirección de envío.');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && 'Cliente'}
            {step === 2 && 'Pago'}
            {step === 3 && 'Envío'}
            {step === 4 && 'Confirmar'}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="customer-modal">
        <div className="modal-header">
          <h2>Completar Compra - {companyName}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {renderStepIndicator()}

        <div className="modal-content">
          {/* Paso 1: Información del Cliente */}
          {currentStep === 1 && (
            <div className="step-content">
              <h3>Información del Cliente</h3>
              <div className="form-section">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isFinalConsumer}
                      onChange={() => setIsFinalConsumer(!isFinalConsumer)}
                    />
                    <span className="checkmark"></span>
                    Comprar como Consumidor Final
                  </label>
                  <p className="help-text">
                    {isFinalConsumer 
                      ? 'No necesitas proporcionar información adicional.'
                      : 'Proporciona tu información para facturación.'
                    }
                  </p>
                </div>

                {!isFinalConsumer && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Usuario *</label>
                      <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={customerData.username}
                        onChange={(e) => setCustomerData({ ...customerData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>DPI del Cliente *</label>
                      <input
                        type="text"
                        placeholder="Número de DPI"
                        value={customerData.clientDPI}
                        onChange={(e) => setCustomerData({ ...customerData, clientDPI: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Contraseña (opcional)</label>
                      <input
                        type="password"
                        placeholder="Contraseña (si tienes cuenta)"
                        value={customerData.password}
                        onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paso 2: Método de Pago */}
          {currentStep === 2 && (
            <div className="step-content">
              <h3>Método de Pago</h3>
              <div className="payment-methods">
                <div 
                  className={`payment-option ${paymentMethod === 'tarjeta' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('tarjeta')}
                >
                  <div className="payment-icon">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div className="payment-info">
                    <h4>Tarjeta de Crédito/Débito</h4>
                    <p>Pago seguro con Stripe</p>
                  </div>
                  <div className="radio-check">
                    {paymentMethod === 'tarjeta' && <i className="fas fa-check"></i>}
                  </div>
                </div>

                <div 
                  className={`payment-option ${paymentMethod === 'efectivo' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('efectivo')}
                >
                  <div className="payment-icon">
                    <i className="fas fa-money-bill-wave"></i>
                  </div>
                  <div className="payment-info">
                    <h4>Efectivo</h4>
                    <p>Pago contra entrega</p>
                  </div>
                  <div className="radio-check">
                    {paymentMethod === 'efectivo' && <i className="fas fa-check"></i>}
                  </div>
                </div>
              </div>

              {paymentMethod === 'tarjeta' && (
                <div className="card-input-section">
                  <label>Información de la Tarjeta</label>
                  <div className="card-element-container">
                    <CardElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <p className="security-note">
                    <i className="fas fa-lock"></i>
                    Tu información está protegida con encriptación SSL
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Método de Envío */}
          {currentStep === 3 && (
            <div className="step-content">
              <h3>Método de Envío</h3>
              <div className="shipping-methods">
                <div 
                  className={`shipping-option ${shippingMethod === 'domicilio' ? 'selected' : ''}`}
                  onClick={() => setShippingMethod('domicilio')}
                >
                  <div className="shipping-icon">
                    <i className="fas fa-truck"></i>
                  </div>
                  <div className="shipping-info">
                    <h4>Envío a Domicilio</h4>
                    <p>Entrega en 1-2 días hábiles</p>
                    <span className="shipping-cost">Costo: Q15.00</span>
                  </div>
                  <div className="radio-check">
                    {shippingMethod === 'domicilio' && <i className="fas fa-check"></i>}
                  </div>
                </div>

                <div 
                  className={`shipping-option ${shippingMethod === 'recoger' ? 'selected' : ''}`}
                  onClick={() => setShippingMethod('recoger')}
                >
                  <div className="shipping-icon">
                    <i className="fas fa-store"></i>
                  </div>
                  <div className="shipping-info">
                    <h4>Recoger en Farmacia</h4>
                    <p>Disponible en 2-4 horas</p>
                    <span className="shipping-cost free">Gratis</span>
                  </div>
                  <div className="radio-check">
                    {shippingMethod === 'recoger' && <i className="fas fa-check"></i>}
                  </div>
                </div>
              </div>

              {shippingMethod === 'domicilio' && (
                <div className="address-section">
                  <label>Dirección de Entrega *</label>
                  <textarea
                    placeholder="Ingresa tu dirección completa (incluye referencias)"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows="3"
                  ></textarea>
                  <p className="help-text">
                    Incluye detalles como número de casa, colonia, zona, referencias, etc.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Paso 4: Resumen y Confirmación */}
          {currentStep === 4 && (
            <div className="step-content">
              <h3>Resumen del Pedido</h3>
              
              {/* Resumen de productos */}
              <div className="order-summary">
                <div className="products-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="product-item">
                      <img src={item.image} alt={item.name} className="product-image" />
                      <div className="product-details">
                        <h5>{item.name}</h5>
                        <p>Cantidad: {item.quantity}</p>
                        <p>Precio unitario: Q{item.price}</p>
                      </div>
                      <div className="product-total">
                        Q{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-totals">
                  <div className="total-line">
                    <span>Subtotal:</span>
                    <span>Q{totalAmount.toFixed(2)}</span>
                  </div>
                  {shippingMethod === 'domicilio' && (
                    <div className="total-line">
                      <span>Envío:</span>
                      <span>Q15.00</span>
                    </div>
                  )}
                  <div className="total-line final-total">
                    <span>Total:</span>
                    <span>Q{(totalAmount + (shippingMethod === 'domicilio' ? 15 : 0)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Información de entrega y pago */}
                <div className="summary-info">
                  <div className="info-section">
                    <h5>Método de Pago:</h5>
                    <p>
                      <i className={`fas ${paymentMethod === 'tarjeta' ? 'fa-credit-card' : 'fa-money-bill-wave'}`}></i>
                      {paymentMethod === 'tarjeta' ? 'Tarjeta de Crédito/Débito' : 'Efectivo contra entrega'}
                    </p>
                  </div>
                  <div className="info-section">
                    <h5>Método de Envío:</h5>
                    <p>
                      <i className={`fas ${shippingMethod === 'domicilio' ? 'fa-truck' : 'fa-store'}`}></i>
                      {shippingMethod === 'domicilio' ? 'Envío a domicilio' : 'Recoger en farmacia'}
                    </p>
                    {shippingMethod === 'domicilio' && (
                      <p className="address-display">{shippingAddress}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {currentStep > 1 && (
            <button className="btn-secondary" onClick={prevStep}>
              <i className="fas fa-arrow-left"></i>
              Anterior
            </button>
          )}
          
          {currentStep < 4 ? (
            <button className="btn-primary" onClick={nextStep}>
              Siguiente
              <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button 
              className="btn-confirm" 
              onClick={handleConfirm} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  Confirmar Pedido
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;