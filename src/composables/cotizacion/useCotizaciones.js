import { computed, getCurrentInstance, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { createCotizacionApi } from "@/services/cotizacionApi";
import {
  formatoMoneda,
  formatearTelefono,
  mapearResumenCotizacion,
} from "@/utils/cotizacion";

const getUsuarioId = () => {
  try {
    const session = JSON.parse(localStorage.getItem("userSession") || "{}");
    return session.usuario?.idUsuario ?? 1;
  } catch {
    return 1;
  }
};

export const useCotizaciones = ({ busqueda, estatus, sucursal }) => {
  const { proxy } = getCurrentInstance();
  const router = useRouter();
  const api = createCotizacionApi(proxy.$serverIP);
  const cotizaciones = ref([]);
  const loading = ref(false);

  const cargar = async () => {
    loading.value = true;
    try {
      const data = await api.listar();
      cotizaciones.value = (data || []).map(mapearResumenCotizacion);
    } catch (error) {
      console.error("Error al cargar cotizaciones:", error);
      await Swal.fire("Error", "No se pudieron cargar las cotizaciones.", "error");
    } finally {
      loading.value = false;
    }
  };

  const sucursales = computed(() => {
    const nombres = cotizaciones.value
      .map((cotizacion) => cotizacion.sucursal)
      .filter((nombre) => nombre && String(nombre).trim());

    return [...new Set(nombres)].sort((a, b) =>
      String(a).localeCompare(String(b), "es-MX", { sensitivity: "base" }),
    );
  });

  const items = computed(() =>
    cotizaciones.value
      .filter((cotizacion) => {
        const texto = String(busqueda.value || "").toLowerCase().trim();
        if (estatus.value && cotizacion.estatus !== estatus.value) return false;
        if (sucursal.value && cotizacion.sucursal !== sucursal.value) return false;
        if (!texto) return true;

        const valores = [
          cotizacion.codigo,
          cotizacion.sucursal,
          cotizacion.fechaCreacion,
          cotizacion.cliente?.nombre,
          cotizacion.cliente?.telefono,
          cotizacion.total,
          cotizacion.estatus,
          cotizacion.nombreLlanta,
          ...(cotizacion.paquetes?.map((paquete) => paquete.nombre) || []),
        ];
        return valores.some((valor) =>
          String(valor ?? "").toLowerCase().includes(texto),
        );
      })
      .map((cotizacion) => ({
        codigo: cotizacion.codigo || "N/A",
        sucursal: cotizacion.sucursal || "N/A",
        fechaCreacion: cotizacion.fechaCreacion || "N/A",
        cliente: cotizacion.cliente?.nombre || "N/A",
        telefono: cotizacion.cliente?.telefono || "N/A",
        observaciones: cotizacion.cliente?.observaciones || "No disponible",
        paquete: cotizacion.paquetes?.length
          ? cotizacion.paquetes.map((paquete) => paquete.nombre).join(", ")
          : "N/A",
        nombreLlanta: cotizacion.nombreLlanta || "N/A",
        total: formatoMoneda(cotizacion.total),
        estatus:
          typeof cotizacion.estatus === "string"
            ? cotizacion.estatus
            : "Desconocido",
        acciones: cotizacion,
      })),
  );

  const actualizarEstado = async (cotizacion, idEstadoCotizacion) => {
    try {
      const data = await api.actualizarEstado({
        idCotizacion: cotizacion.idCotizacion,
        idEstadoCotizacion,
        idUsuario: getUsuarioId(),
      });
      await cargar();
      return data;
    } catch (error) {
      console.error("Error al actualizar la cotización:", error);
      await Swal.fire("Error", "No se pudo actualizar la cotización.", "error");
      return null;
    }
  };

  const cancelar = (cotizacion) => actualizarEstado(cotizacion, 4);
  const reactivar = (cotizacion) => actualizarEstado(cotizacion, 1);
  const finalizar = (cotizacion) => actualizarEstado(cotizacion, 3);
  const aprobar = async (cotizacion) => {
    const resultado = await actualizarEstado(cotizacion, 2);
    if (!resultado) return;

    await router.push({
      name: "orden-trabajo-form",
      params: { idCotizacion: cotizacion.idCotizacion },
    });
  };

  onMounted(cargar);

  return {
    aprobar,
    cancelar,
    cargar,
    finalizar,
    formatearTelefono,
    items,
    loading,
    reactivar,
    sucursales,
  };
};
