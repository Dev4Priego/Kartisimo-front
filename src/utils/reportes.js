export const ID_SUCURSAL_ADMINISTRADORA = 1;

export const obtenerAlcanceReportes = () => {
  let sesion = {};

  try {
    sesion = JSON.parse(localStorage.getItem("userSession") || "{}");
  } catch {
    sesion = {};
  }

  const idSucursal = Number(sesion?.usuario?.idSucursal || 0);

  return {
    idSucursal,
    esAdministrador: idSucursal === ID_SUCURSAL_ADMINISTRADORA,
  };
};

export const limitarSucursalesAlUsuario = (sucursales, alcance) => {
  const lista = Array.isArray(sucursales) ? sucursales : [];
  if (alcance.esAdministrador) return lista;

  return lista.filter(
    (sucursal) => Number(sucursal.idSucursal) === alcance.idSucursal,
  );
};
