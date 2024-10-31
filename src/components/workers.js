import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    dpi: '',
    birthDate: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    userId: null,
  });
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get('https://farmacia-backend.onrender.com/api/workers');
      setWorkers(response.data);
    } catch (error) {
      console.error('Error al obtener trabajadores:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`https://farmacia-backend.onrender.com/api/workers/${editId}`, formData);
        setEditing(false);
        setEditId(null);
      } else {
        await axios.post('https://farmacia-backend.onrender.com/api/workers', formData);
      }
      fetchWorkers();
      setFormData({
        name: '',
        dpi: '',
        birthDate: '',
        email: '',
        phone: '',
        address: '',
        role: '',
        userId: null,
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar trabajador:', error);
    }
  };

  const editWorker = (worker) => {
    setFormData({
      name: worker.name,
      dpi: worker.dpi,
      birthDate: worker.birthDate,
      email: worker.email,
      phone: worker.phone,
      address: worker.address,
      role: worker.role,
      userId: worker.userId,
    });
    setEditing(true);
    setEditId(worker.id);
    setShowModal(true);
  };

  const deleteWorker = async (id) => {
    try {
      await axios.delete(`https://farmacia-backend.onrender.com/api/workers/${id}`);
      fetchWorkers();
    } catch (error) {
      console.error('Error al eliminar trabajador:', error);
    }
  };

  const openModal = () => {
    setFormData({
      name: '',
      dpi: '',
      birthDate: '',
      email: '',
      phone: '',
      address: '',
      role: '',
      userId: null,
    });
    setEditing(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div style={styles.workersContainer}>
      <h2 style={styles.heading}>Gestión de Trabajadores</h2>
      <button onClick={openModal} style={styles.addButton}>Agregar Trabajador</button>

      {/* Modal para Agregar y Editar Trabajadores */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.formTitle}>{editing ? "Actualizar Trabajador" : "Agregar Trabajador"}</h3>
            <form onSubmit={handleSubmit} style={styles.workerForm}>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nombre" required style={styles.input} />
              <input type="text" name="dpi" value={formData.dpi} onChange={handleInputChange} placeholder="DPI" required style={styles.input} />
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} required style={styles.input} />
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Correo Electrónico" required style={styles.input} />
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Teléfono" style={styles.input} />
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Dirección" style={styles.input} />
              
              {/* Lista Desplegable para Rol */}
              <select name="role" value={formData.role} onChange={handleInputChange} required style={styles.select}>
                <option value="" disabled>Selecciona un Rol</option>
                <option value="Administrador">Administrador</option>
                <option value="Vendedor">Vendedor</option>
              </select>
              
              <button type="submit" style={styles.submitButton}>{editing ? "Actualizar" : "Agregar"}</button>
              <button onClick={closeModal} type="button" style={styles.cancelButton}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <table style={styles.workersTable}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Nombre</th>
            <th style={styles.tableHeader}>DPI</th>
            <th style={styles.tableHeader}>Correo Electrónico</th>
            <th style={styles.tableHeader}>Teléfono</th>
            <th style={styles.tableHeader}>Rol</th>
            <th style={styles.tableHeader}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {workers.length > 0 ? (
            workers.map(worker => (
              <tr key={worker.id}>
                <td style={styles.tableData}>{worker.name}</td>
                <td style={styles.tableData}>{worker.dpi}</td>
                <td style={styles.tableData}>{worker.email}</td>
                <td style={styles.tableData}>{worker.phone}</td>
                <td style={styles.tableData}>{worker.role}</td>
                <td style={styles.tableData}>
                  <button onClick={() => editWorker(worker)} style={styles.editButton}>Editar</button>
                  <button onClick={() => deleteWorker(worker.id)} style={styles.deleteButton}>Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={styles.noWorkers}>No hay trabajadores disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  workersContainer: {
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
  workerForm: {
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
  select: {
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
  workersTable: {
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
  noWorkers: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
  },
};

export default Workers;
