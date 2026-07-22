<template>
  <div class="container-fluid mp-4 p-4">
    <CotizacionToolbar :ctx="cotizacionContext" />
    <CotizacionesTable :ctx="cotizacionContext" />
    <CotizacionPreviewModal :ctx="cotizacionContext" />
    <CotizacionEditorModal :ctx="cotizacionContext" />
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  computed,
  onMounted,
  getCurrentInstance,
  reactive,
  onBeforeUnmount,
  nextTick,
  toRaw,
} from "vue";
import Swal from "sweetalert2";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useRouter } from "vue-router";
import CotizacionToolbar from "@/components/Cotizacion/CotizacionToolbar.vue";
import CotizacionesTable from "@/components/Cotizacion/CotizacionesTable.vue";
import CotizacionPreviewModal from "@/components/Cotizacion/CotizacionPreviewModal.vue";
import CotizacionEditorModal from "@/components/Cotizacion/CotizacionEditorModal.vue";

const { proxy } = getCurrentInstance();
const router = useRouter();

const modalRef = ref(null);
let modalInstance = null;
const paquetesDisponibles = ref([]);
const clientesDisponibles = ref([]);
const items = ref([]);
const nuevoServicio = ref("");
const NuevoConceptoTrabajo = ref(0);
const nuevoPrecio = ref("");
const nuevaCantidad = ref(1);
const nuevaObservacion = ref("");
const busquedaLlantas = ref("");
const busquedaCotizaciones = ref("");
const cotizacionesRealizadas = ref([]);
const conceptoOT = ref([]);
//Tabla componente
const mostrarTabla = ref(false);
const selectedAlmacenes = ref([]);
const dropdownOpen = ref(false);
const userData = JSON.parse(localStorage.getItem("userSession"));
const raw = JSON.parse(localStorage.getItem("userSession") || "{}");

const loggeduser = {
  id: raw.usuario?.idUsuario ?? null,
  nombre: raw.usuario?.nombre ?? "",
  login: raw.usuario?.login ?? "",
  correo: raw.usuario?.correo ?? "",
  id_sucursal: raw.usuario?.idSucursal ?? null,
};

const normalizarPrecio = (valor) => {
  const precio = Number.parseFloat(valor);
  return Number.isFinite(precio) ? Number(precio.toFixed(2)) : 0;
};

const sucursales = [
  "(Ninguna)",
  "Delta",
  "López Mateos",
  "Torres Landa",
  "Martinica",
];
const vistaCotizacion = ref({});
const mostrarVista = ref(false);
const tituloModal = ref("Nueva Cotización");
const codigoCotizacionEnEdicion = ref(null); // null = creación nueva
const filtroEstatus = ref("");
const loading = ref(true);

const itemsSelected = ref([]);
const paquetesSeleccionados = ref([]);
const esNuevaCotizacion = ref(true); // bandera para edicion o crear (paquetes)

const sortBy = ref(""); // '' = sin columna activa
const sortType = ref("asc"); // 'asc' | 'desc'
const tableKey = ref(0); // para forzar re-montaje cuando quieras
const idCliente = ref(null);

const onUpdateSortBy = (v) => {
  sortBy.value = v ?? "";
};
const onUpdateSortType = (v) => {
  sortType.value = v === "desc" ? "desc" : "asc";
};

// success => "success"
// warning => "warning"
// info => ""
const mostrarToast = (type, message) => {
  const color =
    type === "success"
      ? "linear-gradient(to right, #96c93d)"
      : type === "warning"
      ? "linear-gradient(to right, #f5af19, #f12711)"
      : "linear-gradient(to right, #6dd5ed, #2193b0)";

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

const promoGeneral = ref(null);
const promosGeneralesDisponibles = ref([]);

const resetTabla = () => {
  sortBy.value = "";
  sortType.value = "asc";
  busquedaLlantas.value = "";
  tableKey.value++;
};

watch([busquedaLlantas, selectedAlmacenes], () => {
  tableKey.value++;
});

const cotizacionForm = reactive({
  codigo: "", // ← Para saber si es edición
  idCliente: null,
  clienteNombre: "",
  nombre: "",
  apellidos: "",
  clienteTelefono: "",
  clienteCorreo: "",
  clienteExistente: null,
  paquetes: [],
  paquetesDetalles: {},
  llantas: [],
  serviciosExtras: [],
  mostrarTotal: false,
  observaciones: "",
  fechaCreacion: null,
});

const preciosLlantas = reactive({});

//Array de las Promociones Vuelo
const PromocionesVuelo = reactive({
  nombre: "",
  tipo: false,
  valor: 0,
  tipoPromocion: null,
});

/***********************************
 *  FUNCIONES INPUTS
 ***********************************/

const telefonoFormateado = computed({
  get() {
    const soloNumeros = cotizacionForm.clienteTelefono.replace(/\D/g, "");

    const base = soloNumeros.slice(0, 10); // teléfono principal
    //const ext = soloNumeros.slice(10, 13);  // extensión (máx 3)

    let formateado = "";

    if (base.length > 6) {
      formateado = base.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    } else if (base.length > 3) {
      formateado = base.replace(/(\d{3})(\d{0,3})/, "$1 $2");
    } else if (base.length > 0) {
      formateado = base.replace(/(\d{0,3})/, "$1");
    }

    //return ext ? `${formateado} ext ${ext}` : formateado;
    return formateado;
  },

  set(v) {
    // Guardamos SOLO números
    cotizacionForm.clienteTelefono = v.replace(/\D/g, "");
  },
});

const telefonoVistaFormateado = computed(() => {
  if (!vistaCotizacion.value.cliente || !vistaCotizacion.value.cliente.telefono)
    return "Sin teléfono";

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

const telefonoEsValido = computed(() => {
  const soloNumeros = cotizacionForm.clienteTelefono.replace(/\D/g, "");
  return cotizacionForm.clienteTelefono === "" || soloNumeros.length == 10;
});

const correoEsValido = computed(() => {
  return (
    cotizacionForm.clienteCorreo === "" ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cotizacionForm.clienteCorreo)
  );
});

/***********************************
 *  FUNCIONES PARA TABLA COTIZACION
 ***********************************/

const cancelarCotizacion = (cotizacion) => {
  const json = {
    idCotizacion: cotizacion.idCotizacion,
    idEstadoCotizacion: 4, // se puede obtimizar mas los estatus y usar una sola funcion para las 4 operaciones
    idUsuario: 1,
  };

  fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorText = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${errorText}`);
      }
      return res.json();
    })
    .then((data) => {
      cargarCotizaciones();
    })
    .catch((error) => {
      // Aquí capturas cualquier error de la API o de red
      console.error("Error en la petición:", error.message);
    });
};

const reactivarCotizacion = (cotizacion) => {
  const json = {
    idCotizacion: cotizacion.idCotizacion,
    idEstadoCotizacion: 1,
    idUsuario: 1,
  };
  fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorText = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${errorText}`);
      }
      return res.json();
    })
    .then((data) => {
      cargarCotizaciones();
    })
    .catch((error) => {
      // Aquí capturas cualquier error de la API o de red
      console.error("Error en la petición:", error.message);
    });
};

const ajustaNombre = () => {
  cotizacionForm.clienteNombre =
    cotizacionForm.nombre + " " + cotizacionForm.apellidos;
};

const aprobarCotizacion = (cotizacion) => {
  const idCotizacion = cotizacion.idCotizacion;

  const json = {
    idCotizacion: idCotizacion, // parseInt(cotizacion.codigo.replace('COT-', ''), 10),
    idEstadoCotizacion: 2,
    idUsuario: 1,
  };

  fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorText = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${errorText}`);
      }
      return res.json();
    })
    .then((data) => {
      cargarCotizaciones();

      router.push({
        name: "orden-trabajo-form",
        params: {
          idCotizacion: json.idCotizacion,
        },
      });
    })
    .catch((error) => {
      // Aquí capturas cualquier error de la API o de red
      console.error("Error en la petición:", error.message);
    });
};

const observacionesVista = computed(() => {
  const obs = vistaCotizacion.value.cliente?.observaciones;
  return obs === null || obs === undefined ? "No disponible" : obs;
});

const finalizarCotizacion = (cotizacion) => {
  const json = {
    idCotizacion: cotizacion.idCotizacion,
    idEstadoCotizacion: 3,
    idUsuario: 1,
  };
  fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorText = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${errorText}`);
      }
      return res.json();
    })
    .then((data) => {
      cargarCotizaciones();
    })
    .catch((error) => {
      // Aquí capturas cualquier error de la API o de red
      console.error("Error en la petición:", error.message);
    });
};

/***********************************
 *  FUNCIONES PARA CARGA DE DATOS
 ***********************************/
// Función para cargar paquetes
const cargarPaquetes = async () => {
  try {
    const res = await fetch(proxy.$serverIP + "api/Paquetes/getPaquete");
    if (!res.ok) throw new Error("Error en la respuesta");
    const data = await res.json();
    // paquetesDisponibles.value = data
    data.map((p) => {
      const paquete = {
        idPaquete: p.idPaquete,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precioUnitario: normalizarPrecio(p.precioUnitario),
        costo: normalizarPrecio(p.costo),
        detalle: (p.detalle || []).map((d) => ({
          idDesglosePaquete: d.idDesglosePaquete,
          idConceptoTrabajo: d.idConceptoTrabajo,
          nombre: d.descripcion,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
        })),
      };

      paquetesDisponibles.value.push(paquete);
    });
  } catch (e) {
    console.error("Error al cargar paquetes:", e);
  }
};

// Función para cargar clientes
const cargarClientes = async () => {
  try {
    const res = await fetch(proxy.$serverIP + "api/Cliente/getClientes");
    if (!res.ok) throw new Error("Error al obtener clientes");
    const data = await res.json();
    clientesDisponibles.value = data;
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  }
};

// Función para cargar llantas
const cargarLlantas = async () => {
  try {
    const res = await fetch(proxy.$serverIP + "api/Llanta/getLlantaPrecio");
    if (!res.ok) throw new Error("Error al obtener llantas");
    const data = await res.json();

    // Limpia precios anteriores
    Object.keys(preciosLlantas).forEach((key) => delete preciosLlantas[key]);
    const llantaArray = [];
    data.map((llanta) => {
      const nombreCompleto = `${llanta.nombreMarca} ${llanta.modelo}`.trim();
      const sobrePedido = llanta.nombreAlmacen
        .toLowerCase()
        .includes("proveedor");
      preciosLlantas[llanta.idLlanta] = parseFloat(llanta.precio);

      const obj = {
        id: llanta.idLlanta,
        idInventarioInicial: llanta.idInventarioInicial,
        codigo: llanta.codigo,
        llanta: nombreCompleto,
        // nomenclatura: llanta.nomenclatura,
        medida: llanta.medidas,
        runflat: llanta.runflat,
        rango: llanta.rango, // campo para colocar en cotizacionForm como el cliente la solicita medida - marca - modelo - rango
        cantidad: llanta.cantidad,
        ubicacion: llanta.nombreAlmacen,
        idAlmacen: llanta.idAlmacen,
        precio: parseFloat(llanta.precio) || 0,
        costo: parseFloat(llanta.costo) || 0,
        sobrePedido,
      };

      llantaArray.push(obj);
    });
    items.value = llantaArray;

    return items;
  } catch (error) {
    console.error("Error al cargar llantas:", error);
  }
};

// Función para cargar detalles de la sucursal del usuario

