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
		<style>
			body {
				font-family: Arial, Helvetica, sans-serif;
				font-size: 12px;
				color: #000;
			}

			.header {
				display: flex;
				justify-content: space-between;
				margin-bottom: 20px;
			}

			.branch {
				width: 32%;
				font-size: 11px;
				line-height: 1.4;
			}

			hr {
				border: none;
				border-top: 1px solid #000;
				margin: 15px 0;
			}

			.info {
				display: flex;
				justify-content: space-between;
				margin-bottom: 10px;
				font-size: 12px;
			}

			table {
				width: 100%;
				border-collapse: collapse;
				margin-top: 10px;
				font-size: 12px;
			}

			thead th {
				border-top: 2px solid #000;
				border-bottom: 2px solid #000;
				padding: 6px;
				text-align: center;
			}

			tbody td {
				padding: 6px;
				border-bottom: 1px solid #000;
			}

			.center { text-align: center; }
			.right { text-align: right; }

			.footer {
				margin-top: 15px;
				text-align: right;
				font-style: italic;
				font-size: 11px;
			}

			.header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 20px;
			}

			.logo {
				width: 180px;
			}

			.company {
				font-size: 14px;
				font-weight: bold;
				text-align: right;
			}

			.branches {
				display: flex;
				justify-content: space-between;
				margin-top: 10px;
				font-size: 11px;
			}

			.branch {
				width: 32%;
				line-height: 1.4;
			}
		</style>

		<!-- ENCABEZADO -->
		<div class="header">
			<img src="/images/Logo-Kartisimo.png" class="logo" />

			<div class="company">
				Kartisimo Bajio S.A. de C.V.
			</div>
		</div>

		<div class="branches">
			<div class="branch">
				<strong>Blvd. Delta 2002 esq. Rio Mayo</strong><br>
				Col. Valle de Jerez C.P. 37538<br>
				Tel. 477 330 6060 y 477 390 5090<br>
				delta@kartisimo.mx
			</div>

			<div class="branch">
				<strong>Blvd. Lopez Mateos 827 esq. Apolo</strong><br>
				Col. Obrera C.P. 37340<br>
				Tel. 477 717 7440 y 477 470 9419<br>
				apolo@kartisimo.mx
			</div>

			<div class="branch">
				<strong>Blvd. Torres Landa 1901 esq San Jacobo</strong><br>
				Col. La Pisina C.P. 37440<br>
				Tel. 477 390 0290 y 477 461 0028<br>
				torreslanda@kartisimo.mx
			</div>
			<div class="branch">
				<strong>Blvd. Mariano Escobedo Pte. 2715 esq. San Sebastián</strong><br>
				Col. La Martinica, C.P. 37500<br>
				Tel. 477 763 3285 y 477 763 3284
			</div>
		</div>

		<hr>

		<!-- DATOS CLIENTE -->
		<div class="info">
			<div><strong>No. Cotización:</strong> ${props.cotizacion.codigo}</div>
			<div><strong>Cliente:</strong> ${props.cotizacion.cliente.nombre}</div>
			<div><strong>Teléfono:</strong> ${props.cotizacion.cliente.telefono}</div>
		</div>

		<!-- TABLA -->
		<table>
			<thead>
				<tr>
					<th>CANT</th>
					<th>MARCA - MODELO - MEDIDA</th>
					<th>PRECIO UNITARIO</th>
					<th>TOTAL</th>
				</tr>
			</thead>
			<tbody>
				${props.cotizacion.llantasSelecionadas.map(l => `
				<tr>
					<td class="center">${l.cantidad}</td>
					<td>${l.medidas}</td>
					<td class="right">$${l.precioConPromo.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
					<td class="right">$${l.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
				</tr>
				`).join('')}

				${props.cotizacion.paquetes.map(p => `
				<tr>
					<td class="center">1</td>
					<td><em>${p.nombre}</em></td>
					<td class="right">$${p.precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
					<td class="right">$${p.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
				</tr>
				`).join('')}

				${props.cotizacion.serviciosAdicionales.map(s => `
				<tr>
					<td class="center">${s.cantidad}</td>
					<td><em>${s.nombreServicio}</em></td>
					<td class="right">$${s.precioConPromo.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
					<td class="right">$${s.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
				</tr>
				`).join('')}
			</tbody>
		</table>

		<div class="footer">
			Los precios incluyen IVA
		</div>
		`;		// Generar el PDF en base64

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
				CorreoOrigen: '',
				Contrasenia: '',
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
			let data = await response.json()
			console.log(JSON.stringify(data))
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
