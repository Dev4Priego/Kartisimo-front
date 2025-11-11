<template>
  <div class="mt-4">
    <!-- Botón que abre el modal -->
    <button class="btn btn-outline-danger w-100" @click="abrirModal">
      Enviar por correo
    </button>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, defineProps } from 'vue'
import Swal from 'sweetalert2'
import html2pdf from 'html2pdf.js'; 


const { proxy } = getCurrentInstance()
const correo = ref('')
const asunto = ref('')
const mensaje = ref('')


const props = defineProps({
	cotizacion: Object
})


const abrirModal = async () => {

	if (!props.cotizacion) {
		Swal.fire('Error', 'No hay cotización cargada.', 'error')
		return
	}

	const { value: formValues } = await Swal.fire({
		title: 'Enviar por correo',
		html: `
			<input id="correo" class="swal2-input" placeholder="Correo destinatario" type="email">
			<input id="asunto" class="swal2-input" placeholder="Asunto">
			<textarea id="mensaje" class="swal2-textarea" placeholder="Mensaje..."></textarea>
		`,
		confirmButtonText: 'Enviar',
		showCancelButton: true,
		focusConfirm: false,
		preConfirm: () => {
			const email = document.getElementById('correo').value
			const subj = document.getElementById('asunto').value
			const msg = document.getElementById('mensaje').value

			if (!email || !subj || !msg) {
				Swal.showValidationMessage('Completa todos los campos')
				return false
			}

			return { email, subj, msg }
		}
	})

	if (formValues) {
		await generarPDFyEnviar(formValues)
	}
}
const generarPDFyEnviar = async ({ email, subj, msg }) => {
	try {

		Swal.fire({ title: 'Generando PDF...', didOpen: () => Swal.showLoading(), allowOutsideClick: false })

		// Crear un contenedor temporal para el PDF
		const pdfContent = document.createElement('div')
		pdfContent.innerHTML = `
			<h2>Cotización ${props.cotizacion.codigo}</h2>
			<p><strong>Cliente:</strong> ${props.cotizacion.cliente.nombre}</p>
			<p><strong>Teléfono:</strong> ${props.cotizacion.cliente.telefono}</p>
			<p><strong>Correo:</strong> ${props.cotizacion.cliente.correo}</p>
			<hr>
			<h3>Llantas</h3>
			<ul>
				${props.cotizacion.llantasSelecionadas.map(l =>
				`<li>${l.medidas} - ${l.cantidad} × $${l.precioConPromo.toFixed(2)} = $${l.total.toFixed(2)}</li>`
				).join('')}
			</ul>
			<h3>Paquetes</h3>
			<ul>
				${props.cotizacion.paquetes.map(p =>
				`<li>${p.nombre} - $${p.total.toFixed(2)}</li>`
				).join('')}
			</ul>
			<h3>Servicios adicionales</h3>
			<ul>
				${props.cotizacion.serviciosAdicionales.map(s =>
				`<li>${s.nombreServicio} - ${s.cantidad} × $${s.precioConPromo.toFixed(2)} = $${s.total.toFixed(2)}</li>`
				).join('')}
			</ul>
			<hr>
			<h3>Total: $${props.cotizacion.total.toFixed(2)}</h3>
		`		// Generar el PDF en base64
		const opt = {
			margin: 10,
			filename: `${props.cotizacion.codigo}.pdf`,
			html2canvas: { scale: 2 },
			jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
		}

		const pdfBlob = await html2pdf().set(opt).from(pdfContent).outputPdf('blob')
		const pdfBase64 = await blobToBase64(pdfBlob)

		// Enviar correo
		const response = await fetch(`${proxy.$serverIP}api/Email/enviar`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				CorreoOrigen: 'desarrollo4@priego8a.com',
				Contrasenia: 'K@633751140520oz',
				Para: email,
				Asunto: subj,
				Cuerpo: msg,
				AdjuntoBase64: pdfBase64,
				NombreAdjunto: `${props.cotizacion.codigo}.pdf`
			})
		})

		Swal.close()

		if (response.ok) {
			Swal.fire('✅ Enviado', 'El correo con el PDF se envió correctamente.', 'success')
		} else {
			Swal.fire('❌ Error', 'No se pudo enviar el correo.', 'error')
		}
	} catch (error) {
		Swal.fire('Error', error.message, 'error')
	}
}

// Helper para convertir Blob → Base64
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
	const reader = new FileReader()
	reader.onloadend = () => resolve(reader.result.split(',')[1])
	reader.onerror = reject
	reader.readAsDataURL(blob)
})
</script>
