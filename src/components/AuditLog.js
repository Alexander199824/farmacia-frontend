/**
 * @author Alexander Echeverria
 * @file src/components/AuditLog.js
 * @description Componente para visualizar logs de auditoría del sistema
 * @location src/components/AuditLog.js
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/auditLog.css';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    severity: '',
    startDate: '',
    endDate: '',
    userId: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://farmacia-backend.onrender.com/api';

  useEffect(() => {
    fetchAuditLogs();
  }, [filters, currentPage]);

  const fetchAuditLogs = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      params.append('page', currentPage);
      params.append('limit', 20);

      const response = await axios.get(
        `${baseURL}/audit/logs?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setLogs(response.data.logs || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error al obtener logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entity: '',
      severity: '',
      startDate: '',
      endDate: '',
      userId: ''
    });
    setCurrentPage(1);
  };

  const getActionIcon = (action) => {
    const icons = {
      CREATE: 'fa-plus-circle',
      READ: 'fa-eye',
      UPDATE: 'fa-edit',
      DELETE: 'fa-trash-alt',
      LOGIN: 'fa-sign-in-alt',
      LOGOUT: 'fa-sign-out-alt',
      LOGIN_FAILED: 'fa-exclamation-triangle',
      SALE: 'fa-shopping-cart',
      PURCHASE: 'fa-shopping-bag',
      PAYMENT: 'fa-credit-card'
    };
    return icons[action] || 'fa-info-circle';
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'green',
      READ: 'blue',
      UPDATE: 'orange',
      DELETE: 'red',
      LOGIN: 'green',
      LOGOUT: 'gray',
      LOGIN_FAILED: 'red',
      SALE: 'purple',
      PURCHASE: 'teal',
      PAYMENT: 'blue'
    };
    return colors[action] || 'gray';
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: { class: 'severity-low', text: 'Bajo' },
      medium: { class: 'severity-medium', text: 'Medio' },
      high: { class: 'severity-high', text: 'Alto' },
      critical: { class: 'severity-critical', text: 'Crítico' }
    };
    return badges[severity] || badges.low;
  };

  const getActionLabel = (action) => {
    const labels = {
      CREATE: 'Creación',
      READ: 'Lectura',
      UPDATE: 'Actualización',
      DELETE: 'Eliminación',
      LOGIN: 'Inicio de Sesión',
      LOGOUT: 'Cierre de Sesión',
      LOGIN_FAILED: 'Login Fallido',
      SALE: 'Venta',
      PURCHASE: 'Compra',
      PAYMENT: 'Pago'
    };
    return labels[action] || action;
  };

  return (
    <div className="audit-container">
      <div className="audit-header">
        <div>
          <h2>Registro de Auditoría</h2>
          <p>Historial completo de operaciones del sistema</p>
        </div>
      </div>

      {/* Filters */}
      <div className="audit-filters">
        <div className="filter-group">
          <label>Acción</label>
          <select name="action" value={filters.action} onChange={handleFilterChange}>
            <option value="">Todas</option>
            <option value="CREATE">Creación</option>
            <option value="UPDATE">Actualización</option>
            <option value="DELETE">Eliminación</option>
            <option value="LOGIN">Login</option>
            <option value="SALE">Venta</option>
            <option value="PURCHASE">Compra</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Entidad</label>
          <select name="entity" value={filters.entity} onChange={handleFilterChange}>
            <option value="">Todas</option>
            <option value="Product">Producto</option>
            <option value="User">Usuario</option>
            <option value="Invoice">Factura</option>
            <option value="Batch">Lote</option>
            <option value="Client">Cliente</option>
            <option value="Payment">Pago</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severidad</label>
          <select name="severity" value={filters.severity} onChange={handleFilterChange}>
            <option value="">Todas</option>
            <option value="low">Bajo</option>
            <option value="medium">Medio</option>
            <option value="high">Alto</option>
            <option value="critical">Crítico</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Fecha Inicio</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Fecha Fin</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>

        <button className="btn-clear-filters" onClick={clearFilters}>
          <i className="fas fa-times"></i> Limpiar
        </button>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando registros...</p>
        </div>
      ) : (
        <>
          <div className="logs-list">
            {logs.length > 0 ? (
              logs.map(log => {
                const severityBadge = getSeverityBadge(log.severity);
                return (
                  <div key={log.id} className={`log-card ${getActionColor(log.action)}`}>
                    <div className="log-icon">
                      <i className={`fas ${getActionIcon(log.action)}`}></i>
                    </div>
                    <div className="log-content">
                      <div className="log-header">
                        <div className="log-title">
                          <h4>{getActionLabel(log.action)}</h4>
                          <span className={`severity-badge ${severityBadge.class}`}>
                            {severityBadge.text}
                          </span>
                        </div>
                        <span className="log-date">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="log-description">{log.description}</p>
                      
                      <div className="log-details">
                        <div className="log-detail-item">
                          <i className="fas fa-database"></i>
                          <span>Entidad: <strong>{log.entity}</strong></span>
                        </div>
                        {log.entityId && (
                          <div className="log-detail-item">
                            <i className="fas fa-hashtag"></i>
                            <span>ID: <strong>{log.entityId}</strong></span>
                          </div>
                        )}
                        {log.user && (
                          <div className="log-detail-item">
                            <i className="fas fa-user"></i>
                            <span>Usuario: <strong>{log.user.username}</strong></span>
                          </div>
                        )}
                        {log.ipAddress && (
                          <div className="log-detail-item">
                            <i className="fas fa-network-wired"></i>
                            <span>IP: <strong>{log.ipAddress}</strong></span>
                          </div>
                        )}
                      </div>

                      {log.metadata && (
                        <details className="log-metadata">
                          <summary>Ver detalles técnicos</summary>
                          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-logs">
                <i className="fas fa-clipboard-list"></i>
                <p>No hay registros que coincidan con los filtros</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <i className="fas fa-chevron-left"></i> Anterior
              </button>
              
              <span className="pagination-info">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Siguiente <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLog;