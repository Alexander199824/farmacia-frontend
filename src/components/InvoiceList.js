import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvoiceList = () => {
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`${baseURL}/invoices`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setInvoices(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [baseURL]);

  if (loading) return <p>Cargando facturas...</p>;
  if (error) return <p>Error al cargar las facturas: {error.message}</p>;

  return (
    <div style={styles.invoiceContainer}>
      <h2 style={styles.heading}>Lista de Facturas</h2>
      {invoices.length === 0 ? (
        <p>No hay facturas disponibles.</p>
      ) : (
        <table style={styles.invoiceTable}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>ID</th>
              <th style={styles.tableHeader}>Cliente</th>
              <th style={styles.tableHeader}>DPI del Vendedor</th>
              <th style={styles.tableHeader}>DPI del Cliente</th>
              <th style={styles.tableHeader}>Total</th>
              <th style={styles.tableHeader}>Método de Pago</th>
              <th style={styles.tableHeader}>Fecha</th>
              <th style={styles.tableHeader}>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td style={styles.tableData}>{invoice.id}</td>
                <td style={styles.tableData}>{invoice.clientId}</td>
                <td style={styles.tableData}>{invoice.sellerDPI}</td>
                <td style={styles.tableData}>{invoice.clientDPI}</td>
                <td style={styles.tableData}>Q{Number(invoice.totalAmount).toFixed(2)}</td>
                <td style={styles.tableData}>{invoice.paymentMethod}</td>
                <td style={styles.tableData}>{new Date(invoice.date).toLocaleDateString()}</td>
                <td style={styles.tableData}>
                  <button style={styles.detailButton} onClick={() => alert(`Detalles de la factura ${invoice.id}`)}>Ver Detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  invoiceContainer: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
  },
  invoiceTable: {
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
  detailButton: {
    padding: '5px 10px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default InvoiceList;