import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './editar_usuario.css';

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    telefono: "",
    rol: "cliente",
    region: "selecciona",
    comuna: "",
  });

  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const response = await fetch(`http://localhost:8082/api/v1/usuarios/${id}`);
        const data = await response.json();
        if (response.ok) {
          setFormData(data);
        } else {
          setError(data.error ||"No se encontro el usuario");
        }
      } catch (err) {
        setError("Error al cargar datos del usuario");
      }
    };
    obtenerUsuario();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`http://localhost:8082/api/v1/usuarios/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          rut: formData.rut,
          correo: formData.correo,
          telefono: formData.telefono,
          region: formData.region,
          comuna: formData.comuna,
          rol: formData.rol,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(true);
      } else {
        setError(data.error || "Error al actualizar usuario");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    }
  };

  const CerrarModal = () => {
    setShowModal(false);
    navigate("/usuarios");
  };

  return (
    <div className="contenedor">
      <div className="contenedor_editarUsuario">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <h2>Editar Usuario</h2>

          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />

          <label>Apellido</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />

          <label >RUT</label>
          <input
            type="text"
            name="rut"
            value={formData.rut}
            onChange={handleChange}
            required
          />
   
          <label className="form-label">Correo</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
          />

          <label className="form-label">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
          />
          
          <label>Rol</label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
          >
            <option value="cliente">Cliente</option>
            <option value="admin">Admin</option>
            <option value="vendedor">Vendedor</option>
          </select>

          <div className="region-comuna">
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
          >
            <option value="selecciona">Seleccione la Región</option>
            <option value="metropolitana">Región Metropolitana</option>
            <option value="aisen">Aisén</option>
            <option value="antofagasta">Antofagasta</option>
            <option value="araucania">Araucanía</option>
            <option value="arica y parinacota">Arica y Parinacota</option>
            <option value="atacama">Atacama</option>
            <option value="biobio">Biobío</option>
            <option value="coquimbo">Coquimbo</option>
            <option value="libertador bernardo">
            Libertador General Bernardo O'Higgins
            </option>
            <option value="los lagos">Los Lagos</option>
            <option value="los rios">Los Ríos</option>
            <option value="magallanes">Magallanes</option>
            <option value="maule">Maule</option>
            <option value="ñuble">Ñuble</option>
            <option value="tarapaca">Tarapacá</option>
            <option value="valparaiso">Valparaíso</option>
          </select>

          <input
            type="text"
            name="comuna"
            value={formData.comuna}
            onChange={handleChange}
          />
        </div>

          <div className="acciones-botones">
            <button type="submit" className="btn-guardar">
              Actualizar
            </button>
            <Link to="/dashboard" className="btn-cancelar">
              Cancelar
            </Link>
          </div>
        </form>

        {/*modal*/}
        <Modal 
          show={showModal} 
          onHide={CerrarModal}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Exito</Modal.Title>
          </Modal.Header>

          <Modal.Body className="text-start">
            <p>
              Usuario actualizado con exito
            </p>
          </Modal.Body>

          <Modal.Footer>
            <Button className="btn_editar" onClick={CerrarModal}>
              Aceptar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default EditarUsuario;