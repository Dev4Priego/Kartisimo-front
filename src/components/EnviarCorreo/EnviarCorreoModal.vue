<template>
	<div class="mt-4">
		<!-- Botón que abre el modal -->
		<button class="btn btn-primary shadow w-100 position-relative btn-sm py-2 rounded" @click="abrirModal">
			<i class="bi-envelope-paper-fill position-absolute start-0 ms-2"></i>
			&nbsp;&nbsp;Enviar por correo
		</button>
	</div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
import Swal from 'sweetalert2'
import html2pdf from 'html2pdf.js'; 


const { proxy } = getCurrentInstance()
const raw = JSON.parse(localStorage.getItem("userSession") || "{}");

const props = defineProps({
	cotizacion: Object
})


const abrirModal = async () => {
	// console.log('enviar correo componente: ' + JSON.stringify(props.cotizacion))

	// console.log('llanta ' + JSON.stringify(props.cotizacion.llantasSelecionadas[1].medidas))

	if (!props.cotizacion) {
		Swal.fire('Error', 'No hay cotización cargada.', 'error')
		return
	}

	const texto = props.cotizacion?.llantasSelecionadas?.[0]?.medidas || "";

	const match = texto.match(/\d{3}\/\d{2}\s*r?\d{2}/i);

	const medida = match ? match[0].toUpperCase() : "";

	const correo = props.cotizacion?.cliente?.correo || "";

	const { value: formValues } = await Swal.fire({
		title: '<h3>Enviar cotización por correo</h3>',
		html: `
			<table style="margin-left: 0px; margin-right: 0px;">
			<tr><td style="text-align: left;"><input id="correo" class="swal2-input" placeholder="Correo destinatario" type="email" value="${correo ? correo : ''}" style="width: 280px; font-size: 12pt;"></td></tr>
			<tr><td><input id="asunto" class="swal2-input" placeholder="Asunto" value="Cotización ${medida} Kartisimo" style="width: 470px; font-size: 12pt;"></td></tr>
			<tr><td><textarea id="mensaje" class="swal2-textarea" placeholder="Mensaje..." style="width: 470px; font-size: 12pt;"></textarea></td></tr>
			</table>
		`,
		width: '600px',
		confirmButtonText: 'Enviar',
		showCancelButton: true,
		cancelButtonText: 'Cancelar',
		focusConfirm: false,
		showLoaderOnConfirm: true,
		preConfirm: () => {
			const email = document.getElementById('correo').value
			const subj = document.getElementById('asunto').value
			const msg = document.getElementById('mensaje').value

			if (!email || !subj) {
				Swal.showValidationMessage('Completa todos los campos')
				return false
			}

			return { email, subj, msg }
		}
	})

	if (formValues) {
		mostrarConfirmacionEnvio()
		enviarCorreoEnSegundoPlano(formValues)
	}
}


const mostrarConfirmacionEnvio = () => {
	Swal.fire({
		icon: 'success',
		title: 'Correo enviado exitosamente',
		text: 'El correo ha sido enviado exitosamente.',
		confirmButtonText: 'OK'
	})
}

const enviarCorreoEnSegundoPlano = (formValues) => {
	generarPDFyEnviar(formValues).catch((error) => {
		console.error(error)
		Swal.fire('Error', error.message || 'No se pudo enviar el correo.', 'error')
	})
}


