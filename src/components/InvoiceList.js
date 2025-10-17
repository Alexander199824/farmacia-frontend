/**
 * @author Alexander Echeverria
 * @file src/components/InvoiceList.js
 * @description Componente para visualizar lista de pedidos/recibos
 * @location src/components/InvoiceList.js
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/invoiceList.css';

const InvoiceList = () => {
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${baseURL}/invoices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err);
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = 
        order.clientDPI?.includes(searchTerm) ||
        order.sellerDPI?.includes(searchTerm) ||
        order.id?.toString().includes(searchTerm);
      
      const matchesDate = filterDate 
        ? new Date(order.date).toISOString().split('T')[0] === filterDate
        : true;
      
      return matchesSearch && matchesDate;
    });
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'cash': 'Efectivo',
      'stripe': 'Tarjeta',
      'card': 'Tarjeta'
    };
    return methods[method] || method;
  };

  const getPaymentMethodIcon = (method) => {
    return method === 'cash' ? 'fa-money-bill-wave' : 'fa-credit-card';
  };

  const getTotalStats = () => {
    const total = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const cashOrders = orders.filter(o => o.paymentMethod === 'cash').length;
    const cardOrders = orders.filter(o => o.paymentMethod !== 'cash').length;

    return { total, totalAmount, cashOrders, cardOrders };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <p>Error al cargar los pedidos: {error.message}</p>
        <button onClick={fetchOrders} className="btn-retry">
          <i className="fas fa-redo"></i> Reintentar
        </button>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div>
          <h2>Lista de Pedidos</h2>
          <p>Historial completo de ventas y transacciones</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <i className="fas fa-file-invoice"></i>
          </div>
          <div className="stat-info">
            <h4>Total Pedidos</h4>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-info">
            <h4>Ingresos Totales</h4>
            <p className="stat-number">Q{stats.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="stat-info">
            <h4>Efectivo</h4>
            <p className="stat-number">{stats.cashOrders}</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <i className="fas fa-credit-card"></i>
          </div>
          <div className="stat-info">
            <h4>Tarjeta</h4>
            <p className="stat-number">{stats.cardOrders}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar por DPI o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="date-filter">
          <i className="fas fa-calendar"></i>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button 
              className="btn-clear-filter"
              onClick={() => setFilterDate('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <i className="fas fa-inbox"></i>
          <h3>No hay pedidos disponibles</h3>
          <p>No se encontraron pedidos que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente DPI</th>
                <th>Vendedor DPI</th>
                <th>Método de Pago</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="order-id">#{order.id}</span>
                  </td>
                  <td>{new Date(order.date).toLocaleDateString('es-GT', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                  <td>
                    <span className="dpi-badge">{order.clientDPI}</span>
                  </td>
                  <td>
                    <span className="dpi-badge seller">{order.sellerDPI}</span>
                  </td>
                  <td>
                    <span className={`payment-badge ${order.paymentMethod}`}>
                      <i className={`fas ${getPaymentMethodIcon(order.paymentMethod)}`}></i>
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </span>
                  </td>
                  <td className="amount-cell">
                    <strong>Q{Number(order.totalAmount).toFixed(2)}</strong>
                  </td>
                  <td>
                    <button 
                      className="btn-view-details"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <i className="fas fa-eye"></i>
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalles */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Pedido #{selectedOrder.id}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="order-info-grid">
                <div className="info-section">
                  <h4>Información General</h4>
                  <div className="info-item">
                    <span className="label">ID Pedido:</span>
                    <span className="value">#{selectedOrder.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Fecha:</span>
                    <span className="value">
                      {new Date(selectedOrder.date).toLocaleString('es-GT')}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Estado:</span>
                    <span className="value">
                      <span className="status-badge completed">Completado</span>
                    </span>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Cliente</h4>
                  <div className="info-item">
                    <span className="label">DPI Cliente:</span>
                    <span className="value">{selectedOrder.clientDPI}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">ID Cliente:</span>
                    <span className="value">{selectedOrder.clientId}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Vendedor</h4>
                  <div className="info-item">
                    <span className="label">DPI Vendedor:</span>
                    <span className="value">{selectedOrder.sellerDPI}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Pago</h4>
                  <div className="info-item">
                    <span className="label">Método:</span>
                    <span className="value">
                      <span className={`payment-badge ${selectedOrder.paymentMethod}`}>
                        <i className={`fas ${getPaymentMethodIcon(selectedOrder.paymentMethod)}`}></i>
                        {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                      </span>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Total:</span>
                    <span className="value total-amount">
                      Q{Number(selectedOrder.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="items-section">
                  <h4>Productos</h4>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName || `Producto ID: ${item.productId}`}</td>
                          <td>{item.quantity}</td>
                          <td>Q{Number(item.unitPrice).toFixed(2)}</td>
                          <td>Q{(Number(item.unitPrice) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-print"
                onClick={() => window.print()}
              >
                <i className="fas fa-print"></i>
                Imprimir Recibo
              </button>
              <button 
                className="btn-close"
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;