// Función para cargar cotizaciones
const cargarCotizaciones = async (options = {}) => {
  loading.value = true;
  try {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adjuntar el token Bearer si existe

    if (userData?.token) {
      options.headers["Authorization"] = `Bearer ${userData?.token}`;
    }
    const res = await fetch(
      proxy.$serverIP + "api/Cotizacion/resumenCotizaciones",
      options,
    );
    if (!res.ok) throw new Error("Error al obtener cotizaciones");
    const data = await res.json();

    cotizacionesRealizadas.value = data.map((c, i) => ({
      codigo: c.prefijo + "-" + String(c.consecutivoSucursal), // Ej: COT-00001
      idCotizacion: c.idCotizacion,
      sucursal: c.sucursal,
      fechaCreacion: new Date(c.fechaCreacion).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      cliente: {
        nombre: c.clienteNombre,
        telefono: c.telefono,
        correo: c.correo,
        observaciones: c.observaciones || "", // <-- agregado
      },
      paquetes:
        c.nombresPaquetes === "Ninguno"
          ? []
          : c.nombresPaquetes.split(", ").map((nombre) => ({ nombre })),
      llantasSelecionadas: [],
      serviciosAdicionales: [],
      total: c.total,
      estatus: c.estado,
      nombreLlanta: c.nombreLlanta,
      mostrarTotal: false,
    }));
    loading.value = false;
  } catch (error) {
    console.error("Error al cargar cotizaciones:", error);
  }
};

const registrarCerrarConEsc = (mostrarVista) => {
  const listener = (e) => {
    if (e.key !== "Escape") return;

    // 1Si la vista previa está activa, la cerramos
    if (mostrarVista.value) {
      mostrarVista.value = false;
      return;
    }

    // Si el modal de edición está abierto, lo cerramos
    if (modalInstance && modalRef.value.classList.contains("show")) {
      closeModal();
      return;
    }
  };

  window.addEventListener("keydown", listener);

  return () => window.removeEventListener("keydown", listener);
};

/*************************************/
/*      AL MONTAR COMPONENTE
    /*************************************/

onMounted(() => {
  const el = modalRef.value;

  el?.addEventListener("hidden.bs.modal", () => {
    resetTabla();
    cargarPromosRapidas();
  });

  // opcional: cuando se abre
  el?.addEventListener("shown.bs.modal", () => {
    cargarPromosRapidas();
  });
});
let cleanupEscListener = null; // <-- DECLARADO ANTES DE onMounted

onMounted(async () => {
  cargarPaquetes();
  cargarClientes();
  cargarLlantas();
  cargarCotizaciones();
  cargarConcpetoTrabajo();
  cargarAlmacenes();
  cargarPromosRapidas();
  cleanupEscListener = registrarCerrarConEsc(mostrarVista);
});

onBeforeUnmount(() => {
  const el = modalRef.value;
  el?.removeEventListener("hidden.bs.modal", resetTabla);

  if (cleanupEscListener) cleanupEscListener();
});

/*********************************************
        FUNCIONES PARA MODAL CREACION/EDICION
    **********************************************/

const irAlSiguientePrecio = (event) => {
  const isTab = event.key === "Tab";
  const isEnter = event.key === "Enter";
  const isShift = event.shiftKey;

  // Solo intercepta Tab o Enter
  if (!isTab && !isEnter) return;

  event.preventDefault(); // Evita comportamiento por defecto

  // Obtener todos los inputs
  const inputs = Array.from(
    document.querySelectorAll(".input-precio-unitario"),
  );
  const currentIndex = inputs.indexOf(event.target);

  // ⬅⬅⬅ Retroceder con Shift + Tab
  if (isTab && isShift) {
    if (inputs[currentIndex - 1]) {
      inputs[currentIndex - 1].focus();
    } else {
      // Si es el primero, ir al último
      inputs[inputs.length - 1]?.focus();
    }
    return;
  }

  // ➡➡➡ Avanzar con Tab o Enter
  if (inputs[currentIndex + 1]) {
    inputs[currentIndex + 1].focus();
  } else {
    // Si está en el último, vuelve al primero
    inputs[0]?.focus();
  }
};

// Elimina paquete del arreglo
const eliminarPaquete = (idPaquete) => {
  // Elimina el paquete del arreglo
  cotizacionForm.paquetes = cotizacionForm.paquetes.filter(
    (p) => p.idPaquete !== idPaquete,
  );

  // Limpia el detalle asociado (si existe)
  if (
    cotizacionForm.paquetesDetalles &&
    cotizacionForm.paquetesDetalles[idPaquete]
  ) {
    delete cotizacionForm.paquetesDetalles[idPaquete];
  }
};

// Paquetes
// Relaciona el objeto de los checkbox con el objeto que se guarda/edita, eliminando o agregando a cotizacion
watch(
  () => cotizacionForm.paquetes,
  (nuevosSeleccionados) => {
    const actuales = nuevosSeleccionados.map((p) => p.idPaquete);

    // Elimina de paquetesDetalles los que ya no estén seleccionados
    Object.keys(cotizacionForm.paquetesDetalles).forEach((idPaquete) => {
      if (!actuales.includes(Number(idPaquete))) {
        delete cotizacionForm.paquetesDetalles[idPaquete];
      }
    });
  },
);

// Paquetes: colocarlo por default cuando de carge el componente
// Si no hay paquete seleccionado y ya se cargaron los paquetes, pon el primero como default
watch(
  paquetesDisponibles,
  (nuevoValor) => {
    // Solo aplica si es una nueva cotización Y no hay paquetes seleccionados
    if (
      esNuevaCotizacion.value &&
      nuevoValor.length &&
      paquetesSeleccionados.value.length === 0 &&
      cotizacionForm.paquetes.length === 0
    ) {
      paquetesSeleccionados.value = [nuevoValor[0].idPaquete];
    }
  },
  { immediate: true },
);

// Agrega Servicio Adicionales al arreglo CotizacionesForm
const agregarServicioExtra = async () => {
  const nombre = (nuevoServicio.value || "").trim().toUpperCase();
  const observacion = (nuevaObservacion.value || "").trim().toUpperCase();
  const cantidad = parseInt(nuevaCantidad.value);
  const precio = parseFloat(nuevoPrecio.value);

  if (!nombre) {
    mostrarToast("warning", "Debes ingresar el nombre del servicio.");
    return;
  }
  if (isNaN(cantidad) || cantidad <= 0) {
    mostrarToast("warning", "La cantidad debe ser mayor a 0.");
    return;
  }
  if (isNaN(precio) || precio <= 0) {
    mostrarToast("warning", "El precio debe ser mayor a 0.");
    return;
  }

  const duplicado = cotizacionForm.serviciosExtras.some(
    (s) => s.nombre.trim().toUpperCase() === nombre,
  );
  if (duplicado) {
    mostrarToast("warning", "Ya existe un servicio con ese nombre.");
    return;
  }

  const servicio = {
    idDetalleCotizacionServicio: null,
    nombre,
    observacion,
    cantidad,
    precioUnitario: normalizarPrecio(precio),
    costo: 0,
    idConceptoTrabajo: NuevoConceptoTrabajo.value,
    promo: null,
    promosAplicables: [],
    idPromocionSeleccionada: 0,
    precioConPromo: normalizarPrecio(precio),
    excluirPromocionGeneral: false,
    comentario: "",
  };

  try {
    const promos = promosGeneralesDisponibles.value;
    servicio.promosAplicables = promos;
  } catch (error) {
    servicio.promosAplicables = [];
  }

  cotizacionForm.serviciosExtras.push(servicio);
  NuevoConceptoTrabajo.value = 0;
  nuevoServicio.value = "";
  nuevaCantidad.value = 1;
  nuevoPrecio.value = "";
  nuevaObservacion.value = "";
};

// Elimina ServicioAdicional del arreglo
const eliminarServicioExtra = (id) => {
  // Si el idDetalleCotizacionServicio es nulo, usa el índice (i) como respaldo
  cotizacionForm.serviciosExtras = cotizacionForm.serviciosExtras.filter(
    (s, i) => (s.idDetalleCotizacionServicio ?? i) !== id,
  );
};

// Elimina la llanta del arreglo
// Opcional: elimina también su cantidad para limpiar el objeto
const eliminarLlanta = (idLlanta) => {
  cotizacionForm.llantas = cotizacionForm.llantas.filter(
    (ll) => ll.idLlanta !== idLlanta,
  );
};

// Agrega la llanta al arreglo
const agregarLlanta = async (item) => {
  if (cotizacionForm.llantas.length >= 6) {
    mostrarToast("warning", "No puedes agregar más de 6 llantas");
    return;
  }

  const yaExiste = cotizacionForm.llantas.some((ll) => ll.idLlanta === item.id);
  if (yaExiste) {
    return;
  }

  const nuevaLlanta = {
    idDetalleCotizacionLlanta: null,
    idLlanta: item.id,
    idInventarioInicial: item.idInventarioInicial,
    cantidad: 4,
    precioUnitario: normalizarPrecio(item.precio),
    costo: normalizarPrecio(item.costo),
    modeloMedidas: `${item.medida} ${item.rango} ${item.llanta}`,
    marca: item.marca,
    idAlmacen: item.idAlmacen,
    ubicacion: item.ubicacion,
    idConceptoTrabajo: 1,
    promo: null,
    promosAplicables: [],
    precioConPromo: null,
    idPromocionSeleccionada: 0,
    excluirPromocionGeneral: false,
    comentario: "",
  };

  try {
    const promosDisponibles = promosGeneralesDisponibles.value;

    nuevaLlanta.promosAplicables = promosDisponibles || [];
    nuevaLlanta.idPromocionSeleccionada = 0;
    nuevaLlanta.promo = null;
    nuevaLlanta.precioConPromo = nuevaLlanta.precioUnitario;
  } catch (error) {
    console.error("Error al consultar promociones:", error);
    nuevaLlanta.promosAplicables = [];
    nuevaLlanta.idPromocionSeleccionada = 0;
    nuevaLlanta.promo = null;
    nuevaLlanta.precioConPromo = nuevaLlanta.precioUnitario;
  }

  cotizacionForm.llantas.push(nuevaLlanta);

  cotizacionForm.llantas.sort((a, b) => {
    const prioridad = (llanta) => {
      const modelo = llanta.modeloMedidas?.toUpperCase() || "";
      if (modelo.includes("BRIDGESTONE")) return 1;
      if (modelo.includes("FIRESTONE")) return 2;
      return 3; // resto de marcas
    };

    const aPrioridad = prioridad(a);
    const bPrioridad = prioridad(b);

    if (aPrioridad !== bPrioridad) {
      return aPrioridad - bPrioridad;
    }

    // Si tienen la misma prioridad, ordenar por precio de mayor a menor
    return (b.precioUnitario || 0) - (a.precioUnitario || 0);
  });
};

// Obtener promociones aplicables a una llanta (por inventario)
const obtenerPromosPorInventario = async (idInventarioInicial) => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionPorInventario?idInventario=${idInventarioInicial}`,
    );

    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

    const data = await res.json();
    // Puedes filtrar por vigencia/activo si quieres
    return Array.isArray(data) ? data.filter((p) => p.activo) : [];
  } catch (error) {
    console.error("Error al obtener promociones por inventario:", error);
    return [];
  }
};

const obtenerPromosPorPaquete = async (idPaquete) => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionPoridPaquete?idPaquete=${idPaquete}`,
    );

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();
    return Array.isArray(data) ? data.filter((p) => p.activo) : [];
  } catch (error) {
    console.error("Error al obtener promociones por paquete:", error);
    return [];
  }
};

