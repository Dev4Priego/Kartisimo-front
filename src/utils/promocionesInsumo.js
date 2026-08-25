const idValido = (valor) => {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : 0;
};

const esPromocionVuelo = (item) =>
  Boolean(item?.esAlVuelo || item?.isVuelo || item?.promo?.esAlVuelo);

export const obtenerIdsPromocionInsumo = (item = {}) => {
  let idPromocionVuelo = idValido(item.idPromocionVuelo);
  let idPromocion = idValido(item.idPromocion);
  const idSeleccionado = idValido(item.idPromocionSeleccionada);

  if (!idPromocionVuelo && idSeleccionado && esPromocionVuelo(item)) {
    idPromocionVuelo = idSeleccionado;
  }

  if (idPromocionVuelo) {
    idPromocion = 0;
  } else if (!idPromocion && idSeleccionado) {
    idPromocion = idSeleccionado;
  }

  return {
    idPromocion,
    idPromocionVuelo,
    idPromocionSeleccionada: idPromocionVuelo || idPromocion,
    esAlVuelo: Boolean(idPromocionVuelo),
  };
};

export const normalizarPromocionInsumo = (item) => {
  if (!item) return item;

  const ids = obtenerIdsPromocionInsumo(item);
  Object.assign(item, ids, { isVuelo: ids.esAlVuelo });

  if (item.promo && ids.idPromocionSeleccionada) {
    item.promo = {
      ...item.promo,
      idPromocion: ids.idPromocionSeleccionada,
      esAlVuelo: ids.esAlVuelo,
    };
  }

  return item;
};

export const resolverPromocionInsumo = (item = {}) => {
  const ids = obtenerIdsPromocionInsumo(item);
  const idPromocion = ids.idPromocionSeleccionada;
  if (!idPromocion) return null;

  const promociones = [
    ...(item.promosAplicables || []),
    ...(item.promosDisponibles || []),
  ];
  const encontrada = promociones.find(
    (promocion) =>
      idValido(promocion.idPromocion) === idPromocion &&
      Boolean(promocion.esAlVuelo) === ids.esAlVuelo,
  );
  if (encontrada) {
    return {
      ...encontrada,
      idPromocion,
      esAlVuelo: ids.esAlVuelo,
    };
  }

  if (item.promo && idValido(item.promo.idPromocion) === idPromocion) {
    return {
      ...item.promo,
      idPromocion,
      esAlVuelo: ids.esAlVuelo,
    };
  }

  const valor = ids.esAlVuelo
    ? item.valorPromocionVuelo ?? item.valorVuelo
    : item.valorPromocion;
  const tipo = ids.esAlVuelo
    ? item.tipoPromocionVuelo ?? item.tipoVuelo
    : item.tipoPromocion;
  const nombre = ids.esAlVuelo
    ? item.nombrePromocionVuelo ?? item.nombreVuelo
    : item.nombrePromocion;

  return {
    idPromocion,
    valor: Number(valor) || 0,
    tipo: Boolean(tipo),
    nombre: nombre || "Promoción aplicada",
    esAlVuelo: ids.esAlVuelo,
  };
};

export const limpiarPromocionInsumo = (item) => {
  if (!item) return item;
  Object.assign(item, {
    idPromocion: 0,
    idPromocionVuelo: 0,
    idPromocionSeleccionada: 0,
    esAlVuelo: false,
    isVuelo: false,
    promo: null,
    nombrePromocion: null,
    valorPromocion: null,
    tipoPromocion: null,
    nombrePromocionVuelo: null,
    valorPromocionVuelo: null,
    tipoPromocionVuelo: null,
    nombreVuelo: null,
    valorVuelo: null,
    tipoVuelo: null,
  });
  return item;
};

export const mapearPromocionInsumo = (item) => {
  const ids = obtenerIdsPromocionInsumo(item);
  return {
    ...ids,
    isVuelo: ids.esAlVuelo,
    promo: resolverPromocionInsumo(item),
  };
};
