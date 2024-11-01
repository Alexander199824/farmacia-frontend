// src/components/CheckoutPage.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe('pk_test_51Q9AMkB3EtWqqOZ24k1VyZOOgpCNnVY0CunpMiDNtdS9auObuqik24wzWMIJd09gWmvqSgfs55j1A8MPXtCiBjEf00zin7p46b');

const CheckoutPage = ({ cartItems, onConfirmPurchase }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm onConfirmPurchase={onConfirmPurchase} cartItems={cartItems} />
    </Elements>
  );
};

export default CheckoutPage;
