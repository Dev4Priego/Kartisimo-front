import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { createCotizacionApi } from "@/services/cotizacionApi";
import {
  downloadCotizacionPdf,
  printCotizacionPdf,
} from "@/components/Cotizacion/CotizacionPdf";
import {
  formatearTelefono,
  mapearDetallePreview,
} from "@/utils/cotizacion";

const getUsuarioId = () => {
  try {
    const session = JSON.parse(localStorage.getItem("userSession") || "{}");
    return session.usuario?.idUsuario ?? 1;
  } catch {
    return 1;
  }
};

export const useCotizacionPreview = ({ onEstadoActualizado } = {}) => {
  const { proxy } = getCurrentInstance();
  const router = useRouter();
  const api = createCotizacionApi(proxy.$serverIP);
  const cotizacion = ref({});
  const visible = ref(false);
  const loading = ref(false);

  const telefonoFormateado = computed(() =>
    formatearTelefono(cotizacion.value.cliente?.telefono),
  );

  const abrir = async (resumen) => {
    const idCotizacion = resumen?.idCotizacion;
    if (!idCotizacion) return;

    loading.value = true;
    try {
      const detalle = await api.obtenerDetalle(idCotizacion);
      cotizacion.value = mapearDetallePreview(detalle, resumen);
      visible.value = true;
    } catch (error) {
      console.error("Error al cargar detalle de cotización:", error);
      await Swal.fire("Error", "No se pudo cargar la cotización.", "error");
    } finally {
      loading.value = false;
    }
  };

  const cerrar = () => {
    visible.value = false;
  };

  const imprimir = () => printCotizacionPdf(cotizacion.value);
  const descargar = () => downloadCotizacionPdf(cotizacion.value);

  const generarOrdenTrabajo = async () => {
    try {
      await api.actualizarEstado({
        idCotizacion: cotizacion.value.idCotizacion,
        idEstadoCotizacion: 2,
        idUsuario: getUsuarioId(),
      });
      onEstadoActualizado?.();
      await router.push({
        name: "orden-trabajo-form",
        params: { idCotizacion: cotizacion.value.idCotizacion },
      });
    } catch (error) {
      console.error("Error al generar la orden de trabajo:", error);
      await Swal.fire("Error", "No se pudo generar la orden de trabajo.", "error");
    }
  };

  const cerrarConEscape = (event) => {
    if (event.key === "Escape" && visible.value) cerrar();
  };

  onMounted(() => window.addEventListener("keydown", cerrarConEscape));
  onBeforeUnmount(() => window.removeEventListener("keydown", cerrarConEscape));

  return {
    abrir,
    cerrar,
    cotizacion,
    descargar,
    generarOrdenTrabajo,
    imprimir,
    loading,
    telefonoFormateado,
    visible,
  };
};
