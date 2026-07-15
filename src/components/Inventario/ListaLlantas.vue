<template>
  <div v-if="showModal">
    <div class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable" style="max-width: 95vw">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Llantas Nuevas</h5>
          </div>

          <div class="modal-body">
            <div class="container-fluid py-3" >
				<div class="row mb-3">

				<!--  Filtrar -->
				<div class="col-md-6">
					<label for="filtro">Filtrar lista</label>
					<input 
					type="text"
					name="filtro"
					class="form-control"
					placeholder="Buscar por descripción..."
					v-model="filtroTexto"
					/>
				</div>

				
				<div class="col-md-4">
					<label for="FiltroMarca" class="mb-1">Filtrar por marca</label>
					<select class="form-select" name="FiltroMarca" v-model="filtroMarca" @change="SetBranchOnFilter">
					<option value="">-- Todas --</option>
					<option value="SIN_MARCA">-- Sin Marca --</option>

					<option 
						v-for="marca in marcas" 
						:key="marca.idMarca"
						:value="marca.idMarca"
					>
						{{ marca.nombre }}
					</option>
					</select>
				</div>
				<!-- Limpiar -->
				<div class="col-md-2">
					<label for="">ㅤ</label>
					<button 
					class="btn btn-outline-secondary w-100"
					@click="filtroTexto = ''; filtroMarca = ''"
					>
					Limpiar
					</button>
				</div>
				<div class="mb-3">
					<label class="form-label">Asignar marca a resultados filtrados</label>

					<select 
						class="form-select"
						v-model="branchOnFilter"
						@change="SetBranchOnFilter"
						:disabled="disabledBranch"
					>
						<option value="">-- Seleccionar marca --</option>

						<option 
						v-for="marca in marcas" 
						:key="marca.idMarca"
						:value="marca.idMarca"
						>
						{{ marca.nombre }}
						</option>
					</select>
					</div>


				</div>
              <div class="table">

  				<table class="table table-striped table-hover align-middle">
  					<thead class="table-light position-sticky top-0" style="position: sticky;">
				
						<tr>
							
							<th class="text-center">Codigo</th>
							<th class="text-center">Descripcion</th>
							<th class="text-center" style="width: 10%;" >Marca*</th>
							<th class="text-center" style="width: 15%;" >Modelo*</th>
							<th class="text-center">Carga*</th>
							<th class="text-center">Carga Dual</th>
							<th class="text-center">Velocidad</th>
							<th class="text-center">Anchura</th>
							<th class="text-center">Perfil</th>
							<th class="text-center">Rin*</th>
							<th class="text-center">Capas</th>
							<th class="text-center" style="width: 4%;">RunFlat</th>
							<th class="text-center">Cantidad*</th>
							<th class="text-center">Costo*</th>

							<th class="text-center">Precio*</th>
							<th class="text-center" style="min-width: 180px;">Nomenclatura*</th>
							<th class="text-center" style="min-width: 180px;">Medida a guardar</th>

						</tr>
					</thead>
					<tbody>
						<tr v-for="llanta in llantasPaginadas" :key="llanta.codigo">
							
							<!--Codigo-->
							<td class="text-center">{{llanta.codigo}}</td>
							<!--Desc-->
							<td class="text-start">{{llanta.descripcion}}</td>
							<!--marca-->
							<td>
								<select name="marca" id="marca" class="form-select mb-3" v-model.number="llanta.marca">
									<option value="null">--Sin marca--</option> <!--Poner id de "Sin marca	"-->
								
									<option v-for="marca in marcas" :key=" marca.idMarca" :value="marca.idMarca"> {{marca.nombre}}</option>
								</select>
							</td>
							<!--Modelo-->
							<td>
								<input type="text" class="form-control" v-model="llanta.modelo">
							</td>
							<!--Carga-->
							<td>
								<input type="number" class="form-control" v-model="llanta.carga">
							</td>
							<!--subCarga (Dual)-->
							<td>
								<input type="number" class="form-control" v-model="llanta.subCarga">
							</td>
							<!--Vel-->
							<td>
								<input type="text" class="form-control" v-model="llanta.velocidad">
							</td>
							<!--ancho-->
							<td>
								<input type="number" class="form-control" v-model="llanta.anchura">
							</td>
							<!--perfil-->
							<td>
								<input type="number" class="form-control" v-model="llanta.perfil">
							</td>
							<!--rin-->
							<td>
								<input type="number" class="form-control" v-model="llanta.rin">
							</td>
							<!--capas-->
							<td>
								<input
									type="number"
									class="form-control"
									v-model="llanta.capas"
									:disabled="!usaCapas(llanta.nomenclatura)"
								>
							</td>
							<!--runFlat-->
							<td>
								<select name="runflat" id="runflat" v-model="llanta.rf" class="form-select">
									<option value="0">No</option>
									<option value="1">Sí</option>
								</select>
							</td>
							<!--cantidad-->
							<td>
								<input type="number" class="form-control" v-model="llanta.cantidad">
							</td>
							<!--runFlat-->
              <td>
								<input type="number" class="form-control" v-model="llanta.costo" step="any" >
							</td>
							<td>
								<input type="number" class="form-control" v-model="llanta.precio" step="any" >
							</td>
							<td>
								<select class="form-select" v-model.number="llanta.nomenclatura">
									<option :value="0">-- Seleccionar --</option>
									<option
										v-for="opcion in nomenclaturas"
										:key="opcion.value"
										:value="opcion.value"
									>
										{{ opcion.label }}
									</option>
								</select>
							</td>
							<td class="text-nowrap fw-semibold">
								{{ buildMedida(llanta) || '-' }}
							</td>
						</tr>
					</tbody>
				</table>
				<div class="d-flex justify-content-between align-items-center mt-2">

					<button 
						class="btn btn-outline-secondary btn-sm"
						@click="prevPage"
						:disabled="page === 1"
					>
						← Anterior
					</button>

					<span>
						Página {{ page }} de {{ totalPages }}
					</span>

					<button 
						class="btn btn-outline-secondary btn-sm"
						@click="nextPage"
						:disabled="page === totalPages"
					>
						Siguiente →
					</button>

					</div>
			</div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">
			Cancelar
			</button>

            <button class="btn btn-success" @click="GuardarLlantas">Cargar Lista</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop fade show"></div>
  </div>
