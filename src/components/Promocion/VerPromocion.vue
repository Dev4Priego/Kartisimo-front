<template>
	<div class="card shadow-sm p-3">
		<div class="d-flex justify-content-between align-items-center mb-3">
			<input
				v-model="filtro"
				type="text"
				class="form-control w-auto"
				placeholder="Buscar por nombre..."
			/>
		</div>

		<!-- Spinner mientras carga -->
		<div v-if="loading" class="text-center my-4">
			<div class="spinner-border text-primary" role="status"></div>
				<p class="mt-2 text-muted">Cargando promociones...</p>
		</div>

		<!-- Tabla -->
		<div v-else class="table-responsive">
			<table class="table align-middle table-hover">
				<thead class="table-light">
				<tr>
					<!-- <th>ID</th> -->
					<th>Nombre</th>
					<th>Tipo</th>
					<th>Valor</th>
					<th>Es General</th>
					<th>Fecha Inicio</th>
					<th>Fecha Fin</th>
					<th>Cant. Artículos</th>
					<!-- <th>Estado</th> -->
					<th>Acciones</th>
				</tr>
				</thead>

				<tbody>
				<tr v-for="promo in promocionesFiltradas" :key="promo.idPromocion">
					<!-- <td>{{ promo.idPromocion }}</td> -->
					<td>{{ promo.nombre }}</td>
					<td>
					<span
						class="badge"
						:class="promo.tipo ? 'bg-primary' : 'bg-info'"
					>
						{{ promo.tipo ? "Porcentaje" : "Monto fijo" }}
					</span>
					</td>
					<td>{{ promo.valor }}</td>
					<td>{{ promo.esGeneral ? "Sí" : "No" }}</td>
					<td>{{ formatearFecha(promo.fechaInicio) }}</td>
					<td>{{ formatearFecha(promo.fechaFin) }}</td>
					<td>{{ promo.cantidadArticulos }}</td>
					<!-- <td>
						<span
							class="badge"
							:class="promo.activo ? 'bg-success' : 'bg-danger'"
						>
							{{ promo.activo ? 'Activo' : 'Inactivo' }}
						</span>
					</td> -->
					<td>
					<button
						class="btn btn-sm btn-outline-info me-1"
						@click="verPromocion(promo.idPromocion)"
					>
						<i class="bi bi-eye"></i>
					</button>
					<button
						class="btn btn-sm btn-outline-primary me-1"
						@click="editarPromocion(promo.idPromocion)"
					>
						<i class="bi bi-pencil"></i>
					</button>
					<!-- <button class="btn btn-sm btn-outline-danger">
						<i class="bi bi-trash"></i>
					</button> -->
					</td>
				</tr>

				<tr v-if="promociones.length === 0">
					<td colspan="10" class="text-center text-muted">
					No hay promociones disponibles
					</td>
				</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import Swal from "sweetalert2";
const { proxy } = getCurrentInstance();
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";


const promociones = ref([]);
const filtro = ref("");
const loading = ref(true);



