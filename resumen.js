// resumen.js – Motor Punku Open (Versión Anti-Bloqueo)
const hfToken = "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"; 
// Usamos Mistral, que es el más estable para evitar errores de CORS en Edge
const modelUrl = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

document.addEventListener("DOMContentLoaded", () => {
    const inputType = document.getElementById("inputType");
    if (inputType) {
        inputType.addEventListener("change", function() {
            document.getElementById("bookInputs").style.display = this.value === "book" ? "block" : "none";
            document.getElementById("urlInputs").style.display = this.value === "url" ? "block" : "none";
        });
    }
    console.log("🚀 Punku Open: Sistema Anti-Bloqueo Activo.");
});

async function generarResumen() {
    const tipo = document.getElementById("inputType").value;
    const titulo = document.getElementById("inputTitle")?.value.trim();
    const autor = document.getElementById("inputAuthor")?.value.trim();
    const url = document.getElementById("inputUrl")?.value.trim();
    const palabras = document.getElementById("targetWordCount").value;

    const errorDiv = document.getElementById("error");
    const resultadoDiv = document.getElementById("resultado");
    const mensajeDiv = document.getElementById("mensaje");

    errorDiv.textContent = "";
    resultadoDiv.innerHTML = "";
    mensajeDiv.textContent = "⏳ Punku Open está analizando... (Espera 10-15 segundos)";

    let prompt = "";
    if (tipo === "book") {
        if (!titulo) return mostrarError("⚠️ Por favor, escribe el título del libro.");
        prompt = `Resume el libro "${titulo}" de ${autor || 'autor desconocido'}. Haz un resumen educativo de ${palabras} palabras en español.`;
    } else {
        if (!url) return mostrarError("⚠️ Pega una URL válida.");
        prompt = `Resume el contenido de este enlace: ${url}. Hazlo en ${palabras} palabras en español.`;
    }

    try {
        const response = await fetch(modelUrl, {
            headers: { 
                "Authorization": `Bearer ${hfToken}`,
                "Content-Type": "application/json"
                // No agregamos nada más para evitar que Edge sospeche (CORS)
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<s>[INST] ${prompt} [/INST]`,
                parameters: { 
                    max_new_tokens: 1000, 
                    wait_for_model: true // Esto es clave para que no falle si la IA está dormida
                }
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Fallo en la conexión con la IA");
        }

        let textoFinal = data[0]?.generated_text || "No se pudo obtener el texto.";
        
        // Limpiamos la respuesta para que solo salga el resumen
        if (textoFinal.includes("[/INST]")) {
            textoFinal = textoFinal.split("[/INST]").pop().trim();
        }

        resultadoDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #2ecc71; box-shadow: 0 2px 10px rgba(0,0,0,0.1); color: #333;">
                <h3 style="margin-top:0; color:#2ecc71;">📝 Resumen Punku Open:</h3>
                <p style="text-align:justify; line-height:1.6; white-space: pre-wrap;">${textoFinal}</p>
            </div>`;
        mensajeDiv.textContent = "✅ ¡Resumen generado con éxito!";

    } catch (err) {
        console.error("Error detectado:", err);
        mostrarError("❌ Error de conexión. Por favor, intenta de nuevo en 10 segundos.");
    }
}

function mostrarError(msg) {
    document.getElementById("error").textContent = msg;
    document.getElementById("mensaje").textContent = "";
}

// Utilidades básicas
function copiarResumen() {
    const texto = document.getElementById("resultado").innerText;
    if (texto) {
        navigator.clipboard.writeText(texto);
        alert("📋 Copiado al portapapeles.");
    }
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
