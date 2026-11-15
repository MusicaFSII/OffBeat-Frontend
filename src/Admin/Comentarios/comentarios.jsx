import { useState, useEffect } from "react";
import '../Usuarios/usuarios.css';

function Comentarios() {
  const [comentarios, setComentarios] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarComentarios = async () => {
      try {
        const response = await fetch('/api/comentarios');
        const data = await response.json();

        if (response.ok) {
          setComentarios(data);
        } else {
          setError(data.error || "No se pudieron obtener los comentarios");
        }
      } catch (err) {
        setError("Error al conectar con el servidor");
      }
    };

    cargarComentarios();
  }, []);

  return (
    <div className="container text-center">
      <h1 className="titulo">Comentarios</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && comentarios.length === 0 ? (
        <div className="alert alert-info">Aún no hay comentarios.</div>
      ) : (
        <table className="table table-bordered">
          <thead className="text-center tabla_usuarios">
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Apellido</th>
              <th scope="col">Correo</th>
              <th scope="col">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {comentarios.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.apellido}</td>
                <td>{c.correo}</td>
                <td className="text-start" style={{ whiteSpace: 'pre-wrap' }}>
                  {c.comentario}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Comentarios;