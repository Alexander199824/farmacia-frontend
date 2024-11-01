// src/components/CheckoutPage.js
import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51Q9AMkB3EtWqqOZ24k1VyZOOgpCNnVY0CunpMiDNtdS9auObuqik24wzWMIJd09gWmvqSgfs55j1A8MPXtCiBjEf00zin7p46b');

const CheckoutPage = ({ cartItems, onConfirmPurchase }) => {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await axios.post('https://farmacia-backend.onrender.com/api/create-payment-intent', {
          amount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0) * 100, // Convert to cents
        });
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Error fetching client secret:', error);
      }
    };

    fetchClientSecret();
  }, [cartItems]);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm onPaymentSuccess={onConfirmPurchase} clientSecret={clientSecret} />
    </Elements>
  );
};

export default CheckoutPage;
