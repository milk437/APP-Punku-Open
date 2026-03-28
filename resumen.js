// resumen.js – Motor Punku Open con Hugging Face Llama 3
const hfToken = "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"; 
const modelUrl = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";

// Configuración inicial al cargar la página
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
    mensajeDiv.textContent = "⏳ Analizando contenido...";

    let prompt = "";
    if (tipo === "book") {
        if (!titulo) return mostrarError("⚠️ Ingresa el título del libro.");
        prompt = `Resume el libro "${titulo}" de ${autor || 'autor desconocido'}. Resumen de ${palabras} palabras en español para nivel secundaria.`;
    } else {
        if (!url) return mostrarError("⚠️ Pega una URL válida.");
        prompt = `Resume este contenido: ${url}. Resumen de ${palabras} palabras en español.`;
    }

    try {
        const response = await fetch(modelUrl, {
            headers: { 
                Authorization: `Bearer ${hfToken}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
                parameters: { max_new_tokens: 1000, temperature: 0.6 }
            }),
        });

        const data = await response.json();
        
        if (data.error) {
            if (data.error.includes("currently loading")) {
                return mensajeDiv.textContent = "⏳ El servidor se está encendiendo... reintenta en 10 segundos.";
            }
            throw new Error(data.error);
        }

        const textoFinal = data[0]?.generated_text || "Error al generar.";

        resultadoDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-top:0; color:#007bff;">📝 Resumen Punku Open:</h3>
                <p style="text-align:justify;">${textoFinal.replace(/\n/g, "<br>")}</p>
            </div>`;
        mensajeDiv.textContent = "✅ ¡Listo!";

    } catch (err) {
        console.error("Fallo:", err);
        mostrarError("❌ Error de conexión con la IA.");
    }
}

function mostrarError(msg) {
    document.getElementById("error").textContent = msg;
    document.getElementById("mensaje").textContent = "";
}

// Funciones de utilidad (PDF, Copiar, etc)
function copiarResumen() {
    const texto = document.getElementById("resultado").innerText;
    if (texto) navigator.clipboard.writeText(texto).then(() => alert("📋 Copiado."));
}

function descargarPDF() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return alert("No hay resumen.");
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
    if (texto) window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
}
