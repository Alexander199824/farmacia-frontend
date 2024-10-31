import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    supplier: ''
  });
  const [image, setImage] = useState(null); // Estado para la imagen
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://farmacia-backend.onrender.com/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Guardar la imagen seleccionada
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('description', formData.description);
    productData.append('price', formData.price);
    productData.append('stock', formData.stock);
    productData.append('supplier', formData.supplier);
    if (image) productData.append('image', image); // Agregar imagen solo si está presente

    const token = localStorage.getItem('token'); // Obtener el token de localStorage

    try {
      let response;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Incluir el token en el encabezado
        }
      };
      if (editing) {
        response = await axios.put(`https://farmacia-backend.onrender.com/api/products/${editId}`, productData, config);
      } else {
        response = await axios.post('https://farmacia-backend.onrender.com/api/products', productData, config);
      }
      console.log("Respuesta del servidor:", response.data);

      fetchProducts();
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        supplier: '',
      });
      setImage(null); // Resetear la imagen
      setShowModal(false);
      alert("Producto guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar el producto:", error.response ? error.response.data : error.message);
      alert(`Error al guardar el producto: ${error.response ? error.response.data.message : error.message}`);
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
  };

  const deleteProduct = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://farmacia-backend.onrender.com/api/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProducts();
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  const openModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      supplier: ''
    });
    setImage(null);
    setEditing(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div style={styles.productsContainer}>
      <h2 style={styles.heading}>Gestión de Productos</h2>
      <button onClick={openModal} style={styles.addButton}>Agregar Producto</button>

      {/* Modal para Agregar y Editar Productos */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.formTitle}>{editing ? "Actualizar Producto" : "Agregar Producto"}</h3>
            <form onSubmit={handleSubmit} style={styles.productForm} encType="multipart/form-data">
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nombre" required style={styles.input} />
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Descripción" style={styles.input} />
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Precio" required style={styles.input} />
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Stock" required style={styles.input} />
              <input type="text" name="supplier" value={formData.supplier} onChange={handleInputChange} placeholder="Proveedor" required style={styles.input} />
              <input type="file" name="image" onChange={handleImageChange} style={styles.input} /> {/* Campo para imagen */}
              <button type="submit" style={styles.submitButton}>{editing ? "Actualizar" : "Agregar"}</button>
              <button onClick={closeModal} type="button" style={styles.cancelButton}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <table style={styles.productsTable}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Nombre</th>
            <th style={styles.tableHeader}>Descripción</th>
            <th style={styles.tableHeader}>Precio</th>
            <th style={styles.tableHeader}>Stock</th>
            <th style={styles.tableHeader}>Proveedor</th>
            <th style={styles.tableHeader}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map(product => (
              <tr key={product.id}>
                <td style={styles.tableData}>{product.name}</td>
                <td style={styles.tableData}>{product.description}</td>
                <td style={styles.tableData}>{product.price}</td>
                <td style={styles.tableData}>{product.stock}</td>
                <td style={styles.tableData}>{product.supplier}</td>
                <td style={styles.tableData}>
                  <button onClick={() => editProduct(product)} style={styles.editButton}>Editar</button>
                  <button onClick={() => deleteProduct(product.id)} style={styles.deleteButton}>Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={styles.noProducts}>No hay productos disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  productsContainer: {
    width: '100%',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
  },
  addButton: {
    marginBottom: '20px',
    padding: '10px 15px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '500px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  productForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  formTitle: {
    marginBottom: '15px',
    color: '#333',
  },
  input: {
    marginBottom: '10px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  },
  submitButton: {
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  cancelButton: {
    padding: '10px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  productsTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    padding: '12px',
    backgroundColor: '#007BFF',
    color: '#fff',
  },
  tableData: {
    padding: '12px',
    border: '1px solid #ddd',
    textAlign: 'center',
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#ffc107',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '5px',
  },
  noProducts: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
  },
};

export default Products;