const obtenerPromosGeneralesParaServicio = async () => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionesGenerales`,
    );
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();

    // Solo promociones activas
    return Array.isArray(data) ? data.filter((p) => p.activo) : [];
  } catch (error) {
    console.error(
      "Error al obtener promociones generales para servicios:",
      error,
    );
    return [];
  }
};

// Helper reutilizable
const aplicarPromo = (precio, promoIndividual, promoGlobal) => {
  
  if (promoIndividual && promoIndividual.valor != null) {
    return promoIndividual.tipo
      ? precio * (1 - promoIndividual.valor / 100)
      : Math.max(0, precio - promoIndividual.valor);
  } else if (promoGlobal && promoGlobal.valor != null) {
    return promoGlobal.tipo
      ? precio * (1 - promoGlobal.valor / 100)
      : Math.max(0, precio - promoGlobal.valor);
  }
  return precio;
};

// aplica la promocion
const onCambioPromo = (item) => {
  // Funciona para los 3 servicios
  const idSel = item.idPromocionSeleccionada; // normal
  const idVuelo = item.idPromocionAlVuelo; // vuelo

  // Si no hay ninguna promoción
  if (!idSel && !idVuelo) {
    item.promo = null;
    item.precioConPromo = item.precioUnitario;
    item.isVuelo = null;
    return;
  }

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

// aplica promo seleccionada
const onCambioPromoPaquete = (paquete) => {
  const idSel = paquete.idPromocionSeleccionada;

  if (!idSel) {
    paquete.promo = null;
    paquete.precioConPromo = paquete.precioUnitario;
    return;
  }

  const promo = paquete.promosAplicables.find((p) => p.idPromocion === idSel);
  paquete.promo = promo || null;

  const base = paquete.precioUnitario ?? 0;

  if (promo) {
    paquete.precioConPromo = promo.tipo
      ? base * (1 - promo.valor / 100)
      : Math.max(0, base - promo.valor);
  } else {
    paquete.precioConPromo = base;
  }
};

const onCambioPromoServicio = (servicio) => {
  const idSel = servicio.idPromocionSeleccionada;

  if (!idSel) {
    servicio.promo = null;
    servicio.precioConPromo = servicio.precioUnitario;
    return;
  }

  const promo = servicio.promosAplicables.find((p) => p.idPromocion === idSel);
  servicio.promo = promo || null;

  const base = servicio.precioUnitario ?? 0;

  servicio.precioConPromo = promo
    ? promo.tipo
      ? base * (1 - promo.valor / 100)
      : Math.max(0, base - promo.valor)
    : base;
};

const precioFinalItem = (item, promoGlobal) => {
  const base = item.precioUnitario ?? 0;

  // Si tiene promo individual → aplica esa
  // si tiene tipo Promo false es Monto, si es true es Porcentual
  if (item.promo && item.promo.valor != null) {
    return item.promo.tipo
      ? base * (1 - item.promo.valor / 100)
      : Math.max(0, base - item.promo.valor);
  }

  // Si tiene promo general y no está excluido → aplica
  if (
    promoGlobal &&
    promoGlobal.valor != null &&
    !item.excluirPromocionGeneral
  ) {
    return promoGlobal.tipo
      ? base * (1 - promoGlobal.valor / 100)
      : Math.max(0, base - promoGlobal.valor);
  }

  // Si está excluido o sin promo
  return base;
};

watch(
  () => cotizacionForm.paquetes,
  async (nuevosPaquetes) => {
    for (const p of nuevosPaquetes) {
      // Ya configurado antes (evitar repetir)
      if (p.promosAplicables !== undefined) continue;

      // Inicialización
      p.promo = null;
      p.idPromocionSeleccionada = 0;
      p.promosAplicables = [];
      p.precioConPromo = p.precioUnitario;
      p.excluirPromocionGeneral = false;

      // Consultar promociones aplicables
      const promos = promosGeneralesDisponibles.value;

      p.promosAplicables = promos || [];
    }
  },
  { deep: true },
);

const cargarConcpetoTrabajo = async () => {
  try {
    const response = await fetch(`${proxy.$serverIP}api/ConceptoTrabajo/get`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    conceptoOT.value = data.map((a) => ({
      idConceptoOrdenTrabajo: a.idConcetoOrdenTrabajo,
      nombre: a.nombre,
    }));
  } catch (error) {
    console.error("Error cargando ConceptoTrabajo:", error);
  }
};

const cargarFormulario = async (cotizacion = null) => {
  // 🔹 Guardamos lo que el usuario haya escrito
  const observacionesPrevias = cotizacionForm.observaciones || "";

  if (!cotizacion) {
    Object.assign(cotizacionForm, {
      codigo: "",
      clienteNombre: "",
      nombre: "",
      apellidos: "",
      clienteTelefono: "",
      clienteCorreo: "",
      clienteExistente: null,
      paquetes: [],
      paquetesDetalles: {},
      llantas: [],
      serviciosExtras: [],
      mostrarTotal: false,
      fechaCreacion: new Date(),
      observaciones: "",
      // observaciones: observacionesPrevias, // 🔹 Conservamos lo escrito ===== ¿Por qué? Lo quité.
    });

    promoGeneral.value = null;
    itemsSelected.value = [];
    paquetesSeleccionados.value = [];
    esNuevaCotizacion.value = true;
    // 🔹 Asignar el primer paquete automáticamente para nuevas cotizaciones
    if (
      paquetesDisponibles.value.length > 0 &&
      paquetesSeleccionados.value.length === 0
    ) {
      paquetesSeleccionados.value = [paquetesDisponibles.value[0].idPaquete];
    }

    return;
  }

  // Si se carga una cotización existente
  try {
    const codigoStr = String(cotizacion?.idCotizacion ?? "").trim();
    esNuevaCotizacion.value = false;
    const res = await fetch(
      `${proxy.$serverIP}api/Cotizacion/getDetalleCotizacion?id=${cotizacion.idCotizacion}`,
    );

    if (!res.ok) {
      console.error("❌ Error HTTP:", res.status, res.statusText);
      mostrarToast(
        "warning",
        `No se pudo cargar la cotización: ${res.statusText}`,
      );
      return;
    }

    const data = await res.json();

    // 🔹 Cargar datos de cliente
    cotizacionForm.codigo = data.prefijo + "-" + data.consecutivoSucursal;
    cotizacionForm.idCotizacion = data.idCotizacion;
    cotizacionForm.fechaCreacion = data.fechaCreacion;
    cotizacionForm.clienteNombre = data.clienteNombre;
    cotizacionForm.nombre = data.nombres;
    cotizacionForm.apellidos = data.apPaterno + " " + data.apMaterno;
    cotizacionForm.clienteTelefono = data.telefono;
    cotizacionForm.clienteCorreo = data.correo;
    cotizacionForm.clienteExistente = null;
    cotizacionForm.mostrarTotal = data.mostrarTotal;
    cotizacionForm.observaciones = data.observaciones;

    // ===============================
    // 🔹 PAQUETES
    // ===============================
    cotizacionForm.paquetes = await Promise.all(
      data.paquetes.map(async (p) => {
        const base = paquetesDisponibles.value.find(
          (q) => q.idPaquete === p.idPaquete,
        );
        if (!base) return null;

        // 🔹 Determinar si tiene promoción individual o al vuelo
        const promoIndividual = p.idPromocion
          ? {
              idPromocion: p.idPromocion,
              nombre: p.nombrePromocion,
              valor: p.valorPromocion,
              tipo: p.tipoPromocion,
              esAlVuelo: false,
            }
          : p.idPromocionVuelo
          ? {
              idPromocion: p.idPromocionVuelo,
              nombre: p.nombrePromocionVuelo,
              valor: p.valorPromocionVuelo,
              tipo: p.tipoPromocionVuelo,
              esAlVuelo: true,
            }
          : null;

        // 🔹 Obtener promociones aplicables desde la API
        const promosAplicables = promosGeneralesDisponibles.value;

        // 🔹 Calcular precio con la función estándar
        const precioBase = p.precioUnitario;
        const precioConPromo = precioFinalItem(
          {
            precioUnitario: precioBase,
            promo: promoIndividual,
            excluirPromocionGeneral: p.excluirPromocionGeneral,
          },
          promoGeneral.value,
        );

        return {
          ...base,

          comentario: p.comentario || "",
          excluirPromocionGeneral: p.excluirPromocionGeneral ?? false,
          cantidad: p.cantidad,
          costo: normalizarPrecio(p.costo ?? base.costo),
          promosAplicables,
          promo: promoIndividual,
          idPromocionSeleccionada:
            promoIndividual && !promoIndividual.esAlVuelo
              ? promoIndividual.idPromocion
              : 0,
          precioConPromo,

          idPromocionAlVuelo:
            promoIndividual && promoIndividual.esAlVuelo
              ? promoIndividual.idPromocion
              : null,
          isVuelo: promoIndividual?.esAlVuelo ?? false,
          mostrarEditorPromo: false,
        };
      }),
    );

    // Registrar idDetalle para edición
    // marcaremos los checkboxes en el modal
    paquetesSeleccionados.value = cotizacionForm.paquetes
      .filter((p) => p && p.idPaquete != null)
      .map((p) => p.idPaquete);
    // ===============================
    // 🔹 LLANTAS
    // ===============================
    cotizacionForm.llantas = await Promise.all(
      data.llantas.map(async (ll) => {
        // 1. Promo individual si existe

        const promoIndividual = ll.idPromocion
          ? {
              idPromocion: ll.idPromocion,
              nombre: ll.nombrePromocion,
              valor: ll.valorPromocion,
              tipo: ll.tipoPromocion,
              esAlVuelo: false,
            }
          : ll.idPromocionVuelo
          ? {
              idPromocion: ll.idPromocionVuelo,
              nombre: ll.nombrePromocionVuelo,
              valor: ll.valorPromocionVuelo,
              tipo: ll.tipoPromocionVuelo,
              esAlVuelo: true,
            }
          : null;

        // 2. Obtener promociones aplicables desde API
        const promosAplicables = promosGeneralesDisponibles.value;

        // 3. Calcular precio con promo
        const precioBase = ll.precioUnitario;
        const precioConPromo = precioFinalItem(
          {
            precioUnitario: precioBase,
            promo: promoIndividual,
            excluirPromocionGeneral: ll.excluirPromocionGeneral,
          },
          promoGeneral.value,
        );

        return {
          idDetalleCotizacionLlanta: ll.idDetalleCotizacionLlanta,
          idLlanta: ll.idLlanta,
          idInventarioInicial: ll.idInventarioInicial,
          idAlmacen: ll.idAlmacen,
          cantidad: ll.cantidad,
          precioUnitario: precioBase,
          costo: normalizarPrecio(ll.costo),
          modeloMedidas: ll.modeloMedidas,
          ubicacion: ll.ubicacion,
          idConceptoTrabajo: 1,

          promosAplicables,
          promo: promoIndividual,
          idPromocionSeleccionada:
            promoIndividual && !promoIndividual.esAlVuelo
              ? promoIndividual.idPromocion
              : 0,

          idPromocionAlVuelo:
            promoIndividual && promoIndividual.esAlVuelo
              ? promoIndividual.idPromocion
              : null,
          precioConPromo,
          excluirPromocionGeneral: ll.excluirPromocionGeneral ?? false,
          comentario: ll.comentario || "",
          isVuelo: promoIndividual?.esAlVuelo ?? false,
        };
      }),
    );

    // ===============================
    // 🔹 SERVICIOS EXTRAS
    // ===============================
    cotizacionForm.serviciosExtras = await Promise.all(
      data.servicios.map(async (s) => {
        const promoIndividual = s.idPromocion
          ? {
              idPromocion: s.idPromocion,
              nombre: s.nombrePromocion,
              valor: s.valorPromocion,
              tipo: s.tipoPromocion,
              esAlVuelo: false,
            }
          : s.idPromocionVuelo
          ? {
              idPromocion: s.idPromocionVuelo,
              nombre: s.nombrePromocionVuelo,
              valor: s.valorPromocionVuelo,
              tipo: s.tipoPromocionVuelo,
              esAlVuelo: true,
            }
          : null;

        const promosAplicables = promosGeneralesDisponibles.value;

        const precioBase = s.precioUnitario ?? 0;

        const precioConPromo = precioFinalItem(
          {
            precioUnitario: precioBase,
            promo: promoIndividual,
            excluirPromocionGeneral: s.excluirPromocionGeneral,
          },
          promoGeneral.value,
        );

        return {
          idDetalleCotizacionServicio: s.idDetalleCotizacionServicio,
          nombre: s.descripcion,
          observacion: s.observacion,
          cantidad: s.cantidad,
          precioUnitario: precioBase,
          costo: normalizarPrecio(s.costo),
          idConceptoTrabajo: s.idConceptoTrabajo,
          promosAplicables,
          promo: promoIndividual,
          idPromocionSeleccionada:
            promoIndividual && !promoIndividual.esAlVuelo
              ? promoIndividual.idPromocion
              : 0,

          idPromocionAlVuelo:
            promoIndividual && promoIndividual.esAlVuelo
              ? promoIndividual.idPromocion
              : null,
          precioConPromo,
          excluirPromocionGeneral: s.excluirPromocionGeneral ?? false,
          comentario: s.comentario || "",
          isVuelo: promoIndividual?.esAlVuelo ?? false,
        };
      }),
    );
  } catch (e) {
    console.error("Error cargando cotización para edición:", e);
    mostrarToast("warning", "No se pudo cargar la cotización");
  }
};

/* const cargarPromosGenerales = async () => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionesGenerales`,
    );
    if (!res.ok) throw new Error("Error al obtener promociones generales");

    const data = await res.json();
    promosGeneralesDisponibles.value = data;

    if (data.length > 0) {
    } else {
    }
  } catch (error) {
    console.error("Error al cargar promociones generales:", error);
  }
}; */

