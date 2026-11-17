import React, { useState, useEffect } from 'react';
import './categoriaA.css';

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [codigo, setCodigo] = useState(null); 

  const url_categoria = 'http://localhost:8081/api/v1/categorias';

  const cargarCategorias = async () => {
    try {
      const resCat = await fetch(url_categoria);

      if (!resCat.ok) {
        throw new Error('Error al obtener las categorías');
      }

      const dataCategoria = await resCat.json();
      setCategorias(Array.isArray(dataCategoria) ? dataCategoria : []);
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const abrirCrear = () => {
    setCodigo(null);
    setNombreCategoria('');
    document.getElementById('cuadro-ingreso-categorias').showModal();
  };

  const abrirEditar = (cat) => {
    setCodigo(cat.codigo);
    setNombreCategoria(cat.nombre);
    document.getElementById('cuadro-ingreso-categorias').showModal();
  };

  const limpiarFormulario = () => {
    setCodigo(null);
    setNombreCategoria('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const editando = codigo !== null;
    const url = editando
      ? `${url_categoria}/actualizar/${encodeURIComponent(codigo)}`
      : `${url_categoria}/guardar`;

    try {
      const response = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nombreCategoria }),
      });

      if (response.ok) {
        alert(editando ? 'Categoría actualizada exitosamente' : 'Categoría agregada exitosamente');
        cargarCategorias();
        document.getElementById('cuadro-ingreso-categorias').close();
      } else if (response.status === 404) {
        alert('La categoría no existe');
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Error al guardar la categoría');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      alert('No se pudo conectar con el servidor');
    }
  };

  const handleEliminar = async(cat) => {
    const confirmado = window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)
    if(!confirmado) return;

    try {
      const response = await fetch(
        `${url_categoria}/eliminar/${encodeURIComponent(cat.codigo)}`,
        {method: 'DELETE'}
      );

      if (response.ok){
        alert('Categoría eliminada exitosamente');
        cargarCategorias();
      } else if (response.status === 404){
        alert('La categoría no existe');
      } else{
        alert('No se pudo eliminar la categoría');
      }
    } catch (error) {
      console.error('Error al eliminar categoría: ',error);
      alert('No se pudo conectar con el servidor');
    }
  }

  return (
    <div className="container-fluid flex-grow-1 p-0">
      <div className="row m-0 min-vh-100">

        <div className="col-10 col-sm-9 col-xl-10 p-4">
          <h2 className="mb-4">Categorías</h2>

          <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Código</th>
                <th scope="col">Nombre de la Categoría</th>
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="5" className="text-center">Cargando categorías...</td>
                </tr>
              ) : categorias.length > 0 ? (
                categorias.map((cat, index) => (
                  <tr key={cat.codigo}>
                    <th scope="row">{index + 1}</th>
                    <td>{cat.codigo}</td>
                    <td>{cat.nombre}</td>
                    <td><button className="btn button-editar-producto" onClick={() => abrirEditar(cat)}>Editar</button></td>
                    <td><button className="btn button-eliminar-producto" onClick={() => handleEliminar(cat)}>Eliminar</button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No hay categorías registradas</td>
                </tr>
              )}
            </tbody>
          </table>

          <button className="btn btn-success" onClick={abrirCrear}>
            Agregar categoría
          </button>

          <dialog id="cuadro-ingreso-categorias" onClose={limpiarFormulario}>
            <form className="cuadro-registro" onSubmit={handleSubmit}>
              <h3>{codigo ? 'Editar categoría' : 'Ingresar categoría'}</h3>

              <label htmlFor="nombre_categoria">Nombre: </label>
              <input
                type="text"
                id="nombre_categoria"
                value={nombreCategoria}
                onChange={(e) => setNombreCategoria(e.target.value)}
                required
              />

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-info">
                  {codigo ? 'Actualizar' : 'Agregar'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => document.getElementById('cuadro-ingreso-categorias').close()}
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