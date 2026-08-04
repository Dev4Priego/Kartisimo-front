<template>
	<div class="mt-4">
		<!-- BotÃ³n que abre el modal -->
		<button class="btn btn-primary shadow w-100 position-relative btn-sm py-2 rounded" @click="abrirModal">
			<i class="bi-envelope-paper-fill position-absolute start-0 ms-2"></i>
			&nbsp;&nbsp;Enviar por correo
		</button>

		<div
			v-if="mostrarModalCorreo"
			class="correo-modal-backdrop"
			@click.self="cerrarModalCorreo"
		>
			<div class="correo-modal" role="dialog" aria-modal="true" aria-labelledby="correo-modal-title">
				<div class="correo-modal-header">
					<h3 id="correo-modal-title">Enviar cotizaciÃ³n por correo</h3>
					<button
						type="button"
						class="correo-modal-close"
						aria-label="Cerrar"
						:disabled="enviandoCorreo"
						@click="cerrarModalCorreo"
					>
						<i class="bi bi-x-lg"></i>
					</button>
				</div>

				<div class="correo-modal-body">
					<label class="correo-field">
						<span>Correo destinatario</span>
						<input
							v-model.trim="correoDestino"
							type="email"
							placeholder="Correo destinatario"
							autocomplete="email"
							:disabled="enviandoCorreo"
						/>
					</label>

					<label class="correo-field">
						<span>Asunto</span>
						<input
							v-model.trim="asuntoCorreo"
							type="text"
							placeholder="Asunto"
							:disabled="enviandoCorreo"
						/>
					</label>

					<label class="correo-field">
						<span>Mensaje</span>
						<textarea
							v-model="mensajeCorreo"
							placeholder="Mensaje..."
							rows="5"
							:disabled="enviandoCorreo"
						></textarea>
					</label>

					<p v-if="mensajeModalCorreo" class="correo-modal-message" :class="estadoModalCorreo">
						{{ mensajeModalCorreo }}
					</p>

					<div class="correo-modal-actions">
						<button
							type="button"
							class="correo-btn correo-btn-secondary"
							:disabled="enviandoCorreo"
							@click="cerrarModalCorreo"
						>
							Cancelar
						</button>
						<button
							type="button"
							class="correo-btn correo-btn-primary"
							:disabled="enviandoCorreo"
							@click="enviarDesdeModal"
						>
							<span v-if="enviandoCorreo" class="correo-spinner"></span>
							{{ enviandoCorreo ? "Enviando..." : "Enviar" }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import Swal from 'sweetalert2'
import { getCotizacionPdfBlob } from '@/components/Cotizacion/CotizacionPdf'


const { proxy } = getCurrentInstance()
const raw = JSON.parse(localStorage.getItem("userSession") || "{}");

const props = defineProps({
	cotizacion: Object
})

const mostrarModalCorreo = ref(false)
const correoDestino = ref('')
const asuntoCorreo = ref('')
const mensajeCorreo = ref('')
const mensajeModalCorreo = ref('')
const estadoModalCorreo = ref('')
const enviandoCorreo = ref(false)

const abrirModal = () => {
	if (!props.cotizacion) {
		mensajeModalCorreo.value = 'No hay cotización cargada.'
		estadoModalCorreo.value = 'error'
		mostrarModalCorreo.value = true
		return
	}

	const texto = props.cotizacion?.llantasSelecionadas?.[0]?.medidas || "";
	const match = texto.match(/\d{3}\/\d{2}\s*r?\d{2}/i);
	const medida = match ? match[0].toUpperCase() : "";
	const correo = props.cotizacion?.cliente?.correo || "";

	correoDestino.value = correo
	asuntoCorreo.value = `Cotización ${medida} Kartisimo`
	mensajeCorreo.value = ''
	mensajeModalCorreo.value = ''
	estadoModalCorreo.value = ''
	mostrarModalCorreo.value = true
}

const cerrarModalCorreo = () => {
	if (enviandoCorreo.value) return
	mostrarModalCorreo.value = false
}

const enviarDesdeModal = async () => {
	if (!correoDestino.value || !asuntoCorreo.value) {
		mensajeModalCorreo.value = 'Completa todos los campos requeridos.'
		estadoModalCorreo.value = 'error'
		return
	}
	
		
	//enviandoCorreo.value = true
	//mensajeModalCorreo.value = 'El correo se está procesando en segundo plano.'
	//estadoModalCorreo.value = 'info'

	try {
		await generarPDFyEnviar({
			email: correoDestino.value,
			subj: asuntoCorreo.value,
			msg: mensajeCorreo.value,
		})
		//mensajeModalCorreo.value = 'Correo enviado exitosamente.'
		//estadoModalCorreo.value = 'success'
		
	} catch (error) {
		console.error(error)
		mensajeModalCorreo.value = error.message || 'No se pudo enviar el correo.'
		estadoModalCorreo.value = 'error'
		enviandoCorreo.value = false
	}
}


const generarPDFyEnviar = async ({ email, subj, msg }) => {
	enviandoCorreo.value = true
	mensajeModalCorreo.value = ''
	estadoModalCorreo.value = ''

	const [pdfBlob, datos] = await Promise.all([
		getCotizacionPdfBlob(props.cotizacion),
		obtenerDatosUsuarioCorreo(),
	])
	const pdfBase64 = await blobToBase64(pdfBlob)

	const response = await fetch(`${proxy.$serverIP}api/Email/enviar`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			CorreoOrigen: raw.usuario.correo,
			Contrasenia: datos.usuario.password_correo,
			Para: email,
			Asunto: subj,
			Cuerpo: msg,
			NombreRemitente: 'Kartisimo ' + datos.usuario.nombre,
			AdjuntoBase64: pdfBase64,
			NombreAdjunto: `Cotizacion_${props.cotizacion?.codigo || 'Kartisimo'}.pdf`,
		}),
	})

	if (!response.ok) {
		let data = null
		try {
			data = await response.json()
		} catch {
			data = null
		}
		throw new Error(data?.message || data?.mensaje || 'No se pudo enviar el correo.')
	}

	enviandoCorreo.value = false
	cerrarModalCorreo()
	Swal.fire({
		icon: 'success',
		title: 'Correo enviado correctamente',
		text: 'La cotizacion fue enviada al correo indicado.',
		confirmButtonText: 'OK',
	})
}
const obtenerDatosUsuarioCorreo = async () => {
	const response = await fetch(`${proxy.$serverIP}api/Usuario/${raw.usuario.idUsuario}`)

	if (!response.ok) {
		throw new Error('No se pudieron obtener los datos del usuario para enviar el correo.')
	}

	return response.json()
}

