import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    dpi: '',
    birthDate: '',
    email: '',
    phone: '',
    address: ''
  });
  const [image, setImage] = useState(null); // Estado para la imagen de perfil
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://farmacia-backend.onrender.com/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientData = new FormData();
    clientData.append('name', formData.name);
    clientData.append('dpi', formData.dpi);
    clientData.append('birthDate', formData.birthDate);
    clientData.append('email', formData.email);
    clientData.append('phone', formData.phone);
    clientData.append('address', formData.address);
    if (image) clientData.append('image', image);

    const token = localStorage.getItem('token');

    try {
      let response;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };
      if (editing) {
        response = await axios.put(`https://farmacia-backend.onrender.com/api/clients/${editId}`, clientData, config);
      } else {
        response = await axios.post('https://farmacia-backend.onrender.com/api/clients', clientData, config);
      }

      fetchClients();
      resetForm();
      setShowModal(false);
      alert("Cliente guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar el cliente:", error.response ? error.response.data : error.message);
      alert(`Error al guardar el cliente: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const editClient = (client) => {
    setFormData({
      name: client.name,
      dpi: client.dpi,
      birthDate: client.birthDate,
      email: client.email,
      phone: client.phone,
      address: client.address
    });
    setEditing(true);
    setEditId(client.id);
    setShowModal(true);
  };

  const deleteClient = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://farmacia-backend.onrender.com/api/clients/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchClients();
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
    }
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dpi: '',
      birthDate: '',
      email: '',
      phone: '',
      address: ''
    });
    setImage(null);
    setEditing(false);
    setEditId(null);
  };

  return (
    <div style={styles.clientsContainer}>
      <h2 style={styles.heading}>Gestión de Clientes</h2>
      <button onClick={openModal} style={styles.addButton}>Agregar Cliente</button>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.formTitle}>{editing ? "Actualizar Cliente" : "Agregar Cliente"}</h3>
            <form onSubmit={handleSubmit} style={styles.clientForm} encType="multipart/form-data">
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nombre" required style={styles.input} />
              <input type="text" name="dpi" value={formData.dpi} onChange={handleInputChange} placeholder="DPI" required style={styles.input} />
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} placeholder="Fecha de nacimiento" required style={styles.input} />
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Correo electrónico" required style={styles.input} />
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Teléfono" style={styles.input} />
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Dirección" style={styles.input} />
              <input type="file" name="image" onChange={handleImageChange} style={styles.input} />
              <button type="submit" style={styles.submitButton}>{editing ? "Actualizar" : "Agregar"}</button>
              <button onClick={closeModal} type="button" style={styles.cancelButton}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <table style={styles.clientsTable}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Nombre</th>
            <th style={styles.tableHeader}>DPI</th>
            <th style={styles.tableHeader}>Fecha de Nacimiento</th>
            <th style={styles.tableHeader}>Correo</th>
            <th style={styles.tableHeader}>Teléfono</th>
            <th style={styles.tableHeader}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.length > 0 ? (
            clients.map(client => (
              <tr key={client.id}>
                <td style={styles.tableData}>{client.name}</td>
                <td style={styles.tableData}>{client.dpi}</td>
                <td style={styles.tableData}>{client.birthDate}</td>
                <td style={styles.tableData}>{client.email}</td>
                <td style={styles.tableData}>{client.phone}</td>
                <td style={styles.tableData}>
                  <button onClick={() => editClient(client)} style={styles.editButton}>Editar</button>
                  <button onClick={() => deleteClient(client.id)} style={styles.deleteButton}>Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={styles.noClients}>No hay clientes disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  clientsContainer: {
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
  clientForm: {
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
  clientsTable: {
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
  noClients: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
  },
};

export default Clients;
