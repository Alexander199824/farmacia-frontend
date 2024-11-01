// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CheckoutPage from './components/CheckoutPage'; // Importa la nueva página de checkout

// Load your Stripe publishable key
const stripePromise = loadStripe('pk_test_51Q9AMkB3EtWqqOZ24k1VyZOOgpCNnVY0CunpMiDNtdS9auObuqik24wzWMIJd09gWmvqSgfs55j1A8MPXtCiBjEf00zin7p46b');

const App = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [timer, setTimer] = useState(null);
  const [logoutMessage, setLogoutMessage] = useState('');
  const [cartItems, setCartItems] = useState([]); // Ejemplo de items en el carrito

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuth(!!token);

    if (token) {
      startTimer();
    }

    const handleActivity = () => resetTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [isAuth]);

  const startTimer = () => {
    clearTimer();
    const newTimer = setTimeout(() => {
      setLogoutMessage('La sesión se ha cerrado por inactividad.');
      handleLogout();
    }, 3000000); // 30 minutos en milisegundos
    setTimer(newTimer);
  };

  const resetTimer = () => {
    clearTimer();
    if (isAuth) {
      startTimer();
    }
  };

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuth(false);
    clearTimer();
  };

  return (
    <Router>
      <Elements stripe={stripePromise}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login setAuth={setIsAuth} logoutMessage={logoutMessage} />} />
          <Route
            path="/dashboard"
            element={isAuth ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route 
            path="/checkout" 
            element={<CheckoutPage cartItems={cartItems} onConfirmPurchase={() => {/* lógica de confirmación */}} />} 
          />
        </Routes>
      </Elements>
    </Router>
  );
};

export default App;
