// resumen.js – Generador de Resúmenes Punku Open PRO
const apiKey = "AIzaSyCqmEe_Bc3W3gqTTV5FGxg8Y1wLkvTbuaY"; 
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

// --- CONFIGURACIÓN DE INTERFAZ ---
// Usamos el ID 'inputType' que está en tu HTML
if (document.getElementById("inputType")) {
    document.getElementById("inputType").addEventListener("change", actualizarInputs);
}

function actualizarInputs() {
    const tipo = document.getElementById("inputType").value;
    const bookInputs = document.getElementById("bookInputs");
    const urlInputs = document.getElementById("urlInputs");

    // Ajuste según los IDs de tu HTML
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
    const resultado = document.getElementById("resultado");
    const mensaje = document.getElementById("mensaje");

    // Limpiar estados previos
    if (errorDiv) errorDiv.textContent = "";
    if (resultado) resultado.innerHTML = "";
    if (mensaje) mensaje.textContent = "⏳ Punku Open está generando tu resumen...";

    let prompt = "";
    let longitud = palabras === "libre" ? "extensión libre" : `aproximadamente ${palabras} palabras`;

    // Lógica de Prompt
    if (tipo === "book") {
        if (!titulo) return mostrarError("⚠️ Por favor, ingresa el título del libro.");
        prompt = `Resume el libro titulado "${titulo}"${autor ? ` escrito por ${autor}` : ""}. El resumen debe ser de ${longitud} y tener un enfoque pedagógico.`;
    } else {
        if (!url) return mostrarError("⚠️ Por favor, pega una URL o enlace de video válido.");
        prompt = `Analiza y resume el contenido principal del siguiente enlace: ${url}. Que el resumen sea de ${longitud}.`;
    }

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: prompt }] }] 
            })
        });

        if (!response.ok) throw new Error("API Key inválida o límite excedido");

        const data = await response.json();
        const textoIA = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textoIA) {
            resultado.innerHTML = `
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; line-height: 1.6;">
                    <h3 style="color: #2c3e50;">📝 Resumen Generado:</h3>
                    <p>${textoIA.replace(/\n/g, "<br>")}</p>
                </div>`;
            mensaje.textContent = "✅ Resumen listo.";
        } else {
            mostrarError("❌ La IA no pudo procesar este contenido.");
        }
    } catch (err) {
        console.error(err);
        mostrarError("❌ Error crítico: Verifica tu conexión o API Key.");
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
    navigator.clipboard.writeText(texto).then(() => alert("📋 Copiado al portapapeles"));
}

// --- EXPORTACIÓN ---
function descargarPDF() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return alert("No hay contenido.");
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
    window.open(`https://wa.me/?text=${encodeURIComponent("Resumen de Punku Open:\n\n" + texto)}`, "_blank");
}

function enviarCorreo() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return;
    window.location.href = `mailto:?subject=Resumen%20Punku%20Open&body=${encodeURIComponent(texto)}`;
}
