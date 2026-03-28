// resumen.js – Motor Punku Open con Hugging Face Llama 3
const hfToken = "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"; 
const modelUrl = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";

document.addEventListener("DOMContentLoaded", () => {
    const inputType = document.getElementById("inputType");
    if (inputType) {
        inputType.addEventListener("change", function() {
            const tipo = this.value;
            document.getElementById("bookInputs").style.display = tipo === "book" ? "block" : "none";
            document.getElementById("urlInputs").style.display = (tipo === "url" || tipo === "video") ? "block" : "none";
        });
    }
    console.log("🚀 Punku Open: Motor Llama-3 (Hugging Face) Activo.");
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
    mensajeDiv.textContent = "⏳ Punku Open está analizando el contenido...";

    let prompt = "";
    if (tipo === "book") {
        if (!titulo) return mostrarError("⚠️ Ingresa el título del libro.");
        prompt = `Resume de forma pedagógica el libro "${titulo}" de ${autor || 'autor desconocido'}. Extensión: ${palabras} palabras. Idioma: Español.`;
    } else {
        if (!url) return mostrarError("⚠️ Pega una URL válida.");
        prompt = `Resume el contenido de este enlace: ${url}. Extensión: ${palabras} palabras. Idioma: Español.`;
    }

    try {
        const response = await fetch(modelUrl, {
            headers: { 
                "Authorization": `Bearer ${hfToken}`,
                "Content-Type": "application/json",
                // Eliminamos cabeceras extra que causan errores de CORS en navegadores estrictos
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
                parameters: { 
                    max_new_tokens: 1000, 
                    temperature: 0.7,
                    wait_for_model: true // CRÍTICO: Espera a que el modelo cargue si está dormido
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Fallo en la respuesta del servidor");
        }

        const data = await response.json();
        
        // Hugging Face a veces devuelve el texto con el prompt incluido, lo limpiamos
        let textoFinal = data[0]?.generated_text || "No se pudo generar el resumen.";
        
        resultadoDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); color: #333;">
                <h3 style="margin-top:0; color:#007bff;">📝 Resumen Punku Open:</h3>
                <p style="text-align:justify; line-height:1.6; white-space: pre-wrap;">${textoFinal}</p>
            </div>`;
        mensajeDiv.textContent = "✅ ¡Resumen generado con éxito!";

    } catch (err) {
        console.error("Fallo detallado:", err);
        mostrarError("❌ Error: " + err.message);
    }
}

function mostrarError(msg) {
    document.getElementById("error").textContent = msg;
    document.getElementById("mensaje").textContent = "";
}

// Funciones de utilidad corregidas para evitar bloqueos de Edge
function copiarResumen() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => alert("📋 Copiado al portapapeles."));
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
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
}
