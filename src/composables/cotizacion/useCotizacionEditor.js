import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";

import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import { createCotizacionApi } from "@/services/cotizacionApi";
import { mostrarToast } from "@/components/common/funciones";
import {
  calcularTotalItem,
  formatoMoneda,
  normalizarPrecio,
  obtenerPromocionDetalle,
} from "@/utils/cotizacion";

const SUCURSALES = [
  "(Ninguna)",
  "Delta",
  "López Mateos",
  "Torres Landa",
  "Martinica",
];

const crearFormularioVacio = () => ({
  codigo: "",
  idCotizacion: null,
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
  fechaCreacion: new Date(),
});

const leerUsuario = () => {
  try {
    const session = JSON.parse(localStorage.getItem("userSession") || "{}");
    const usuario = session.usuario || {};
    return {
      id: usuario.idUsuario ?? null,
      nombre: usuario.nombre ?? "",
      login: usuario.login ?? "",
      correo: usuario.correo ?? "",
      id_sucursal: usuario.idSucursal ?? null,
    };
  } catch {
    return { id: null, nombre: "", login: "", correo: "", id_sucursal: null };
  }
};

const crearItemPromocionable = (item, promociones, promocionGeneral) => {
  const promo = obtenerPromocionDetalle(item);
  const resultado = {
    promo,
    promosAplicables: promociones,
    idPromocionSeleccionada: promo && !promo.esAlVuelo ? promo.idPromocion : 0,
    idPromocionAlVuelo: promo?.esAlVuelo ? promo.idPromocion : 0,
    isVuelo: promo?.esAlVuelo ?? false,
    excluirPromocionGeneral: item.excluirPromocionGeneral ?? false,
    mostrarEditorPromo: false,
  };

  resultado.precioConPromo = calcularTotalItem(
    { ...item, ...resultado },
    promocionGeneral,
  );
  return resultado;
};