const cargarPromosRapidas = async () => {
  try {
    const res = await fetch(`${proxy.$serverIP}api/Promocion/getPromosRapidas`);
    if (!res.ok) throw new Error("Error al obtener promociones generales");

    const data = await res.json();
    promosGeneralesDisponibles.value = data;

    if (data.length > 0) {
    } else {
    }
  } catch (error) {
    console.error("Error al cargar promociones generales:", error);
  }
};

const aplicarPromocionGeneral = async () => {
  const promos = promosGeneralesDisponibles.value;

  if (promos.length === 0) {
    Swal.fire(
      "Sin promociones",
      "No hay promociones generales activas.",
      "info",
    );
    return;
  }

  let html = "<p>Selecciona una promoción general para aplicar:</p>";
  promos.forEach((promo, i) => {
    html += `
            <div style="text-align:left;margin-bottom:8px;">
                <input type="radio" name="promoGeneral" id="promoGeneral_${i}" value="${
      promo.idPromocion
    }" style="margin-right:6px;">
                <label for="promoGeneral_${i}">
                <strong>${promo.nombre}</strong> — ${
      promo.tipo
        ? `Descuento del ${promo.valor}%`
        : `Descuento de $${promo.valor}`
    }
                </label>
            </div>
            `;
  });

  const { value: promoId } = await Swal.fire({
    title: "Promociones generales",
    html,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Aplicar promoción",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const checked = document.querySelector(
        'input[name="promoGeneral"]:checked',
      );
      return checked ? checked.value : null;
    },
  });

  if (!promoId) return;

  const seleccionada = promos.find((p) => p.idPromocion == promoId);
  promoGeneral.value = seleccionada;

  // 🔸 Recalcular precios con la nueva promoción general
  cotizacionForm.llantas.forEach((ll) => {
    ll.precioConPromo = aplicarPromo(
      ll.precioUnitario,
      ll.promo,
      promoGeneral.value,
    );
  });

  cotizacionForm.paquetes.forEach((p) => {
    p.precioConPromo = aplicarPromo(
      p.precioUnitario,
      p.promo,
      promoGeneral.value,
    );
  });

  cotizacionForm.serviciosExtras.forEach((s) => {
    s.precioConPromo = aplicarPromo(
      s.precioUnitario,
      s.promo,
      promoGeneral.value,
    );
  });

  // Forzar reactividad profunda
  await nextTick(() => {
    cotizacionForm.llantas = JSON.parse(
      JSON.stringify(toRaw(cotizacionForm.llantas)),
    );
    cotizacionForm.paquetes = JSON.parse(
      JSON.stringify(toRaw(cotizacionForm.paquetes)),
    );
    cotizacionForm.serviciosExtras = JSON.parse(
      JSON.stringify(toRaw(cotizacionForm.serviciosExtras)),
    );
  });

  // 🔸 Actualización visual inmediata
  Swal.fire({
    icon: "success",
    title: "Promoción aplicada",
    text: `Se aplicó "${seleccionada.nombre}" correctamente.`,
  });
};

