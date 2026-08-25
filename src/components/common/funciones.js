import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { computed } from "vue";

export function formatearFecha(fecha) {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatearFechaHora(fecha) {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function mostrarToast(type, message) {
  const color =
    type === "success"
      ? "linear-gradient(to right, #00b09b, #96c93d)"
      : type === "warning"
      ? "linear-gradient(to right, #f5af19, #f12711)"
      : "linear-gradient(to right, #2193b0, #6dd5ed)";

  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: color,
      borderRadius: "6px",
      color: "white",
      fontSize: "14px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    },
  }).showToast();
}
export const AplicarPromo = (item) => {
  const base = (item.precioUnitario || 0) * (item.cantidad || 1);

  // Buscar el valor de promoción en diferentes formatos
  // Primero busca en el objeto promo (OrdenTrabajoEdit)
  let valor = null;
  let tipo = null;

  if (item.promo && item.promo.valor != null) {
    valor = item.promo.valor;
    tipo = item.promo.tipo;
  } else {
    // Buscar en los campos directos del backend (OrdenTrabajoPreview)
    valor = item.valorPromocion || item.valorVuelo || null;
    tipo = item.tipoPromocion || item.tipoVuelo || null;
  }

  // Si tiene promoción válida, aplicarla
  if (valor != null && valor > 0) {
    return tipo
      ? base * (1 - valor / 100)
      : Math.max(0, base - valor);
  }
  return base;
};

export const onCambioPromo = (item) => {
  // Funciona para los 3 servicios
  const idSel = item.idPromocionSeleccionada; // normal
  const idVuelo = item.idPromocionAlVuelo; // vuelo

  // Si no hay ninguna promoción
  if (!idSel && !idVuelo) {
    item.promo = null;
    item.precioConPromo = item.precioUnitario;
    item.isVuelo = null;
    item.idPromocionSeleccionada = 0;
    item.idPromocionAlVuelo = 0;
    item.promo = null;
    item.isVuelo = false;
    item.precioConPromo = item.precioUnitario;
    item.mostrarEditorPromo = false;
    return;
  }

  item.mostrarEditorPromo = false;

  // Buscamos la promoción correspondiente
  const promo = (item.promosAplicables || []).find(
    (p) => p.idPromocion === idSel || p.idPromocion === idVuelo,
  );

  item.promo = promo || null;
  item.isVuelo = !!idVuelo;

  // Calcular precio con la promo
  const base = item.precioUnitario * item.cantidad;
  if (promo) {
    item.precioConPromo = promo.tipo
      ? base * (1 - promo.valor / 100)
      : Math.max(0, base - promo.valor);
  } else {
    item.precioConPromo = base;
  }
};
export const onCambioPromoPaquete = (paquete) => {
  const idSel = paquete.idPromocionSeleccionada;

  if (!idSel) {
    paquete.promo = null;
    paquete.precioConPromo = paquete.precioUnitario;
    return;
  }

  const promo = paquete.promosAplicables.find((p) => p.idPromocion === idSel);
  paquete.promo = promo || null;

  const base = paquete.precioUnitario * paquete.cantidad;

  if (promo) {
    paquete.precioConPromo = promo.tipo
      ? base * (1 - promo.valor / 100)
      : Math.max(0, base - promo.valor);
  } else {
    paquete.precioConPromo = base;
  }
};

export const onCambioPromoServicio = (servicio) => {
  const idSel = servicio.idPromocionSeleccionada;

  if (!idSel) {
    servicio.promo = null;
    servicio.precioConPromo = servicio.precioUnitario;
    return;
  }

  const promo = servicio.promosAplicables.find((p) => p.idPromocion === idSel);
  servicio.promo = promo || null;

  const base = servicio.precioUnitario * servicio.cantidad ?? 1;

  servicio.precioConPromo = promo
    ? promo.tipo
      ? base * (1 - promo.valor / 100)
      : Math.max(0, base - promo.valor)
    : base;
};

export const telefonoFormateado = computed(() => {
  if (!vistaCotizacion.value.cliente || !vistaCotizacion.value.cliente.telefono)
    return "";

  let valor = vistaCotizacion.value.cliente.telefono.replace(/\D/g, "");
  if (valor.length > 10) valor = valor.substring(0, 10);

  if (valor.length > 6) {
    return valor.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1 $2 $3");
  } else if (valor.length > 3) {
    return valor.replace(/(\d{3})(\d{0,3})/, "$1 $2");
  } else {
    return valor;
  }
});