export const useCotizacionEditor = ({ onGuardado } = {}) => {
  const { proxy } = getCurrentInstance();
  const api = createCotizacionApi(proxy.$serverIP);
  const modalRef = ref(null);
  let modalInstance = null;
  let buscarLlantasTimer = null;
  let catalogosCargados = false;
  let catalogosPromise = null;
  let llantasController = null;
  let llantasRequestId = 0;

  const loggeduser = leerUsuario();
  const sucursales = SUCURSALES;
  const tituloModal = ref("Nueva Cotización");
  const guardando = ref(false);
  const cotizacionForm = reactive(crearFormularioVacio());
  const paquetesDisponibles = ref([]);
  const paquetesSeleccionados = ref([]);
  const conceptoOT = ref([]);
  const almacenes = ref([]);
  const promosGeneralesDisponibles = ref([]);
  const promoGeneral = ref(null);
  const esNuevaCotizacion = ref(true);
  const MarcasLlantas = ref([]);
  const mostrarTabla = ref(false);
  const nuevoServicio = ref("");
  const NuevoConceptoTrabajo = ref(0);
  const nuevoPrecio = ref("");
  const nuevaCantidad = ref(1);

  const items = ref([]);
  const busquedaLlantas = ref("");
  const selectedAlmacenes = ref([]);
  const dropdownOpen = ref(false);
  const totalRows = ref(0);
  const page = ref(1);
  const rowsPerPage = ref(100);
  const llantasLoading = ref(false);
  const sortColumn = ref("");
  const sortDirection = ref("asc");

  const PromocionesVuelo = reactive({
    nombre: "",
    tipo: false,
    valor: 0,
    tipoPromocion: null,
  });

  const telefonoFormateado = computed({
    get: () => {
      const numeros = String(cotizacionForm.clienteTelefono || "")
        .replace(/\D/g, "")
        .slice(0, 10);
      if (numeros.length > 6) {
        return numeros.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1 $2 $3");
      }
      if (numeros.length > 3) {
        return numeros.replace(/(\d{3})(\d{0,3})/, "$1 $2");
      }
      return numeros;
    },
    set: (valor) => {
      cotizacionForm.clienteTelefono = String(valor || "").replace(/\D/g, "");
    },
  });

  const telefonoEsValido = computed(() => {
    const telefono = String(cotizacionForm.clienteTelefono || "");
    return telefono === "" || telefono.replace(/\D/g, "").length === 10;
  });

  const correoEsValido = computed(
    () =>
      cotizacionForm.clienteCorreo === "" ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cotizacionForm.clienteCorreo),
  );

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalRows.value / Number(rowsPerPage.value || 1))),
  );
  const paginaInicio = computed(() =>
    totalRows.value === 0 ? 0 : rowsPerPage.value * (page.value - 1) + 1,
  );
  const paginaFin = computed(() =>
    Math.min(rowsPerPage.value * page.value, totalRows.value),
  );
  const selectedAlmacenesLabel = computed(() => {
    if (!selectedAlmacenes.value.length) return "Elegir almacenes";
    return selectedAlmacenes.value
      .map(
        (id) =>
          almacenes.value.find((almacen) => Number(almacen.id) === Number(id))
            ?.nombre || id,
      )
      .join(", ");
  });

  const AplicarPromo = (item) => calcularTotalItem(item, promoGeneral.value);
  const totalCotizacion = computed(() =>
    [
      ...cotizacionForm.llantas,
      ...cotizacionForm.paquetes,
      ...cotizacionForm.serviciosExtras,
    ].reduce((total, item) => total + AplicarPromo(item), 0),
  );

  const cargarPaquetes = async () => {
    const data = await api.listarPaquetes();
    paquetesDisponibles.value = (data || []).map((paquete) => ({
      idPaquete: paquete.idPaquete,
      nombre: paquete.nombre,
      descripcion: paquete.descripcion,
      precioUnitario: normalizarPrecio(paquete.precioUnitario),
      costo: normalizarPrecio(paquete.costo),
      detalle: (paquete.detalle || []).map((detalle) => ({
        idDesglosePaquete: detalle.idDesglosePaquete,
        idConceptoTrabajo: detalle.idConceptoTrabajo,
        nombre: detalle.descripcion,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
      })),
    }));
  };
  const cargarMarcas = async () => {
    const data = await api.listarMarcas();
    MarcasLlantas.value = (data || []).map((marca) => ({
      idMarca: Number(marca.idMarca),
      nombre: marca.nombre,
    }));
  };

  const editarDatosLlanta = async (item) => {
    const idLlanta = Number(item.idLlanta);
    const idMarca = Number(item.idMarca);
    const medida = String(item.medida || "").trim();
    const modelo = String(item.modelo || "").trim();
    const rango = String(item.rango || "").trim();
    const runFlat = Number(item.runflat || 0);

    if (!idLlanta) {
      mostrarToast("warning", "No se encontró la llanta que deseas editar.");
      return false;
    }
    if (!idMarca) {
      mostrarToast("warning", "Selecciona una marca.");
      return false;
    }
    if (!medida || !modelo || !rango) {
      mostrarToast("warning", "Completa medida, modelo y rango.");
      return false;
    }

    item.guardandoEditor = true;
    try {
      const response = await api.editarDatosLlanta({
        idLlanta,
        medida,
        idMarca,
        modelo,
        rango,
        runFlat,
      });
      const editada = response?.llanta;
      if (!editada) {
        throw new Error("La API no devolvió la llanta editada.");
      }

      const marcaCatalogo = MarcasLlantas.value.find(
        (marca) => Number(marca.idMarca) === Number(editada.idMarca ?? idMarca),
      );
      const datosActualizados = {
        idMarca: Number(editada.idMarca ?? idMarca),
        marca: editada.marca || marcaCatalogo?.nombre || "",
        modelo: editada.modelo || modelo,
        medida: editada.medida || medida,
        rango: editada.rango || rango,
        runflat: Number(editada.runFlat ?? runFlat),
      };
      datosActualizados.modeloMedidas = [
        datosActualizados.medida,
        datosActualizados.marca,
        datosActualizados.modelo,
        datosActualizados.rango,
      ]
        .filter(Boolean)
        .join(" ");

      for (const llanta of cotizacionForm.llantas) {
        if (Number(llanta.idLlanta) === idLlanta) {
          Object.assign(llanta, datosActualizados);
        }
      }
      for (const llanta of items.value) {
        if (Number(llanta.idLlanta) === idLlanta) {
          Object.assign(llanta, datosActualizados, {
            llanta: `${datosActualizados.marca} ${datosActualizados.modelo}`.trim(),
          });
        }
      }

      item.mostrarEditor = false;
      delete item._datosOriginales;
      mostrarToast("success", "Datos de la llanta actualizados.");
      return true;
    } catch (error) {
      console.error("Error al editar los datos de la llanta:", error);
      mostrarToast(
        "error",
        error?.message || "No se pudieron actualizar los datos de la llanta.",
      );
      return false;
    } finally {
      item.guardandoEditor = false;
    }
  };

  const cargarConceptosTrabajo = async () => {
    const data = await api.listarConceptosTrabajo();
    conceptoOT.value = (data || []).map((concepto) => ({
      idConceptoOrdenTrabajo: concepto.idConcetoOrdenTrabajo,
      nombre: concepto.nombre,
    }));
  };

  const cargarAlmacenes = async () => {
    const data = await api.listarAlmacenes();
    almacenes.value = (data || []).map((almacen) => ({
      id: almacen.idAlmacen,
      nombre: almacen.nombre,
    }));
  };

  const cargarPromosRapidas = async () => {
    promosGeneralesDisponibles.value =
      (await api.listarPromocionesRapidas()) || [];
  };

  const cargarCatalogos = async () => {
    if (catalogosCargados) return;
    if (catalogosPromise) return catalogosPromise;

    catalogosPromise = Promise.all([
      cargarPaquetes(),
      cargarMarcas(),
      cargarConceptosTrabajo(),
      cargarAlmacenes(),
      cargarPromosRapidas(),
    ])
      .then(() => {
        catalogosCargados = true;
      })
      .finally(() => {
        catalogosPromise = null;
      });

    return catalogosPromise;
  };

  const cargarLlantas = async () => {
    llantasController?.abort();
    llantasController = new AbortController();
    const controller = llantasController;
    const requestId = ++llantasRequestId;
    llantasLoading.value = true;
    try {
      const data = await api.listarLlantas({
        page: page.value,
        pageSize: rowsPerPage.value,
        search: busquedaLlantas.value,
        idAlmacenes: selectedAlmacenes.value.join(","),
        signal: controller.signal,
      });
      if (requestId !== llantasRequestId) return;
      totalRows.value = Number(data?.totalRows || 0);
      items.value = (Array.isArray(data?.items) ? data.items : [])
        .filter((llanta) => !llanta.eliminado)
        .map((llanta) => {
          const ubicacion = llanta.nombreAlmacen || "";
          return {
            id: llanta.idLlanta,
            idLlanta: llanta.idLlanta,
            idInventarioInicial: llanta.idInventarioInicial,
            codigo: llanta.codigo,
            marca: llanta.nombreMarca,
            idMarca: llanta.idMarca,
            modelo: llanta.modelo,
            llanta: `${llanta.nombreMarca} ${llanta.modelo}`.trim(),
            medida: llanta.medidas,
            runflat: llanta.runflat,
            rango: llanta.rango,
            rangoCarga: String(llanta.rango ?? "").replace(/[a-z]/gi, ""),
            rangoVelocidad:String(llanta.rango ?? "").match(/[a-z]/i)?.[0] || "",
            cantidad: Number(llanta.cantidad) || 0,
            ubicacion,
            idAlmacen: llanta.idAlmacen,
            precio: Math.trunc(llanta.precio),
            costo: Math.trunc(llanta.costo),
            sobrePedido: ubicacion.toLowerCase().includes("proveedor"),
          };
        });
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Error al cargar llantas:", error);
      items.value = [];
      mostrarToast("warning", "No se pudieron cargar las llantas.");
    } finally {
      if (requestId === llantasRequestId) {
        llantasLoading.value = false;
        llantasController = null;
      }
    }
  };

  const compararValores = (a, b) => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), "es-MX", {
      numeric: true,
      sensitivity: "base",
    });
  };
  const sortAccessors = {
    llanta: (item) => item.llanta,
    rangoCarga: (item) => item.rangoCarga,
    rangoVelocidad: (item) =>item.rangoVelocidad,
    rango: (item) => item.rango,
    runflat: (item) => Number(item.runflat || 0),
    codigo: (item) => item.codigo,
    medida: (item) => item.medida,
    cantidad: (item) => Number(item.cantidad || 0),
    ubicacion: (item) => item.ubicacion,
    costo: (item) => Number(item.costo || 0),
    precio: (item) => Number(item.precio || 0),
  };
  const itemsOrdenados = computed(() => {
    const accessor = sortAccessors[sortColumn.value];
    if (!accessor) return items.value;
    const direction = sortDirection.value === "desc" ? -1 : 1;
    return [...items.value].sort(
      (a, b) => compararValores(accessor(a), accessor(b)) * direction,
    );
  });
  const ordenarPor = (actualizacion) => {
    const columna =
      typeof actualizacion === "string"
        ? actualizacion
        : actualizacion?.sortBy;
    if (!columna) return;

    if (sortColumn.value === columna) {
      sortDirection.value =
        actualizacion?.sortType ||
        (sortDirection.value === "asc" ? "desc" : "asc");
      return;
    }
    sortColumn.value = columna;
    sortDirection.value = actualizacion?.sortType || "asc";
  };
  const iconoOrden = (columna) => {
    if (sortColumn.value !== columna) return "bi-arrow-down-up text-muted";
    return sortDirection.value === "asc" ? "bi-sort-up" : "bi-sort-down";
  };

  const resetTabla = () => {
    sortColumn.value = "";
    sortDirection.value = "asc";
    busquedaLlantas.value = "";
    selectedAlmacenes.value = [];
    page.value = 1;
  };
  const toggleTodos = () => {
    selectedAlmacenes.value = [];
    page.value = 1;
    cargarLlantas();
  };
  const onAlmacenesChanged = () => {
    page.value = 1;
    cargarLlantas();
  };
  const prevPage = () => {
    if (page.value <= 1) return;
    page.value--;
    cargarLlantas();
  };
  const nextPage = () => {
    if (page.value >= totalPages.value) return;
    page.value++;
    cargarLlantas();
  };
  const onRowsChange = () => {
    page.value = 1;
    cargarLlantas();
  };

  const limpiarFormulario = () => {
    Object.assign(cotizacionForm, crearFormularioVacio());
    promoGeneral.value = null;
    paquetesSeleccionados.value = [];
    esNuevaCotizacion.value = true;
    nuevoServicio.value = "";
    NuevoConceptoTrabajo.value = 0;
    nuevoPrecio.value = "";
    nuevaCantidad.value = 1;
  };

  const cargarFormulario = async (resumen = null, detalle = null) => {
    limpiarFormulario();
    if (!resumen) {
      if (paquetesDisponibles.value.length) {
        paquetesSeleccionados.value = [paquetesDisponibles.value[0].idPaquete];
      }
      return;
    }

    esNuevaCotizacion.value = false;
    const data = detalle ?? (await api.obtenerDetalle(resumen.idCotizacion));
    promoGeneral.value = data.idPromocionGeneral
      ? {
          idPromocion: data.idPromocionGeneral,
          nombre: data.nombrePromocionGeneral,
          valor: data.valorPromocionGeneral,
          tipo: data.tipoPromocionGeneral,
        }
      : null;

    Object.assign(cotizacionForm, {
      codigo: `${data.prefijo}-${data.consecutivoSucursal}`,
      idCotizacion: data.idCotizacion,
      idCliente: data.idCliente ?? null,
      fechaCreacion: data.fechaCreacion,
      clienteNombre: data.clienteNombre || "",
      nombre: data.nombres || "",
      apellidos: `${data.apPaterno || ""} ${data.apMaterno || ""}`.trim(),
      clienteTelefono: data.telefono || "",
      clienteCorreo: data.correo || "",
      clienteExistente: null,
      mostrarTotal: data.mostrarTotal,
      observaciones: data.observaciones || "",
    });

    cotizacionForm.paquetes = (data.paquetes || [])
      .map((paquete) => {
        const base = paquetesDisponibles.value.find(
          (disponible) => disponible.idPaquete === paquete.idPaquete,
        );
        if (!base) return null;
        const promocion = crearItemPromocionable(
          paquete,
          promosGeneralesDisponibles.value,
          promoGeneral.value,
        );
        cotizacionForm.paquetesDetalles[paquete.idPaquete] =
          paquete.idDetalleCotizacionPaquete ?? null;
        return {
          ...base,
          cantidad: Number(paquete.cantidad ?? 1),
          precioUnitario: normalizarPrecio(paquete.precioUnitario),
          costo: normalizarPrecio(paquete.costo ?? base.costo),
          comentario: paquete.comentario || "",
          ...promocion,
        };
      })
      .filter(Boolean);
    paquetesSeleccionados.value = cotizacionForm.paquetes.map(
      (paquete) => paquete.idPaquete,
    );

    cotizacionForm.llantas = (data.llantas || []).map((llanta) => {
      const base = {
        idDetalleCotizacionLlanta: llanta.idDetalleCotizacionLlanta,
        idLlanta: llanta.idLlanta,
        idInventarioInicial: llanta.idInventarioInicial,
        idAlmacen: llanta.idAlmacen,
        cantidad: Number(llanta.cantidad ?? 1),
        precioUnitario: normalizarPrecio(llanta.precioUnitario),
        costo: normalizarPrecio(llanta.costo),
        medida: llanta.soloMedida,
        rango: llanta.soloRango,
        modelo: llanta.modelo,
        idMarca: Number(llanta.idMarca),
        marca: llanta.nombreMarca,
        runflat: Number(llanta.runflat ?? 0),
        modeloMedidas: llanta.modeloMedidas,
        ubicacion: llanta.ubicacion,
        idConceptoTrabajo: llanta.idConceptoTrabajo ?? 1,
        comentario: llanta.comentario || "",
      };
      return {
        ...base,
        ...crearItemPromocionable(
          { ...llanta, ...base },
          promosGeneralesDisponibles.value,
          promoGeneral.value,
        ),
      };
    });

    cotizacionForm.serviciosExtras = (data.servicios || []).map((servicio) => {
      const base = {
        idDetalleCotizacionServicio: servicio.idDetalleCotizacionServicio,
        nombre: servicio.descripcion,
        observacion: servicio.observacion || "",
        cantidad: Number(servicio.cantidad ?? 1),
        precioUnitario: normalizarPrecio(servicio.precioUnitario),
        costo: normalizarPrecio(servicio.costo),
        idConceptoTrabajo: servicio.idConceptoTrabajo,
        comentario: servicio.comentario || "",
      };
      return {
        ...base,
        ...crearItemPromocionable(
          { ...servicio, ...base },
          promosGeneralesDisponibles.value,
          promoGeneral.value,
        ),
      };
    });
  };

  const abrir = async (resumen = null) => {
    try {
      tituloModal.value = resumen?.idCotizacion
        ? "Editar Cotización"
        : "Nueva Cotización";

      const detallePromise = resumen?.idCotizacion
        ? api.obtenerDetalle(resumen.idCotizacion)
        : Promise.resolve(null);
      const llantasPromise = cargarLlantas();
      const [, detalle] = await Promise.all([
        cargarCatalogos(),
        detallePromise,
      ]);

      await cargarFormulario(resumen, detalle);
      if (!modalInstance) {
        modalInstance = new Modal(modalRef.value, { keyboard: false });
      }
      modalInstance.show();
      void llantasPromise;
    } catch (error) {
      console.error("Error al abrir la cotización:", error);
      await Swal.fire("Error", "No se pudo abrir la cotización.", "error");
    }
  };

  const closeModal = () => modalInstance?.hide();
  const onModalOculto = () => {
    limpiarFormulario();
    resetTabla();
  };

  const ajustaNombre = () => {
    cotizacionForm.clienteNombre =
      `${cotizacionForm.nombre} ${cotizacionForm.apellidos}`.trim();
  };
  const manejarCliente = (cliente) => {
    if (!cliente) return;
    cotizacionForm.idCliente = cliente.idCliente;
    cotizacionForm.nombre = cliente.nombres ?? "";
    cotizacionForm.apellidos = `${cliente.apPaterno ?? ""} ${
      cliente.apMaterno ?? ""
    }`.trim();
    cotizacionForm.clienteTelefono = cliente.telefono ?? "";
    cotizacionForm.clienteCorreo = cliente.correo ?? "";
    cotizacionForm.observaciones = cliente.observaciones ?? "";
    ajustaNombre();
    mostrarTabla.value = false;
  };

  const eliminarPaquete = (idPaquete) => {
    cotizacionForm.paquetes = cotizacionForm.paquetes.filter(
      (paquete) => paquete.idPaquete !== idPaquete,
    );
    paquetesSeleccionados.value = paquetesSeleccionados.value.filter(
      (id) => id !== idPaquete,
    );
    delete cotizacionForm.paquetesDetalles[idPaquete];
  };
  const eliminarLlanta = (idLlanta) => {
    cotizacionForm.llantas = cotizacionForm.llantas.filter(
      (llanta) => llanta.idLlanta !== idLlanta,
    );
  };
  const eliminarServicioExtra = (id) => {
    cotizacionForm.serviciosExtras = cotizacionForm.serviciosExtras.filter(
      (servicio, index) =>
        (servicio.idDetalleCotizacionServicio ?? index) !== id,
    );
  };

  const agregarLlanta = (item) => {
    if (cotizacionForm.llantas.length >= 6) {
      mostrarToast("warning", "No puedes agregar más de 6 llantas");
      return;
    }
    if (cotizacionForm.llantas.some((llanta) => llanta.idLlanta === item.id)) {
      return;
    }

    const base = {
      idDetalleCotizacionLlanta: null,
      idLlanta: item.id,
      idInventarioInicial: item.idInventarioInicial,
      cantidad: 4,
      precioUnitario: normalizarPrecio(item.precio),
      costo: normalizarPrecio(item.costo),
      modelo: item.modelo,
      marca: item.marca,
      idMarca: item.idMarca,
      medida: item.medida,
      rango: item.rango,
      runflat: Number(item.runflat ?? 0),
      modeloMedidas: `${item.medida} ${item.rango} ${item.llanta}`,
      marca: item.marca,
      idAlmacen: item.idAlmacen,
      ubicacion: item.ubicacion,
      idConceptoTrabajo: 1,
      comentario: "",
      excluirPromocionGeneral: false,
    };
    cotizacionForm.llantas.push({
      ...base,
      ...crearItemPromocionable(
        base,
        promosGeneralesDisponibles.value,
        promoGeneral.value,
      ),
    });
    cotizacionForm.llantas.sort((a, b) => {
      const prioridad = (llanta) => {
        const modelo = String(llanta.modeloMedidas || "").toUpperCase();
        if (modelo.includes("BRIDGESTONE")) return 1;
        if (modelo.includes("FIRESTONE")) return 2;
        return 3;
      };
      return prioridad(a) - prioridad(b) || b.precioUnitario - a.precioUnitario;
    });
  };

  const agregarServicioExtra = () => {
    const nombre = String(nuevoServicio.value || "")
      .trim()
      .toUpperCase();
    const cantidad = Number.parseInt(nuevaCantidad.value);
    const precio = Number.parseFloat(nuevoPrecio.value);
    if (!nombre)
      return mostrarToast("warning", "Debes ingresar el nombre del servicio.");
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return mostrarToast("warning", "La cantidad debe ser mayor a 0.");
    }
    if (!Number.isFinite(precio) || precio <= 0) {
      return mostrarToast("warning", "El precio debe ser mayor a 0.");
    }
    if (
      cotizacionForm.serviciosExtras.some(
        (servicio) => servicio.nombre.trim().toUpperCase() === nombre,
      )
    ) {
      return mostrarToast("warning", "Ya existe un servicio con ese nombre.");
    }

    const base = {
      idDetalleCotizacionServicio: null,
      nombre,
      observacion: "",
      cantidad,
      precioUnitario: normalizarPrecio(precio),
      costo: 0,
      idConceptoTrabajo: NuevoConceptoTrabajo.value,
      comentario: "",
      excluirPromocionGeneral: false,
    };
    cotizacionForm.serviciosExtras.push({
      ...base,
      ...crearItemPromocionable(
        base,
        promosGeneralesDisponibles.value,
        promoGeneral.value,
      ),
    });
    NuevoConceptoTrabajo.value = 0;
    nuevoServicio.value = "";
    nuevaCantidad.value = 1;
    nuevoPrecio.value = "";
  };

  const onCambioPromo = (item) => {
    const idPromocion = item.idPromocionAlVuelo || item.idPromocionSeleccionada;
    item.promo =
      (item.promosAplicables || []).find(
        (promo) => promo.idPromocion === idPromocion,
      ) || null;
    item.isVuelo = Boolean(item.idPromocionAlVuelo);
    item.mostrarEditorPromo = false;
    item.precioConPromo = AplicarPromo(item);
  };
  const buscarPromocionAplicada = (item) => Number(item.idPromocionAlVuelo) > 0;
  const togglePromoAlVuelo = (item) => {
    if (buscarPromocionAplicada(item)) {
      item.promosAplicables = (item.promosAplicables || []).filter(
        (promo) => !promo.esAlVuelo,
      );
      item.idPromocionSeleccionada = 0;
      item.idPromocionAlVuelo = 0;
      item.promo = null;
      item.isVuelo = false;
      item.mostrarEditorPromo = false;
      item.precioConPromo = AplicarPromo(item);
      return;
    }
    item.mostrarEditorPromo = !item.mostrarEditorPromo;
  };

  const guardarPromoAlVuelo = async (item) => {
    if (!item) return;
    if (!PromocionesVuelo.nombre || !PromocionesVuelo.valor) {
      await Swal.fire("Error", "Completa todos los campos.", "warning");
      return;
    }
    try {
      const data = await api.crearPromocionVuelo({
        Nombre: PromocionesVuelo.nombre,
        Tipo: PromocionesVuelo.tipo,
        Valor: PromocionesVuelo.valor,
        TipoPromo: PromocionesVuelo.tipoPromocion || 1,
      });
      const promocion = {
        idPromocion: data.idPromoVuelo,
        nombre: PromocionesVuelo.nombre,
        tipo: PromocionesVuelo.tipo,
        valor: PromocionesVuelo.valor,
        tipopromo: PromocionesVuelo.tipoPromocion || 1,
        esAlVuelo: true,
      };
      item.promosAplicables = [...(item.promosAplicables || []), promocion];
      item.idPromocionAlVuelo = promocion.idPromocion;
      item.idPromocionSeleccionada = 0;
      onCambioPromo(item);
      Object.assign(PromocionesVuelo, {
        nombre: "",
        tipo: false,
        valor: 0,
        tipoPromocion: null,
      });
    } catch (error) {
      console.error("Error al guardar promoción al vuelo:", error);
      await Swal.fire(
        "Error",
        "No se pudo guardar la promoción al vuelo.",
        "error",
      );
    }
  };

  const irAlSiguientePrecio = (event) => {
    if (event.key !== "Tab" && event.key !== "Enter") return;
    event.preventDefault();
    const inputs = Array.from(
      document.querySelectorAll(".input-precio-unitario"),
    );
    const actual = inputs.indexOf(event.target);
    const siguiente = event.shiftKey
      ? (actual - 1 + inputs.length) % inputs.length
      : (actual + 1) % inputs.length;
    inputs[siguiente]?.focus();
  };

  const validarPartidas = async () => {
    const llantaInvalida = cotizacionForm.llantas.some(
      (llanta) =>
        Number(llanta.cantidad) <= 0 || Number(llanta.precioUnitario) <= 0,
    );
    const paqueteInvalido = cotizacionForm.paquetes.some(
      (paquete) => Number(paquete.precioUnitario) <= 0,
    );
    const servicioInvalido = cotizacionForm.serviciosExtras.some(
      (servicio) =>
        Number(servicio.cantidad) <= 0 || Number(servicio.precioUnitario) <= 0,
    );
    if (llantaInvalida || paqueteInvalido || servicioInvalido) {
      await Swal.fire({
        icon: "warning",
        title: "Datos inválidos",
        text: "Verifica las cantidades y precios de las partidas.",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    return true;
  };

  const construirPayload = () => {
    const clienteExistente =
      cotizacionForm.clienteExistente &&
      typeof cotizacionForm.clienteExistente === "object"
        ? cotizacionForm.clienteExistente
        : null;
    const cliente = clienteExistente
      ? {
          idCliente: clienteExistente.idCliente,
          nombre:
            `${clienteExistente.nombres} ${clienteExistente.apPaterno} ${clienteExistente.apMaterno}`.trim(),
          nombres: clienteExistente.nombres,
          apellidos:
            `${clienteExistente.apPaterno} ${clienteExistente.apMaterno}`.trim(),
          telefono: clienteExistente.telefono,
          correo: clienteExistente.correo,
          observaciones: cotizacionForm.observaciones || "",
        }
      : {
          idCliente: cotizacionForm.idCliente,
          nombre: cotizacionForm.clienteNombre || "",
          nombres: cotizacionForm.nombre || "",
          apellidos: cotizacionForm.apellidos || "",
          telefono: cotizacionForm.clienteTelefono || "",
          correo: cotizacionForm.clienteCorreo || "",
          observaciones: cotizacionForm.observaciones || "",
        };

    const promocionPartida = (item) => ({
      idPromocion: item.isVuelo ? null : item.idPromocionSeleccionada || null,
      idPromocionVuelo: item.isVuelo ? item.idPromocionAlVuelo : null,
      isVuelo: item.isVuelo || false,
      excluirPromocionGeneral: item.excluirPromocionGeneral ? 1 : 0,
      comentario: item.comentario || "",
    });

    return {
      codigo: cotizacionForm.idCotizacion || null,
      mostrarTotal: cotizacionForm.mostrarTotal,
      idSucursal: loggeduser.id_sucursal,
      cliente,
      llantas: cotizacionForm.llantas.map((llanta) => ({
        idDetalleCotizacionLlanta: llanta.idDetalleCotizacionLlanta || null,
        idLlanta: llanta.idLlanta,
        idInventarioInicial: llanta.idInventarioInicial,
        idConceptoTrabajo: llanta.idConceptoTrabajo,
        cantidad: Number(llanta.cantidad),
        precioUnitario: Number(llanta.precioUnitario),
        costo: Number(llanta.costo || 0),
        idAlmacen: llanta.idAlmacen,
        ...promocionPartida(llanta),
      })),
      paquetes: cotizacionForm.paquetes.map((paquete) => ({
        idDetalleCotizacionPaquete:
          cotizacionForm.paquetesDetalles[paquete.idPaquete] || null,
        idPaquete: paquete.idPaquete,
        cantidad: Number(paquete.cantidad ?? 1),
        precioUnitario: Number(paquete.precioUnitario ?? paquete.precio ?? 0),
        costo: Number(paquete.costo || 0),
        ...promocionPartida(paquete),
        detalle: (paquete.detalle || []).map((detalle) => ({
          idDesglosePaquete: detalle.idDesglosePaquete,
          idConceptoTrabajo: detalle.idConceptoTrabajo,
          descripcion: detalle.nombre,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          subTotal: detalle.subtotal,
        })),
      })),
      serviciosAdicionales: cotizacionForm.serviciosExtras.map((servicio) => ({
        idDetalleCotizacionServicio:
          servicio.idDetalleCotizacionServicio || null,
        idConceptoTrabajo: servicio.idConceptoTrabajo,
        descripcionServicio: servicio.nombre,
        observacion: servicio.observacion || "",
        cantidad: Number(servicio.cantidad),
        precioUnitario: Number(servicio.precioUnitario),
        costo: Number(servicio.costo || 0),
        ...promocionPartida(servicio),
      })),
      creadoPor: loggeduser.id,
      observaciones: cotizacionForm.observaciones,
      idPromocionGeneral: promoGeneral.value?.idPromocion ?? null,
    };
  };

  const guardarCotizacion = async () => {
    if (guardando.value || !(await validarPartidas())) return;
    guardando.value = true;
    try {
      const payload = construirPayload();
      const data = cotizacionForm.idCotizacion
        ? await api.editar(payload)
        : await api.crear(payload);
      mostrarToast("success", "Cotización guardada");
      closeModal();
      onGuardado?.(data);
    } catch (error) {
      console.error("Error al guardar cotización:", error);
      await Swal.fire("Error", "No se pudo guardar la cotización.", "error");
    } finally {
      guardando.value = false;
    }
  };

  watch(busquedaLlantas, () => {
    clearTimeout(buscarLlantasTimer);
    buscarLlantasTimer = setTimeout(() => {
      page.value = 1;
      cargarLlantas();
    }, 250);
  });

  watch(paquetesSeleccionados, (ids) => {
    for (const id of ids) {
      if (cotizacionForm.paquetes.some((paquete) => paquete.idPaquete === id)) {
        continue;
      }
      const base = paquetesDisponibles.value.find(
        (paquete) => paquete.idPaquete === id,
      );
      if (!base) continue;
      const item = {
        ...base,
        cantidad: 1,
        comentario: "",
        excluirPromocionGeneral: false,
      };
      cotizacionForm.paquetes.push({
        ...item,
        ...crearItemPromocionable(
          item,
          promosGeneralesDisponibles.value,
          promoGeneral.value,
        ),
      });
    }
    cotizacionForm.paquetes = cotizacionForm.paquetes.filter((paquete) =>
      ids.includes(paquete.idPaquete),
    );
  });

  const recalcular = (partidas) => {
    partidas.forEach((partida) => {
      partida.precioConPromo = AplicarPromo(partida);
    });
  };
  watch(
    () => [
      promoGeneral.value,
      cotizacionForm.llantas.map((item) => [
        item.precioUnitario,
        item.cantidad,
      ]),
      cotizacionForm.paquetes.map((item) => [
        item.precioUnitario,
        item.cantidad,
      ]),
      cotizacionForm.serviciosExtras.map((item) => [
        item.precioUnitario,
        item.cantidad,
      ]),
    ],
    () => {
      recalcular(cotizacionForm.llantas);
      recalcular(cotizacionForm.paquetes);
      recalcular(cotizacionForm.serviciosExtras);
    },
    { deep: true },
  );

  onMounted(() => {
    nextTick(() =>
      modalRef.value?.addEventListener("hidden.bs.modal", onModalOculto),
    );
  });
  onBeforeUnmount(() => {
    clearTimeout(buscarLlantasTimer);
    llantasController?.abort();
    modalRef.value?.removeEventListener("hidden.bs.modal", onModalOculto);
    modalInstance?.dispose();
  });

  return {
    AplicarPromo,
    NuevoConceptoTrabajo,
    PromocionesVuelo,
    abrir,
    ajustaNombre,
    agregarLlanta,
    agregarServicioExtra,
    almacenes,
    buscarPromocionAplicada,
    busquedaLlantas,
    closeModal,
    conceptoOT,
    correoEsValido,
    cotizacionForm,
    dropdownOpen,
    editarDatosLlanta,
    eliminarLlanta,
    eliminarPaquete,
    eliminarServicioExtra,
    formatoMoneda,
    guardarCotizacion,
    guardarPromoAlVuelo,
    guardando,
    iconoOrden,
    irAlSiguientePrecio,
    itemsOrdenados,
    llantasLoading,
    loggeduser,
    MarcasLlantas,
    manejarCliente,
    modalRef,
    mostrarTabla,
    nextPage,
    nuevaCantidad,
    nuevoPrecio,
    nuevoServicio,
    onAlmacenesChanged,
    onCambioPromo,
    onRowsChange,
    ordenarPor,
    cargarMarcas,
    paquetesDisponibles,
    paquetesSeleccionados,
    page,
    paginaFin,
    paginaInicio,
    prevPage,
    promoGeneral,
    rowsPerPage,
    selectedAlmacenes,
    selectedAlmacenesLabel,
    sucursales,
    telefonoEsValido,
    telefonoFormateado,
    tituloModal,
    togglePromoAlVuelo,
    toggleTodos,
    totalCotizacion,
    totalPages,
    totalRows,
  };
};
