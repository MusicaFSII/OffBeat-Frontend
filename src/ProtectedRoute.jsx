import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { obtenerUsuario, rutaInicio } from './roles';

const ProtectedRoute = ({ allowedRoles, blockedRoles }) => {
  const usuario = obtenerUsuario();

  //rutas con roles permitidos
  if (allowedRoles) {
    if (!usuario) {
      return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(usuario.rol)) {
      return <Navigate to={rutaInicio(usuario.rol)} replace />;
    }
  }

  //rutas con roles bloqueados
  if (blockedRoles && usuario && blockedRoles.includes(usuario.rol)) {
    return <Navigate to={rutaInicio(usuario.rol)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;