const mostrarToast = (type, message) => {
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



// Filtrado simple por nombre
const promocionesFiltradas = computed(() =>
	promociones.value.filter((p) =>
		p.nombre.toLowerCase().includes(filtro.value.toLowerCase())
	)
);

const formatearFecha = (fecha) => {
  	return new Date(fecha).toLocaleDateString("es-MX");
};

const cargarPromociones = async () => {
	loading.value = true;

	try {
		const res = await fetch(`${proxy.$serverIP}api/Promocion/getPromocion`);

		if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

		const data = await res.json();

		promociones.value = data;
	} catch (error) {
		console.error("Error al cargar promociones:", error);

		Swal.fire({
			icon: "error",
			title: "Oops...",
			text: "No se pudieron cargar las promociones.",
			footer: error.message,
		});
	} finally {
		loading.value = false;
	}
};

// Ver detalles de una promoción
const verPromocion = async (idPromocion) => {
	try {
		const res = await fetch(`${proxy.$serverIP}api/Promocion/getPromocionById?idPromocion=${idPromocion}`);
		
		if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

		const promo = await res.json();

		let contenidoHtml = `
			<div style="text-align:left;">
				<p><strong>Nombre:</strong> ${promo.nombrePromocion}</p>
				<p>
					<strong>Tipo:</strong> 
					${promo.tipo ? "Porcentaje" : "Monto fijo"}
				</p>
				<p><strong>Valor:</strong> ${promo.valor}${promo.tipo ? "%" : ""}</p>
				<p>
					<strong>Fecha inicio:</strong> 
					${formatearFecha(promo.fechaInicio)}
				</p>
				<p>
					<strong>Fecha fin:</strong> ${formatearFecha(promo.fechaFin)}
				</p>
				<p>
					<strong>Estado:</strong> 
					${promo.activo ? '<span class="badge bg-success">Activo</span>'	: '<span class="badge bg-danger">Inactivo</span>'}
				</p>
				<hr />
			`;

		if (promo.productos && promo.productos.length > 0) {
			contenidoHtml += `
				<p>
					<strong>Productos en promoción:</strong>
				</p>
				<table class="table table-sm table-bordered">
					<thead class="table-light">
						<tr>
						<th>Código</th>
						<th>Modelo</th>
						<th>Marca</th>
						<th>Medidas</th>
						<th>Uso</th>
						<th>Almacén origen</th>
						</tr>
					</thead>
					<tbody>
						${promo.productos.map((p) => `
						<tr>
							<td>${p.codigoLlanta}</td>
							<td>${p.modeloLlanta}</td>
							<td>${p.marcaLlanta}</td>
							<td>${p.medidasLlanta}</td>
							<td>${p.usoLlanta}</td>
							<td>${p.almacenOrigen}</td>
						</tr>
						`).join("")}
					</tbody>
				</table>
			`;
		} else {
			contenidoHtml += `<p><em>La promoción es general (no contiene artículos específicos).</em></p>`;
		}

		contenidoHtml += `</div>`;

		Swal.fire({
			title: "Detalles de la Promoción",
			html: contenidoHtml,
			width: "800px",
			confirmButtonText: "Cerrar",
			showClass: {
				popup: "animate__animated animate__fadeInDown",
			},
			hideClass: {
				popup: "animate__animated animate__fadeOutUp",
			},
		});
	} catch (error) {
		console.error("Error al obtener la promoción:", error);
		Swal.fire({
			icon: "error",
			title: "Error",
			text: "No se pudo cargar la información de la promoción.",
			footer: error.message,
		});
	}
};

const editarPromocion = async (idPromocion) => {
	try {
		// Obtener datos actuales de la promoción
		const res = await fetch(`${proxy.$serverIP}api/Promocion/getPromocionById?idPromocion=${idPromocion}`);
		if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
		const promo = await res.json();

		// Inicializar arreglo de productos
		let productos = promo.productos || [];

		
		const generarTablaProductos = () => {
			if (!productos.length) {
				return `<p><em>Esta promoción es general (sin artículos asociados).</em></p>`;
			}

			return `
				<table class="table table-sm table-bordered" id="tablaProductosPromo">
					<thead class="table-light">
						<tr>
							<th>Código</th>
							<th>Modelo</th>
							<th>Marca</th>
							<th>Medidas</th>
							<th>Uso</th>
							<th>Almacén</th>
							<th>Eliminar</th>
						</tr>
					</thead>
					<tbody>
						${productos.map((p, i) => `
							<tr data-index="${i}">
								<td>${p.codigoLlanta}</td>
								<td>${p.modeloLlanta}</td>
								<td>${p.marcaLlanta}</td>
								<td>${p.medidasLlanta}</td>
								<td>${p.usoLlanta}</td>
								<td>${p.almacenOrigen}</td>
								<td><button type="button" class="btn btn-danger btn-sm eliminarFila"><i class="bi bi-x"></i></button></td>
							</tr>`
						).join("")}
					</tbody>
				</table>
				<button type="button" id="btnAgregarProducto" class="btn btn-secondary btn-sm mt-2">
					Agregar producto
				</button>
			`;
		};

		// Mostrar modal principal
		const { value: formValues } = await Swal.fire({
			title: "Editar Promoción",
			width: "900px",
			html: `
				<div class="container text-start">
					<div class="row g-2">
						<div class="col-md-6">
							<label><strong>Nombre:</strong></label>
							<input id="nombrePromocion" class="form-control" value="${promo.nombrePromocion}" />
						</div>
						<div class="col-md-3">
							<label><strong>Tipo:</strong></label>
							<select id="tipo" class="form-select">
								<option value="true" ${promo.tipo ? "selected" : ""}>Porcentaje</option>
								<option value="false" ${!promo.tipo ? "selected" : ""}>Monto fijo</option>
							</select>
						</div>
						<div class="col-md-3">
							<label><strong>Valor:</strong></label>
							<input id="valor" type="number" class="form-control" value="${promo.valor}" />
						</div>

						<div class="col-md-6 mt-2">
							<label><strong>Fecha inicio:</strong></label>
							<input id="fechaInicio" type="date" class="form-control" value="${promo.fechaInicio.split("T")[0]}" />
						</div>
						<div class="col-md-6 mt-2">
							<label><strong>Fecha fin:</strong></label>
							<input id="fechaFin" type="date" class="form-control" value="${promo.fechaFin.split("T")[0]}" />
						</div>

						<div class="col-md-6 mt-3">
							<div class="form-check">
								<input id="esGeneral" class="form-check-input" type="checkbox" ${promo.esGeneral ? "checked" : ""} />
								<label class="form-check-label"><strong>Promoción general</strong></label>
							</div>
						</div>
						<div class="col-md-6 mt-3">
							<div class="form-check">
								<input id="activo" class="form-check-input" type="checkbox" ${promo.activo ? "checked" : ""	} />
								<label class="form-check-label"><strong>Activo</strong></label>
							</div>  
						</div>
					</div>

					<hr />

					<h6><strong>Productos</strong></h6>
					<div id="contenedorProductos">
						${generarTablaProductos()}
					</div>
				</div>
			`,
			confirmButtonText: "Guardar cambios",
			showCancelButton: true,
			cancelButtonText: "Cancelar",
			focusConfirm: false,

			didOpen: () => {
				const contenedor = document.getElementById("contenedorProductos");
				renderizarProductos(productos, contenedor);
			},

			preConfirm: () => {
				console.log("idPromocion: "+ idPromocion + "Productos: "+ JSON.stringify(productos))
				return {
					idPromocion,
					nombrePromocion: document.getElementById("nombrePromocion").value,
					tipo: document.getElementById("tipo").value === "true",
					valor: parseFloat(document.getElementById("valor").value),
					esGeneral: document.getElementById("esGeneral").checked,
					fechaInicio: new Date(document.getElementById("fechaInicio").value).toISOString(),
					fechaFin: new Date(document.getElementById("fechaFin").value).toISOString(),
					activo: document.getElementById("activo").checked,
					productos: productos,
				};
			},

		});

		// Guardar cambios en backend
		if (formValues) {
			const response = await fetch(`${proxy.$serverIP}api/Promocion/editar`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formValues),
			});

			if (!response.ok)
				throw new Error(`Error ${response.status}: ${response.statusText}`);

			cargarPromociones();
			Swal.fire({
				icon: "success",
				title: "¡Promoción actualizada!",
				text: "Los cambios se guardaron correctamente.",
				timer: 2000,
				showConfirmButton: false,
			});
		}
	} catch (error) {
		console.error("Error al editar promoción:", error);
		Swal.fire({
			icon: "error",
			title: "Error",
			text: "Ocurrió un problema al editar la promoción.",
			footer: error.message,
		});
	}
};



