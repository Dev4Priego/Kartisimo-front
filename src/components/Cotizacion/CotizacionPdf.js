import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

let logoBase64 = null;

const loadLogoBase64 = async () => {
  if (logoBase64) return logoBase64;

  const response = await fetch("/images/Logo-Kartisimo.png");
  const blob = await response.blob();

  logoBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return logoBase64;
};

const formatMoney = (value) =>
  `$${(Number(value) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (fecha) => {
  if (!fecha) return "";

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatPhone = (telefono) => {
  if (!telefono) return "";

  const digitos = String(telefono).replace(/\D/g, "");
  if (digitos.length !== 10) return telefono;

  return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
};

const cell = (text, alignment = "left") => ({
  text: text ?? "",
  alignment,
  fontSize: 10,
  margin: [0, 10, 0, 10],
});

const promoIsVisible = (promoLabel) =>
  promoLabel && promoLabel !== "(Excluido de promocion)" && promoLabel !== "(Excluido de promoción)";

const promoLabelCell = (promoLabel) => ({
  columns: [
    { width: "*", text: "" },
    {
      width: "auto",
      table: {
        body: [
          [
            {
              text: promoLabel,
              style: "promoLabel",
              fillColor: "#dc3545",
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
    },
  ],
  margin: [0, 2, 0, 2],
});

const totalCell = ({ precioUnitario = 0, cantidad = 1, total, promoLabel }) => {
  const qty = Number(cantidad) || 1;
  const totalOriginal = (Number(precioUnitario) || 0) * qty;
  const totalFinal = Number.isFinite(Number(total)) ? Number(total) : totalOriginal;
  const hasPromo = promoIsVisible(promoLabel) && totalFinal < totalOriginal;

  return {
    stack: hasPromo
      ? [
          {
            text: formatMoney(totalOriginal),
            decoration: "lineThrough",
            color: "#888",
            fontSize: 9,
            alignment: "right",
          },
          promoLabelCell(promoLabel),
          {
            text: formatMoney(totalFinal),
            color: "green",
            bold: true,
            fontSize: 10,
            alignment: "right",
          },
        ]
      : [
          {
            text: formatMoney(totalFinal),
            alignment: "right",
            fontSize: 10,
          },
        ],
    margin: [0, 10, 0, 10],
  };
};

const descriptionCell = (mainText, comentario) => {
  const cleanComment = String(comentario || "").trim();

  if (!cleanComment) return cell(mainText);

  return {
    stack: [
      { text: mainText || "", fontSize: 10, alignment: "left" },
      {
        text: cleanComment,
        italics: true,
        fontSize: 8,
        color: "#555",
        margin: [0, 2, 0, 0],
      },
    ],
    margin: [0, 10, 0, 10],
  };
};

const sectionHeader = (label) => [
  {
    text: "CANT",
    alignment: "center",
    style: "tableHeaderBorder",
    fillColor: "#ededed",
  },
  {
    text: label,
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

const buildRows = (cotizacion) => {
  const llantas = cotizacion?.llantasSelecionadas || [];
  const paquetes = cotizacion?.paquetes || [];
  const servicios = cotizacion?.serviciosAdicionales || [];

  const llantasRows = llantas.map((llanta) => [
    cell(String(llanta.cantidad || 0), "center"),
    descriptionCell(llanta.medidas, llanta.comentario),
    cell(formatMoney(llanta.precioUnitario), "right"),
    totalCell({
      precioUnitario: llanta.precioUnitario,
      cantidad: llanta.cantidad,
      total: llanta.total,
      promoLabel: llanta.promoLabel,
    }),
  ]);

  const paquetesRows = paquetes.map((paquete) => [
    cell(String(paquete.cantidad || 1), "center"),
    descriptionCell(
      `${String(paquete.nombre || "").toUpperCase()}, ${String(
        paquete.descripcion || "",
      ).toUpperCase()}`,
      paquete.comentario,
    ),
    cell(formatMoney(paquete.precioUnitario), "right"),
    totalCell({
      precioUnitario: paquete.precioUnitario,
      cantidad: paquete.cantidad || 1,
      total: paquete.total,
      promoLabel: paquete.promoLabel,
    }),
  ]);

  const serviciosRows = servicios.map((servicio) => [
    cell(String(servicio.cantidad || 0), "center"),
    descriptionCell(
      servicio.nombreServicio || servicio.descripcion || "",
      servicio.comentario || servicio.observacion,
    ),
    cell(formatMoney(servicio.precioUnitario), "right"),
    totalCell({
      precioUnitario: servicio.precioUnitario,
      cantidad: servicio.cantidad,
      total: servicio.total,
      promoLabel: servicio.promoLabel,
    }),
  ]);

  return [
    ...llantasRows,
    sectionHeader("SERVICIO"),
    ...paquetesRows,
    ...serviciosRows,
  ];
};

export const buildCotizacionPdfDefinition = async (cotizacion) => {
  const logo = await loadLogoBase64();
  const cliente = cotizacion?.cliente || {};

  return {
    pageMargins: [40, 40, 40, 60],
    pageSize: "LETTER",
    content: [
      {
        columns: [
          {
            width: "*",
            stack: [{ image: logo, width: 140, margin: [0, 0, 0, 10] }],
          },
          { width: "auto", stack: [] },
        ],
      },
      {
        columns: [
          [
            { text: "Blvd. Delta 2002\nesq. Río Mayo", bold: true, fontSize: 9, lineHeight: 1.2 },
            { text: "Col. Valle de Jerez C.P 37538", fontSize: 8, lineHeight: 1.2 },
            { text: "Tel. 477 330 6060 y\n477 390 5090", fontSize: 8, lineHeight: 1.2 },
            { text: "delta@kartisimo.mx", fontSize: 8, lineHeight: 1.2 },
          ],
          [
            { text: "Blvd. Lopez Mateos 827\nesq. Apolo", bold: true, fontSize: 9, lineHeight: 1.2 },
            { text: "Col. Obrera C.P. 37340", fontSize: 8, lineHeight: 1.2 },
            { text: "Tel. 477 717 7440 y\n477 470 9419", fontSize: 8, lineHeight: 1.2 },
            { text: "apolo@kartisimo.mx", fontSize: 8, lineHeight: 1.2 },
          ],
          [
            { text: "Blvd. Torres Landa 1901\nesq San Jacobo", bold: true, fontSize: 9, lineHeight: 1.2 },
            { text: "Col. La Piscina C.P. 37440", fontSize: 8, lineHeight: 1.2 },
            { text: "Tel. 477 390 0290 y\n477 461 0028", fontSize: 8, lineHeight: 1.2 },
            { text: "torreslanda@kartisimo.mx", fontSize: 8, lineHeight: 1.2 },
          ],
          [
            { text: "Blvd. Mariano Escobedo Pte.\n2715 esq. San Sebastián", bold: true, fontSize: 9, lineHeight: 1.2 },
            { text: "Col. La Martinica, C.P. 37500", fontSize: 8, lineHeight: 1.2 },
            { text: "Tel. 477 763 3285 y\n477 763 3284", fontSize: 8, lineHeight: 1.2 },
          ],
        ],
        columnGap: 15,
        margin: [0, 0, 0, 18],
      },
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: "#888" },
        ],
        margin: [0, 8, 0, 8],
      },
      {
        columns: [
          { width: "auto", text: `C${cotizacion?.codigo || ""}`, fontSize: 10, margin: [0, 0, 16, 6] },
          [
            {
              width: "auto",
              text: [{ text: "Fecha de emisión: ", bold: true }, formatDate(cliente.fecha || cotizacion?.fechaCreacion)],
              fontSize: 10,
              margin: [0, 0, 10, 6],
            },
            {
              width: "auto",
              text: [{ text: "Teléfono(s): ", bold: true }, { text: formatPhone(cliente.telefono) || "N/A", color: "#444" }],
              fontSize: 10,
              margin: [0, 0, 10, 6],
            },
          ],
          [
            {
              width: "auto",
              text: [{ text: "Cliente: ", bold: true }, cliente.nombre || "N/A"],
              fontSize: 10,
              margin: [0, 0, 10, 6],
            },
            {
              width: "auto",
              text: [{ text: "Correo: ", bold: true }, cliente.correo || "N/A"],
              fontSize: 10,
              margin: [0, 0, 0, 6],
            },
          ],
        ],
      },
      {
        text: [{ text: "Observaciones: ", bold: true }, cotizacion?.observaciones || "N/A"],
        fontSize: 10,
        margin: [1, 10, 15, 13],
      },
      {
        table: {
          headerRows: 1,
          widths: [40, "*", 90, 90],
          body: [
            [
              { text: "CANT", style: "tableHeaderBorder", alignment: "center" },
              { text: "MEDIDA - MARCA - MODELO - RANGO", style: "tableHeaderBorder", alignment: "left" },
              { text: "PRECIO UNIT.", style: "tableHeaderBorder", alignment: "right" },
              { text: "TOTAL", style: "tableHeaderBorder", alignment: "right" },
            ],
            ...buildRows(cotizacion),
          ],
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? "#ededed" : null),
          vLineWidth: () => 0,
        },
        margin: [0, 12, 0, 0],
      },
      cotizacion?.mostrarTotal
        ? {
            text: `Total: ${formatMoney(cotizacion?.total)}`,
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
      },
      notaIVA: {
        italics: true,
        fontSize: 9,
      },
    },
  };
};

export const createCotizacionPdf = async (cotizacion) => {
  const definition = await buildCotizacionPdfDefinition(cotizacion);
  return pdfMake.createPdf(definition);
};

export const downloadCotizacionPdf = async (cotizacion) => {
  const pdf = await createCotizacionPdf(cotizacion);
  const llantas = cotizacion?.llantasSelecionadas || [];
  const NormalizarLlantas = llantas?.[0]?.medidas.replaceAll("/"," ");
  pdf.download(
    `Cotizacion ${NormalizarLlantas || ""} Kartisimo C${
      cotizacion?.codigo || ""
    }.pdf`,
  );
};

export const printCotizacionPdf = async (cotizacion) => {
  const pdf = await createCotizacionPdf(cotizacion);
  const win = window.open("", "_blank");
  pdf.print();
};

export const getCotizacionPdfBlob = async (cotizacion) => {
  const pdf = await createCotizacionPdf(cotizacion);

  return new Promise((resolve) => {
    pdf.getBlob((blob) => resolve(blob));
  });
};
