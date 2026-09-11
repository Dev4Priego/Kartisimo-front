<template>
  <div class="container-fluid p-4 reporte-seguimientos">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="mb-1">
          <i class="bi bi-calendar-check me-2"></i>Seguimientos
        </h1>
        <p class="text-muted mb-0">
          Seguimientos programados por orden y concepto de trabajo
        </p>
      </div>
      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-outline-success"
          :disabled="cargando || exportando || !reporte.length"
          @click="exportarXlsx"
        >
          <span v-if="exportando" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-filetype-xlsx me-2"></i>Exportar XLSX
        </button>
        <button
          type="button"
          class="btn btn-outline-primary"
          :disabled="cargando"
          @click="cargarReporte"
        >
          <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
        </button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card border-start border-4 border-primary">
          <span>Total de seguimientos</span>
          <strong>{{ reporte.length }}</strong>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card border-start border-4 border-warning">
          <span>Pendientes</span>
          <strong>{{ totales.pendientes }}</strong>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card border-start border-4 border-danger">
          <span>Vencidos</span>
          <strong>{{ totales.vencidos }}</strong>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card border-start border-4 border-success">
          <span>Realizados</span>
          <strong>{{ totales.realizados }}</strong>
        </div>
      </div>
    </div>

    <form class="bg-white rounded shadow-sm p-3 mb-3" @submit.prevent>
      <div class="row g-3 align-items-end">
        <div class="col-12 col-lg-4">
          <label class="form-label fw-semibold">Búsqueda general</label>
          <input
            v-model.trim="filtros.busqueda"
            type="search"
            class="form-control"
            placeholder="OT, cliente, teléfono o seguimiento"
            @input="programarCargaReporte"
          />
        </div>
        <div class="col-6 col-md-3 col-lg-2">
          <label class="form-label fw-semibold">Desde</label>
          <input
            v-model="filtros.fechaInicio"
            type="date"
            class="form-control"
            @input="programarCargaReporte"
          />
        </div>
        <div class="col-6 col-md-3 col-lg-2">
          <label class="form-label fw-semibold">Hasta</label>
          <input
            v-model="filtros.fechaFin"
            type="date"
            class="form-control"
            @input="programarCargaReporte"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-2">
          <label class="form-label fw-semibold">Estado</label>
          <select
            v-model="filtros.estado"
            class="form-select"
            @input="programarCargaReporte"
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Vencido">Vencidos</option>
            <option value="Realizado">Realizados</option>
          </select>
        </div>
        <div class="col-12 col-md-6 col-lg-2">
          <label class="form-label fw-semibold">Sucursal</label>
          <select
            v-model="filtros.idSucursal"
            class="form-select"
            :disabled="!alcanceReportes.esAdministrador"
            @input="programarCargaReporte"
          >
            <option v-if="alcanceReportes.esAdministrador" value="">Todas</option>
            <option
              v-for="sucursal in sucursales"
              :key="sucursal.idSucursal"
              :value="sucursal.idSucursal"
            >
              {{ sucursal.nombre }}
            </option>
          </select>
        </div>
        <div class="col-12 col-md-8 col-lg-4">
          <label class="form-label fw-semibold">Concepto de trabajo</label>
          <select
            v-model="filtros.idConceptoTrabajo"
            class="form-select"
            @input="programarCargaReporte"
          >
            <option value="">Todos los conceptos</option>
            <option
              v-for="concepto in conceptosTrabajo"
              :key="concepto.idConceptoTrabajo"
              :value="concepto.idConceptoTrabajo"
            >
              {{ concepto.nombre }}
            </option>
          </select>
        </div>
        <div class="col-12 col-md-4 col-lg-2 d-grid">
          <button
            type="button"
            class="btn btn-light"
            :disabled="cargando"
            @click="limpiarFiltros"
          >
            <i class="bi bi-x-lg me-2"></i>Limpiar
          </button>
        </div>
      </div>
    </form>

    <div class="bg-white rounded shadow-sm overflow-hidden">
      <div v-if="cargando" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2 mb-0">Consultando seguimientos...</p>
      </div>
      <div v-else-if="error" class="text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <p class="fw-semibold mt-2 mb-0">{{ error }}</p>
      </div>
      <div v-else class="table-responsive">
         <EasyDataTable
        :key="tableKey"
        :headers="headers"
        :items="reporte"
        :rows-per-page="20"
        show-index
        border
        alternating
        buttons-pagination
        table-class-name="table table-hover align-middle mb-3 fs-2"
        class="rounded-4 shadow-sm tabla-grande"
      >
      <template #item-fecha="item">
       
          {{formatearFecha(item.fecha)}}
        

      </template>
      <template #item-estado ="item">
             <span class="badge" :class="claseEstado(item.estado)">
                  {{ item.estado }}
                </span>
      </template>
      <template #item-cantidadPeriodo="item">
        {{ item.cantidadPeriodo }} {{ item.periodo }}
      </template>
      </EasyDataTable>
       <!--  <table class="table table-hover align-middle mb-0 tabla-seguimientos">
          <thead class="table-light">
            <tr>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Orden</th>
              <th>Sucursal</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Concepto de trabajo</th>
              <th>Seguimiento</th>
              <th>Periodo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reporte" :key="item.idSeguimiento">
              <td class="text-nowrap">{{ formatearFecha(item.fecha) }}</td>
              <td>
                <span class="badge" :class="claseEstado(item.estado)">
                  {{ item.estado }}
                </span>
              </td>
              <td class="text-nowrap fw-semibold">{{ item.ordenTrabajo }}</td>
              <td>{{ item.sucursal || "N/A" }}</td>
              <td>{{ item.cliente || "N/A" }}</td>
              <td class="text-nowrap">{{ item.telefono || "N/A" }}</td>
              <td>{{ item.conceptoTrabajo || "Sin concepto" }}</td>
              <td class="seguimiento-descripcion">{{ item.seguimientoDescripcion }}</td>
              <td class="text-nowrap">{{ item.cantidadPeriodo }} {{ item.periodo }}</td>
            </tr>
            <tr v-if="!reporte.length">
              <td colspan="9" class="text-center text-muted py-5">
                <i class="bi bi-calendar-x fs-2 d-block mb-2"></i>
                No hay seguimientos que coincidan con los filtros.
              </td>
            </tr>
          </tbody>
        </table> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from "vue";