// Helper para convertir Blob â†’ Base64
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
	const reader = new FileReader()
	reader.onloadend = () => resolve(reader.result.split(',')[1])
	reader.onerror = reject
	reader.readAsDataURL(blob)
})


</script>

<style scoped>
.correo-modal-backdrop {
	position: fixed;
	inset: 0;
	z-index: 1080;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
	background: rgba(0, 0, 0, 0.42);
}

.correo-modal {
	width: min(600px, 100%);
	max-height: calc(100vh - 48px);
	overflow: auto;
	background: #fff;
	border-radius: 6px;
	box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
}

.correo-modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 22px 24px 12px;
}

.correo-modal-header h3 {
	margin: 0;
	font-size: 22px;
	font-weight: 600;
	color: #222;
}

.correo-modal-close {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 34px;
	height: 34px;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: #707070;
	transition: background-color 0.15s ease, color 0.15s ease;
}

.correo-modal-close:hover:not(:disabled) {
	background: #f2f2f2;
	color: #222;
}

.correo-modal-body {
	display: grid;
	gap: 14px;
	padding: 8px 24px 24px;
}

.correo-field {
	display: grid;
	gap: 6px;
	margin: 0;
}

.correo-field span {
	font-size: 13px;
	font-weight: 600;
	color: #4b5563;
}

.correo-field input,
.correo-field textarea {
	width: 100%;
	border: 1px solid #d5d9e2;
	border-radius: 4px;
	padding: 10px 12px;
	font-size: 15px;
	color: #202124;
	background: #fff;
	outline: none;
	transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.correo-field textarea {
	resize: vertical;
	min-height: 118px;
}

.correo-field input:focus,
.correo-field textarea:focus {
	border-color: #3085d6;
	box-shadow: 0 0 0 3px rgba(48, 133, 214, 0.14);
}

.correo-field input:disabled,
.correo-field textarea:disabled {
	background: #f6f7f9;
	color: #6b7280;
}

.correo-modal-message {
	margin: 0;
	padding: 10px 12px;
	border-radius: 4px;
	font-size: 14px;
}

.correo-modal-message.error {
	color: #842029;
	background: #f8d7da;
}

.correo-modal-message.success {
	color: #0f5132;
	background: #d1e7dd;
}

.correo-modal-message.info {
	color: #084298;
	background: #cfe2ff;
}

.correo-modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	padding-top: 4px;
}

.correo-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	min-width: 96px;
	border: 0;
	border-radius: 4px;
	padding: 10px 16px;
	font-size: 15px;
	font-weight: 600;
	transition: background-color 0.15s ease, opacity 0.15s ease;
}

.correo-btn:disabled {
	cursor: not-allowed;
	opacity: 0.75;
}

.correo-btn-primary {
	color: #fff;
	background: #3085d6;
}

.correo-btn-primary:hover:not(:disabled) {
	background: #256fb6;
}

.correo-btn-secondary {
	color: #fff;
	background: #6c757d;
}

.correo-btn-secondary:hover:not(:disabled) {
	background: #5c636a;
}

.correo-spinner {
	width: 15px;
	height: 15px;
	border: 2px solid rgba(255, 255, 255, 0.45);
	border-top-color: #fff;
	border-radius: 50%;
	animation: correo-spin 0.7s linear infinite;
}

@keyframes correo-spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: 576px) {
	.correo-modal-backdrop {
		align-items: flex-start;
		padding: 16px;
	}

	.correo-modal-header,
	.correo-modal-body {
		padding-left: 18px;
		padding-right: 18px;
	}

	.correo-modal-actions {
		flex-direction: column-reverse;
	}

	.correo-btn {
		width: 100%;
	}
}
</style>
