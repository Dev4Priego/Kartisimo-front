export const normalizarPrecio = (valor) => {
  const precio = Number(valor);
  return Number.isFinite(precio) ? precio : 0;
};

export const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(normalizarPrecio(valor));

export const formatearTelefono = (telefono) => {
  if (!telefono) return "";
  const digitos = String(telefono).replace(/\D/g, "");
  if (digitos.length !== 10) return String(telefono);
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
};

export const formatearFechaCotizacion = (fecha) => {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const obtenerPromocionDetalle = (item = {}) => {
  if (item.idPromocion) {
    return {
      idPromocion: item.idPromocion,
      nombre: item.nombrePromocion,
      valor: item.valorPromocion,
      tipo: item.tipoPromocion,
      esAlVuelo: false,
    };
  }

  if (item.idPromocionVuelo) {
    return {
      idPromocion: item.idPromocionVuelo,
      nombre: item.nombrePromocionVuelo,
      valor: item.valorPromocionVuelo,
      tipo: item.tipoPromocionVuelo,
      esAlVuelo: true,
    };
  }

  return null;
};

export const aplicarDescuento = (totalBase, promocion) => {
  const total = normalizarPrecio(totalBase);
  if (!promocion || promocion.valor == null) return total;

  const valor = normalizarPrecio(promocion.valor);
  return promocion.tipo
    ? total * (1 - valor / 100)
    : Math.max(0, total - valor);
};

export const calcularTotalItem = (item, promocionGeneral = null) => {
  const totalBase =
    normalizarPrecio(item?.precioUnitario) *
    normalizarPrecio(item?.cantidad ?? 1);
  const promocion =
    item?.promo ||
    (!item?.excluirPromocionGeneral ? promocionGeneral : null);

  return aplicarDescuento(totalBase, promocion);
};

export const mapearResumenCotizacion = (cotizacion) => ({
  codigo: `C${cotizacion.prefijo}-${String(cotizacion.consecutivoSucursal)}`,
  idCotizacion: cotizacion.idCotizacion,
  sucursal: cotizacion.sucursal,
  fechaCreacion: formatearFechaCotizacion(cotizacion.fechaCreacion),
  cliente: {
    nombre: cotizacion.clienteNombre,
    telefono: cotizacion.telefono,
    correo: cotizacion.correo,
    observaciones: cotizacion.observaciones || "",
  },
  paquetes:
    cotizacion.nombresPaquetes === "Ninguno"
      ? []
      : String(cotizacion.nombresPaquetes || "")
          .split(", ")
          .filter(Boolean)
          .map((nombre) => ({ nombre })),
  llantasSelecionadas: [],
  serviciosAdicionales: [],
  total: cotizacion.total,
  estatus: cotizacion.estado,
  nombreLlanta: cotizacion.nombreLlanta,
  mostrarTotal: false,
});

const mapearPromocionPreview = (item, promocionGeneral) => {
  const promoIndividual = obtenerPromocionDetalle(item);
  const cantidad = normalizarPrecio(item.cantidad ?? 1);
  const precioUnitario = normalizarPrecio(item.precioUnitario);
  const promocion =
    promoIndividual ||
    (!item.excluirPromocionGeneral ? promocionGeneral : null);
  const total = aplicarDescuento(precioUnitario * cantidad, promocion);

  return {
    cantidad,
    precioUnitario,
    precioConPromo: cantidad ? total / cantidad : precioUnitario,
    total,
    promoLabel: item.excluirPromocionGeneral
      ? "(Excluido de promoción)"
      : promocion?.nombre || "",
  };
};

export const mapearDetallePreview = (data, resumen = {}) => {
  const promocionGeneral = data.idPromocionGeneral
    ? {
        idPromocion: data.idPromocionGeneral,
        nombre: data.nombrePromocionGeneral,
        valor: data.valorPromocionGeneral,
        tipo: data.tipoPromocionGeneral,
      }
    : null;

  const llantasSelecionadas = (data.llantas || []).map((llanta) => ({
    idLlanta: llanta.idLlanta,
    medidas: llanta.modeloMedidas,
    ubicacion: llanta.ubicacion,
    comentario: llanta.comentario || "",
    ...mapearPromocionPreview(llanta, promocionGeneral),
  }));

  const paquetes = (data.paquetes || []).map((paquete) => ({
    idPaquete: paquete.idPaquete,
    nombre: paquete.nombre,
    descripcion: paquete.descripcion,
    comentario: paquete.comentario || "",
    ...mapearPromocionPreview(paquete, promocionGeneral),
  }));

  const serviciosAdicionales = (data.servicios || []).map((servicio) => ({
    nombreServicio: servicio.descripcion,
    observacion: servicio.observacion,
    comentario: servicio.comentario || "",
    ...mapearPromocionPreview(servicio, promocionGeneral),
  }));

  const partidas = [
    ...llantasSelecionadas,
    ...paquetes,
    ...serviciosAdicionales,
  ];
  const totalBase = partidas.reduce(
    (total, item) => total + item.precioUnitario * item.cantidad,
    0,
  );
  const total = partidas.reduce(
    (acumulado, item) => acumulado + normalizarPrecio(item.total),
    0,
  );

  return {
    codigo: `${data.prefijo}-${data.consecutivoSucursal}`,
    idCotizacion: data.idCotizacion,
    fechaCreacion: formatearFechaCotizacion(data.fechaCreacion),
    creadoPor: data.idCreador,
    cliente: {
      nombre: data.clienteNombre,
      telefono: data.telefono || "",
      correo: data.correo || "",
      fecha: data.fechaCreacion,
      observaciones: data.observaciones || "",
    },
    llantasSelecionadas,
    paquetes,
    serviciosAdicionales,
    total,
    totalBase,
    tienePromocion: total !== totalBase,
    nombrePromocionGeneral: data.nombrePromocionGeneral,
    valorPromocionGeneral: data.valorPromocionGeneral,
    tipoPromocionGeneral: data.tipoPromocionGeneral,
    estatus: resumen.estatus || data.estado || "Activa",
    mostrarTotal: data.mostrarTotal,
    sucursal: data.sucursal,
    observaciones: data.observaciones,
  };
};
