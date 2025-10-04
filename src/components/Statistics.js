/**
 * @author Alexander Echeverria
 * @file src/components/Statistics.js
 * @description Componente de estadísticas, reportes y análisis del sistema
 * @location src/components/Statistics.js
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/statistics.css';

const Statistics = () => {
  const [dashboard, setDashboard] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [inventoryReport, setInventoryReport] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://farmacia-backend.onrender.com/api';

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboard(),
      fetchTopProducts(),
      fetchTopClients(),
      fetchInventoryReport()
    ]);
    setLoading(false);
  };

  const fetchDashboard = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${baseURL}/statistics/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDashboard(response.data);
    } catch (error) {
      console.error('Error al obtener dashboard:', error);
    }
  };

  const fetchTopProducts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${baseURL}/statistics/top-products?limit=10&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setTopProducts(response.data);
    } catch (error) {
      console.error('Error al obtener productos top:', error);
    }
  };

  const fetchTopClients = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${baseURL}/statistics/top-clients?limit=10&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setTopClients(response.data);
    } catch (error) {
      console.error('Error al obtener clientes top:', error);
    }
  };

  const fetchInventoryReport = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${baseURL}/statistics/inventory`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setInventoryReport(response.data);
    } catch (error) {
      console.error('Error al obtener reporte de inventario:', error);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <div>
          <h2>Estadísticas y Reportes</h2>
          <p>Análisis detallado del desempeño del negocio</p>
        </div>
        <div className="date-filter">
          <div className="date-group">
            <label>Desde:</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="date-group">
            <label>Hasta:</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-chart-line"></i> Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <i className="fas fa-pills"></i> Productos
        </button>
        <button
          className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <i className="fas fa-users"></i> Clientes
        </button>
        <button
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <i className="fas fa-warehouse"></i> Inventario
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="tab-content">
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon blue">
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                  <div className="kpi-info">
                    <h4>Ventas Totales</h4>
                    <p className="kpi-value">Q{dashboard.sales?.total || '0.00'}</p>
                    <span className="kpi-label">{dashboard.sales?.count || 0} facturas</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon green">
                    <i className="fas fa-chart-bar"></i>
                  </div>
                  <div className="kpi-info">
                    <h4>Venta Promedio</h4>
                    <p className="kpi-value">Q{dashboard.sales?.average || '0.00'}</p>
                    <span className="kpi-label">por factura</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon purple">
                    <i className="fas fa-user-friends"></i>
                  </div>
                  <div className="kpi-info">
                    <h4>Clientes Únicos</h4>
                    <p className="kpi-value">{dashboard.clients?.unique || 0}</p>
                    <span className="kpi-label">en el período</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon orange">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="kpi-info">
                    <h4>Stock Bajo</h4>
                    <p className="kpi-value">{dashboard.inventory?.lowStock || 0}</p>
                    <span className="kpi-label">productos</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon red">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="kpi-info">
                    <h4>Por Vencer</h4>
                    <p className="kpi-value">{dashboard.inventory?.expiring || 0}</p>
                    <span className="kpi-label">productos</span>
                  </div>
                </div>
              </div>

              <div className="charts-grid">
                <div className="chart-card">
                  <h3>Métodos de Pago</h3>
                  <div className="payment-methods">
                    {dashboard.paymentMethods?.map((method, index) => (
                      <div key={index} className="payment-item">
                        <div className="payment-header">
                          <span className="payment-name">
                            <i className={`fas fa-${method.paymentMethod === 'cash' ? 'money-bill-wave' : 'credit-card'}`}></i>
                            {method.paymentMethod === 'cash' ? 'Efectivo' : method.paymentMethod === 'stripe' ? 'Tarjeta' : method.paymentMethod}
                          </span>
                          <span className="payment-count">{method.count} ventas</span>
                        </div>
                        <div className="payment-bar">
                          <div
                            className="payment-fill"
                            style={{ width: `${(method.count / dashboard.sales?.count * 100) || 0}%` }}
                          ></div>
                        </div>
                        <span className="payment-total">Q{parseFloat(method.total || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="report-card">
                <h3>Top 10 Productos Más Vendidos</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th>Cantidad Vendida</th>
                        <th>Ingresos Totales</th>
                        <th>Precio Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{product.product?.name || 'N/A'}</strong>
                            <br />
                            <small>{product.product?.description || ''}</small>
                          </td>
                          <td>{product.totalQuantity}</td>
                          <td className="text-success">Q{parseFloat(product.totalRevenue || 0).toFixed(2)}</td>
                          <td>Q{parseFloat(product.product?.price || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="tab-content">
              <div className="report-card">
                <h3>Top 10 Clientes Frecuentes</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Cliente</th>
                        <th>Contacto</th>
                        <th>Compras</th>
                        <th>Total Gastado</th>
                        <th>Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topClients.map((client, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{client.client?.name || 'N/A'}</strong>
                          </td>
                          <td>
                            {client.client?.email && <div><i className="fas fa-envelope"></i> {client.client.email}</div>}
                            {client.client?.phone && <div><i className="fas fa-phone"></i> {client.client.phone}</div>}
                          </td>
                          <td>{client.purchaseCount}</td>
                          <td className="text-success">Q{parseFloat(client.totalSpent || 0).toFixed(2)}</td>
                          <td>Q{(parseFloat(client.totalSpent || 0) / parseInt(client.purchaseCount || 1)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="tab-content">
              <div className="inventory-summary">
                <div className="summary-card">
                  <h3>Resumen de Inventario</h3>
                  <div className="summary-item">
                    <span>Valor Total del Inventario:</span>
                    <strong className="text-primary">Q{inventoryReport.totalValue || '0.00'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Total de Productos:</span>
                    <strong>{inventoryReport.products?.length || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="report-card">
                <h3>Detalle de Inventario</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Stock Actual</th>
                        <th>Precio Unitario</th>
                        <th>Valor en Inventario</th>
                        <th>Lotes Activos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryReport.products?.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{product.name}</strong>
                          </td>
                          <td>
                            <span className={product.stock < 10 ? 'text-danger' : 'text-success'}>
                              {product.stock}
                            </span>
                          </td>
                          <td>Q{parseFloat(product.price || 0).toFixed(2)}</td>
                          <td className="text-primary">Q{parseFloat(product.inventoryValue || 0).toFixed(2)}</td>
                          <td>{product.batches?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Statistics;