import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import './blog.css'

const url_blog = "http://localhost:8083/api/v1/blogs";
const url_imagen = "http://localhost:8083/uploads/blogs/";

export default function detallesBlog() {
  const {codigo_blog} = useParams();
  console.log("codigo_blog:", codigo_blog);
  const [blog, setBlog] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarBlog = async () => {
      try {
        const res = await fetch(`${url_blog}/${codigo_blog}`);
        if(res.ok){
          setBlog(await res.json());
        }
      } catch (e) {
        console.error('Error al conectar con el servidor:', e);
      } finally {
        setCargando(false);
      }
    };

    cargarBlog();
  }, [codigo_blog]);

  if (cargando) {
    return <div>Cargando blogs...</div>;
  }

  if (!blog) {
    return <div>No se encontró el blog</div>;
  }

  return (
    <div>
      <div>
        <Card className="separacion-titulo-parrafo">
          <Card.Img src={`${url_imagen}${blog.imagen}`} className="tamano-imagen-blog-detalle" />
          <div className="contenido-texto-blog">
            <Card.Title className="titulo-blog-detalle">{blog.titulo}</Card.Title>
            <div className="parrafo-posicion-tamano">
              {blog.contenido}
            </div>
          </div>
        </Card>
      </div>
    </div> 
  );
}