// CREAR / EDITAR COTIZACIONES
const guardarCotizacion = async () => {
  try {
    /* ================= VALIDACIONES ================= */

    const llantaInvalida = cotizacionForm.llantas.find(
      (l) =>
        isNaN(Number(l.cantidad)) ||
        Number(l.cantidad) <= 0 ||
        isNaN(Number(l.precioUnitario)) ||
        Number(l.precioUnitario) <= 0,
    );

    if (llantaInvalida) {
      await Swal.fire({
        icon: "warning",
        title: "Datos inválidos en llantas",
        text: "Verifica las cantidades y precios de las llantas.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const paqueteInvalido = cotizacionForm.paquetes.find(
      (p) => isNaN(Number(p.precioUnitario)) || Number(p.precioUnitario) <= 0,
    );

    if (paqueteInvalido) {
      await Swal.fire({
        icon: "warning",
        title: "Datos inválidos en paquetes",
        text: "Verifica los precios de los paquetes.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const servicioInvalido = cotizacionForm.serviciosExtras.find(
      (s) =>
        isNaN(Number(s.cantidad)) ||
        Number(s.cantidad) <= 0 ||
        isNaN(Number(s.precioUnitario)) ||
        Number(s.precioUnitario) <= 0,
    );

    if (servicioInvalido) {
      await Swal.fire({
        icon: "warning",
        title: "Datos inválidos en servicios adicionales",
        text: "Verifica las cantidades y precios de los servicios.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    /* ================= CLIENTE ================= */

    const rawId = cotizacionForm.idCotizacion
      ? cotizacionForm.idCotizacion
      : null;

    let clienteEncontrado = null;

    if (
      cotizacionForm.clienteExistente &&
      typeof cotizacionForm.clienteExistente === "object"
    ) {
      clienteEncontrado = cotizacionForm.clienteExistente;
    }

    // ⚠️ IMPORTANTE: NO reconstruir el nombre en editar
    const cliente = clienteEncontrado
      ? {
          idCliente: clienteEncontrado.idCliente,
          nombre:
            `${clienteEncontrado.nombres} ${clienteEncontrado.apPaterno} ${clienteEncontrado.apMaterno}`.trim(),
          nombres: clienteEncontrado.nombres,
          apellidos:
            `${clienteEncontrado.apPaterno} ${clienteEncontrado.apMaterno}`.trim(),
          telefono: clienteEncontrado.telefono,
          correo: clienteEncontrado.correo,
          observaciones: cotizacionForm.observaciones || "",
        }
      : {
          idCliente: cotizacionForm?.idCliente || null,
          nombre: cotizacionForm.clienteNombre || "",
          nombres: cotizacionForm.nombre || "",
          apellidos: cotizacionForm.apellidos || "",
          telefono: cotizacionForm.clienteTelefono || "",
          correo: cotizacionForm.clienteCorreo || "",
          observaciones: cotizacionForm.observaciones || "",
        };

    /* ================= MAPEO ================= */

    const llantas = cotizacionForm.llantas.map((ll) => ({
      idDetalleCotizacionLlanta: ll.idDetalleCotizacionLlanta || null,
      idLlanta: ll.idLlanta,
      idInventarioInicial: ll.idInventarioInicial,
      idConceptoTrabajo: ll.idConceptoTrabajo,
      cantidad: Number(ll.cantidad),
      precioUnitario: Number(ll.precioUnitario),
      costo: Number(ll.costo || 0),
      idAlmacen: ll.idAlmacen,
      idPromocion: ll.isVuelo ? null : ll.idPromocionSeleccionada || null,
      idPromocionVuelo: ll.isVuelo ? ll.idPromocionAlVuelo : null,
      isVuelo: ll.isVuelo || false,
      excluirPromocionGeneral: ll.excluirPromocionGeneral ? 1 : 0,
      comentario: ll.comentario || "",
    }));

    const paquetes = cotizacionForm.paquetes.map((p) => ({
      idDetalleCotizacionPaquete:
        cotizacionForm.paquetesDetalles?.[p.idPaquete] || null,
      idPaquete: p.idPaquete,
      idPromocion: p.isVuelo ? null : p.idPromocionSeleccionada || null,
      idPromocionVuelo: p.isVuelo ? p.idPromocionAlVuelo : null,
      isVuelo: p.isVuelo || false,
      cantidad: p.cantidad, // o el valor que requieras
      precioUnitario: p.precioUnitario ?? p.precio ?? 0,
      costo: Number(p.costo || 0),
      excluirPromocionGeneral: p.excluirPromocionGeneral ? 1 : 0,
      comentario: p.comentario || "",
      detalle: p.detalle.map((d) => ({
        idDesglosePaquete: d.idDesglosePaquete,
        idConceptoTrabajo: d.idConceptoTrabajo,
        descripcion: d.nombre,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subTotal: d.subtotal,
      })),
    }));

    const serviciosAdicionales = cotizacionForm.serviciosExtras.map((s) => ({
      idDetalleCotizacionServicio: s.idDetalleCotizacionServicio || null,
      idPromocion: s.isVuelo ? null : s.idPromocionSeleccionada || null,
      idPromocionVuelo: s.isVuelo ? s.idPromocionAlVuelo : null,
      idConceptoTrabajo: s.idConceptoTrabajo,
      isVuelo: s.isVuelo || false,
      descripcionServicio: s.nombre,
      observacion: s.observacion || "",
      cantidad: Number(s.cantidad),
      precioUnitario: Number(s.precioUnitario),
      costo: Number(s.costo || 0),
      excluirPromocionGeneral: s.excluirPromocionGeneral ? 1 : 0,
      comentario: s.comentario || "",
    }));

    /* ================= PAYLOAD ================= */

    const nuevaCotizacion = {
      codigo: rawId,
      mostrarTotal: cotizacionForm.mostrarTotal,
      idSucursal: loggeduser.id_sucursal,
      cliente,
      llantas,
      paquetes,
      serviciosAdicionales,
      creadoPor: loggeduser.idUsuario,
      observaciones: cotizacionForm.observaciones,
      idPromocionGeneral: promoGeneral.value?.idPromocion ?? null,
    };

    /* ================= REQUEST ================= */

    const url = cotizacionForm.codigo
      ? `${proxy.$serverIP}api/Cotizacion/editarCotizacion`
      : `${proxy.$serverIP}api/Cotizacion/crearCotizacion`;

    const res = await fetch(url, {
      method: cotizacionForm.codigo ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaCotizacion),
      Authorization: `Bearer ${userData?.token}`,
    });

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }

    const data = await res.json();

    mostrarToast("success", "Cotización guardada");
    cargarFormulario();
    closeModal();
    cargarCotizaciones();
    mostrarVistaPrevia(data, "ver");
  } catch (error) {
    console.error("ERROR guardarCotizacion:", error);
    Swal.fire("Error", "No se pudo guardar la cotización.", "error");
  }
};

const subtotalLlantas = computed(() => {
  return cotizacionForm.llantas.reduce((sum, ll) => {
    const cantidad = ll.cantidad ?? 1;
    
    
  
    return sum + precioFinalItem(ll, promoGeneral.value) * cantidad;
  }, 0);
});

const subtotalPaquete = computed(() => {
  return cotizacionForm.paquetes.reduce((sum, p) => {
    const cantidad = p.cantidad ?? 1;
    return sum + precioFinalItem(p, promoGeneral.value) * cantidad;
  }, 0);
});

const subtotalExtras = computed(() => {
  return cotizacionForm.serviciosExtras.reduce((sum, s) => {
    const cantidad = s.cantidad ?? 1;
    return sum + precioFinalItem(s, promoGeneral.value) * cantidad;
  }, 0);
});

const totalCotizacion = computed(() => {
  return subtotalLlantas.value + subtotalPaquete.value + subtotalExtras.value;
});

/************************************/
/*   BUSQUEDA LLANTAS CON PRECIO    */
/************************************/

/* ====== 1) Constantes/Helpers ====== */
const brandPriority = { bridgestone: 1, firestone: 2 };
const multiwordBrands = ["ngt auto", "general tire"];
const reSplit = /[\s\/\-]+/;
const reNonAN = /[^a-z0-9]/gi;
const collator = new Intl.Collator("es", { sensitivity: "base" });

function extractMarcaFromLlanta(llanta) {
  const t = (llanta || "").toString().trim();
  if (!t) return "";
  const lower = t.toLowerCase();
  const mw = multiwordBrands.find((m) => lower.startsWith(m + " "));

  return (mw ? mw : t.split(/[\s-]+/, 1)[0]).toUpperCase();
}

function parsePrecio(v) {
  if (v == null) return Number.POSITIVE_INFINITY;
  if (typeof v === "number")
    return Number.isFinite(v) ? v : Number.POSITIVE_INFINITY;
  const n = Number(
    v
      .toString()
      .replace(/[^\d.,-]/g, "")
      .replace(/\./g, "")
      .replace(",", "."),
  );

  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function parseMedida(text) {
  const clean = text.replace(/\s+/g, "");
  const match = clean.match(/(\d{3})\/(\d{2})R?(\d{2})?/i);

  if (!match) return {};

  return {
    ancho: match[1],
    perfil: match[2],
    rin: match[3] || null,
  };
}

/* ====== 2) Prepara ítems una sola vez ====== */
const preparedItems = computed(() =>
  (items.value || []).map((it) => {
    const codigo = (it.codigo ?? "").toString();
    const llanta = (it.llanta ?? "").toString();
    const medida = (it.medida ?? "").toString();
    const rango = (it.rango ?? "").toString();
    const ubic = (it.ubicacion ?? "").toString();
    const dims = parseMedida(llanta + " " + medida);
    const text = (
      llanta +
      " " +
      medida +
      " " +
      rango +
      " " +
      ubic
    ).toLowerCase();
    const unido = text.replace(reNonAN, "");
    const medidaNorm = medida.replace(/\s+/g, "").toLowerCase();
    const marca = extractMarcaFromLlanta(llanta);
    const brandRank = brandPriority[marca.toLowerCase()] ?? 3;
    const idInventarioInicial = (it.idInventarioInicial ?? "").toString();

    return {
      ...it,
      _text: text,
      _unido: unido,
      _medidaNorm: medidaNorm,
      _dims: dims,
      _marca: marca,
      _brandRank: brandRank,
      _priceNum: parsePrecio(it.precio),
      _code: codigo,
      _idInventarioInicial: idInventarioInicial,
    };
  }),
);

/* ====== 3) Orden base (una sola vez) ====== */
const baseSorted = computed(() => {
  const arr = preparedItems.value.slice();

  arr.sort((a, b) => {
    // 1. Prioridad por marca
    if (a._brandRank !== b._brandRank) return a._brandRank - b._brandRank;

    // 2. Precio DESC (mayor primero)
    if (a._priceNum !== b._priceNum) return b._priceNum - a._priceNum;

    return collator.compare(a._code, b._code);
  });

  return arr;
});

/* ====== 4) Debounce de la búsqueda ====== */
const q = busquedaLlantas; // tu ref existente
const qDebounced = ref("");
let _t; // timer
watch(q, (val) => {
  clearTimeout(_t);
  _t = setTimeout(() => {
    qDebounced.value = (val || "").toLowerCase().trim();
  }, 250); // ajusta 200–300ms
});

/* ====== 5) Filtrado usando el orden base (sin reordenar en cada tecla) ====== */
const itemsFiltrados = computed(() => {
  const term = qDebounced.value;
  let base = baseSorted.value;
  const medidaMatch = term.match(/(\d{3})\/(\d{2})/);
  if (term) {
    const palabras = term.split(reSplit).filter(Boolean);
    base = base.filter((it) => {
      const t = it._text;
      const u = it._unido;

      // 🔥 1. Filtro fuerte por medida (si existe)
      if (medidaMatch) {
        const [, ancho, perfil] = medidaMatch;

        if (it._dims.ancho !== ancho || it._dims.perfil !== perfil) {
          return false;
        }
      }

      // 🔥 2. Filtro por palabras
      for (let i = 0; i < palabras.length; i++) {
        const p = palabras[i].toLowerCase();
        const pn = p.replace(reNonAN, "");

        // Ignorar medida aquí (ya se procesó arriba)
        if (/^\d{3}\/\d{2}/.test(p)) continue;

        if (!(t.includes(p) || u.includes(pn))) {
          return false;
        }
      }

      return true;
    });
  }

  if (selectedAlmacenes.value.length > 0) {
    base = base.filter((it) => selectedAlmacenes.value.includes(it.ubicacion));
  }

  return base;
});

const toggleTodos = (e) => {
  // Si marca “Todos”, limpiar los filtros
  if (e.target.checked) {
    selectedAlmacenes.value = [];
  }
};

/*************************************/
/*      FUNCION DROPDAWN ALMACENES
    /*************************************/
const almacenes = ref([
  { id: 1, nombre: "Kartisimo" },
  { id: 2, nombre: "Bridgestone" },
  { id: 3, nombre: "Sucursal Sur" },
]);

const cargarAlmacenes = async (options = {}) => {
  try {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adjuntar el token Bearer si existe

    if (userData?.token) {
      options.headers["Authorization"] = `Bearer ${userData?.token}`;
    }
    const response = await fetch(
      `${proxy.$serverIP}api/Almacen/getAlmacen`,
      options,
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json(); // <- aquí parseas el JSON real

    // Aquí mapeamos para que tenga el mismo formato que esperabas
    almacenes.value = data.map((a) => ({
      id: a.idAlmacen,
      nombre: a.nombre,
    }));
  } catch (error) {
    console.error("Error cargando almacenes:", error);
  }
};

/*************************************/
/*      ABRIR/CERRAR MODAL
    /*************************************/
const openModal = () => {
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalRef.value, {
      keyboard: false,
    });
  }
  modalInstance.show();
};

const closeModal = () => {
  modalInstance?.hide();
  codigoCotizacionEnEdicion.value = null;
  resetTabla();
  cargarFormulario(); // limpia informacoin
};

const formatoMoneda = (valor) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(valor);
};

// Abrir modal para nueva cotización o edición
const abrirModalCotizacion = (cotizacion = null) => {
  if (cotizacion && cotizacion.idCotizacion) {
    tituloModal.value = "Editar Cotización";
  } else {
    tituloModal.value = "Nueva Cotización";
  }
  cargarFormulario(cotizacion);
  openModal();

  mostrarVista.value = false;
};

const tblHeadersModal = [
  { text: "Llanta", value: "llanta", sortable: true },
  { text: "Rango", value: "rango" },
  { text: "Runflat", value: "runflat" },
  { text: "Codigo", value: "codigo" },
  { text: "Medidas", value: "medida", sortable: true },
  { text: "Cantidad", value: "cantidad", sortable: true },
  { text: "Ubicación", value: "ubicacion", sortable: true },
  { text: "Costo", value: "costo", sortable: true },
  { text: "Precio", value: "precio", sortable: true },
  { text: "Acciones", value: "acciones", width: 50 },
];

const cotizacionesTransformadas = computed(() => {
  return cotizacionesRealizadas.value
    .filter((c) => {
      const texto = busquedaCotizaciones.value.toLowerCase().trim();
      if (filtroEstatus.value && c.estatus !== filtroEstatus.value)
        return false;
      if (!texto) return true;

      const valores = [
        c.codigo,
        c.sucursal,
        c.fechaCreacion,
        c.cliente?.nombre,
        c.cliente?.telefono,
        c.total?.toString(),
        c.estatus,
        c.nombreLlanta,
        ...(c.paquetes?.map((p) => p.nombre) || []),
      ];

      return valores.some((v) => String(v).toLowerCase().includes(texto));
    })
    .map((c) => ({
      codigo: c.codigo || "—",
      sucursal: c.sucursal,
      fechaCreacion: c.fechaCreacion || "—",
      cliente: c.cliente?.nombre || "—",
      telefono: c.cliente?.telefono || "—",
      observaciones: c.cliente?.observaciones || "No disponible", // <-- agregado

      paquete: c.paquetes?.length
        ? c.paquetes.map((p) => p.nombre).join(", ")
        : "—",
      nombreLlanta: c.nombreLlanta || "—",
      total: formatoMoneda(c.total || 0),
      estatus: typeof c.estatus === "string" ? c.estatus : "Desconocido",
      acciones: c,
    }));
});

watch(itemsSelected, (seleccionados) => {
  seleccionados.forEach((item) => {
    if (cantidadesPorLlanta.value[item.id] === undefined) {
      cantidadesPorLlanta.value[item.id] = 4;
    }
  });
});

// observar si clienteExistente a cambiado de valor
watch(
  () => cotizacionForm.clienteExistente,
  (nuevoNombre) => {
    const cliente = clientesDisponibles.value.find(
      (c) => c.nombres === nuevoNombre,
    );
    if (cliente) {
      cotizacionForm.clienteNombre =
        cliente.nombres + " " + cliente.apPaterno + " " + cliente.apMaterno;
      cotizacionForm.nombre = cliente.nombres;
      cotizacionForm.apellidos = cliente.apPaterno + " " + cliente.apMaterno;
      cotizacionForm.clienteTelefono = cliente.telefono;
      cotizacionForm.clienteCorreo = cliente.correo;
    } else {
      cotizacionForm.clienteNombre = "";
      cotizacionForm.clienteTelefono = "";
      cotizacionForm.clienteCorreo = "";
    }
  },
);

/*********************************************
 *  WATCHER: recalcular precioConPromo al editar precio unitario
 *********************************************/
watch(
  () =>
    cotizacionForm.llantas.map((ll) => ({
      id: ll.idLlanta,
      precio: ll.precioUnitario,
      cantidad: ll.cantidad,
    })),
  (nuevosValores) => {
    nuevosValores.forEach(({ id, precio, cantidad }) => {
      const llanta = cotizacionForm.llantas.find((l) => l.idLlanta === id);
      if (!llanta) return;

      const totalBase = (precio || 0) * (cantidad || 1);
      llanta.precioConPromo = aplicarPromo(
        totalBase,
        llanta.promo,
        promoGeneral.value,
      );
    });
  },
  { deep: true },
);

// Paquetes
watch(
  () =>
    cotizacionForm.paquetes.map((p) => ({
      id: p.idPaquete,
      precio: p.precioUnitario,
      cantidad: p.cantidad,
    })),
  (nuevosValores) => {
    nuevosValores.forEach(({ id, precio, cantidad }) => {
      const paquete = cotizacionForm.paquetes.find((p) => p.idPaquete === id);
      if (!paquete) return;
      const totalBase = (precio || 0) * (cantidad || 1);
      paquete.precioConPromo = aplicarPromo(
        totalBase,
        paquete.promo,
        promoGeneral.value,
      );
    });
  },
  { deep: true },
);
watch(
  paquetesSeleccionados,
  async (ids) => {
    const actuales = cotizacionForm.paquetes.map((p) => p.idPaquete);

    // añadir los que se acaban de marcar
    for (const id of ids) {
      if (!actuales.includes(id)) {
        const base = paquetesDisponibles.value.find((p) => p.idPaquete === id);
        if (!base) continue;

        const paqueteObj = {
          idPaquete: base.idPaquete,
          nombre: base.nombre,
          descripcion: base.descripcion,
          precioUnitario: base.precioUnitario,
          costo: base.costo || 0,
          cantidad: 1,
          comentario: "",
          detalle: base.detalle || [],
          excluirPromocionGeneral: false,
          promosAplicables: [],
          promo: null,
          idPromocionSeleccionada: 0,
          precioConPromo: base.precioUnitario || 0,
          idPromocionAlVuelo: 0,
          isVuelo: false,
          mostrarEditorPromo: false,
        };

        paqueteObj.promosAplicables = promosGeneralesDisponibles.value;
        cotizacionForm.paquetes.push(paqueteObj);
      }
    }

    // eliminar los que se desmarcaron
    cotizacionForm.paquetes = cotizacionForm.paquetes.filter((p) =>
      ids.includes(p.idPaquete),
    );
  },
  { deep: true, immediate: true },
);

// Servicios
watch(
  () =>
    cotizacionForm.serviciosExtras.map((s) => ({
      nombre: s.nombre,
      precio: s.precioUnitario,
      cantidad: s.cantidad,
    })),
  (nuevosValores) => {
    nuevosValores.forEach(({ nombre, precio, cantidad }) => {
      const servicio = cotizacionForm.serviciosExtras.find(
        (s) => s.nombre === nombre,
      );
      if (!servicio) return;
      const totalBase = (precio || 0) * (cantidad || 1);
      servicio.precioConPromo = aplicarPromo(
        totalBase,
        servicio.promo,
        promoGeneral.value,
      );
    });
  },
  { deep: true },
);

/*********************************************
        FUNCIONES PARA MODAL SCREENSHOT Y PDF
    **********************************************/

const mostrarVistaPrevia = async (cotizacion, modo = "ver") => {
  if (modo === "ver") {
    try {
      const res = await fetch(
        `${proxy.$serverIP}api/Cotizacion/getDetalleCotizacion?id=${cotizacion.idCotizacion}`,
      );
      const data = await res.json();

      // ===============================
      // 🔹 PROMOCIÓN GENERAL
      // ===============================
      const promoGeneral = data.idPromocionGeneral
        ? {
            idPromocion: data.idPromocionGeneral,
            nombre: data.nombrePromocionGeneral,
            valor: data.valorPromocionGeneral,
            tipo: data.tipoPromocionGeneral,
          }
        : null;

      // ===============================
      //   LLANTAS
      // ===============================
      const llantasConPromo = data.llantas.map((ll) => {
        const promoIndividual = ll.idPromocion
          ? {
              idPromocion: ll.idPromocion,
              nombre: ll.nombrePromocion,
              valor: ll.valorPromocion,
              tipo: ll.tipoPromocion,
              esAlVuelo: false,
            }
          : ll.idPromocionVuelo
          ? {
              idPromocion: ll.idPromocionVuelo,
              nombre: ll.nombrePromocionVuelo,
              valor: ll.valorPromocionVuelo,
              tipo: ll.tipoPromocionVuelo,
              esAlVuelo: true,
            }
          : null;

        // Si el ítem está excluido, no aplicar ninguna promo
        const aplicaPromo = !ll.excluirPromocionGeneral;
        const precioBase = ll.precioUnitario ?? 0;

        const precioConPromo = aplicaPromo
          ? aplicarPromo(precioBase, promoIndividual, promoGeneral)
          : precioBase;

        // Etiqueta
        const promoLabel = aplicaPromo
          ? promoIndividual
            ? `${promoIndividual.nombre}`
            : promoGeneral
            ? `${promoGeneral.nombre} `
            : ""
          : "(Excluido de promoción)";

        return {
          idLlanta: ll.idLlanta,
          medidas: ll.modeloMedidas,
          cantidad: ll.cantidad,
          precioUnitario: precioBase,
          ubicacion: ll.ubicacion,
          precioConPromo,
          promoLabel,
          total: precioConPromo * ll.cantidad,
          comentario: ll.comentario || "",
        };
      });

      // ===============================
      // 🔹 PAQUETES
      // ===============================
      const paquetes = data.paquetes.map((p) => {
        const promoIndividual = p.idPromocion
          ? {
              idPromocion: p.idPromocion,
              nombre: p.nombrePromocion,
              valor: p.valorPromocion,
              tipo: p.tipoPromocion,
              esAlVuelo: false,
            }
          : p.idPromocionVuelo
          ? {
              idPromocion: p.idPromocionVuelo,
              nombre: p.nombrePromocionVuelo,
              valor: p.valorPromocionVuelo,
              tipo: p.tipoPromocionVuelo,
              esAlVuelo: true,
            }
          : null;

        const aplicaPromo = !p.excluirPromocionGeneral;
        const precioBase = Number(p.precioUnitario ?? 0);
        const cantidad = Number(p.cantidad ?? 1);

        const precioConPromo = aplicaPromo
          ? aplicarPromo(precioBase, promoIndividual, promoGeneral)
          : precioBase;

        const promoLabel = aplicaPromo
          ? promoIndividual
            ? `${promoIndividual.nombre}`
            : promoGeneral
            ? `${promoGeneral.nombre}`
            : ""
          : "(Excluido de promoción)";

        return {
          idPaquete: p.idPaquete,
          nombre: p.nombre,
          descripcion: p.descripcion,
          cantidad,
          precioUnitario: precioBase,
          precio: precioConPromo,
          total: precioConPromo * cantidad,
          promoLabel,
          comentario: p.comentario || "",
        };
      });

      // ===============================
      // 🔹 SERVICIOS
      // ===============================
      const serviciosAdicionales = data.servicios.map((s) => {
        const promoIndividual = s.idPromocion
          ? {
              idPromocion: s.idPromocion,
              nombre: s.nombrePromocion,
              valor: s.valorPromocion,
              tipo: s.tipoPromocion,
              esAlVuelo: false,
            }
          : s.idPromocionVuelo
          ? {
              idPromocion: s.idPromocionVuelo,
              nombre: s.nombrePromocionVuelo,
              valor: s.valorPromocionVuelo,
              tipo: s.tipoPromocionVuelo,
              esAlVuelo: true,
            }
          : null;

        const aplicaPromo = !s.excluirPromocionGeneral;
        const precioBase = Number(s.precioUnitario ?? 0);
        const cantidad = Number(s.cantidad ?? 1);

        const precioConPromo = aplicaPromo
          ? aplicarPromo(precioBase, promoIndividual, promoGeneral)
          : precioBase;

        const promoLabel = aplicaPromo
          ? promoIndividual
            ? `${promoIndividual.nombre}`
            : promoGeneral
            ? `${promoGeneral.nombre}`
            : ""
          : "(Excluido de promoción)";

        return {
          nombreServicio: s.descripcion,
          observacion: s.observacion,
          cantidad,
          precioUnitario: precioBase,
          precioConPromo,
          total: precioConPromo * cantidad,
          promoLabel,
          comentario: s.comentario || "",
        };
      });

      // ===============================
      // 🔹 CALCULO DE TOTALES
      // ===============================
      const totalBase =
        llantasConPromo.reduce(
          (s, l) => s + Number(l.precioUnitario ?? 0) * Number(l.cantidad ?? 1),
          0,
        ) +
        paquetes.reduce(
          (s, p) => s + Number(p.precioUnitario ?? 0) * Number(p.cantidad ?? 1),
          0,
        ) +
        serviciosAdicionales.reduce(
          (s, s2) => s + Number(s2.precioUnitario ?? 0) * Number(s2.cantidad ?? 1),
          0,
        );

      const totalFinal =
        llantasConPromo.reduce((s, l) => s + Number(l.total ?? 0), 0) +
        paquetes.reduce((s, p) => s + Number(p.total ?? 0), 0) +
        serviciosAdicionales.reduce((s, s2) => s + Number(s2.total ?? 0), 0);

      // ===============================
      // 🔹 VISTA FINAL
      // ===============================
      vistaCotizacion.value = {
        codigo: data.prefijo + "-" + data.consecutivoSucursal,
        idCotizacion: data.idCotizacion,
        fechaCreacion: new Date(data.fechaCreacion).toLocaleDateString(
          "es-MX",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          },
        ),
        creadoPor: data.idCreador,
        cliente: {
          nombre: data.clienteNombre,
          telefono: data.telefono || "Sin teléfono",
          correo: data.correo || "",
          fecha: data.fechaCreacion,
          observaciones: data.observaciones || "", // ⚡ AQUI
        },
        llantasSelecionadas: llantasConPromo,
        paquetes,
        serviciosAdicionales,
        total: totalFinal,
        totalBase,
        tienePromocion: totalFinal !== totalBase,
        nombrePromocionGeneral: data.nombrePromocionGeneral,
        valorPromocionGeneral: data.valorPromocionGeneral,
        tipoPromocionGeneral: data.tipoPromocionGeneral,
        estatus: cotizacion.estatus || "Activa",
        mostrarTotal: data.mostrarTotal,
        sucursal: data.sucursal,
        observaciones: data.observaciones,
      };
      mostrarVista.value = true;
    } catch (error) {
      console.error("Error al cargar detalle de cotización:", error);
      Swal.fire("Error", "No se pudo cargar la cotización.", "error");
    }
  }
};

const confirmarAccion = async (vistaCotizacion) => {
  // SE AGREGA VALIDACION PORQUE ESTO HACE UN PUT Y ACTUALIZA ESTADO DE UNA COTIZACION, EL CLIENTE PIDIO QUITAR LA CONFIRMACION
  // const result = await Swal.fire({
  //   title: "¿Estás seguro?",
  //   text: "Esta acción no se puede deshacer.",
  //   icon: "warning",
  //   showCancelButton: true,
  //   confirmButtonText: "Sí, continuar",
  //   cancelButtonText: "Cancelar",
  //   confirmButtonColor: "#d33",
  //   cancelButtonColor: "#6c757d",
  //   reverseButtons: true,
  // });

  // if (!result.isConfirmed) return;

  aprobarCotizacion(vistaCotizacion);
};

// MANDAR A IMPRIMIR

const imprimirCotizacion = () => {
  window.print();
};

// GENERAR PDF

const logoBase64 = ref(null);

const loadLogoBase64 = async () => {
  if (logoBase64.value) return logoBase64.value;
  const response = await fetch("/images/Logo-Kartisimo.png");
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      logoBase64.value = reader.result;
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

pdfMake.vfs = pdfFonts.vfs;

const manejarCliente = (cliente) => {
  if (cliente) {
    cotizacionForm.idCliente = cliente.idCliente;
    cotizacionForm.nombre = cliente.nombres ?? "";
    cotizacionForm.apellidos = `${cliente.apPaterno ?? ""} ${
      cliente.apMaterno ?? ""
    }`.trim();
    cotizacionForm.clienteTelefono = cliente?.telefono ?? "";
    cotizacionForm.clienteCorreo = cliente?.correo ?? "";
    cotizacionForm.observaciones = cliente?.observaciones ?? "";
    mostrarTabla.value = false;

    //cotizacionForm.clienteExistente = cliente;
  }
};

//=================================
//Funciones promocines
//=================================

//Buscar Promociones Aplicadas
const buscarPromocionAplicada = (item) => {
  return item.idPromocionAlVuelo > 0;
};

// Abrir rama de promocion al vuelo
const togglePromoAlVuelo = (item) => {
  const promociones = item.idPromocionAlVuelo;

  if (promociones) {
    item.promosAplicables = item.promosAplicables.filter((p) => !p.esAlVuelo);

    item.idPromocionSeleccionada = 0;
    item.idPromocionAlVuelo = 0;
    item.promo = null;
    item.isVuelo = false;
    item.precioConPromo = item.precioUnitario;

    return;
  }

  // SI NO EXISTE → ABRIR RAMA OCULTA
  item.mostrarEditorPromo = !item.mostrarEditorPromo;
};
const togglePaquete = (paquete) => {
  if (cotizacionForm.paquetesDetalles[paquete.idPaquete]) {
    eliminarPaquete(paquete.idPaquete);
    delete cotizacionForm.paquetesDetalles[paquete.idPaquete];
  } else {
    cotizacionForm.paquetesDetalles[paquete.idPaquete] = 0;
  }
};

// Guardar Promociones al vuelo
const guardarPromoAlVuelo = async (itemPromoActual) => {
  const item = itemPromoActual;
  if (!item) {
    console.error("No hay item seleccionada");
    return;
  }

  item.promosAplicables = item.promosAplicables || [];

  if (!PromocionesVuelo.nombre || !PromocionesVuelo.valor) {
    Swal.fire("Error", "Completa todos los campos.", "warning");
    return;
  }

  const nuevaPromo = {
    idPromocion: 0,
    nombre: PromocionesVuelo.nombre,
    tipo: PromocionesVuelo.tipo,
    valor: PromocionesVuelo.valor,
    tipopromo: PromocionesVuelo?.tipoPromocion || 1,
    esAlVuelo: true,
  };

  const url = `${proxy.$serverIP}api/promocionVuelo/CrearPromoVuelo`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Nombre: nuevaPromo.nombre,
        Tipo: nuevaPromo.tipo,
        Valor: nuevaPromo.valor,
        TipoPromo: nuevaPromo.tipopromo,
      }),
    });

    if (!res.ok)
      throw new Error(`Error al guardar promoción al vuelo (${res.status})`);

    const data = await res.json();

    nuevaPromo.idPromocion = data.idPromoVuelo;

    item.promosAplicables.push(nuevaPromo);
    item.idPromocionAlVuelo = nuevaPromo.idPromocion;
    onCambioPromo(item);
    item.mostrarEditorPromo = false;

    // LIMPIAR FORM
    PromocionesVuelo.nombre = "";
    PromocionesVuelo.valor = 0;
    PromocionesVuelo.tipo = false;
    PromocionesVuelo.tipoPromocion = 0;
  } catch (error) {
    console.error("Error al guardar promoción al vuelo:", error);
    Swal.fire("Error", "No se pudo guardar la promoción al vuelo.", "error");
  }
};

