/**
 * @author Alexander Echeverria
 * @file src/components/Products.js
 * @description Componente mejorado para gestión completa de productos con 
 * búsqueda avanzada, visualización de imágenes y control de inventario
 * @location src/components/Products.js
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    supplier: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, low-stock, no-stock
  const [sortBy, setSortBy] = useState('name'); // name, price, stock
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, filterBy, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseURL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtros
    switch (filterBy) {
      case 'low-stock':
        filtered = filtered.filter(p => p.stock < 10 && p.stock > 0);
        break;
      case 'no-stock':
        filtered = filtered.filter(p => p.stock === 0);
        break;
      default:
        break;
    }

    // Aplicar ordenamiento
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'stock':
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('description', formData.description);
    productData.append('price', formData.price);
    productData.append('stock', formData.stock);
    productData.append('supplier', formData.supplier);
    if (image) productData.append('image', image);

    const token = localStorage.getItem('token');

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };
      
      if (editing) {
        await axios.put(`${baseURL}/products/${editId}`, productData, config);
        alert("✅ Producto actualizado exitosamente");
      } else {
        await axios.post(`${baseURL}/products`, productData, config);
        alert("✅ Producto creado exitosamente");
      }

      fetchProducts();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error al guardar el producto:", error.response?.data || error.message);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const editProduct = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      supplier: product.supplier
    });
    setEditing(true);
    setEditId(product.id);
    setShowModal(true);
    
    // Mostrar preview de imagen existente si hay
    if (product.image && product.image.data) {
      const base64 = btoa(
        new Uint8Array(product.image.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      setImagePreview(`data:image/jpeg;base64,${base64}`);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${baseURL}/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProducts();
      alert('✅ Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      alert('❌ Error al eliminar el producto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      supplier: ''
    });
    setImage(null);
    setImagePreview(null);
    setEditing(false);
    setEditId(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getProductImage = (product) => {
    if (product.image && product.image.data) {
      const base64 = btoa(
        new Uint8Array(product.image.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      return `data:image/jpeg;base64,${base64}`;
    }
    return 'https://via.placeholder.com/200x200?text=Sin+Imagen';
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { class: 'danger', text: 'Agotado', icon: 'fa-times-circle' };
    if (stock < 10) return { class: 'warning', text: 'Stock Bajo', icon: 'fa-exclamation-triangle' };
    return { class: 'success', text: 'Disponible', icon: 'fa-check-circle' };
  };

  const getStats = () => {
    return {
      total: products.length,
      lowStock: products.filter(p => p.stock < 10 && p.stock > 0).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0)
    };
  };

  const stats = getStats();

  return (
    <div className="products-container">
      <div className="products-header">
        <div>
          <h2>Gestión de Productos</h2>
          <p>Administración completa del inventario</p>
        </div>
        <button onClick={openModal} className="btn-add">
          <i className="fas fa-plus"></i> Agregar Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="stat-info">
            <h4>Total Productos</h4>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h4>Stock Bajo</h4>
            <p className="stat-number">{stats.lowStock}</p>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-info">
            <h4>Agotados</h4>
            <p className="stat-number">{stats.outOfStock}</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-info">
            <h4>Valor Total</h4>
            <p className="stat-number">Q{stats.totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
            <option value="all">Todos</option>
            <option value="low-stock">Stock Bajo</option>
            <option value="no-stock">Agotados</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Ordenar: Nombre</option>
            <option value="price">Ordenar: Precio</option>
            <option value="stock">Ordenar: Stock</option>
          </select>

          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <i className="fas fa-th"></i>
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editing ? 'Actualizar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Paracetamol 500mg"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descripción del producto"
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Precio (Q) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock Inicial *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Proveedor *</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder="Nombre del proveedor"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Imagen del Producto</label>
                  <div className="image-upload-area">
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="product-image"
                      className="file-input"
                    />
                    <label htmlFor="product-image" className="file-label">
                      <i className="fas fa-camera"></i>
                      {imagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editing ? 'Actualizar' : 'Crear'} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Display */}
      <div className={`products-display ${viewMode}`}>
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <i className="fas fa-box-open"></i>
            <h3>No se encontraron productos</h3>
            <p>Intenta cambiar los filtros de búsqueda</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const status = getStockStatus(product.stock);
            return (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={getProductImage(product)} alt={product.name} />
                  <div className={`stock-badge ${status.class}`}>
                    <i className={`fas ${status.icon}`}></i>
                    {status.text}
                  </div>
                </div>
                
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-details">
                    <div className="detail-item">
                      <i className="fas fa-tag"></i>
                      <span>Q{parseFloat(product.price).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-boxes"></i>
                      <span>{product.stock} unidades</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-truck"></i>
                      <span>{product.supplier}</span>
                    </div>
                  </div>
                </div>
                
                <div className="product-actions">
                  <button onClick={() => editProduct(product)} className="btn-edit">
                    <i className="fas fa-edit"></i>
                    Editar
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="btn-delete">
                    <i className="fas fa-trash"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Products;