const abrirSelectorDeLlantas = async (productos, contenedor) => {
  const buscador = contenedor.querySelector("#buscadorLlantas");
  if (!buscador) return;

  buscador.innerHTML = `
    <div class="card p-3 border">
      <h6><strong>Buscar llantas</strong></h6>
      <div class="input-group mb-2">
        <input type="text" id="inputBusqueda" class="form-control" placeholder="Ej. 215" />
        <button class="btn btn-primary btn-sm" id="btnBuscarLlantas">Buscar</button>
        <button class="btn btn-secondary btn-sm" id="btnCancelarBusqueda">Cerrar</button>
      </div>
      <div id="tablaResultados" style="max-height:400px; overflow:auto;">
        <p><em>Ingresa una medida y presiona “Buscar”.</em></p>
      </div>
    </div>
  `;

  const input = document.getElementById("inputBusqueda");
  const btnBuscar = document.getElementById("btnBuscarLlantas");
  const btnCancelar = document.getElementById("btnCancelarBusqueda");
  const tablaResultados = document.getElementById("tablaResultados");
  let llantas = [];

  const buscarLlantas = async () => {
    const busqueda = input.value.trim();
    if (!busqueda) {
      tablaResultados.innerHTML = "<p class='text-danger'>Ingresa una medida válida.</p>";
      return;
    }

    tablaResultados.innerHTML = "<p><em>Cargando...</em></p>";
    try {
      const res = await fetch(`${proxy.$serverIP}api/Llanta/getLlantaPromo?pageNumber=1&pageSize=10&busquedaMedida=${busqueda}`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

      const data = await res.json();
      llantas = data.llantas || [];

      if (llantas.length === 0) {
        tablaResultados.innerHTML = "<p><em>No se encontraron resultados.</em></p>";
        return;
      }

      tablaResultados.innerHTML = `
        <table class="table table-sm table-hover table-bordered">
          <thead class="table-light">
            <tr>
              <th></th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Medidas</th>
              <th>Almacén</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            ${llantas
              .map(
                (l) => `
                  <tr>
                    <td><input type="checkbox" class="form-check-input seleccionarLlanta" data-id="${l.idProducto}" /></td>
                    <td>${l.idProducto}</td>
                    <td>${l.nombre}</td>
                    <td>${l.marca}</td>
                    <td>${l.anchura}/${l.perfil}R${l.rin} ${l.carga}${l.velocidad}</td>
                    <td>${l.almacen}</td>
                    <td>$${l.precio.toFixed(2)}</td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <button class="btn btn-success btn-sm mt-2" id="btnAgregarSeleccionadas">Agregar seleccionadas</button>
      `;
    } catch (err) {
      console.error(err);
      tablaResultados.innerHTML = "<p class='text-danger'>Error al obtener llantas.</p>";
    }
  };

  btnBuscar.addEventListener("click", buscarLlantas);
  input.addEventListener("keypress", (e) => e.key === "Enter" && buscarLlantas());
  btnCancelar.addEventListener("click", () => (buscador.innerHTML = ""));

  buscador.addEventListener("click", (e) => {
    if (e.target.id === "btnAgregarSeleccionadas") {
      const seleccionadas = [];
      buscador.querySelectorAll(".seleccionarLlanta:checked").forEach((chk) => {
        const id = parseInt(chk.dataset.id);
        const llanta = llantas.find((l) => l.idProducto === id);
        if (llanta) seleccionadas.push(llanta);
      });

      if (!seleccionadas.length) {
        mostrarToast("warning", "Selecciona al menos una llanta");
        return;
      }

      // ✅ Evitar duplicados
      seleccionadas.forEach((l) => {
        const existe = productos.some((p) => p.idReferencia === l.idProducto);
        if (!existe) {
          productos.push({
            idPromocionProducto: 0,
            idReferencia: l.idProducto, // requerido por API
            tipoReferencia: "LLANTA",
            idInventarioInicial: l.idProducto,
            idLlanta: 0, // no aplica
            codigoLlanta: l.idProducto.toString(),
            modeloLlanta: l.nombre,
            marcaLlanta: l.marca,
            medidasLlanta: `${l.anchura}/${l.perfil}R${l.rin} ${l.carga}${l.velocidad}`,
            usoLlanta: "Carretera", // valor por defecto
            almacenOrigen: l.almacen,
          });
        }
      });

      mostrarToast("success", "Llantas agregadas correctamente");
      renderizarProductos(productos, contenedor);
    }
  });
};






const renderizarProductos = (productos, contenedor) => {
	if (!contenedor) return;

	const tablaHTML = productos.length
		? `
			<table class="table table-sm table-bordered">
				<thead class="table-light">
					<tr>
						<th>Código</th>
						<th>Modelo</th>
						<th>Marca</th>
						<th>Medidas</th>
						<th>Uso</th>
						<th>Almacén</th>
						<th>Eliminar</th>
					</tr>
				</thead>
				<tbody>
					${productos
						.map(
							(p, i) => `
						<tr data-index="${i}">
							<td>${p.codigoLlanta}</td>
							<td>${p.modeloLlanta}</td>
							<td>${p.marcaLlanta}</td>
							<td>${p.medidasLlanta}</td>
							<td>${p.usoLlanta}</td>
							<td>${p.almacenOrigen}</td>
							<td>
								<button type="button" class="btn btn-danger btn-sm eliminarFila">
									<i class="bi bi-x"></i>
								</button>
							</td>
						</tr>
					`
						)
						.join("")}
				</tbody>
			</table>
			<button id="btnAgregarProducto" class="btn btn-secondary btn-sm mt-2">
				Agregar producto
			</button>
			<div id="buscadorLlantas" class="mt-3"></div>
		`
		: `<p><em>Esta promoción es general (sin artículos asociados).</em></p>
			<button id="btnAgregarProducto" class="btn btn-secondary btn-sm mt-2">Agregar producto</button>
			<div id="buscadorLlantas" class="mt-3"></div>`;

	contenedor.innerHTML = tablaHTML;

	// Manejar eliminación de productos
	contenedor.querySelectorAll(".eliminarFila").forEach((btn, index) => {
		btn.addEventListener("click", () => {
			productos.splice(index, 1);
			renderizarProductos(productos, contenedor);
		});
	});

	// Agregar nuevas llantas
	contenedor.querySelector("#btnAgregarProducto")?.addEventListener("click", () => {
		abrirSelectorDeLlantas(productos, contenedor);
	});
};



// Cargar al iniciar el componente
onMounted(() => {
  cargarPromociones();
});
</script>
