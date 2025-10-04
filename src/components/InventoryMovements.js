/**
 * @author Alexander Echeverria
 * @file src/components/InventoryMovements.js
 * @description Componente para visualizar el historial de movimientos de inventario
 * @location src/components/InventoryMovements.js
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/inventoryMovements.css';

const InventoryMovements = () => {
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://farmacia-backend.onrender.com/api';

  useEffect(() => {
    fetchMovements();
  }, [filter, dateRange]);

  const fetchMovements = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      let url = `${baseURL}/inventory/movements`;
      const params = [];
      
      if (filter !== 'all') {
        params.push(`type=${filter}`);
      }
      if (dateRange.startDate) {
        params.push(`startDate=${dateRange.startDate}`);
      }
      if (dateRange.endDate) {
        params.push(`endDate=${dateRange.endDate}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMovements(response.data);
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type) => {
    const icons = {
      purchase: 'fa-shopping-cart',
      sale: 'fa-cash-register',
      adjustment: 'fa-sliders-h',
      transfer_in: 'fa-arrow-down',
      transfer_out: 'fa-arrow-up',
      return: 'fa-undo',
      damage: 'fa-exclamation-triangle',
      expiry: 'fa-calendar-times',
      donation: 'fa-gift',
      sample: 'fa-flask'
    };
    return icons[type] || 'fa-box';
  };

  const getMovementColor = (type) => {
    const colors = {
      purchase: 'green',
      sale: 'blue',
      adjustment: 'orange',
      transfer_in: 'green',
      transfer_out: 'red',
      return: 'purple',
      damage: 'red',
      expiry: 'red',
      donation: 'pink',
      sample: 'teal'
    };
    return colors[type] || 'gray';
  };

  const getMovementLabel = (type) => {
    const labels = {
      purchase: 'Compra',
      sale: 'Venta',
      adjustment: 'Ajuste',
      transfer_in: 'Entrada',
      transfer_out: 'Salida',
      return: 'Devolución',
      damage: 'Daño',
      expiry: 'Vencimiento',
      donation: 'Donación',
      sample: 'Muestra'
    };
    return labels[type] || type;
  };

  return (
    <div className="movements-container">
      <div className="movements-header">
        <div>
          <h2>Movimientos de Inventario</h2>
          <p>Historial completo de movimientos y trazabilidad</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="type-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button
            className={`filter-btn ${filter === 'sale' ? 'active' : ''}`}
            onClick={() => setFilter('sale')}
          >
            Ventas
          </button>
          <button
            className={`filter-btn ${filter === 'purchase' ? 'active' : ''}`}
            onClick={() => setFilter('purchase')}
          >
            Compras
          </button>
          <button
            className={`filter-btn ${filter === 'adjustment' ? 'active' : ''}`}
            onClick={() => setFilter('adjustment')}
          >
            Ajustes
          </button>
        </div>

        <div className="date-filters">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            placeholder="Fecha inicio"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            placeholder="Fecha fin"
          />
        </div>
      </div>

      {/* Movements List */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando movimientos...</p>
        </div>
      ) : (
        <div className="movements-list">
          {movements.length > 0 ? (
            movements.map(movement => (
              <div key={movement.id} className={`movement-card ${getMovementColor(movement.movementType)}`}>
                <div className="movement-icon">
                  <i className={`fas ${getMovementIcon(movement.movementType)}`}></i>
                </div>
                <div className="movement-info">
                  <div className="movement-header">
                    <h4>{getMovementLabel(movement.movementType)}</h4>
                    <span className="movement-date">
                      {new Date(movement.movementDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="movement-details">
                    <p><strong>Producto:</strong> {movement.product?.name || 'N/A'}</p>
                    {movement.batch && (
                      <p><strong>Lote:</strong> {movement.batch.batchNumber}</p>
                    )}
                    <p><strong>Cantidad:</strong> {movement.quantity}</p>
                    <p><strong>Stock Anterior:</strong> {movement.previousStock}</p>
                    <p><strong>Stock Nuevo:</strong> {movement.newStock}</p>
                    {movement.notes && (
                      <p><strong>Notas:</strong> {movement.notes}</p>
                    )}
                  </div>
                  <div className="movement-footer">
                    <span className="movement-user">
                      <i className="fas fa-user"></i> {movement.user?.username || 'Sistema'}
                    </span>
                    {movement.approved && (
                      <span className="movement-approved">
                        <i className="fas fa-check-circle"></i> Aprobado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-movements">
              <i className="fas fa-inbox"></i>
              <p>No hay movimientos registrados</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryMovements;