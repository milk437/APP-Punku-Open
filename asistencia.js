// asistencia.js ajustado para validar "Primera/Segunda Entrada/Salida" correctamente con corrección de campo "Criterio"

const SHEET_URL = 'https://opensheet.elk.sh/1PEy3PvnotKeN50fO-c2CiVaMjsU_YTTCjHJOlrgR-GA/Registro';

let datosFiltrados = [];

async function cargarDatos() {
  const grado = document.getElementById("filtroGrado").value;
  const seccion = document.getElementById("filtroSeccion").value;
  const contenedor = document.getElementById("tablaContainer");
  const detalle = document.getElementById("detalleEstudiante");
  detalle.style.display = "none";
  contenedor.innerHTML = "⏳ Cargando datos...";

  try {
    const res = await fetch(SHEET_URL);
    const data = await res.json();

    const datos = data.filter(row => row.Fecha && row.DNI && row['Nombre Completo']);
    const grados = [...new Set(datos.map(r => r.Grado).filter(Boolean))];
    const secciones = [...new Set(datos.map(r => r.Sección).filter(Boolean))];
    actualizarOpciones("filtroGrado", grados);
    actualizarOpciones("filtroSeccion", secciones);

    datosFiltrados = datos.filter(r => {
      return (!grado || r.Grado === grado) && (!seccion || r.Sección === seccion);
    });

    mostrarTabla(analizarEstudiantes(datosFiltrados));
    generarGrafico(datosFiltrados);
  } catch (e) {
    console.error(e);
    contenedor.innerHTML = "❌ Error al cargar los datos.";
  }
}

function actualizarOpciones(id, opciones) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">Todos</option>';
  opciones.forEach(op => {
    const opt = document.createElement("option");
    opt.value = op;
    opt.textContent = op;
    select.appendChild(opt);
  });
}

function analizarEstudiantes(data) {
  const estudiantes = {};

  data.forEach(row => {
    const dni = row.DNI;
    const fecha = row.Fecha;
    const criterioKey = Object.keys(row).find(k => k.toLowerCase().includes("criterio"));
    const criterio = (row[criterioKey] || "").trim();

    if (!estudiantes[dni]) {
      estudiantes[dni] = {
        dni,
        nombre: row["Nombre Completo"],
        registrosPorDia: {},
        totalDias: 0,
        completas: 0,
        irregulares: 0,
        faltas: 0
      };
    }

    if (!estudiantes[dni].registrosPorDia[fecha]) {
      estudiantes[dni].registrosPorDia[fecha] = {
        primeraEntrada: 0,
        primeraSalida: 0,
        segundaEntrada: 0,
        segundaSalida: 0
      };
    }

    if (criterio.includes("Primera Entrada")) {
      estudiantes[dni].registrosPorDia[fecha].primeraEntrada += 1;
    } else if (criterio.includes("Primera Salida")) {
      estudiantes[dni].registrosPorDia[fecha].primeraSalida += 1;
    } else if (criterio.includes("Segunda Entrada")) {
      estudiantes[dni].registrosPorDia[fecha].segundaEntrada += 1;
    } else if (criterio.includes("Segunda Salida")) {
      estudiantes[dni].registrosPorDia[fecha].segundaSalida += 1;
    }
  });

  for (const est of Object.values(estudiantes)) {
    const fechas = Object.keys(est.registrosPorDia);
    est.totalDias = fechas.length;

    fechas.forEach(fecha => {
      const dia = est.registrosPorDia[fecha];
      const mañana = dia.primeraEntrada && dia.primeraSalida;
      const tarde = dia.segundaEntrada && dia.segundaSalida;

      if (mañana && tarde) {
        est.completas++;
      } else if (dia.primeraEntrada || dia.primeraSalida || dia.segundaEntrada || dia.segundaSalida) {
        est.irregulares++;
      } else {
        est.faltas++;
      }
    });

    const porcentaje = est.totalDias === 0
      ? 0
      : ((est.completas + est.irregulares * 0.5) / est.totalDias) * 100;

    est.porcentaje = porcentaje.toFixed(1);
    est.icono = porcentaje >= 90 ? '🟢' : porcentaje >= 70 ? '🟡' : '🔴';
  }

  return Object.values(estudiantes);
}