const formatearTelefono = (telefono) => {
  if (!telefono) return "";
  const digitos = telefono.replace(/\D/g, "");
  if (digitos.length !== 10) return telefono;
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
};

const generarPDF = async () => {
  const logo = await loadLogoBase64();
  const v = vistaCotizacion.value;

  const celdaCentroY = (text, alignment = "left") => ({
    text,
    alignment,
    fontSize: 10,
    margin: [0, 10, 0, 10],
  });

  const formatMoney = (v) =>
    `$${(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const celdaTotalConPromo = ({
    precioUnitario,
    cantidad = 1,
    total,
    promoLabel,
  }) => {
    const totalSinPromo = precioUnitario * cantidad;

    const tienePromo =
      total < totalSinPromo &&
      promoLabel &&
      promoLabel !== "" &&
      promoLabel !== ""; // 🔥 filtro clave

    return {
      stack: tienePromo
        ? [
            // ❌ ya no quieres tachado → lo quitamos
            {
              text: promoLabel,
              fontSize: 9,
              style: "promoLabel",
              alignment: "right",
              margin: [0, 2, 0, 2],
            },
            {
              text: formatMoney(total),
              color: "green",
              bold: true,
              fontSize: 10,
              alignment: "right",
            },
          ]
        : [
            {
              text: formatMoney(total),
              alignment: "right",
              fontSize: 10,
            },
          ],
      margin: [0, 10, 0, 10],
    };
  };

  // Arma las filas para la tabla, primero llantas, luego paquetes, luego servicios
  const llantasRows = v.llantasSelecionadas.map((ll) => {
    const tienePromo = ll.promoLabel && ll.precioConPromo < ll.precioUnitario;
    const descripcion =
      ll.comentario && ll.comentario.trim() !== ""
        ? {
            stack: [
              { text: ll.medidas, fontSize: 10, alignment: "left" },
              {
                text: ll.comentario,
                italics: true,
                fontSize: 8,
                color: "#555",
                margin: [0, 2, 0, 0],
              },
            ],
            margin: [0, 10, 0, 10],
          }
        : celdaCentroY(ll.medidas);

    return [
      celdaCentroY(String(ll.cantidad), "center"),
      descripcion,
      celdaCentroY(
        `$${ll.precioUnitario.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`,
        "right",
      ),
      {
        stack: tienePromo
          ? [
              {
                text: `$${(ll.precioUnitario * ll.cantidad).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 2 },
                )}`,
                decoration: "lineThrough",
                color: "#888",
                fontSize: 9,
                alignment: "right",
              },
              {
                text: ll.promoLabel,
                fontSize: 9,
                style: "promoLabel",
                alignment: "right",
                margin: [0, 2, 0, 2],
              },
              {
                text: `$${ll.total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`,
                color: "green",
                bold: true,
                fontSize: 10,
                alignment: "right",
              },
            ]
          : [
              {
                text: `$${ll.total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`,
                fontSize: 10,
                alignment: "right",
              },
            ],
        margin: [0, 10, 0, 10],
      },
    ];
  });

  const paquetesRows = v.paquetes.map((p) => {
    const descripcion =
      p.comentario && p.comentario.trim() !== ""
        ? {
            stack: [
              {
                text:
                  p.nombre.toUpperCase() + ", " + p.descripcion.toUpperCase(),
                fontSize: 10,
                alignment: "left",
              },
              {
                text: p.comentario,
                italics: true,
                fontSize: 8,
                color: "#555",
                margin: [0, 2, 0, 0],
              },
            ],
            margin: [0, 10, 0, 10],
          }
        : celdaCentroY(
            p.nombre.toUpperCase() + ", " + p.descripcion.toUpperCase(),
          );

    return [
      celdaCentroY("1", "center"),
      descripcion,
      celdaCentroY(formatMoney(p.precioUnitario), "right"),
      celdaTotalConPromo({
        precioUnitario: p.precioUnitario,
        cantidad: p.cantidad,
        total: p.total,
        fontSize: 10,
        promoLabel: p.promoLabel,
      }),
    ];
  });

  const serviciosRows = v.serviciosAdicionales.map((s) => {
    const comentario = s.comentario || s.observacion || "";
    const descripcion =
      comentario.trim() !== ""
        ? {
            stack: [
              { text: s.nombreServicio, fontSize: 10, alignment: "left" },
              {
                text: comentario,
                italics: true,
                fontSize: 8,
                color: "#555",
                margin: [0, 2, 0, 0],
              },
            ],
            margin: [0, 10, 0, 10],
          }
        : {
            text: s.nombreServicio,
            italics: false,
            fontSize: 10,
            margin: [0, 10, 0, 10],
          };

    return [
      {
        text: String(s.cantidad),
        alignment: "center",
        fontSize: 10,
        margin: [0, 10, 0, 10],
      },
      descripcion,
      {
        text: formatMoney(s.precioUnitario),
        alignment: "right",
        fontSize: 9,
        margin: [0, 10, 0, 10],
      },
      celdaTotalConPromo({
        precioUnitario: s.precioUnitario,
        cantidad: s.cantidad,
        total: s.total,
        promoLabel: s.promoLabel,
      }),
    ];
  });

  const separador = (textoColumna2) => [
    {
      text: "CANT",
      alignment: "center",
      style: "tableHeaderBorder",
      fillColor: "#ededed",
    },
    {
      text: textoColumna2,
      alignment: "left",
      style: "tableHeaderBorder",
      fillColor: "#ededed",
    },
    {
      text: "PRECIO UNIT.",
      alignment: "right",
      style: "tableHeaderBorder",
      fillColor: "#ededed",
    },
    {
      text: "TOTAL",
      alignment: "right",
      style: "tableHeaderBorder",
      fillColor: "#ededed",
    },
  ];

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const d = new Date(fecha);

    const fechaFormateada = d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const horaFormateada = d.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${fechaFormateada}, ${horaFormateada}`;
  };

  const formatearFechaSinHora = (fecha) => {
    if (!fecha) return "";

    const d = new Date(fecha);

    const fechaFormateada = d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return fechaFormateada;
  };

  const formatearTelefono = (telefono) => {
    if (!telefono) return "";
    const digitos = telefono.replace(/\D/g, "");
    if (digitos.length !== 10) return telefono;
    return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
  };
  // Definición del PDF
  const docDefinition = {
    pageMargins: [40, 40, 40, 60],
    pageSize: "LETTER",
    content: [
      // Logo y encabezado
      {
        columns: [
          {
            width: "*",
            stack: [{ image: logo, width: 140, margin: [0, 0, 0, 10] }],
          },
          {
            width: "auto",
            stack: [],
          },
        ],
      },
      {
        columns: [
          [
            {
              text: "Blvd. Delta 2002\nesq. Rio Mayo",
              bold: true,
              fontSize: 9,
              lineHeight: 1.2,
            },
            {
              text: "Col. Valle de Jerez C.P 37538",
              fontSize: 8,
              lineHeight: 1.2,
            },
            {
              text: "Tel. 477 330 6060 y\n477 390 5090",
              fontSize: 8,
              lineHeight: 1.2,
            },
            { text: "delta@kartisimo.mx", fontSize: 8, lineHeight: 1.2 },
          ],
          [
            {
              text: "Blvd. Lopez Mateos 827\nesq. Apolo",
              bold: true,
              fontSize: 9,
              lineHeight: 1.2,
            },
            { text: "Col. Obrera C.P. 37340", fontSize: 8, lineHeight: 1.2 },
            {
              text: "Tel. 477 717 7440 y\n477 470 9419",
              fontSize: 8,
              lineHeight: 1.2,
            },
            { text: "apolo@kartisimo.mx", fontSize: 8, lineHeight: 1.2 },
          ],
          [
            {
              text: "Blvd. Torres Landa 1901\nesq San Jacobo",
              bold: true,
              fontSize: 9,
              lineHeight: 1.2,
            },
            {
              text: "Col. La Piscina C.P. 37440",
              fontSize: 8,
              lineHeight: 1.2,
            },
            {
              text: "Tel. 477 390 0290 y\n477 461 0028",
              fontSize: 8,
              lineHeight: 1.2,
            },
            { text: "torreslanda@kartisimo.mx", fontSize: 8, lineHeight: 1.2 },
          ],
          [
            {
              text: "Blvd. Mariano Escobedo Pte.\n2715 esq. San Sebastián",
              bold: true,
              fontSize: 9,
              lineHeight: 1.2,
            },
            {
              text: "Col. La Martinica, C.P. 37500",
              fontSize: 8,
              lineHeight: 1.2,
            },
            {
              text: "Tel. 477 763 3285 y\n477 763 3284",
              fontSize: 8,
              lineHeight: 1.2,
            },
          ],
        ],
        columnGap: 15,
        margin: [0, 0, 0, 18],
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#888",
          },
        ],
        margin: [0, 8, 0, 8],
      },
      {
        columns: [
          {
            width: "auto",
            text: `C${v.codigo}`,
            fontSize: 10,
            margin: [0, 0, 16, 6],
          },
          [
            {
              width: "auto",
              text: [
                {
                  text: "Fecha de emisión: ",
                  bold: true,
                },
                `${formatearFechaSinHora(v.cliente.fecha) || ""}`,
              ],
              fontSize: 10,
              margin: [0, 0, 10, 6],
            },
            {
              width: "auto",
              text: [
                {
                  text: "Teléfono(s): ",
                  bold: true,
                },
                {
                  text: formatearTelefono(v.cliente.telefono) || "N/A",
                  color: "#444",
                },
              ],
              fontSize: 10,
              margin: [0, 0, 10, 6],
            },
          ],
          [
            {
              width: "auto",
              text: [
                {
                  text: "Cliente: ",
                  bold: true,
                },
                `${v.cliente.nombre || "N/A"}`,
              ],
              fontSize: 10,
              margin: [0, 0, 10, 6],
            },
            {
              width: "auto",
              text: [
                {
                  text: "Correo: ",
                  bold: true,
                },
                `${v.cliente.correo || "N/A"}`,
              ],
              fontSize: 10,
              margin: [0, 0, 0, 6],
            },
          ],
        ],
      },
      {
        text: [
          {
            text: "Observaciones: ",
            bold: true,
          },
          v.observaciones || "N/A",
        ],
        fontSize: 10,
        margin: [1, 10, 15, 13], // margen inferior para separar de la tabla
      },
      // Tabla principal
      {
        table: {
          headerRows: 1,
          widths: [40, "*", 90, 90],
          body: [
            [
              {
                text: "CANT",
                style: "tableHeaderBorder",
                alignment: "center",
              },
              {
                text: "MEDIDA - MARCA - MODELO - RANGO",
                style: "tableHeaderBorder",
                alignment: "left",
              },
              {
                text: "PRECIO UNIT.",
                style: "tableHeaderBorder",
                alignment: "right",
              },
              {
                text: "TOTAL",
                style: "tableHeaderBorder",
                alignment: "right",
              },
            ],
            ...llantasRows,
            separador("SERVICIO"),
            ...paquetesRows,
            ...serviciosRows,
          ],
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? "#ededed" : null),

          vLineWidth: (i, node) => 0,
        },
        margin: [0, 12, 0, 0],
      },
      v.mostrarTotal
        ? {
            text: "Total: " + formatMoney(v.total),
            style: "tableHeaderBorder",
            alignment: "right",
            fontSize: 12,
            margin: [0, 14, 0, 0],
          }
        : {},
      {
        text: "Los precios incluyen IVA",
        style: "notaIVA",
        alignment: "right",
        margin: [0, 14, 0, 0],
      },
    ],

    styles: {
      tableHeaderBorder: {
        bold: true,
        fontSize: 10,
        border: [true, true, true, true],
        alignment: "center",
        margin: [0, 1, 0, 1],
      },
      promoLabel: {
        fontSize: 8,
        color: "white",
        background: "#dc3545", // rojo bootstrap
        margin: [0, 2, 0, 2],
      },
      notaIVA: {
        italics: true,
        fontSize: 9,
      },
    },
  };

  //pdfMake.createPdf(docDefinition).open();

  // usa esta si el problema es download
  pdfMake.createPdf(docDefinition).download(`Cotización_${v.codigo}.pdf`);
};

