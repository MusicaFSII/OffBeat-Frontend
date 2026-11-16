import React, { useState, useEffect } from 'react';
import './registroProductos.css';

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    codigo: '', nombre: '', precio: '', imagenuRL: '', descripcion: '', stock: 0, categoria:'', enOferta:'', porcOferta:''
  });

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const resProducto = await fetch('http://localhost:8081/api/v1/productos');
        
        if(!resProducto.ok){
          throw new Error('Error al obtener los productos')
        }

        const dataProducto = await resProducto.json();
        setProductos(Array.isArray(dataProducto) ? dataProducto : []);

        const resCat = await fetch('http://localhost:8081/api/v1/categorias');
        
        if(!resCat.ok){
          throw new Error('Error al obtener las categorías')
        }
        
        const dataCategoria = await resCat.json();
        setCategorias(Array.isArray(dataCategoria) ? dataCategoria : []);

      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const prepararEdicion = (prod, cat) => {
    setEditando(true);
    setForm({
      nombre: prod.nombre || '',
      precio: prod.precio || '',
      imagen: prod.imagenUrl || '',
      descripcion: prod.descripcion || '',
      stock: prod.stock || 0,
      categoria: cat.nombreCategoria || '',
      en_oferta: prod.enOferta === true ? 'SÍ':'NO',
      porc_oferta: prod.porcOferta || ''
    });
    document.getElementById('cuadro-ingreso-productos').showModal();
  };

  const abrirParaAgregar = () => {
    setEditando(false); 
    setForm({nombre: '', precio: '', imagen: '', descripcion: '',
       stock: 0, categoria: '', enOferta:'', porcOferta:'' });
    document.getElementById('cuadro-ingreso-productos').showModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editando ? `/api/productos/${form.codigo}` : '/api/productos';
    const metodo = editando ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: form.nombre,
          precio: parseFloat(form.precio),
          imagen: form.imagen,
          descripcion: form.descripcion,
          stock: form.stock || 0,
          nombreCategoria: form.categoria,
          enOferta: form.enOferta,
          porcOferta: form.porcOferta || 0
        }),
      });

      const data = await response.json();
      if (data.ok) {
        alert(data.mensaje);
        const res = await fetch('/api/productos');
        const newData = await res.json();
        setProductos(newData.productos || []);
        
        document.getElementById('cuadro-ingreso-productos').close();
        setForm({ codigo: '', nombre: '', precio: '', imagenUrl: '', descripcion: '', stock: 0, categoria: '', enOferta:'', porcOferta:'' });
      } else {
        alert(data.error || 'Error al registrar producto');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    }
  };

  const handleEliminar = async(codigo, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar el producto "${nombre}"?`);

    if(!confirmar)return;

    try {
      const response = await fetch(`/api/productos/${codigo}`,{
        method: 'DELETE',
      });

      const data = await response.json();

      if(response.ok){
        alert(data.mensaje || 'Producto eliminado correctamente');
        const res = await fetch('/api/productos');
        const nuevosDatos = await res.json();
        setProductos(nuevosDatos.productos || []);
      }else{
          alert(data.error || 'Error al eliminar el producto');
      } 
    } catch (error) {
      console.error('Hubo un error tratando de eliminar el producto', error)
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
              <tbody id="table-products" >
                {cargando ? (
                  <tr>
                    <td span="5" className="text-center">Cargando productos...</td>
                  </tr>
                ) : productos.length > 0 ? (
                  productos.map((prod, index) => (
                    <tr key={prod.idProducto || index}>
                      <th scope="row">{index + 1}</th>
                      <td>{prod.codigo}</td>
                      <td>{prod.nombre}</td>
                      <td>{prod.descripcion}</td>
                      <td>{prod.nombreCategoria}</td>
                      <td>{prod.stock}</td>
                      <td>${prod.precio}</td>
                      <td>
                        {prod.imagenUrl ? (
                          <img src={prod.imagenUrl} alt={prod.nombre} width="50" height="50" style={{objectFit: 'cover'}} />
                        ) : (
                          'Sin imagen'
                        )}
                      </td>
                      <td>{prod.enOferta === true ? 'SÍ' : 'NO'}</td>
                      <td>{prod.porcOferta}</td>
                      <td><button className='btn button-editar-producto' onClick={()=> prepararEdicion(prod)}>Editar</button></td>
                      <td><button className='btn button-eliminar-producto' onClick={()=> handleEliminar(prod.codigo, prod.nombre)}>Eliminar</button></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No hay productos registrados</td>
                  </tr>
                )}
              </tbody>
            </table>

            <button className="btn btn-success button-nuevo-producto" id="ventana-ingreso-productos" onClick={() => document.getElementById('cuadro-ingreso-productos').showModal()}>
              Agregar producto
            </button>

            <dialog id="cuadro-ingreso-productos">
              <form className="cuadro-registro" id="forma-ingreso-productos" onSubmit={handleSubmit}>
                <h3>INGRESO DE PRODUCTOS</h3>

                <label htmlFor="nombre">Nombre: </label>
                <input type="text" id="nombre" value={form.nombre} onChange={handleChange} required />

                <label htmlFor="descripcion">Descripción: </label>
                <input type="text" id="descripcion" value={form.descripcion} onChange={handleChange} required />

                <label htmlFor="precio">Precio: </label>
                <input type="number" id="precio" value={form.precio} onChange={handleChange} required />
                
                <label htmlFor="stock">Stock: </label>
                <input type="number" id="stock" value={form.stock} onChange={handleChange} required />

                <label htmlFor="categoria">Categoría: </label>
                <select id="categoria" value={form.categoria} onChange={handleChange} required>
                  <option value="">Seleccione la categoria</option>
                  {categorias.map((cat)=>(
                    <option key={cat.idCategoria} value={cat.nombreCategoria}>{cat.nombreCategoria}</option>
                  ))}
                </select>
                  
                
                <label htmlFor="imagen">Imagen (URL): </label>
                <input type="text" id="imagen" value={form.imagen} onChange={handleChange} />

                <label htmlFor="en_oferta">¿en oferta?: </label>
                <select id="en_oferta" name="en_oferta" value={form.en_oferta} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  <option value="SÍ">SÍ</option>
                  <option value="NO">NO</option>
                </select>

                <label htmlFor="porc_oferta">% oferta: </label>
                <input type="number" id="porc_oferta" value={form.porc_oferta} onChange={handleChange}/>

                <div style={{ marginTop: '50px' }}>
                  <button type="submit" className="btn btn-info">Aceptar</button>
                  <button type="button" className="btn btn-danger" id="btn-cerrar-cuadro" onClick={() => document.getElementById('cuadro-ingreso-productos').close()}>
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