import { useState, useEffect, useRef } from "react";
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { BsFileEarmarkPdf, BsSearch } from "react-icons/bs";
import html2pdf from 'html2pdf.js';

//headers con el token de la sesion
const obtenerHeaders = () => {
  try {
    const token = JSON.parse(localStorage.getItem('usuario'))?.token;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export default function Ordenes() {
  const [compras, setCompras] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroUsuarioId, setFiltroUsuarioId] = useState('');
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const boletaRef = useRef(null);

  useEffect(() => {
    cargarCompras();
    cargarUsuarios();
  }, []);

  const cargarCompras = async () => {
    try {
      const res = await fetch('/api/compras', { headers: obtenerHeaders() });
      if (!res.ok) {
       console.error("Error al cargar compras:", res.status);
       return;
      }
      const data = await res.json();
      setCompras(Array.isArray(data) ? data : (data.compras ?? []));
    } catch (error) {
      console.error("Error al cargar compras:", error);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await fetch('/api/usuarios', { headers: obtenerHeaders() });
      if(!res.ok) {
        console.error("Error al cargar usuarios:", res.status);
        return;
      }
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : (data.usuarios ?? []));
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const comprasFiltradas = filtroUsuarioId 
    ? compras.filter(c => String(c.usuarioId) === String(filtroUsuarioId))
    : compras;

  const formatearFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleString('es-CL')  : '';

  const descargarBoletaPDF = (compra) => {
    setCompraSeleccionada(compra);
    
    setTimeout(() => {
      const elemento = boletaRef.current;
      if (!elemento) return;
      const opciones = {
        margin: 10,
        filename: `boleta_admin_${compra.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      html2pdf().set(opciones).from(elemento).save();
    }, 500);
  };

  return (
    <main className="container my-4">
      <div className="wireframe-box p-4 mb-5 tabla_historial rounded shadow-sm">
        <h2 className="titulo mb-4">Ordenes</h2>

        {/*historial compras*/}
        <Card className="mb-4 tabla_historial">
          <Card.Header className="d-flex justify-content-between align-items-center bg-dark text-white">
            <strong>Historial de Ordenes</strong>
            <div className="d-flex align-items-center gap-2" style={{ width: '320px' }}>
              <BsSearch className="text-white" />
              <Form.Select 
                size="sm" 
                value={filtroUsuarioId} 
                onChange={(e) => setFiltroUsuarioId(e.target.value)}
              >
                <option value="">Filtrar por usuario (Todos)</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} {u.apellido} ({u.correo})
                  </option>
                ))}
              </Form.Select>
            </div>
          </Card.Header>
          <Card.Body>
            <Table className="table-bordered tabla_historial" responsive>
              <thead>
                <tr>
                  <th>N° Orden</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Correo</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {comprasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center titulo">No se encontraron ordenes.</td>
                  </tr>
                ) : (
                  comprasFiltradas.map(compra => (
                    <tr key={compra.id}>
                      <td>#{compra.id}</td>
                      <td>{formatearFecha(compra.fecha)}</td>
                      <td>{compra.nombre} {compra.apellido}</td>
                      <td>{compra.correo}</td>
                      <td>${Number(compra.total).toLocaleString('es-CL')}</td>
                      <td>
                        <Button 
                          className="botonPDF"
                          size="sm" 
                          onClick={() => descargarBoletaPDF(compra)}
                        >
                          <BsFileEarmarkPdf className="me-1" /> Descargar Boleta
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/*contenedor que general la boleta en PDF */}
        <div style={{ display: 'none' }}>
          {compraSeleccionada && (
            <div ref={boletaRef} className="p-4 bg-white text-dark" style={{ width: '600px' }}>
              <h3 className="text-success mb-3">Boleta Electrónica - Nro #{compraSeleccionada.id}</h3>
              <p><strong>Fecha:</strong> {formatearFecha(compraSeleccionada.fecha)}</p>
              <hr />
              <h5>Datos del Cliente</h5>
              <p><strong>Nombre:</strong> {compraSeleccionada.nombre} {compraSeleccionada.apellido}</p>
              <p><strong>Correo:</strong> {compraSeleccionada.correo}</p>
              <p><strong>Teléfono:</strong> {compraSeleccionada.telefono}</p>
              <hr />
              <h5>Dirección de Envío</h5>
              <p><strong>Calle:</strong> {compraSeleccionada.calle} {compraSeleccionada.depo ? `, Dpto: ${compraSeleccionada.depo}` : ''}</p>
              <p><strong>Comuna / Región:</strong> {compraSeleccionada.comuna}, {compraSeleccionada.region}</p>
              {compraSeleccionada.indicacion && <p><strong>Indicaciones:</strong> {compraSeleccionada.indicacion}</p>}
              <hr />

              <h5>Detalle del Pedido</h5>
              <table style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Producto</th>
                    <th style={{ textAlign: 'right' }}>Precio</th>
                    <th style={{ textAlign: 'right' }}>Cant.</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(compraSeleccionada.detalles ?? []).map((item, i) => {
                    const precio = item.producto?.precio ?? 0;
                    return (
                      <tr key={i}>
                        <td>{item.producto?.nombre}</td>
                        <td style={{ textAlign: 'right' }}>${precio.toLocaleString('es-CL')}</td>
                        <td style={{ textAlign: 'right' }}>{item.cantidad}</td>
                        <td style={{ textAlign: 'right' }}>${(precio * item.cantidad).toLocaleString('es-CL')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <h4 className="text-end mt-4">Total Pagado: ${Number(compraSeleccionada.total).toLocaleString('es-CL')}</h4>
            </div>
          )}
        </div>

      </div>
    </main>
)};