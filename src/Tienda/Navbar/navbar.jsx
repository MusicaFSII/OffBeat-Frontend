import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BsCart2, BsPersonCircle, BsBoxArrowRight } from "react-icons/bs";
import { googleLogout } from '@react-oauth/google';
import Logo from '../../assets/logo.png';
import { obtenerUsuario } from '../../roles';
import './navbar.css';

function NavigationBar() {
  const location = useLocation(); //hace que se vuelva a leer la sesion en cada cambio de pagina
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(obtenerUsuario());

  useEffect(() => {
    setUsuario(obtenerUsuario());
  }, [location]);

  const cerrarSesion = () => {
    googleLogout();
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/home');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src={Logo} alt="Offbeat" />
          </Link>

          <div className="navbar-links">
            <NavLink to="/home">Home</NavLink>
            <NavLink to="/producto">Productos</NavLink>
            <NavLink to="/ofertas">Ofertas</NavLink>
            <NavLink to="/nosotros">Nosotros</NavLink>
            <NavLink to="/blogs">Blog</NavLink>
            <NavLink to="/contacto">Contacto</NavLink>
            {usuario?.rol === 'admin' && (
              <NavLink to="/dashboard">Administración</NavLink>
            )}
          </div>
        </div>

        <div className="navbar-actions">
          {usuario ? (
            <div className="user-logged-container">
              <Link
                to="/login"
                className="user-profile-link"
                title="Mi Cuenta"
              >
                <BsPersonCircle size={20} />
                <span>{usuario.nombre ? `Hola, ${usuario.nombre}` : "Mi Cuenta"}</span>
              </Link>

              <button
                onClick={cerrarSesion}
                className="logout-button"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <BsBoxArrowRight size={20} />
                <span className="logout-text">Salir</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="login-action-button"
              aria-label="Iniciar sesión"
              title="Iniciar sesión"
            >
              <BsPersonCircle size={20} />
              <span>Iniciar Sesión</span>
            </Link>
          )}

          <Link to="/carrito" className="cart-button">
            <BsCart2 size={19}/>
            <span>Carrito</span>
          </Link>
        </div>
      </nav>
      <Outlet/>  
    </>
  );
}

export default NavigationBar;