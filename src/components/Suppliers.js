/**
 * @author Alexander Echeverria
 * @file src/components/Suppliers.js
 * @description Componente para visualizar y analizar proveedores del sistema,
 * mostrando estadísticas de productos, inventario y rendimiento por proveedor
 * @location src/components/Suppliers.js
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/suppliers.css';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('products'); // products, value, name

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSuppliersData();
  }, []);

  const fetchSuppliersData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/products`);
      const products = response.data;

      // Agrupar productos por proveedor
      const suppliersMap = {};

      products.forEach(product => {
        const supplierName = product.supplier || 'Sin Proveedor';
        
        if (!suppliersMap[supplierName]) {
          suppliersMap[supplierName] = {
            name: supplierName,
            products: [],
            totalProducts: 0,
            totalValue: 0,
            totalStock: 0,
            avgPrice: 0,
            lowStockCount: 0
          };
        }

        suppliersMap[supplierName].products.push(product);
        suppliersMap[supplierName].totalProducts++;
        suppliersMap[supplierName].totalStock += product.stock;
        suppliersMap[supplierName].totalValue += parseFloat(product.price) * product.stock;
        
        if (product.stock < 10) {
          suppliersMap[supplierName].lowStockCount++;
        }
      });

      // Calcular precio promedio
      Object.keys(suppliersMap).forEach(key => {
        const supplier = suppliersMap[key];
        const totalPrice = supplier.products.reduce((sum, p) => sum + parseFloat(p.price), 0);
        supplier.avgPrice = totalPrice / supplier.totalProducts;
      });

      const suppliersArray = Object.values(suppliersMap);
      setSuppliers(suppliersArray);
    } catch (error) {
      console.error('Error al obtener datos de proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedSuppliers = () => {
    let sorted = [...suppliers];

    if (searchTerm) {
      sorted = sorted.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'products':
        sorted.sort((a, b) => b.totalProducts - a.totalProducts);
        break;
      case 'value':
        sorted.sort((a, b) => b.totalValue - a.totalValue);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return sorted;
  };

  const selectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierProducts(supplier.products);
  };

  const getTotalStats = () => {
    return {
      totalSuppliers: suppliers.length,
      totalProducts: suppliers.reduce((sum, s) => sum + s.totalProducts, 0),
      totalValue: suppliers.reduce((sum, s) => sum + s.totalValue, 0),
      totalStock: suppliers.reduce((sum, s) => sum + s.totalStock, 0)
    };
  };

  const stats = getTotalStats();
  const sortedSuppliers = getSortedSuppliers();

  return (
    <div className="suppliers-container">
      <div className="suppliers-header">
        <div>
          <h2>Gestión de Proveedores</h2>
          <p>Análisis y estadísticas de proveedores del inventario</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <i className="fas fa-truck"></i>
          </div>
          <div className="stat-info">
            <h4>Total Proveedores</h4>
            <p className="stat-number">{stats.totalSuppliers}</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="stat-info">
            <h4>Productos Totales</h4>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <i className="fas fa-warehouse"></i>
          </div>
          <div className="stat-info">
            <h4>Stock Total</h4>
            <p className="stat-number">{stats.totalStock}</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-info">
            <h4>Valor Inventario</h4>
            <p className="stat-number">Q{stats.totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="controls-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sort-controls">
          <label>Ordenar por:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="products">Cantidad de Productos</option>
            <option value="value">Valor de Inventario</option>
            <option value="name">Nombre (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Suppliers List */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando proveedores...</p>
        </div>
      ) : (
        <div className="suppliers-grid">
          <div className="suppliers-list">
            <h3>Lista de Proveedores ({sortedSuppliers.length})</h3>
            {sortedSuppliers.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>No se encontraron proveedores</p>
              </div>
            ) : (
              sortedSuppliers.map((supplier, index) => (
                <div
                  key={index}
                  className={`supplier-card ${selectedSupplier?.name === supplier.name ? 'active' : ''}`}
                  onClick={() => selectSupplier(supplier)}
                >
                  <div className="supplier-header">
                    <div className="supplier-icon">
                      <i className="fas fa-truck"></i>
                    </div>
                    <div className="supplier-name">
                      <h4>{supplier.name}</h4>
                      <p>{supplier.totalProducts} productos</p>
                    </div>
                  </div>
                  
                  <div className="supplier-stats">
                    <div className="stat-item">
                      <span className="stat-label">Stock Total</span>
                      <span className="stat-value">{supplier.totalStock}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Valor</span>
                      <span className="stat-value">Q{supplier.totalValue.toFixed(2)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Precio Prom.</span>
                      <span className="stat-value">Q{supplier.avgPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {supplier.lowStockCount > 0 && (
                    <div className="low-stock-alert">
                      <i className="fas fa-exclamation-triangle"></i>
                      {supplier.lowStockCount} productos con stock bajo
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="supplier-details">
            {selectedSupplier ? (
              <>
                <div className="details-header">
                  <div>
                    <h3>{selectedSupplier.name}</h3>
                    <p>Detalles y productos del proveedor</p>
                  </div>
                  <button 
                    className="btn-close"
                    onClick={() => setSelectedSupplier(null)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="details-stats">
                  <div className="detail-stat">
                    <i className="fas fa-boxes"></i>
                    <div>
                      <p className="detail-label">Productos</p>
                      <p className="detail-value">{selectedSupplier.totalProducts}</p>
                    </div>
                  </div>
                  <div className="detail-stat">
                    <i className="fas fa-warehouse"></i>
                    <div>
                      <p className="detail-label">Stock Total</p>
                      <p className="detail-value">{selectedSupplier.totalStock}</p>
                    </div>
                  </div>
                  <div className="detail-stat">
                    <i className="fas fa-dollar-sign"></i>
                    <div>
                      <p className="detail-label">Valor Total</p>
                      <p className="detail-value">Q{selectedSupplier.totalValue.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="detail-stat">
                    <i className="fas fa-chart-line"></i>
                    <div>
                      <p className="detail-label">Precio Prom.</p>
                      <p className="detail-value">Q{selectedSupplier.avgPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="products-table-container">
                  <h4>Productos del Proveedor</h4>
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Valor</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierProducts.map(product => (
                        <tr key={product.id}>
                          <td>
                            <div>
                              <strong>{product.name}</strong>
                              <p className="product-description">{product.description}</p>
                            </div>
                          </td>
                          <td>Q{parseFloat(product.price).toFixed(2)}</td>
                          <td>
                            <span className={`stock-badge ${product.stock < 10 ? 'low' : ''}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="value-col">
                            Q{(parseFloat(product.price) * product.stock).toFixed(2)}
                          </td>
                          <td>
                            {product.stock === 0 ? (
                              <span className="status-badge danger">Agotado</span>
                            ) : product.stock < 10 ? (
                              <span className="status-badge warning">Stock Bajo</span>
                            ) : (
                              <span className="status-badge success">Disponible</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <i className="fas fa-hand-pointer"></i>
                <h4>Seleccione un Proveedor</h4>
                <p>Haga clic en un proveedor de la lista para ver sus detalles y productos</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;