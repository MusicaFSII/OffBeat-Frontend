import React, { useState, useEffect } from 'react';
import './registroProductos.css';

const FORM_VACIO = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: 0,
  codigoCategoria: '',
  imagenUrl: '',
  enOferta: '',
  porcOferta: ''
};

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [codigo, setCodigo] = useState(null); 
  const [form, setForm] = useState(FORM_VACIO);

  const url_producto = 'http://localhost:8081/api/v1/productos';
  const url_categoria = 'http://localhost:8081/api/v1/categorias';

  const cargarProductos = async () => {
    try {
      const resProducto = await fetch(url_producto);
      if (!resProducto.ok) throw new Error('Error al obtener los productos');
      const dataProducto = await resProducto.json();
      setProductos(Array.isArray(dataProducto) ? dataProducto : []);
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const resCategoria = await fetch(url_categoria);
      if (!resCategoria.ok) throw new Error('Error al obtener categorías');
      const dataCategoria = await resCategoria.json();
      setCategorias(Array.isArray(dataCategoria) ? dataCategoria : []);
    } catch (error) {
      console.error('Error al obtener categorías', error);
    }
  };

  useEffect(() => {
    const cargarTodo = async () => {
      await Promise.all([cargarProductos(), cargarCategorias()]);
      setCargando(false);
    };
    cargarTodo();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const abrirAgregar = () => {
    setCodigo(null);
    setForm(FORM_VACIO);
    document.getElementById('cuadro-ingreso-productos').showModal();
  };

  const prepararEdicion = (prod) => {
    setCodigo(prod.codigo); 
    setForm({
      nombre: prod.nombre || '',
      descripcion: prod.descripcion || '',
      precio: prod.precio ?? '',
      stock: prod.stock ?? 0,
      codigoCategoria: prod.codigoCategoria || '',
      imagenUrl: prod.imagenUrl || '',
      enOferta: prod.enOferta ? 'SÍ' : 'NO',
      porcOferta: prod.porcOferta ?? ''
    });
    document.getElementById('cuadro-ingreso-productos').showModal();
  };

  const limpiarFormulario = () => {
    setCodigo(null);
    setForm(FORM_VACIO);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const editando = codigo !== null;
    const url = editando
      ? `${url_producto}/actualizar/${encodeURIComponent(codigo)}`
      : `${url_producto}/guardar`;

    const enOferta = form.enOferta === 'SÍ';

    try {
      const response = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: parseFloat(form.precio),
          stock: parseInt(form.stock, 10) || 0,
          imagenUrl: form.imagenUrl,
          enOferta: enOferta,
          porcOferta: enOferta ? parseInt(form.porcOferta, 10) || 0 : 0,
          codigoCategoria: form.codigoCategoria
        }),
      });

      if (response.ok) {
        alert(editando ? 'Producto actualizado' : 'Producto agregado');
        cargarProductos();
        document.getElementById('cuadro-ingreso-productos').close();
      } else if (response.status === 404) {
        alert('El producto o la categoría no existe');
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error en la petición: ', error);
      alert('No se pudo conectar con el servidor');
    }
  };

  const handleEliminar = async (prod) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar el producto "${prod.nombre}"?`);
    if (!confirmar) return;

    try {
      const response = await fetch(
        `${url_producto}/eliminar/${encodeURIComponent(prod.codigo)}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        alert('Producto eliminado correctamente');
        cargarProductos();
      } else if (response.status === 404) {
        alert('El producto no existe');
      } else {
        alert('Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Hubo un error tratando de eliminar el producto', error);
      alert('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="container-fluid flex-grow-1 p-0">
      <div className="row m-0 min-vh-80">
        <div className="p-4">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Código</th>
                <th scope="col">Nombre</th>
                <th scope="col">Descripción</th>
                <th scope="col">Categoría</th>
                <th scope="col">Stock</th>
                <th scope="col">Precio</th>
                <th scope="col">Imagen</th>
                <th scope="col">¿en oferta?</th>
                <th scope="col">%</th>
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody id="table-products">
              {cargando ? (
                <tr>
                  <td colSpan="12" className="text-center">Cargando productos...</td>
                </tr>
              ) : productos.length > 0 ? (
                productos.map((prod, index) => (
                  <tr key={prod.codigo}>
                    <th scope="row">{index + 1}</th>
                    <td>{prod.codigo}</td>
                    <td>{prod.nombre}</td>
                    <td>{prod.descripcion}</td>
                    <td>{prod.nombreCategoria}</td>
                    <td>{prod.stock}</td>
                    <td>${prod.precio}</td>
                    <td>
                      {prod.imagenUrl ? (
                        <img src={prod.imagenUrl} alt={prod.nombre} width="50" height="50" style={{ objectFit: 'cover' }} />
                      ) : (
                        'Sin imagen'
                      )}
                    </td>
                    <td>{prod.enOferta ? 'SÍ' : 'NO'}</td>
                    <td>{prod.porcOferta}</td>
                    <td>
                      <button className="btn button-editar-producto" onClick={() => prepararEdicion(prod)}>
                        Editar
                      </button>
                    </td>
                    <td>
                      <button className="btn button-eliminar-producto" onClick={() => handleEliminar(prod)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center">No hay productos registrados</td>
                </tr>
              )}
            </tbody>
          </table>

          <button className="btn btn-success button-nuevo-producto" id="ventana-ingreso-productos" onClick={abrirAgregar}>
            Agregar producto
          </button>

          <dialog id="cuadro-ingreso-productos" onClose={limpiarFormulario}>
            <form className="cuadro-registro" id="forma-ingreso-productos" onSubmit={handleSubmit}>
              <h3>{codigo ? 'EDITAR PRODUCTO' : 'INGRESO DE PRODUCTOS'}</h3>

              <label htmlFor="nombre">Nombre: </label>
              <input type="text" id="nombre" value={form.nombre} onChange={handleChange} required />

              <label htmlFor="descripcion">Descripción: </label>
              <input type="text" id="descripcion" value={form.descripcion} onChange={handleChange} required />

              <label htmlFor="precio">Precio: </label>
              <input type="number" id="precio" min="0" step="any" value={form.precio} onChange={handleChange} required />

              <label htmlFor="stock">Stock: </label>
              <input type="number" id="stock" min="0" value={form.stock} onChange={handleChange} required />

              <label htmlFor="codigoCategoria">Categoría: </label>
              <select id="codigoCategoria" value={form.codigoCategoria} onChange={handleChange} required>
                <option value="">Seleccione la categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.codigo} value={cat.codigo}>{cat.nombre}</option>
                ))}
              </select>

              <label htmlFor="imagenUrl">Imagen (URL): </label>
              <input type="text" id="imagenUrl" value={form.imagenUrl} onChange={handleChange} />

              <label htmlFor="enOferta">¿en oferta?: </label>
              <select id="enOferta" value={form.enOferta} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                <option value="SÍ">SÍ</option>
                <option value="NO">NO</option>
              </select>

              {form.enOferta === 'SÍ' && (
                <>
                  <label htmlFor="porcOferta">% oferta: </label>
                  <input type="number" id="porcOferta" min="0" max="100" value={form.porcOferta} onChange={handleChange} />
                </>
              )}

              <div style={{ marginTop: '50px' }}>
                <button type="submit" className="btn button-editar-producto">
                  {codigo ? 'Actualizar' : 'Aceptar'}
                </button>
                <button
                  type="button"
                  className="btn button-eliminar-producto"
                  id="btn-cerrar-cuadro"
                  onClick={() => document.getElementById('cuadro-ingreso-productos').close()}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </dialog>
        </div>
      </div>
    </div>
  );
}