</template>
<script setup>
import Swal from "sweetalert2";
import { ref, defineProps, defineEmits, watch, computed, onMounted } from "vue";
import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
const marcas = ref([]);
const page = ref(1);
const pageSize = ref(100);
const numrow =ref(1)
const filtroMarca=ref("")
const filtroTexto=ref("")
const emit = defineEmits(['close'])
const props = defineProps({
  showModal: Boolean,
  llantas: { type: Array, required: true },
  almacen: { type: String, required: true },
});

// paginacion de la tabla
const totalPages = computed(()=>{
	return  Math.ceil(llantasFiltradas.value.length / pageSize.value)
})
const llantasPaginadas = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return llantasFiltradas.value.slice(start, start + pageSize.value)
})

const nextPage = () => {
  if (page.value < totalPages.value) page.value++
}

const prevPage = () => {
  if (page.value > 1) page.value--
}
//filtros
const llantasFiltradas = computed(() => {
	const texto = filtroTexto.value.toLowerCase()
  return props.llantas.filter(llanta => {

 
     const textoMatch =
      llanta.descripcion?.toLowerCase().includes(texto) ||
      String(llanta.codigo)?.toLowerCase().includes(texto)

    //  Filtro por marca
    let marcaMatch = true

    if (filtroMarca.value === 'SIN_MARCA') {
      marcaMatch = !llanta.marca  // null, "", undefined
    } 
    else if (filtroMarca.value) {
      marcaMatch = llanta.marca == filtroMarca.value
    }

    return textoMatch && marcaMatch
  })
})

const branchOnFilter = ref(null);
const SetBranchOnFilter = ()=>{
	if(!branchOnFilter.value  && !filtroTexto.value) return
	llantasFiltradas.value.forEach(llanta =>{
		llanta.marca = branchOnFilter.value
	})
	branchOnFilter.value=null
}
const disabledBranch =ref(true); // activa
watch ([filtroTexto] , ()=>{
	if (filtroTexto.value != ""){
		disabledBranch.value = false;
	}else{

		disabledBranch.value=true;
	}
})

