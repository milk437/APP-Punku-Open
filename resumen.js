// resumen.js – Generador de Resúmenes Punku Open PRO
const apiKey = "AIzaSyCqmEe_Bc3W3gqTTV5FGxg8Y1wLkvTbuaY"; 

// CORRECCIÓN CRÍTICA: Usamos /v1/ y la ruta exacta que pide Google ahora
const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

// --- CONFIGURACIÓN DE INTERFAZ ---
document.addEventListener("DOMContentLoaded", () => {
    const inputType = document.getElementById("inputType");
    if (inputType) {
        inputType.addEventListener("change", actualizarInputs);
    }
    console.log("✅ Punku Open: Sistema de resúmenes cargado.");
});

function actualizarInputs() {
    const tipo = document.getElementById("inputType").value;
    const bookInputs = document.getElementById("bookInputs");
    const urlInputs = document.getElementById("urlInputs");

    if (bookInputs) bookInputs.style.display = tipo === "book" ? "block" : "none";
    if (urlInputs) urlInputs.style.display = (tipo === "url" || tipo === "video") ? "block" : "none";
}

// --- FUNCIÓN PRINCIPAL: GENERAR RESUMEN ---
async function generarResumen() {
    const tipo = document.getElementById("inputType").value;
    const titulo = document.getElementById("inputTitle")?.value.trim();
    const autor = document.getElementById("inputAuthor")?.value.trim();
    const url = document.getElementById("inputUrl")?.value.trim();
    const palabras = document.getElementById("targetWordCount")?.value;

    const errorDiv = document.getElementById("error");
    const resultadoDiv = document.getElementById("resultado");
    const mensajeDiv = document.getElementById("mensaje");

    if (errorDiv) errorDiv.textContent = "";
    if (resultadoDiv) resultadoDiv.innerHTML = "";
    if (mensajeDiv) mensajeDiv.textContent = "⏳ Punku Open está analizando el contenido...";

    let prompt = "";
    let longitud = palabras === "libre" ? "una extensión libre y detallada" : `aproximadamente ${palabras} palabras`;

    if (tipo === "book") {
        if (!titulo) return mostrarError("⚠️ Indica el título del libro.");
        prompt = `Resume el libro "${titulo}"${autor ? ` de ${autor}` : ""}. El resumen debe ser de ${longitud} y con enfoque pedagógico.`;
    } else {
        if (!url) return mostrarError("⚠️ Pega una URL válida.");
        prompt = `Analiza y resume el contenido de este enlace: ${url}. El resumen debe tener ${longitud}.`;
    }

    try {
        // Estructura de petición simplificada para evitar el 404/400
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Error de Google:", data.error.message);
            // Si sale 404 aquí, es que la API KEY fue dada de baja por seguridad
            return mostrarError("❌ Error de Google: " + data.error.message);
        }

        const textoIA = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textoIA) {
            resultadoDiv.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; color: #333;">
                    <h3 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">📝 Resumen:</h3>
                    <p style="margin-top: 15px; line-height: 1.6; text-align: justify;">${textoIA.replace(/\n/g, "<br>")}</p>
                </div>`;
            mensajeDiv.textContent = "✅ Resumen generado.";
        } else {
            mostrarError("❌ No se recibió respuesta de la IA.");
        }
    } catch (err) {
        console.error("Fallo de red:", err);
        mostrarError("❌ Error de conexión. Revisa la consola.");
    }
}

function mostrarError(msg) {
    document.getElementById("error").textContent = msg;
    document.getElementById("mensaje").textContent = "";
}

// --- FUNCIONES DE EXPORTACIÓN (CORREGIDAS) ---
function copiarResumen() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return alert("Genera un resumen primero.");
    navigator.clipboard.writeText(texto).then(() => alert("📋 ¡Copiado!"));
}

function descargarPDF() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return alert("No hay contenido.");
    // Usamos el objeto global de la librería cargada en el HTML
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(texto, 180);
    doc.text(splitText, 10, 10);
    doc.save("Resumen_PunkuOpen.pdf");
}

function descargarWord() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return;
    const blob = new Blob(['\ufeff' + texto], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Resumen_PunkuOpen.doc";
    link.click();
}

function enviarWhatsapp() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
}

function enviarCorreo() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return;
    window.location.href = `mailto:?subject=Resumen%20Punku%20Open&body=${encodeURIComponent(texto)}`;
}