const cotizacionContext = {
  router,
  modalRef,
  modalInstance,
  paquetesDisponibles,
  clientesDisponibles,
  items,
  nuevoServicio,
  NuevoConceptoTrabajo,
  nuevoPrecio,
  nuevaCantidad,
  nuevaObservacion,
  busquedaLlantas,
  busquedaCotizaciones,
  cotizacionesRealizadas,
  conceptoOT,
  mostrarTabla,
  selectedAlmacenes,
  dropdownOpen,
  raw,
  loggeduser,
  sucursales,
  vistaCotizacion,
  mostrarVista,
  tituloModal,
  codigoCotizacionEnEdicion,
  filtroEstatus,
  loading,
  itemsSelected,
  paquetesSeleccionados,
  esNuevaCotizacion,
  sortBy,
  sortType,
  tableKey,
  idCliente,
  onUpdateSortBy,
  onUpdateSortType,
  mostrarToast,
  promoGeneral,
  promosGeneralesDisponibles,
  resetTabla,
  cotizacionForm,
  preciosLlantas,
  PromocionesVuelo,
  telefonoFormateado,
  telefonoVistaFormateado,
  telefonoEsValido,
  correoEsValido,
  cancelarCotizacion,
  reactivarCotizacion,
  ajustaNombre,
  aprobarCotizacion,
  observacionesVista,
  finalizarCotizacion,
  cargarPaquetes,
  cargarClientes,
  cargarLlantas,
  cargarCotizaciones,
  registrarCerrarConEsc,
  cleanupEscListener,
  irAlSiguientePrecio,
  eliminarPaquete,
  agregarServicioExtra,
  eliminarServicioExtra,
  eliminarLlanta,
  agregarLlanta,
  cargarPromosRapidas,
  aplicarPromo,
  onCambioPromo,
  onCambioPromoPaquete,
  onCambioPromoServicio,
  precioFinalItem,
  cargarConcpetoTrabajo,
  cargarFormulario,
  cargarPromosRapidas,
  aplicarPromocionGeneral,
  guardarCotizacion,
  subtotalLlantas,
  subtotalPaquete,
  subtotalExtras,
  totalCotizacion,
  brandPriority,
  multiwordBrands,
  reSplit,
  reNonAN,
  collator,
  extractMarcaFromLlanta,
  parsePrecio,
  parseMedida,
  preparedItems,
  baseSorted,
  q,
  qDebounced,
  _t,
  itemsFiltrados,
  toggleTodos,
  almacenes,
  cargarAlmacenes,
  openModal,
  closeModal,
  formatoMoneda,
  abrirModalCotizacion,
  tblHeadersModal,
  cotizacionesTransformadas,
  mostrarVistaPrevia,
  confirmarAccion,
  imprimirCotizacion,
  logoBase64,
  loadLogoBase64,
  manejarCliente,
  buscarPromocionAplicada,
  togglePromoAlVuelo,
  togglePaquete,
  guardarPromoAlVuelo,
  formatearTelefono,
  generarPDF,
};
</script>

