// resumen.js – Generador de Resúmenes Punku Open PRO
const apiKey = "AIzaSyCqmEe_Bc3W3gqTTV5FGxg8Y1wLkvTbuaY"; 
// Cambiamos a v1 que es la ruta estable para evitar el error 404
const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

// --- CONFIGURACIÓN DE INTERFAZ ---
document.addEventListener("DOMContentLoaded", () => {
    const inputType = document.getElementById("inputType");
    if (inputType) {
        inputType.addEventListener("change", actualizarInputs);
    }
    console.log("✅ Punku Open cargado correctamente.");
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

    // Limpiar estados previos
    if (errorDiv) errorDiv.textContent = "";
    if (resultadoDiv) resultadoDiv.innerHTML = "";
    if (mensajeDiv) mensajeDiv.textContent = "⏳ Punku Open está analizando el contenido...";

    let prompt = "";
    let longitud = palabras === "libre" ? "una extensión libre y detallada" : `aproximadamente ${palabras} palabras`;

    // Lógica de Prompt según tu HTML
    if (tipo === "book") {
        if (!titulo) return mostrarError("⚠️ Indica el título del libro.");
        prompt = `Resume el libro titulado "${titulo}"${autor ? ` de ${autor}` : ""}. El resumen debe ser de ${longitud} y tener un enfoque educativo.`;
    } else {
        if (!url) return mostrarError("⚠️ Pega una URL o enlace válido.");
        prompt = `Analiza y resume el contenido principal de este enlace: ${url}. El resumen debe tener ${longitud}.`;
    }

    try {
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

        // Manejo de errores de la API de Google
        if (data.error) {
            console.error("Error de API:", data.error.message);
            return mostrarError("❌ Error de Google: " + data.error.message);
        }

        const textoIA = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textoIA) {
            resultadoDiv.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; line-height: 1.6; color: #333;">
                    <h3 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">📝 Resumen Generado:</h3>
                    <p style="margin-top: 15px;">${textoIA.replace(/\n/g, "<br>")}</p>
                </div>`;
            mensajeDiv.textContent = "✅ Resumen listo.";
        } else {
            mostrarError("❌ La IA no devolvió contenido. Intenta de nuevo.");
        }
    } catch (err) {
        console.error("Error de conexión:", err);
        mostrarError("❌ Error crítico: Verifica tu conexión a internet.");
    }
}

// --- UTILIDADES ---
function mostrarError(msg) {
    const errorDiv = document.getElementById("error");
    if (errorDiv) errorDiv.textContent = msg;
    document.getElementById("mensaje").textContent = "";
}

function copiarResumen() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return alert("Primero genera un resumen.");
    navigator.clipboard.writeText(texto).then(() => alert("📋 ¡Copiado al portapapeles!"));
}

function descargarPDF() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return alert("Genera un resumen primero.");
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
    window.open(`https://wa.me/?text=${encodeURIComponent("Resumen Punku Open:\n\n" + texto)}`, "_blank");
}

function enviarCorreo() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return;
    window.location.href = `mailto:?subject=Resumen%20Punku%20Open&body=${encodeURIComponent(texto)}`;
}
