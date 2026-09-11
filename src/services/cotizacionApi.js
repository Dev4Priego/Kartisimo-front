const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem("userSession") || "{}");
  } catch {
    return {};
  }
};

const joinUrl = (baseUrl, path) =>
  `${String(baseUrl || "").replace(/\/$/, "")}/${String(path).replace(
    /^\//,
    "",
  )}`;

const responseCache = new Map();
const pendingRequests = new Map();
let cacheGeneration = 0;
const CATALOG_TTL = 5 * 60 * 1000;
const CLIENTS_TTL = 2 * 60 * 1000;
const DETAIL_TTL = 30 * 1000;
const SUMMARY_TTL = 5 * 1000;

const getCached = (key, ttl, loader) => {
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now())
    return Promise.resolve(cached.data);

  const generation = cacheGeneration;
  const pendingKey = `${generation}:${key}`;
  if (pendingRequests.has(pendingKey)) return pendingRequests.get(pendingKey);

  const pending = loader()
    .then((data) => {
      if (generation === cacheGeneration) {
        responseCache.set(key, { data, expiresAt: Date.now() + ttl });
      }
      return data;
    })
    .finally(() => pendingRequests.delete(pendingKey));

  pendingRequests.set(pendingKey, pending);
  return pending;
};

const invalidateCache = (prefix) => {
  cacheGeneration++;
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) responseCache.delete(key);
  }
};

const readResponse = async (response) => {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();

  const text = await response.text();
  return text || null;
};

export const createCotizacionApi = (baseUrl) => {
  const normalizedBaseUrl = String(baseUrl || "").replace(/\/$/, "");
  const cotizacionCachePrefix = `${normalizedBaseUrl}:cotizacion:`;

  const request = async (path, options = {}) => {
    const session = getSession();
    const headers = new Headers(options.headers || {});

    if (options.body != null && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (session.token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }

    const response = await fetch(joinUrl(baseUrl, path), {
      ...options,
      headers,
    });
    const data = await readResponse(response);

    if (!response.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message || data?.title || `Error HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  };

  const cachedRequest = (key, path, ttl) =>
    getCached(`${normalizedBaseUrl}:${key}`, ttl, () => request(path));

  const mutation = async (path, options) => {
    const data = await request(path, options);
    invalidateCache(cotizacionCachePrefix);
    return data;
  };

  return {
    listar: () =>
      cachedRequest(
        "cotizacion:resumen",
        "api/Cotizacion/resumenCotizaciones",
        SUMMARY_TTL,
      ),
    obtenerDetalle: (idCotizacion) =>
      cachedRequest(
        `cotizacion:detalle:${idCotizacion}`,
        `api/Cotizacion/getDetalleCotizacion?id=${encodeURIComponent(
          idCotizacion,
        )}`,
        DETAIL_TTL,
      ),
    crear: (cotizacion) =>
      mutation("api/Cotizacion/crearCotizacion", {
        method: "POST",
        body: JSON.stringify(cotizacion),
      }),
    editar: (cotizacion) =>
      mutation("api/Cotizacion/editarCotizacion", {
        method: "PUT",
        body: JSON.stringify(cotizacion),
      }),
    editarDatosLlanta: (llanta) =>
      mutation("api/Listas/EditarDatosLlanta", {
        method: "PUT",
        body: JSON.stringify(llanta),
      }),
    actualizarEstado: (estado) =>
      mutation("api/Cotizacion/editarEstado", {
        method: "PUT",
        body: JSON.stringify(estado),
      }),
    listarPaquetes: () =>
      cachedRequest(
        "catalogo:paquetes",
        "api/Paquetes/getPaquete",
        CATALOG_TTL,
      ),
    listarLlantas: ({ page, pageSize, search, idAlmacenes, signal }) => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search: search || "",
        idAlmacenes: idAlmacenes || "",
      });
      return request(`api/Llanta/getLlantaPrecio-Paginado?${params}`, {
        signal,
      });
    },
    listarMarcas: () =>
      cachedRequest(
        "catalogo:marcas",
        "api/Llanta/getMarcasLlantas",
        CATALOG_TTL,
      ).then((data) => data?.marcas || []),
    listarConceptosTrabajo: () =>
      cachedRequest(
        "catalogo:conceptos",
        "api/ConceptoTrabajo/get",
        CATALOG_TTL,
      ),
    listarAlmacenes: () =>
      cachedRequest(
        "catalogo:almacenes",
        "api/Almacen/getAlmacen",
        CATALOG_TTL,
      ),
    listarPromocionesRapidas: () =>
      cachedRequest(
        "catalogo:promociones",
        "api/Promocion/getPromosRapidas",
        CATALOG_TTL,
      ),
    listarClientes: () =>
      cachedRequest(
        "catalogo:clientes",
        "api/Cliente/getClientes",
        CLIENTS_TTL,
      ),
    crearPromocionVuelo: (promocion) =>
      request("api/promocionVuelo/CrearPromoVuelo", {
        method: "POST",
        body: JSON.stringify(promocion),
      }),
  };
};