const generarPDFyEnviar = async ({ email, subj, msg }) => {
	const llantas = props.cotizacion?.llantasSelecionadas || []
	const paquetes = props.cotizacion?.paquetes || []
	const serviciosAdicionales = props.cotizacion?.serviciosAdicionales || []
	const datosUsuarioPromise = obtenerDatosUsuarioCorreo()

		// Crear un contenedor temporal para el PDF
		const pdfContent = document.createElement('div')
		pdfContent.innerHTML = `
	<style>
/* 🔹 BASE */
body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  color: #000;
}

/* 🔹 HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.logo {
  width: 180px;
}

/* 🔹 SUCURSALES */
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

/* 🔹 DIVISOR */
hr {
  border: none;
  border-top: 1px solid #000;
  margin: 15px 0;
}

/* 🔹 INFO CLIENTE */
.info-grid {
  display: grid;
  grid-template-columns: 15% 40% 45%;
  gap: 6px 20px;
  font-size: 12px;
  margin-bottom: 10px;
  padding-top: 1px;
}

/* 🔹 TABLA */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 12px;
  table-layout: fixed; /* 🔥 clave */
}

/* 🔹 ANCHOS OPTIMIZADOS */
th:nth-child(1), td:nth-child(1) { width: 8%; }
th:nth-child(2), td:nth-child(2) { width: 57%; } /* 🔥 columna larga */
th:nth-child(3), td:nth-child(3) { width: 17%; }
th:nth-child(4), td:nth-child(4) { width: 18%; }

/* 🔹 HEADER TABLA */
thead th {
  background-color: #e0e0e0; /* 🔥 sombreado visible */
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  padding: 6px;
}

/* 🔹 CELDAS */
td {
  padding: 6px;
  border-bottom: 1px solid #000;
  vertical-align: middle;
}

/* 🔹 FIX COLUMNA LARGA (MEDIDAS) */
td:nth-child(2), th:nth-child(2) {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.2;
  font-size: 11px;
}

/* 🔹 ALINEACIONES */
.center { text-align: center; }
.right { text-align: right; }

/* 🔹 SEPARADOR SERVICIOS */
.separador {
  background-color: #f0f0f0;
  font-weight: bold;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
}

/* 🔹 PROMOS */
.total-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.precio-original {
  text-decoration: line-through;
  color: #888;
  font-size: 11px;
  margin-bottom: 2px;
}

.promo-label {
  display: inline-block;
  background: #e53935;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  margin: 2px 0;
}

.precio-final {
  color: #2e7d32;
  font-weight: bold;
  font-size: 13px;
}

/* 🔹 FOOTER */
.footer {
  margin-top: 15px;
  text-align: right;
  font-style: italic;
  font-size: 11px;
}

/* 🔹 BORDE FINAL */
tbody tr:last-child td {
  border-bottom: 2px solid #000;
}
</style>

		<!-- ENCABEZADO -->
		<div class="header">
			<img src="/images/Logo-Kartisimo.png" class="logo" />

		</div>

		<div class="branches">
			<div class="branch">
				<strong>Blvd. Delta 2002<br>esq. Rio Mayo</strong><br>
				Col. Valle de Jerez C.P. 37538<br>
				Tel. 477 330 6060 y<br>477 390 5090<br>
				delta@kartisimo.mx
			</div>

			<div class="branch">
				<strong>Blvd. Lopez Mateos 827<br>esq. Apolo</strong><br>
				Col. Obrera C.P. 37340<br>
				Tel. 477 717 7440 y<br>477 470 9419<br>
				apolo@kartisimo.mx
			</div>

			<div class="branch">
				<strong>Blvd. Torres Landa 1901<br>esq San Jacobo</strong><br>
				Col. La Pisina C.P. 37440<br>
				Tel. 477 390 0290 y<br>477 461 0028<br>
				torreslanda@kartisimo.mx
			</div>
			<div class="branch">
				<strong>Blvd. Mariano Escobedo Pte.<br>2715 esq. San Sebastián</strong><br>
				Col. La Martinica, C.P. 37500<br>
				Tel. 477 763 3285 y<br>477 763 3284
			</div>
		</div>

		<hr>

		<!-- DATOS CLIENTE -->
		<div class="info-grid">

  <div>
    C${props.cotizacion?.codigo }
  </div>

  <div>
    <strong>Fecha emisión:</strong> 
    ${formatearFecha(props.cotizacion?.cliente?.fecha) || 'N/A'}
  </div>

  <div>
    <strong>Cliente:</strong> 
    ${props.cotizacion?.cliente?.nombre || 'N/A'}
  </div>

  <div>
  </div>

  <div>
    <strong>Teléfono:</strong> 
    ${formatearTelefono(props.cotizacion?.cliente?.telefono) || 'N/A'}
  </div>

  <div>
    <strong>Correo:</strong> 
    ${props.cotizacion?.cliente?.correo || 'Sin correo'}
  </div>

</div>
<div>
    <strong>Observaciones:</strong> 
    ${props.cotizacion?.observaciones || 'N/A'}
  </div>



</div>

		<!-- TABLA -->
		<table>
			<thead>
				<tr>
					<th>CANT</th>
					<th>MEDIDA-MARCA-MODELO-RANGO</th>
					<th class="right">PRECIO UNIT.</th>
					<th class="right">TOTAL</th>
				</tr>
			</thead>
			<tbody>

				${llantas.map(l => `
				<tr>
				<td class="center">${l.cantidad}</td>
				<td>${l.medidas}</td>
				<td class="right">
					$${l.precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2 })}
				</td>
				<td class="right">
                   
					${renderTotalConPromo({
					precioUnitario: l.precioUnitario,
						cantidad: l.cantidad,
					total: l.total,
					promoLabel: l.promoLabel,
					})}



				</td>
				</tr>
				`).join('')}

				<!-- 🔹 SEPARADOR -->
				${
				(paquetes.length || serviciosAdicionales.length)
				? `
					<tr>
					<td class="separador center">CANT</td>
					<td class="separador">
						SERVICIOS
					</td>
					<td class="separador right">
						PRECIO UNIT.
					</td>
					<td class="separador right">
						TOTAL
					</td>
					</tr>
									`
				: ''
				}

				${
				(props.cotizacion.totalOriginal || 0) > (props.cotizacion.total || 0)
				? `
					<tr>
					<td class="separador center">CANT</td>
					<td colspan="3" class="separador">
						Total
					</td>
					</tr>
									`
				: ''
				}

				

				${paquetes.map(p => `
				<tr>
				<td class="center">1</td>
				<td>${p.nombre.toUpperCase()}, ${p.descripcion.toUpperCase()}</td>
				<td class="right">
					$${p.precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2 })}
				</td>
				<td class="right">
					${renderTotalConPromo({
					precioUnitario: p.precioUnitario,
					cantidad: 1,
					total: p.total,
					promoLabel: p.promoLabel,
					})}
				</td>
				</tr>
				`).join('')}

				${serviciosAdicionales.map(s => `
				<tr>
				<td class="center">${s.cantidad}</td>
				<td>${s.nombreServicio.toUpperCase()}</td>
				<td class="right">
					$${s.precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2 })}
				</td>
				<td class="right">
					${renderTotalConPromo({
					precioUnitario: s.precioUnitario,
					cantidad: s.cantidad,
					total: s.total,
					promoLabel: s.promoLabel,
					})}
				</td>
				</tr>
				`).join('')}

				${props.cotizacion.mostrarTotal ?  
				`<tr>
				<td colspan="4" style="border-top: 2px solid #000;"></td>
				</tr>

				<tr>
				<td colspan="3" class="right" style="font-weight:bold; font-size:16px;">
					Total:
				</td>
				<td class="right" style="font-weight:bold; font-size:16px;">
					$${(props.cotizacion.total ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
				</td>
				</tr>` : ``}

				</tbody>
		</table>

						<div class="footer">
							Los precios incluyen IVA
						</div>
						`;		// Generar el PDF en base64

						const opt = {
							margin: 10,
							filename: `${props.cotizacion.codigo}.pdf`,
							image: { type: 'jpeg', quality: 0.92 },
							html2canvas: { scale: 1.5, useCORS: true },
							jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
						}

		const [pdfBlob, datos] = await Promise.all([
			html2pdf().set(opt).from(pdfContent).outputPdf('blob'),
			datosUsuarioPromise
		])
		const pdfBase64 = await blobToBase64(pdfBlob)

		// Enviar correo
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
				NombreAdjunto: 'Cotización Kartisimo.pdf'
			})
		})

		if (response.ok) {
          console.log('Correo enviado exitosamente');
		} else {
			let data = null
			try {
				data = await response.json()
			} catch {
				data = null
			}
			console.log(JSON.stringify(data))
			throw new Error(data?.message || data?.mensaje || 'No se pudo enviar el correo.')
		}
}