<style>
.cotizacion-table {
  max-width: min(1100px, 95vw);
}

.cotizacion-header {
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.cotizacion-header-cliente {
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.modal-1000 {
  max-width: 1000px;
  width: 100%;
}

@media print {
  @page {
    size: letter;
    margin: 8mm;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 🔴 Ocultar todo */
  body * {
    visibility: hidden;
  }

  /* 🟢 Mostrar solo cotización */
  #area-imprimir,
  #area-imprimir * {
    visibility: visible;
  }

  #area-imprimir {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;

    font-family: Arial, sans-serif;
    font-size: 8pt;
    line-height: 1.3;
    color: #000;
  }

  /* ========================= */
  /* 🔥 TABLA ESTILO PDF REAL */
  /* ========================= */

  #area-imprimir table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-top: 20px;
    border-width: 0px;
  }

  #area-imprimir .table-bordered tr {
    border-width: 0px;
    border-style: none;
  }

  /* HEADER */
  #area-imprimir .table-light th {
    background: #ededed;
    font-weight: bold;
    font-size: 10pt;
    padding: 6px 4px;

    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
  }

  #area-imprimir .cotizacion-header-cliente {
    font-size: 10pt;
    border-width: 0px;
    background-color: transparent;
    margin: 0px;
    padding: 0px;
  }

  #area-imprimir .cotizacion-header {
    border-width: 0px;
    border-radius: 0;
    padding: 0;
  }

  #area-imprimir .direcciones {
    font-size: 10pt;
  }

  /* FILAS */
  #area-imprimir tbody td {
    padding: 8px 4px;
    font-size: 9pt;

    border: none;
    border-top: 1px solid #000;
  }

  #area-imprimir .tr-servicios td {
    border-bottom: 1px solid #000;
  }

  /* ❌ quitar líneas verticales */
  #area-imprimir th,
  #area-imprimir td {
    border-left: none !important;
    border-right: none !important;
  }

  /* 🔥 separador tipo SERVICIOS */
  #area-imprimir .fila-separador td {
    background: #ededed;
    font-weight: bold;

    border-top: 2px solid #000;
    border-bottom: 2px solid #000;
  }

  /* 📐 alineaciones */
  #area-imprimir td:nth-child(1),
  #area-imprimir th:nth-child(1) {
    width: 40px;
    text-align: center;
  }

  #area-imprimir td:nth-child(2),
  #area-imprimir th:nth-child(2) {
    text-align: left;
  }

  #area-imprimir td:nth-child(3),
  #area-imprimir th:nth-child(3),
  #area-imprimir td:nth-child(4),
  #area-imprimir th:nth-child(4) {
    width: 90px;
    text-align: right;
  }

  /* 💰 total */
  #area-imprimir .total-verde {
    color: #008000;
    font-weight: bold;
    font-size: 10pt;
  }

  /* 🎟️ promo */
  #area-imprimir .promo-label {
    color: #d92300;
    font-style: italic;
    font-size: 8pt;
  }

  /* 📄 total general */
  #area-imprimir .total-general {
    font-weight: bold;
    font-size: 12pt;
    text-align: right;
    margin-top: 10px;
  }

  /* 📄 nota IVA */
  #area-imprimir .nota-iva {
    font-style: italic;
    font-size: 9pt;
    text-align: right;
    margin-top: 10px;
  }

  /* 🔧 arreglos Bootstrap */
  .table-responsive {
    overflow: visible !important;
  }

  .modal,
  .modal-dialog,
  .modal-content {
    position: static !important;
    overflow: visible !important;
  }

  .modal-body {
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
  }

  /* 📄 saltos de página */
  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
  }

  thead {
    display: table-header-group;
  }

  /* ❌ ocultar botones */
  button,
  .btn,
  .no-imprimir {
    display: none !important;
  }
}
</style>