import EasyDataTable from "vue3-easy-data-table";
import {
  limitarSucursalesAlUsuario,
  obtenerAlcanceReportes,
} from "@/utils/reportes";

const { proxy } = getCurrentInstance();
const userData = JSON.parse(localStorage.getItem("userSession"));
const alcanceReportes = obtenerAlcanceReportes();
const reporte = ref([]);
const sucursales = ref([]);
const conceptosTrabajo = ref([]);
const cargando = ref(false);
const exportando = ref(false);
const error = ref("");
let temporizadorReporte = null;
let controladorReporte = null;
const headers = [
  {text:"Fecha", value:"fecha", sortable:true},
  {text:"Estado", value:"estado", sortable:true},
  {text:"Orden", value:"ordenTrabajo", sortable:true},
  {text:"Sucursal", value:"sucursal", sortable:true},
  {text:"Cliente", value:"cliente", sortable:true},
  {text:"Teléfono", value:"telefono", sortable:true},
  {text:"Concepto de trabajo", value:"conceptoTrabajo", sortable:true},
  {text:"Seguimiento", value:"seguimientoDescripcion", sortable:true},
  {text:"Periodo", value:"cantidadPeriodo", sortable:true},
]
const tableKey = ref(0)
const filtrosIniciales = () => ({
  busqueda: "",
  fechaInicio: "",
  fechaFin: "",
  idSucursal: alcanceReportes.esAdministrador
    ? ""
    : alcanceReportes.idSucursal,
  idConceptoTrabajo: "",
  estado: "",
});
const filtros = reactive(filtrosIniciales());

const headersAutorizados = () =>
  userData?.token ? { Authorization: `Bearer ${userData.token}` } : {};

const totales = computed(() => ({
  pendientes: reporte.value.filter((item) => item.estado === "Pendiente").length,
  vencidos: reporte.value.filter((item) => item.estado === "Vencido").length,
  realizados: reporte.value.filter((item) => item.estado === "Realizado").length,
}));

const formatearFecha = (valor) => {
  const partes = String(valor || "").slice(0, 10).split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : "N/A";
};

const claseEstado = (estado) => ({
  "text-bg-warning": estado === "Pendiente",
  "text-bg-danger": estado === "Vencido",
  "text-bg-success": estado === "Realizado",
});

const cargarCatalogos = async () => {
  try {
    const [respuestaSucursales, respuestaConceptos] = await Promise.all([
      fetch(`${proxy.$serverIP}api/Sucursales/getSucursales?activas=true`, {
        headers: headersAutorizados(),
      }),
      fetch(`${proxy.$serverIP}api/ConceptoTrabajo/get`, {
        headers: headersAutorizados(),
      }),
    ]);
    if (!respuestaSucursales.ok || !respuestaConceptos.ok) {
      throw new Error("No fue posible cargar los filtros del reporte.");
    }

    const [datosSucursales, datosConceptos] = await Promise.all([
      respuestaSucursales.json(),
      respuestaConceptos.json(),
    ]);
    sucursales.value = limitarSucursalesAlUsuario(
      datosSucursales,
      alcanceReportes,
    );
    conceptosTrabajo.value = (Array.isArray(datosConceptos) ? datosConceptos : []).map(
      (concepto) => ({
        idConceptoTrabajo: Number(concepto.idConcetoOrdenTrabajo),
        nombre: concepto.nombre,
      }),
    );
  } catch (err) {
    console.error("Error al cargar catálogos del reporte:", err);
  }
};

