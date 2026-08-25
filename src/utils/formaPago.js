export const FORMAS_PAGO_TARJETA = [
  "Contado",
  "3 Meses",
  "6 Meses",
  "9 Meses",
  "12 Meses",
];

export const normalizarFormaPago = (metodoPago, formaPago) => {
  if (metodoPago !== "Tarjeta de crédito") return "Contado";

  return FORMAS_PAGO_TARJETA.includes(formaPago) ? formaPago : "3 Meses";
};
