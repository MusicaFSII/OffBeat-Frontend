import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CarritoContext } from '../Carrito/Carrito';
import Accordion from 'react-bootstrap/Accordion';
import './productos.css';

const url = 'http://localhost:8081/api/v1/productos'
const url_imagen = 'http://localhost:8081/uploads/productos/';

export default function DetalleProductos() {
  const { codigo } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const { agregarProducto } = useContext(CarritoContext);

  useEffect(() => {
    fetch(`${url}/${codigo}`)
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se pudo encontrar el producto');
        }
        return respuesta.json();
      })
      .then((data) => {
        setProducto(data);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, [codigo]);

  if (cargando) return <div className="text-center p-5">Cargando producto...</div>;
  if (error || !producto) return <div className="text-center p-5">{error || 'Producto no encontrado.'}</div>;
  
  const imagen = `${url_imagen}${producto.imagenUrl}`;
  const enOferta = producto.enOferta === true && producto.porcOferta > 0;
  const precioNeto = producto.precioFinal - producto.precioIva;
  
  const formatearPrecio = (valor) => {
    return valor ? new Intl.NumberFormat('es-CL').format(valor) : '0';
  };

  const agregarClick = () => {
    agregarProducto({
      id: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precioFinal,
      imagen: imagen
    });
  };

  return (
    <main className="container">
      <div className="container-presentacion">
        <div className="card-productos">
          {enOferta && (
            <span className="badge bg-danger">
              -{producto.porcOferta}%
            </span>
          )}
          <h1>{producto.nombre}</h1>
          <img src={imagen} className="card-productos-img" alt={producto.nombre || "producto-detalle"} />
        </div>

          <div className="card-precios-detalles">
            {enOferta &&(
              <div>
              <span>
                Precio normal: ${formatearPrecio(producto.precio)}
              </span>
            </div>
            )}
            <p>
              Precio neto: $<span id="precioProducto">{formatearPrecio(precioNeto)}</span>
            </p>
            <p>
              IVA (19%): $<span id="precioIVA">{formatearPrecio(producto.precioIva)}</span>
            </p>
            <p className='precio-total'>
              Precio TOTAL: $<span id="precioTotal">{formatearPrecio(producto.precioFinal)}</span>
            </p>

            <button type="button" className="btn btn-info btn-carrito button-agregar" onClick={agregarClick}>
              Agregar al carrito
            </button>
          </div>
      </div> 

      <Accordion className="acordeon-descripcion">
      <Accordion.Item eventKey="0">
        <Accordion.Header>Descripción</Accordion.Header>
        <Accordion.Body>
          {producto.descripcion}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
    </main>
  );
}