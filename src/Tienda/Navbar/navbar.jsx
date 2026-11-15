import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BsCart2, BsPersonCircle, BsBoxArrowRight } from "react-icons/bs";
import { googleLogout } from '@react-oauth/google';
import Logo from '../../assets/logo.png';
import { obtenerUsuario } from '../../roles';
import './navbar.css';

function NavigationBar() {
  useLocation(); //hace que se vuelva a leer la sesion en cada cambio de pagina
  const usuario = obtenerUsuario();

  const cerrarSesion = () => {
    googleLogout();
    localStorage.removeItem('usuario');
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
            <>
              <Link
                to="/login"
                className="user-button"
                aria-label="Mi Cuenta"
                title="Mi Cuenta"
              >
                <BsPersonCircle size={21}/>
              </Link>

              <Link
                to="/login"
                className="user-button"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                onClick={cerrarSesion}
              >
                <BsBoxArrowRight size={21}/>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="user-button"
              aria-label="Iniciar sesión"
              title="Iniciar sesión"
            >
              <BsPersonCircle size={21}/>
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