import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './blog.css'

const url_blog = "http://localhost:8083/api/v1/blogs";
const url_imagen =  "http://localhost:8083/uploads/blogs/";

export default function Blog() {
  const location = useLocation();
  const esAdmin = location.pathname.includes('/admin');

  const [blogs, setBlogs] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modo, setModo] = useState('lista');
  const [blogEditable, setBlogEditable] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagen, setImagen] = useState(null);

  const [tituloEditado, setTituloEditado] = useState('');
  const [contenidoEditado, setContenidoEditado] = useState('');

  const limpiarFormulario = () => {
    setBlogEditable(null);
    setTitulo('');
    setContenido('');
    setImagen(null);
    setModo('lista');
  }
  
  /*------------BUSCAR BLOGS------------*/
  useEffect(() => {
    const cargarBlogs = async () => {
      try {
        const res = await fetch(url_blog);
        if (res.ok) {
          setBlogs(await res.json());
        }
      } catch (e) {
        console.error('Error al conectar con el servidor:', e);
      } finally {
        setCargando(false);
      }
    };
    cargarBlogs();
  }, []);

  /*------------CREAR BLOGS------------*/
  const controlCrear = async (e) => {
    e.preventDefault();
    if (!imagen) return alert("Por favor, selecciona una imagen.");

    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('contenido', contenido);
      formData.append('imagen', imagen);

      const res = await fetch(`${url_blog}/guardar`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const creado = await res.json();
        setBlogs([...blogs, creado]);
        alert('¡Blog creado con éxito!');
        limpiarFormulario();
      } else {
        alert('No se pudo crear el blog');
      }

    } catch (err) {
      console.error('Error al crear el blog', err);
    }
  };

  /*------------ACTUALIZAR BLOGS------------*/
  const activarEdicion = (blog) => {
    setBlogEditable(blog);
    setTituloEditado(blog.titulo);
    setContenidoEditado(blog.contenido);
    setImagen(null);
    setModo('editar');
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', tituloEditado);
      formData.append('contenido', contenidoEditado);
      if(imagen){
        formData.append('imagen', imagen);
      }

      const res = await fetch(`${url_blog}/actualizar/${blogEditable.codigo}`, {
        method: 'PUT',
        body: formData,
      });

      if(res.ok){
        const actualizado = await res.json();
        setBlogs(blogs.map((b) => (b.codigo === actualizado.codigo ? actualizado : b)));
        alert('Blog actualizado con éxito');
        limpiarFormulario();
      }else{
        alert('No se pudo actualizar el blog');
      }
    } catch (error) {
      console.log('Ha ocurrido un error actualizando el blog', error);
    }
  };

  /*------------ELIMINAR BLOGS------------*/
  const controlELiminar = async (codigo) =>{
    if(!window.confirm('¿estás seguro que quieres eliminar el blog?')) return;

    try{
      const res = await fetch(`${url_blog}/eliminar/${codigo}`, {
        method: 'DELETE',
      });

      if(red.ok){
        alert("El blog ha sido eliminado");
        setBlogs(blogs.filter((b) => b.codigo !== codigo));
      }else{
        alert(data.error || "No se pudo eliminar el blog")
      }
    }catch(error){
      console.log("Error al eliminar el blog", error)
    }
  }

  if (cargando) {
    return <div style={{ padding: '20px' }}>Cargando blogs...</div>;
  }

  if ((modo === 'crear' || modo === 'editar') && esAdmin) {
    return (
      <div className="creacion-blog">
        <h3>{modo === 'crear' ? 'Creación de blog' : `Editando: ${blogEditable?.codigo}`}</h3>

        <form onSubmit={modo === 'crear' ? controlCrear : guardarCambios}>
          <div style={{ marginBottom: '15px' }}>
            <label>Título:</label>
            <input type="text" value={modo === 'crear' ? titulo : tituloEditado} onChange={e => modo === 'crear' ? setTitulo(e.target.value) : setTituloEditado(e.target.value)} style={{ width: '100%', padding: '8px', color: '#000' }} required />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Contenido:</label>
            <textarea 
              value={modo === 'crear' ? contenido : contenidoEditado} 
              onChange={e => modo === 'crear' ? setContenido(e.target.value) : setContenidoEditado(e.target.value)} 
              rows="5" 
              style={{ width: '100%', padding: '8px', color: '#000' }}
              required 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Imagen:</label>
            <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} 
              style={{ width: '100%' }} required={modo === 'crear'} />
          </div>

          <Button type="submit" variant={modo === 'crear' ? 'primary' : 'success'} style={{ marginRight: '10px' }}>
            {modo === 'crear' ? 'Publicar' : 'Guardar Cambios'}
          </Button>

          <Button type="button" variant="secondary" onClick={() => {
            setBlogEditable(null);
            setModo('lista');
            setTitulo('');
            setContenido('');
            setImagen(null);
          }}>
            Cancelar
          </Button>

        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="button-crear-blog">
        <h2 className="titulo-pagina">Blogs</h2>
        {esAdmin &&(
          <Button variant="primary" onClick={() => setModo('crear')}>
            Crear Blog
          </Button>
        )}
      </div>

      {blogs.length === 0 ? (
        <div>No hay blogs, ¡Escribe uno!</div>
      ) : (
        <div>
          {blogs.map((blog) => (
            <div key={blog.codigo}>
              <Link to={`/blogs/${blog.codigo}`}>
              <Card className="estructura-blogs-inicio" >
                <Card.Img src={`${url_imagen}${blog.imagen}`} className="tamano-imagen-blog"/>
                <div>
                  <Card.Title className="titulo-blog">{blog.titulo}</Card.Title>
                </div>
              </Card>
              </Link>

              {esAdmin &&(
                    <div className="separacion-botones-admin">
                      <Button variant="warning" onClick={() => activarEdicion(blog)}>
                        Editar
                      </Button>
                    
                      <Button variant="danger" onClick={() => controlELiminar(blog.codigo)}>
                        Eliminar
                      </Button>
                    </div>
                  )} 
            </div>
          ))}
        </div>
      )}
    </div> 
  );
} 