const obtenerDatosUsuarioCorreo = async () => {
	const response = await fetch(`${proxy.$serverIP}api/Usuario/${raw.usuario.idUsuario}`)

	if (!response.ok) {
		throw new Error('No se pudieron obtener los datos del usuario para enviar el correo.')
	}

	return response.json()
}

const renderTotalConPromo = ({
  precioUnitario,
  cantidad = 1,
  total,
  promoLabel,
}) => {
  const totalOriginal = precioUnitario * cantidad

  const totalFinal = (typeof total === 'number' && !isNaN(total))
    ? total
    : totalOriginal

  const tienePromo = promoLabel && totalFinal < totalOriginal

  return `
    <div style="text-align:right; line-height:1.2;">
      
      ${
        tienePromo
          ? `
        <div style="text-decoration: line-through; color:#888; font-size:12px;">
          $${totalOriginal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        <div style="color: red; font-size:13px; font-weight:600;">
          ${promoLabel}
        </div>
      `
          : ""
      }

      <div style="color:#2e7d32; font-weight:bold; font-size:16px;">
        $${totalFinal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>

    </div>
  `
}
const formatearFecha = (fecha) => {
  if (!fecha) return ''

  const f = new Date(fecha)

  if (isNaN(f)) return fecha // por si viene mal formateada

  return f.toLocaleDateString('es-MX')
}

const formatearTelefono = (telefono) => {
	if (!telefono) return '';
    const digitos = telefono.replace(/\D/g, '');
    if (digitos.length !== 10) return telefono;
    return `${digitos.slice(0,3)} ${digitos.slice(3,6)} ${digitos.slice(6)}`;
}

// Helper para convertir Blob → Base64
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
	const reader = new FileReader()
	reader.onloadend = () => resolve(reader.result.split(',')[1])
	reader.onerror = reject
	reader.readAsDataURL(blob)
})


</script>
