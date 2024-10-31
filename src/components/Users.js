import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    userType: '',
    dpi: ''
  });
  const [image, setImage] = useState(null); // Estado para la imagen de perfil
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token'); // Obtén el token de autenticación
    try {
      const response = await axios.get('https://farmacia-backend.onrender.com/api/users', {
        headers: { 'Authorization': `Bearer ${token}` } // Incluye el token en el encabezado
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error.response ? error.response.data.message : error.message);
      alert(`Error al obtener usuarios: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Guarda la imagen seleccionada
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = new FormData();
    userData.append('username', formData.username);
    userData.append('password', formData.password);
    userData.append('role', formData.role);
    userData.append('userType', formData.userType);
    userData.append('dpi', formData.dpi);
    if (image) userData.append('image', image); // Agrega la imagen solo si está presente

    const token = localStorage.getItem('token'); // Obtén el token de localStorage

    try {
      let response;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Incluye el token en el encabezado
        }
      };
      if (editing) {
        response = await axios.put(`https://farmacia-backend.onrender.com/api/users/${editId}`, userData, config);
      } else {
        response = await axios.post('https://farmacia-backend.onrender.com/api/users/register', userData, config);
      }
      console.log("Respuesta del servidor:", response.data);

      fetchUsers();
      setFormData({
        username: '',
        password: '',
        role: '',
        userType: '',
        dpi: ''
      });
      setImage(null); // Resetea la imagen
      setShowModal(false);
      alert("Usuario guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar el usuario:", error.response ? error.response.data.message : error.message);
      alert(`Error al guardar el usuario: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const editUser = (user) => {
    setFormData({
      username: user.username,
      password: '', // No se llena por razones de seguridad
      role: user.role,
      userType: user.userType,
      dpi: user.dpi
    });
    setEditing(true);
    setEditId(user.id);
    setShowModal(true);
  };

  const deleteUser = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://farmacia-backend.onrender.com/api/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  };

  const openModal = () => {
    setFormData({
      username: '',
      password: '',
      role: '',
      userType: '',
      dpi: ''
    });
    setImage(null);
    setEditing(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div style={styles.usersContainer}>
      <h2 style={styles.heading}>Gestión de Usuarios</h2>
      <button onClick={openModal} style={styles.addButton}>Agregar Usuario</button>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.formTitle}>{editing ? "Actualizar Usuario" : "Agregar Usuario"}</h3>
            <form onSubmit={handleSubmit} style={styles.userForm} encType="multipart/form-data">
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Nombre de usuario" required style={styles.input} />
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Contraseña" required={!editing} style={styles.input} />
              <select name="role" value={formData.role} onChange={handleInputChange} required style={styles.input}>
                <option value="" disabled>Selecciona un Rol</option>
                <option value="administrador">Administrador</option>
                <option value="vendedor">Vendedor</option>
                <option value="cliente">Cliente</option>
              </select>
              <select name="userType" value={formData.userType} onChange={handleInputChange} required style={styles.input}>
                <option value="" disabled>Selecciona Tipo de Usuario</option>
                <option value="trabajador">Trabajador</option>
                <option value="cliente">Cliente</option>
              </select>
              <input type="text" name="dpi" value={formData.dpi} onChange={handleInputChange} placeholder="DPI" required style={styles.input} />
              <input type="file" name="image" onChange={handleImageChange} style={styles.input} />
              <button type="submit" style={styles.submitButton}>{editing ? "Actualizar" : "Agregar"}</button>
              <button onClick={closeModal} type="button" style={styles.cancelButton}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <table style={styles.usersTable}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Nombre de Usuario</th>
            <th style={styles.tableHeader}>Rol</th>
            <th style={styles.tableHeader}>Tipo de Usuario</th>
            <th style={styles.tableHeader}>DPI</th>
            <th style={styles.tableHeader}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user.id}>
                <td style={styles.tableData}>{user.username}</td>
                <td style={styles.tableData}>{user.role}</td>
                <td style={styles.tableData}>{user.userType}</td>
                <td style={styles.tableData}>{user.dpi}</td>
                <td style={styles.tableData}>
                  <button onClick={() => editUser(user)} style={styles.editButton}>Editar</button>
                  <button onClick={() => deleteUser(user.id)} style={styles.deleteButton}>Eliminar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={styles.noUsers}>No hay usuarios disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  usersContainer: {
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
  userForm: {
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
  usersTable: {
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
  noUsers: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
  },
};

export default Users;
