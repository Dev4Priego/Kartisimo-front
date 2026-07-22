import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export function formatearFecha(fecha)
{
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function formatearFechaHora(fecha)
{
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function mostrarToast(type, message) 
{
	const color = type === "success" 
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
};