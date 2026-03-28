// resumen.js – Generador de Resúmenes y Rúbricas Punku Open PRO

const apiKey = "AIzaSyCqmEe_Bc3W3gqTTV5FGxg8Y1wLkvTbuaY"; // 🔑 Clave Gemini 1.5 Flash
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

// --- CONFIGURACIÓN DE INTERFAZ ---
if (document.getElementById("inputType")) {
    document.getElementById("inputType").addEventListener("change", actualizarInputs);
}

function actualizarInputs() {
    const tipo = document.getElementById("inputType").value;
    const bookInputs = document.getElementById("bookInputs");
    const urlInputs = document.getElementById("urlInputs");
    const studentInputs = document.getElementById("studentInputs"); // Para la rúbrica

    if (bookInputs) bookInputs.style.display = tipo === "book" ? "block" : "none";
    if (urlInputs) urlInputs.style.display = (tipo === "url" || tipo === "video") ? "block" : "none";
    if (studentInputs) studentInputs.style.display = tipo === "rubrica" ? "block" : "none";
}

// --- FUNCIÓN PRINCIPAL: GENERAR RESUMEN ---
function generarResumen() {
    const tipo = document.getElementById("inputType").value;
    const titulo = document.getElementById("inputTitle")?.value.trim();
    const autor = document.getElementById("inputAuthor")?.value.trim();
    const url = document.getElementById("inputUrl")?.value.trim();
    const palabras = document.getElementById("targetWordCount")?.value;
    const textoEstudiante = document.getElementById("inputEstudiante")?.value.trim();

    const errorDiv = document.getElementById("error");
    const resultado = document.getElementById("resultado");
    const mensaje = document.getElementById("mensaje");

    errorDiv.textContent = "";
    resultado.innerHTML = "";
    mensaje.textContent = "⏳ Procesando con IA...";

    let prompt = "";
    let longitud = palabras === "libre" ? "Proporciona un resumen claro y completo." : `en aproximadamente ${palabras} palabras.`;

    // Selección de Lógica según Tipo
    if (tipo === "book") {
        if (!titulo) return mostrarError("⚠️ Ingresa el título del libro.");
        prompt = `Resume el libro "${titulo}"${autor ? ` de ${autor}` : ""}, ${longitud}`;
    } 
    else if (tipo === "url" || tipo === "video") {
        if (!url) return mostrarError("⚠️ Ingresa una URL válida.");
        prompt = `Resume el contenido de esta URL: ${url}. Si no puedes acceder, explica de qué trata según el enlace, ${longitud}`;
    } 
    else if (tipo === "rubrica") {
        if (!textoEstudiante) return mostrarError("⚠️ Pega el texto del estudiante.");
        prompt = `Actúa como docente experto de secundaria en Perú. Evalúa el siguiente texto del alumno: "${textoEstudiante}". 
        Usa los niveles AD, A, B y C del CNEB. Devuelve en HTML: Nivel de logro, fortalezas, debilidades y retroalimentación pedagógica.`;
    }

    // LLAMADA A LA API
    fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    .then(response => {
        if (!response.ok) throw new Error("Error en la clave API o límites alcanzados.");
        return response.json();
    })
    .then(data => {
        const textoIA = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textoIA) {
            resultado.innerHTML = `
                <h3>${tipo === 'rubrica' ? '📊 Evaluación de Rúbrica' : '📝 Resumen Generado'}:</h3>
                <div style="line-height: 1.6; text-align: justify;">${textoIA.replace(/\n/g, "<br>")}</div>`;
            mensaje.textContent = "✅ Proceso completado.";
        } else {
            mostrarError("❌ La IA no pudo procesar la solicitud.");
        }
    })
    .catch(err => {
        console.error(err);
        mostrarError("❌ Error de conexión. Verifica tu API Key.");
    });
}

// --- UTILIDADES ---
function mostrarError(msg) {
    document.getElementById("error").textContent = msg;
    document.getElementById("mensaje").textContent = "";
    document.getElementById("resultado").innerHTML = "";
}

function obtenerTextoPlano() {
    return document.getElementById("resultado").innerText.trim();
}

// --- EXPORTACIÓN DE ARCHIVOS ---
function descargarPDF() {
    const texto = obtenerTextoPlano();
    if (!texto) return alert("No hay contenido para descargar.");
    const blob = new Blob([texto], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "PunkuOpen_Documento.pdf";
    link.click();
}

function descargarWord() {
    const texto = obtenerTextoPlano();
    if (!texto) return alert("No hay contenido para descargar.");
    const blob = new Blob([texto], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "PunkuOpen_Documento.doc";
    link.click();
}

// --- REDES SOCIALES ---
function enviarWhatsapp() {
    const texto = obtenerTextoPlano();
    if (!texto) return;
    const body = encodeURIComponent("Resultado Punku Open:\n\n" + texto);
    window.open(`https://wa.me/?text=${body}`, "_blank");
}

function enviarCorreo() {
    const texto = obtenerTextoPlano();
    if (!texto) return;
    const body = encodeURIComponent(texto);
    window.location.href = `mailto:?subject=Resultado%20Punku%20Open&body=${body}`;
}