function mostrarTabla(lista) {
  const contenedor = document.getElementById("tablaContainer");

  let html = `
    <table class="tabla-asistencia">
      <thead>
        <tr>
          <th>Estudiante</th>
          <th>DNI</th>
          <th>Completas</th>
          <th>Irregulares</th>
          <th>Faltas</th>
          <th>Días</th>
          <th>%</th>
        </tr>
      </thead>
      <tbody>`;

  lista.forEach(est => {
    html += `
      <tr onclick="verDetalle('${est.dni}')">
        <td>${est.icono} ${est.nombre}</td>
        <td>${est.dni}</td>
        <td>${est.completas}</td>
        <td>${est.irregulares}</td>
        <td>${est.faltas}</td>
        <td>${est.totalDias}</td>
        <td>${est.porcentaje}%</td>
      </tr>`;
  });

  html += "</tbody></table>";
  contenedor.innerHTML = html;
}

function verDetalle(dni) {
  const est = analizarEstudiantes(datosFiltrados).find(e => e.dni === dni);
  if (!est) return;

  const detalle = document.getElementById("detalleEstudiante");
  const nombre = document.getElementById("nombreDetalle");
  const contenido = document.getElementById("detalleContenido");

  nombre.textContent = `📌 Detalle de: ${est.nombre}`;

  let html = `<table class="tabla-asistencia"><thead><tr><th>Fecha</th><th>1ra Entrada</th><th>1ra Salida</th><th>2da Entrada</th><th>2da Salida</th></tr></thead><tbody>`;
  Object.entries(est.registrosPorDia).forEach(([fecha, reg]) => {
    html += `<tr><td>${fecha}</td><td>${reg.primeraEntrada}</td><td>${reg.primeraSalida}</td><td>${reg.segundaEntrada}</td><td>${reg.segundaSalida}</td></tr>`;
  });
  html += "</tbody></table>";

  contenido.innerHTML = html;
  detalle.style.display = "block";

  window.resumenTexto = `
Resumen de asistencia de ${est.nombre}
DNI: ${est.dni}
Días registrados: ${est.totalDias}
Asistencias completas: ${est.completas}
Irregulares: ${est.irregulares}
Faltas: ${est.faltas}
Porcentaje de asistencia: ${est.porcentaje}%`;
}

function descargarPDF() {
  if (!window.resumenTexto) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("Punku Open", 10, 10);
  doc.setFontSize(10);
  doc.text("Reporte de Asistencia", 10, 16);
  doc.text(window.resumenTexto, 10, 30);
  doc.text("\u00A9 PunkuOpen - Milton Ruiz", 10, 280);
  doc.save("asistencia_punku_open.pdf");
}

function enviarWhatsapp() {
  if (!window.resumenTexto) return;
  const texto = encodeURIComponent(window.resumenTexto);
  window.open(`https://wa.me/?text=${texto}`, "_blank");
}

function generarGrafico(data) {
  const estudiantes = analizarEstudiantes(data);
  const completas = estudiantes.reduce((sum, e) => sum + e.completas, 0);
  const irregulares = estudiantes.reduce((sum, e) => sum + e.irregulares, 0);
  const faltas = estudiantes.reduce((sum, e) => sum + e.faltas, 0);

  const ctx = document.getElementById('graficoAsistencia').getContext('2d');
  if (window.grafico) window.grafico.destroy();

  window.grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Completas', 'Irregulares', 'Faltas'],
      datasets: [{
        data: [completas, irregulares, faltas],
        backgroundColor: ['#00C851', '#FFA500', '#FF4444']
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Resumen general de asistencia',
          color: 'gold',
          font: { size: 16 }
        }
      },
      scales: {
        x: { ticks: { color: 'gold' } },
        y: { ticks: { color: 'gold' }, beginAtZero: true }
      }
    }
  });
}
