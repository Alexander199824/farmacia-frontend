/**
 * @author Alexander Echeverria
 * @file src/components/Batches.js
 * @description Componente para gestión de lotes, control de vencimientos y trazabilidad
 * @location src/components/Batches.js
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/batches.css';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    batchNumber: '',
    manufacturingDate: '',
    expirationDate: '',
    quantity: '',
    purchasePrice: '',
    salePrice: '',
    supplier: '',
    location: '',
    notes: ''
  });
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://farmacia-backend.onrender.com/api';

  useEffect(() => {
    fetchBatches();
    fetchProducts();
    fetchStats();
  }, [filter]);

  const fetchBatches = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      let url = `${baseURL}/batches`;
      if (filter === 'expiring') {
        url = `${baseURL}/batches/expiring?days=30`;
      } else if (filter === 'expired') {
        url = `${baseURL}/batches/expired`;
      }

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBatches(response.data.batches || response.data);
    } catch (error) {
      console.error('Error al obtener lotes:', error);
      alert('Error al cargar los lotes');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseURL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseURL}/batches/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      if (editing) {
        await axios.put(`${baseURL}/batches/${editId}`, formData, config);
        alert('Lote actualizado exitosamente');
      } else {
        await axios.post(`${baseURL}/batches`, formData, config);
        alert('Lote creado exitosamente');
      }

      fetchBatches();
      fetchStats();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar el lote:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const editBatch = (batch) => {
    setFormData({
      productId: batch.productId,
      batchNumber: batch.batchNumber,
      manufacturingDate: batch.manufacturingDate?.split('T')[0],
      expirationDate: batch.expirationDate?.split('T')[0],
      quantity: batch.quantity,
      purchasePrice: batch.purchasePrice,
      salePrice: batch.salePrice,
      supplier: batch.supplier,
      location: batch.location || '',
      notes: batch.notes || ''
    });
    setEditing(true);
    setEditId(batch.id);
    setShowModal(true);
  };

  const deleteBatch = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este lote?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${baseURL}/batches/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBatches();
      fetchStats();
      alert('Lote eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar el lote:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      batchNumber: '',
      manufacturingDate: '',
      expirationDate: '',
      quantity: '',
      purchasePrice: '',
      salePrice: '',
      supplier: '',
      location: '',
      notes: ''
    });
    setEditing(false);
    setEditId(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'status-active', text: 'Activo' },
      near_expiry: { class: 'status-warning', text: 'Por Vencer' },
      expired: { class: 'status-danger', text: 'Vencido' },
      depleted: { class: 'status-depleted', text: 'Agotado' }
    };
    return badges[status] || badges.active;
  };

  const getDaysUntilExpiry = (expirationDate) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="batches-container">
      <div className="batches-header">
        <div>
          <h2>Gestión de Lotes</h2>
          <p>Control de vencimientos y trazabilidad de productos</p>
        </div>
        <button onClick={openModal} className="btn-add">
          <i className="fas fa-plus"></i> Nuevo Lote
        </button>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="stat-info">
            <h4>Total Lotes</h4>
            <p className="stat-number">{stats.total || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h4>Activos</h4>
            <p className="stat-number">{stats.active || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h4>Por Vencer</h4>
            <p className="stat-number">{stats.nearExpiry || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-info">
            <h4>Vencidos</h4>
            <p className="stat-number">{stats.expired || 0}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button
          className={`filter-btn ${filter === 'expiring' ? 'active' : ''}`}
          onClick={() => setFilter('expiring')}
        >
          Por Vencer (30 días)
        </button>
        <button
          className={`filter-btn ${filter === 'expired' ? 'active' : ''}`}
          onClick={() => setFilter('expired')}
        >
          Vencidos
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editing ? 'Actualizar Lote' : 'Nuevo Lote'}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="batch-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Producto *</label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un producto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Número de Lote *</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Fabricación *</label>
                  <input
                    type="date"
                    name="manufacturingDate"
                    value={formData.manufacturingDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Vencimiento *</label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cantidad *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Precio de Compra *</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Precio de Venta *</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Proveedor *</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Ubicación en Bodega</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ej: Estante A, Nivel 2"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notas</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editing ? 'Actualizar' : 'Crear'} Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de Lotes */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando lotes...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="batches-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Número de Lote</th>
                <th>Cantidad</th>
                <th>Vencimiento</th>
                <th>Días Restantes</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {batches.length > 0 ? (
                batches.map(batch => {
                  const badge = getStatusBadge(batch.status);
                  const days = getDaysUntilExpiry(batch.expirationDate);
                  return (
                    <tr key={batch.id}>
                      <td>{batch.product?.name || 'N/A'}</td>
                      <td>{batch.batchNumber}</td>
                      <td>{batch.quantity}</td>
                      <td>{new Date(batch.expirationDate).toLocaleDateString()}</td>
                      <td>
                        <span className={days < 0 ? 'text-danger' : days < 30 ? 'text-warning' : 'text-success'}>
                          {days < 0 ? `Vencido hace ${Math.abs(days)} días` : `${days} días`}
                        </span>
                      </td>
                      <td>{batch.supplier}</td>
                      <td>
                        <span className={`status-badge ${badge.class}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => editBatch(batch)} className="btn-edit">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => deleteBatch(batch.id)} className="btn-delete">
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No hay lotes disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Batches;