//lee el usuario guardado en la sesion (null si no hay)
export const obtenerUsuario = () => {
  try {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
};

//pagina de inicio de cada rol
export const rutaInicio = (rol) => {
  if (rol === 'admin') return '/dashboard';
  if (rol === 'vendedor') return '/productosA';
  return '/home';
};