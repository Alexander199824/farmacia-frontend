// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [timer, setTimer] = useState(null);
  const [logoutMessage, setLogoutMessage] = useState('');

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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login setAuth={setIsAuth} logoutMessage={logoutMessage} />} />
        <Route
          path="/dashboard"
          element={isAuth ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
