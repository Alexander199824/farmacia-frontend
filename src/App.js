// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Load Stripe with environment variable
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const App = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [timer, setTimer] = useState(null);
  const [logoutMessage, setLogoutMessage] = useState('');
  const [cartItems, setCartItems] = useState([]);

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
    }, parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 1800000); // 30 minutos por defecto
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
    localStorage.removeItem('dpi');
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
            element={isAuth ? <Dashboard setAuth={setIsAuth} /> : <Navigate to="/login" />}
          />
        </Routes>
      </Elements>
    </Router>
  );
};

export default App;