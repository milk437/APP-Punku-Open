// resumen.js – Motor Punku Open con Hugging Face Llama 3
const hfToken = "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"; 
const modelUrl = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";

// Control de visibilidad de los inputs
document.getElementById("inputType").addEventListener("change", function() {
    const tipo = this.value;
    document.getElementById("bookInputs").style.display = tipo === "book" ? "block" : "none";
    document.getElementById("urlInputs").style.display = (tipo === "url" || tipo === "video") ? "block" : "none";
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
        if (!titulo) return mostrarError("⚠️ Por favor, ingresa el título del libro.");
        prompt = `Eres un experto literario. Resume el libro "${titulo}" de ${autor || 'autor desconocido'}. El resumen debe ser de aproximadamente ${palabras} palabras, en español y estructurado para estudiantes de secundaria.`;
    } else {
        if (!url) return mostrarError("⚠️ Por favor, pega una URL válida.");
        prompt = `Resume el contenido de este enlace: ${url}. Hazlo en aproximadamente ${palabras} palabras y en español.`;
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
                return mensajeDiv.textContent = "⏳ El modelo se está cargando en el servidor. Reintenta en 15 segundos.";
            }
            throw new Error(data.error);
        }

        const textoFinal = data[0]?.generated_text || "No se pudo generar el resumen.";

        resultadoDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-top:0;">📝 Resumen Generado:</h3>
                <p>${textoFinal.replace(/\n/g, "<br>")}</p>
            </div>`;
        mensajeDiv.textContent = "✅ Resumen completado con éxito.";

    } catch (err) {
        console.error(err);
        mostrarError("❌ Hubo un fallo en la conexión con la IA. Intenta de nuevo.");
    }
}

function mostrarError(msg) {
    document.getElementById("error").textContent = msg;
    document.getElementById("mensaje").textContent = "";
}

// --- UTILIDADES ---
function copiarResumen() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return alert("Nada que copiar.");
    navigator.clipboard.writeText(texto).then(() => alert("📋 Copiado al portapapeles."));
}

function descargarPDF() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return alert("Primero genera un resumen.");
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
