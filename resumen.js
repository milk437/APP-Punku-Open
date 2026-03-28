// resumen.js – Generador de Resúmenes Punku Open PRO
const apiKey = "AIzaSyCqmEe_Bc3W3gqTTV5FGxg8Y1wLkvTbuaY"; 

// URL CORREGIDA: Volvemos a v1beta pero con la ruta completa y correcta
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

// --- CONFIGURACIÓN DE INTERFAZ ---
document.addEventListener("DOMContentLoaded", () => {
    // Aseguramos que el evento se asigne solo si el elemento existe
    const inputType = document.getElementById("inputType");
    if (inputType) {
        inputType.addEventListener("change", actualizarInputs);
    }
    console.log("✅ Punku Open: Sistema de resúmenes listo.");
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
            // Si el error dice 'API key not found', es que la llave se quemó
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

// Las funciones de PDF, Word, etc., se mantienen igual...