watch([filtroTexto, filtroMarca], () => {
  page.value = 1
})
//Obtener las marcas
const getBranchs = async () => {
  try {
    const res = await fetch(proxy.$serverIP + "api/Llanta/getMarcasLlantas");
    const data = await res.json();
    marcas.value = data.marcas;
    
  } catch (e) {
    console.error("Error al cargar los datos", e);
  }
};
onMounted(async () => {
  await getBranchs();
});
// validar que la lista no tenga llantas con campos nulos
const llantasAceptadas = ref([])

const nomenclaturas = [
  { value: 1, label: 'Métrica radial', example: '205/55R16' },
  { value: 2, label: 'Americana', example: '31X10.50R15' },
  { value: 3, label: 'Radial sin perfil / camión', example: '195R15, 11R22.5' },
  { value: 4, label: 'Convencional / agrícola', example: '10.00-16, 17.5-25' },
  { value: 5, label: 'Flotacion / ATV', example: '25X10-12, 25X10-12-6C' },
  { value: 6, label: 'Metrica con rin por guion', example: '145/70-6, 145/70-6-6C' },
  { value: 7, label: 'Trailer sin perfil', example: '4.80X12, 4.80X12-6C' },
]

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const hasValue = (value) => value !== null && value !== undefined && value !== ''

const formatStoredDecimal = (value, forceTwoDecimals = false) => {
  const number = toNumber(value)
  if (!number) return ''

  const shouldNormalize = Number.isInteger(number) && (forceTwoDecimals || Math.abs(number) >= 1000)
  const normalized = shouldNormalize ? number / 100 : number

  if (forceTwoDecimals) {
    return normalized.toFixed(2)
  }

  return String(Number(normalized.toFixed(2)))
}

const formatRin = (value) => formatStoredDecimal(value)

const usaCapas = (nomenclatura) => [2, 4, 5, 6, 7].includes(Number(nomenclatura || 0))

const requiereRin = (nomenclatura) => Number(nomenclatura || 0) !== 5

const buildCapas = (llanta) => {
  if (!usaCapas(llanta.nomenclatura)) return ''
  const capas = obtenerCapas(llanta)
  return capas > 0 ? `-${capas}C` : ''
}

const obtenerCapas = (llanta) => {
  const directa = toNumber(llanta.capas ?? llanta.Capas ?? llanta.capa ?? llanta.Capa)
  if (directa > 0) return directa

  const texto = [
    llanta.medida,
    llanta.descripcion,
    llanta.normalizada,
    llanta.descripcionNormalizada,
  ].filter(Boolean).join(' ').toUpperCase()

  const match = texto.match(/(?:^|[-\s])(\d{1,2})(?:C|PR)(?:\s|$)/)
  return match ? toNumber(match[1]) : 0
}

const normalizarCapasLlanta = (llanta) => {
  llanta.capas = usaCapas(llanta.nomenclatura) ? obtenerCapas(llanta) : 0
}

watch(
  () => props.llantas,
  (llantas) => {
    llantas.forEach(normalizarCapasLlanta)
  },
  { immediate: true, deep: true }
)

const buildMedida = (llanta) => {
  const nomenclatura = Number(llanta.nomenclatura || 0)
  const ancho = toNumber(llanta.anchura)
  const perfil = toNumber(llanta.perfil)
  const rin = toNumber(llanta.rin)

  if (!nomenclatura || !ancho) return ''
  if (requiereRin(nomenclatura) && !rin) return ''

  if (nomenclatura === 1) {
    if (!perfil) return ''
    return `${ancho}/${perfil}R${formatRin(rin)}`
  }

  if (nomenclatura === 2) {
    if (!perfil) return ''
    return `${formatStoredDecimal(ancho)}X${formatStoredDecimal(perfil, true)}R${formatRin(rin)}${buildCapas(llanta)}`
  }

  if (nomenclatura === 3) {
    return `${formatStoredDecimal(ancho, ancho >= 1000 || (ancho >= 500 && rin >= 1000))}R${formatRin(rin)}`
  }

  if (nomenclatura === 4) {
    const medidaActual = String(llanta.medida || '').toUpperCase()
    const separador = medidaActual.includes('L-') ? 'L-' : '-'
    return `${formatStoredDecimal(ancho, ancho >= 1000)}${separador}${formatRin(rin)}${buildCapas(llanta)}`
  }

  if (nomenclatura === 5) {
    if (!perfil) return ''
    const alto = formatStoredDecimal(ancho, ancho >= 1000)
    const anchoSeccion = formatStoredDecimal(perfil, perfil >= 100)
    const rinMedida = rin > 0 ? `-${formatRin(rin)}` : ''
    return `${alto}X${anchoSeccion}${rinMedida}${buildCapas(llanta)}`
  }

  if (nomenclatura === 6) {
    if (!perfil) return ''
    return `${ancho}/${perfil}-${formatRin(rin)}${buildCapas(llanta)}`
  }

  if (nomenclatura === 7) {
    return `${formatStoredDecimal(ancho, ancho >= 100)}X${formatRin(rin)}${buildCapas(llanta)}`
  }

  return ''
}

