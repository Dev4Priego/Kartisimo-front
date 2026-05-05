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
							<th class="text-center">Velocidad*</th>
							<th class="text-center">Anchura*</th>
							<th class="text-center">Perfil*</th>
							<th class="text-center">Rin*</th>
							<th class="text-center" style="width: 4%;">RunFlat</th>
							<th class="text-center">Cantidad*</th>
							<th class="text-center">Precio*</th>
							<th class="text-center">nom</th>

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
								<input type="number" class="form-control" v-model="llanta.precio" step="any" >
							</td>
							<td>
								<input type="number" class="form-control" v-model="llanta.nomenclatura"  >
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
const almacen=ref('Avante')
const filtroMarca=ref("")
const filtroTexto=ref("")
const emit = defineEmits(['close'])
const props = defineProps({
  showModal: Boolean,
  llantas: { type: Array, required: true },
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

const nomenclatura = (item)=>{
	if (llanta.nomenclatura == 1){
		return item / 100;
	}
	return item;	
	
}

const ValidateList = () => {
  const aceptadas = []
  const rechazadas = []

  props.llantas.forEach(llanta => {
    const esValida = llanta.marca && llanta.modelo && llanta.carga != null && llanta.velocidad  && llanta.anchura != null; //Agregar el campo de redial
	llanta.medida = `${llanta.anchura}${llanta.perfil != 0 ? `/${llanta.perfil}R${llanta.rin}` : `R${llanta.rin}`}`
	llanta.rango=`${llanta.carga}${llanta.subCarga != 0 ? `/${llanta.subCarga}${llanta.velocidad}` : llanta.velocidad }`
    if (esValida) {
      aceptadas.push(llanta)
    } else {
      rechazadas.push(llanta)
    }
  })

  // guardas las válidas
  llantasAceptadas.value = aceptadas

  //reemplazo el array original
  props.llantas.splice(0, props.llantas.length, ...rechazadas)
  if (props.llantas.length === 0) {
    return true;
  } else {
    Swal.fire({
      icon: "warning",
      title: "Campos vacíos",
      text: `Faltan ${props.llantas.length} llantas por completar.`,
      confirmButtonColor: "#3085d6",
    });
    return false;
  }
}

const  GuardarLlantas = async ()=>{
	const valido= ValidateList();
	if(valido){
		console.log("llantas a guardar:" , llantasAceptadas.value)
		const PAYLOAD ={
			llantas: llantasAceptadas.value,
			almacen : almacen.value
		}
		console.log("PAYLOAD [DEBUG]:", PAYLOAD);
		try{
			const res = await fetch(`${proxy.$serverIP}api/Listas/GuardarNuevas`,{
				method: "POST",
				headers:{"Content-Type": "application/json"},
				body:JSON.stringify(PAYLOAD),
			});
			if (!res.ok){
				throw new Error(`Error HTTP ${res.status}`);
			}
			console.log("Guardado...")
			Swal.fire({
				icon: "success",
				title: "Llantas Guardadas",
				text: `Las llantas se guardaron correctamente`,
			});
		}catch{
			 console.error("ERROR guardarCotizacion:", error);
			Swal.fire("Error", "No se pudo guardar la cotización.", "error");
		}finally{
			closeModal();
		}
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
