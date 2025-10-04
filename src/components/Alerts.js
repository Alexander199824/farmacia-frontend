/**
 * @author Alexander Echeverria
 * @file src/components/Alerts.js
 * @description Componente de alertas y notificaciones del sistema
 * @location src/components/Alerts.js
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/alerts.css';

const Alerts = () => {
  const [alerts, setAlerts] = useState({
    expiringProducts: [],
    lowStock: [],
    expiredProducts: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://farmacia-backend.onrender.com/api';

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      // Obtener productos por vencer
      const expiringResponse = await axios.get(
        `${baseURL}/batches/expiring?days=30`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Obtener productos vencidos
      const expiredResponse = await axios.get(
        `${baseURL}/batches/expired`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Obtener productos con stock bajo
      const productsResponse = await axios.get(
        `${baseURL}/products`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const lowStockProducts = productsResponse.data.filter(p => p.stock < 10);

      setAlerts({
        expiringProducts: expiringResponse.data.batches || expiringResponse.data,
        expiredProducts: expiredResponse.data.batches || expiredResponse.data,
        lowStock: lowStockProducts,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error al obtener alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalAlerts = () => {
    return alerts.expiringProducts.length + 
           alerts.expiredProducts.length + 
           alerts.lowStock.length;
  };

  const getDaysUntilExpiry = (expirationDate) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const getFilteredAlerts = () => {
    switch (activeTab) {
      case 'expiring':
        return alerts.expiringProducts;
      case 'expired':
        return alerts.expiredProducts;
      case 'stock':
        return alerts.lowStock;
      default:
        return [
          ...alerts.expiringProducts.map(a => ({ ...a, type: 'expiring' })),
          ...alerts.expiredProducts.map(a => ({ ...a, type: 'expired' })),
          ...alerts.lowStock.map(a => ({ ...a, type: 'stock' }))
        ];
    }
  };

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <div>
          <h2>Centro de Alertas</h2>
          <p>Notificaciones y alertas importantes del sistema</p>
        </div>
        <div className="alerts-badge">
          <span className="total-alerts">{getTotalAlerts()}</span>
          <span className="badge-label">Alertas Activas</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="alerts-summary">
        <div className="summary-card warning">
          <div className="card-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="card-content">
            <h3>{alerts.expiringProducts.length}</h3>
            <p>Productos por Vencer</p>
            <span className="card-subtext">Próximos 30 días</span>
          </div>
        </div>

        <div className="summary-card danger">
          <div className="card-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="card-content">
            <h3>{alerts.expiredProducts.length}</h3>
            <p>Productos Vencidos</p>
            <span className="card-subtext">Requieren atención</span>
          </div>
        </div>

        <div className="summary-card info">
          <div className="card-icon">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="card-content">
            <h3>{alerts.lowStock.length}</h3>
            <p>Stock Bajo</p>
            <span className="card-subtext">Menos de 10 unidades</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="alerts-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <i className="fas fa-th-list"></i> Todas
        </button>
        <button
          className={`tab ${activeTab === 'expiring' ? 'active' : ''}`}
          onClick={() => setActiveTab('expiring')}
        >
          <i className="fas fa-clock"></i> Por Vencer ({alerts.expiringProducts.length})
        </button>
        <button
          className={`tab ${activeTab === 'expired' ? 'active' : ''}`}
          onClick={() => setActiveTab('expired')}
        >
          <i className="fas fa-times-circle"></i> Vencidos ({alerts.expiredProducts.length})
        </button>
        <button
          className={`tab ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          <i className="fas fa-boxes"></i> Stock Bajo ({alerts.lowStock.length})
        </button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando alertas...</p>
        </div>
      ) : (
        <div className="alerts-list">
          {getFilteredAlerts().length > 0 ? (
            getFilteredAlerts().map((alert, index) => {
              if (alert.type === 'stock' || !alert.type) {
                // Alert de stock bajo
                return (
                  <div key={`stock-${alert.id || index}`} className="alert-item info">
                    <div className="alert-icon">
                      <i className="fas fa-boxes"></i>
                    </div>
                    <div className="alert-content">
                      <h4>Stock Bajo: {alert.name}</h4>
                      <p>Solo quedan {alert.stock} unidades disponibles</p>
                      <div className="alert-meta">
                        <span><i className="fas fa-tag"></i> Precio: Q{alert.price}</span>
                        <span><i className="fas fa-user"></i> Proveedor: {alert.supplier}</span>
                      </div>
                    </div>
                    <button className="alert-action">
                      <i className="fas fa-shopping-cart"></i>
                      Reabastecer
                    </button>
                  </div>
                );
              } else if (alert.type === 'expiring' || alert.expirationDate) {
                // Alert de producto por vencer
                const days = getDaysUntilExpiry(alert.expirationDate);
                return (
                  <div key={`expiring-${alert.id}`} className="alert-item warning">
                    <div className="alert-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="alert-content">
                      <h4>Producto por Vencer: {alert.product?.name || 'N/A'}</h4>
                      <p>Lote: {alert.batchNumber} - Vence en {days} días</p>
                      <div className="alert-meta">
                        <span><i className="fas fa-calendar"></i> {new Date(alert.expirationDate).toLocaleDateString()}</span>
                        <span><i className="fas fa-boxes"></i> Cantidad: {alert.quantity}</span>
                        <span><i className="fas fa-warehouse"></i> {alert.location || 'Sin ubicación'}</span>
                      </div>
                    </div>
                    <button className="alert-action">
                      <i className="fas fa-tag"></i>
                      Promocionar
                    </button>
                  </div>
                );
              } else if (alert.type === 'expired') {
                // Alert de producto vencido
                return (
                  <div key={`expired-${alert.id}`} className="alert-item danger">
                    <div className="alert-icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="alert-content">
                      <h4>Producto Vencido: {alert.product?.name || 'N/A'}</h4>
                      <p>Lote: {alert.batchNumber} - Vencido desde {new Date(alert.expirationDate).toLocaleDateString()}</p>
                      <div className="alert-meta">
                        <span><i className="fas fa-boxes"></i> Cantidad: {alert.quantity}</span>
                        <span><i className="fas fa-warehouse"></i> {alert.location || 'Sin ubicación'}</span>
                      </div>
                    </div>
                    <button className="alert-action danger">
                      <i className="fas fa-trash"></i>
                      Dar de Baja
                    </button>
                  </div>
                );
              }
              return null;
            })
          ) : (
            <div className="no-alerts">
              <i className="fas fa-check-circle"></i>
              <h3>¡Todo en orden!</h3>
              <p>No hay alertas activas en este momento</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Alerts;