const buildRango = (llanta) => {
  const carga = toNumber(llanta.carga)
  const subCarga = toNumber(llanta.subCarga)
  const velocidad = String(llanta.velocidad || '').trim().toUpperCase()

  if (!carga || !velocidad || velocidad === 'N/A') return null
  return subCarga ? `${carga}/${subCarga}${velocidad}` : `${carga}${velocidad}`
}

const prepararLlantaParaGuardar = (llanta) => {
  const medida = buildMedida(llanta)
  const velocidad = String(llanta.velocidad || '').trim().toUpperCase()

  llanta.nomenclatura = Number(llanta.nomenclatura || 0)
  llanta.anchura = toNumber(llanta.anchura)
  llanta.perfil = toNumber(llanta.perfil)
  llanta.rin = toNumber(llanta.rin)
  llanta.carga = toNumber(llanta.carga)
  llanta.subCarga = toNumber(llanta.subCarga)
  llanta.rf = toNumber(llanta.rf)
  llanta.capas = usaCapas(llanta.nomenclatura) ? obtenerCapas(llanta) : 0
  llanta.cantidad = toNumber(llanta.cantidad)
  llanta.precio = Number(llanta.precio || 0)
  llanta.velocidad = velocidad && velocidad !== '0' ? velocidad : 'N/A'
  llanta.medida = medida
  llanta.rango = buildRango(llanta)

  return medida
}

const ValidateList = () => {
  const aceptadas = []
  const rechazadas = []

  props.llantas.forEach(llanta => {
    const medida = prepararLlantaParaGuardar(llanta)
    const esValida = Boolean(
      llanta.marca &&
      llanta.modelo &&
      llanta.nomenclatura &&
      medida &&
      hasValue(llanta.anchura) &&
      (!requiereRin(llanta.nomenclatura) || hasValue(llanta.rin))
    )

    if (esValida) {
      aceptadas.push(llanta)
    } else {
      rechazadas.push(llanta)
    }
  })

  llantasAceptadas.value = aceptadas

  return {
    aceptadas,
    rechazadas,
  }
}

const GuardarLlantas = async () => {
  const { aceptadas, rechazadas } = ValidateList()

  if (!props.almacen) {
    Swal.fire("Error", "No se pudo identificar el almacen de la lista.", "error")
    return
  }

  if (aceptadas.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Campos vacíos",
      text: `Faltan ${rechazadas.length} llantas por completar. Revisa marca, modelo, nomenclatura y medida.`,
      confirmButtonColor: "#3085d6",
    })
    return
  }

  const PAYLOAD = {
    llantas: aceptadas,
    almacen: props.almacen
  }

  try {
    const res = await fetch(`${proxy.$serverIP}api/Listas/GuardarNuevas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(PAYLOAD),
    })

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`)
    }

    props.llantas.splice(0, props.llantas.length, ...rechazadas)

    if (rechazadas.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Llantas guardadas parcialmente",
        text: `Se guardaron ${aceptadas.length} llantas. Faltan ${rechazadas.length} por completar.`,
        confirmButtonColor: "#3085d6",
      })
    } else {
      Swal.fire({
        icon: "success",
        title: "Llantas Guardadas",
        text: `Las llantas se guardaron correctamente`,
      })
      closeModal()
    }
  } catch (error) {
    console.error("ERROR guardar llantas:", error)
    Swal.fire("Error", "No se pudieron guardar las llantas.", "error")
  }
}
const closeModal = () => {
  // reset estado interno
  filtroTexto.value = ''
  filtroMarca.value = ''
  page.value = 1

  // emitir al padre
  emit('close')
}
</script>