const cargarReporte = async () => {
  controladorReporte?.abort();
  if (filtros.fechaInicio && filtros.fechaFin && filtros.fechaInicio > filtros.fechaFin) {
    error.value = "La fecha de inicio no puede ser mayor que la fecha final.";
    cargando.value = false;
    return;
  }

  const controladorActual = new AbortController();
  controladorReporte = controladorActual;
  cargando.value = true;
  error.value = "";
  try {
    const parametros = new URLSearchParams();
    Object.entries(filtros).forEach(([campo, valor]) => {
      if (String(valor || "").trim()) parametros.set(campo, String(valor));
    });

    const respuesta = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/reporteSeguimientos?${parametros.toString()}`,
      {
        headers: headersAutorizados(),
        signal: controladorActual.signal,
      },
    );
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      throw new Error(datos?.error || `Error HTTP ${respuesta.status}`);
    }
    reporte.value = Array.isArray(datos?.data) ? datos.data : [];
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error("Error al cargar reporte de seguimientos:", err);
    reporte.value = [];
    error.value = err.message || "No fue posible cargar el reporte.";
  } finally {
    if (controladorReporte === controladorActual) {
      cargando.value = false;
      controladorReporte = null;
    }
  }
};

const programarCargaReporte = () => {
  clearTimeout(temporizadorReporte);
  temporizadorReporte = setTimeout(cargarReporte, 350);
};

const limpiarFiltros = async () => {
  clearTimeout(temporizadorReporte);
  Object.assign(filtros, filtrosIniciales());
  await cargarReporte();
};

const fechaExcel = (valor) => {
  const fecha = String(valor || "").slice(0, 10);
  return fecha ? new Date(`${fecha}T00:00:00`) : null;
};

const exportarXlsx = async () => {
  exportando.value = true;
  try {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Seguimientos");
    hoja.columns = [
      { header: "Fecha", key: "fecha", width: 14 },
      { header: "Estado", key: "estado", width: 14 },
      { header: "Orden", key: "ordenTrabajo", width: 16 },
      { header: "Sucursal", key: "sucursal", width: 22 },
      { header: "Cliente", key: "cliente", width: 32 },
      { header: "Teléfono", key: "telefono", width: 18 },
      { header: "Concepto de trabajo", key: "conceptoTrabajo", width: 28 },
      { header: "Seguimiento", key: "seguimientoDescripcion", width: 50 },
      { header: "Cantidad", key: "cantidadPeriodo", width: 12 },
      { header: "Periodo", key: "periodo", width: 14 },
    ];
    reporte.value.forEach((item) => hoja.addRow({ ...item, fecha: fechaExcel(item.fecha) }));
    hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    hoja.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0D6EFD" },
    };
    hoja.autoFilter = "A1:J1";
    hoja.views = [{ state: "frozen", ySplit: 1 }];
    hoja.getColumn(1).numFmt = "dd/mm/yyyy";
    hoja.getColumn(8).alignment = { wrapText: true, vertical: "top" };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `Seguimientos_${new Date().toISOString().slice(0, 10)}.xlsx`;
    enlace.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error al exportar seguimientos:", err);
    alert("No fue posible exportar el reporte de seguimientos.");
  } finally {
    exportando.value = false;
  }
};

onMounted(async () => {
  await cargarCatalogos();
  await cargarReporte();
});

onBeforeUnmount(() => {
  clearTimeout(temporizadorReporte);
  controladorReporte?.abort();
});
</script>

<style scoped>
.reporte-seguimientos {
  background: #f5f7fb;
  min-height: calc(100vh - 70px);
}

.metric-card {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  height: 100%;
  padding: 1rem;
}

.metric-card span {
  color: #6c757d;
  display: block;
  font-size: 0.85rem;
}

.metric-card strong {
  display: block;
  font-size: 1.35rem;
  margin-top: 0.2rem;
}

.tabla-seguimientos th,
.tabla-seguimientos td {
  white-space: nowrap;
}

.tabla-seguimientos .seguimiento-descripcion {
  min-width: 22rem;
  white-space: normal;
}
</style>
