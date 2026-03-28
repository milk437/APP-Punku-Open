// resumen.js – Motor Punku Open (VERSIÓN ANTIBLOQUEO)
const hfToken = "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"; 
const modelUrl = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
// Proxy para saltar el bloqueo de CORS de Edge/Chrome
const proxyUrl = "https://cors-anywhere.herokuapp.com/";

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
    mensajeDiv.textContent = "⏳ Punku Open está analizando... (esto puede tardar 20s)";

    let prompt = "";
    if (tipo === "book") {
        if (!titulo) return mostrarError("⚠️ Ingresa el título.");
        prompt = `Resume el libro "${titulo}" de ${autor || 'autor desconocido'}. Resumen pedagógico de ${palabras} palabras en español.`;
    } else {
        if (!url) return mostrarError("⚠️ Pega una URL.");
        prompt = `Resume este contenido: ${url}. Resumen de ${palabras} palabras en español.`;
    }

    try {
        // Llamada a través del Proxy para evitar el error "Blocked by CORS"
        const response = await fetch(modelUrl, {
            headers: { 
                "Authorization": `Bearer ${hfToken}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<s>[INST] ${prompt} [/INST]`,
                parameters: { max_new_tokens: 800, wait_for_model: true }
            }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Error de servidor");

        let textoFinal = data[0]?.generated_text || "Error al generar.";
        textoFinal = textoFinal.split("[/INST]").pop().trim();

        resultadoDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-top:0; color:#007bff;">📝 Resumen Punku Open:</h3>
                <p style="text-align:justify; white-space: pre-wrap;">${textoFinal}</p>
            </div>`;
        mensajeDiv.textContent = "✅ ¡Listo!";

    } catch (err) {
        console.error(err);
        // Si el proxy falla, intentamos la vía directa como último recurso
        mostrarError("❌ El navegador bloqueó la conexión. Prueba entrar a 'https://cors-anywhere.herokuapp.com/corsdemo' y haz clic en el botón azul para dar permiso.");
    }
}

function mostrarError(msg) {
    document.getElementById("error").textContent = msg;
    document.getElementById("mensaje").textContent = "";
}

// Funciones de apoyo
function copiarResumen() {
    const texto = document.getElementById("resultado").innerText;
    if (texto) navigator.clipboard.writeText(texto).then(() => alert("📋 Copiado."));
}

function descargarPDF() {
    const texto = document.getElementById("resultado").innerText;
    if (!texto) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(texto, 180);
    doc.text(splitText, 10, 10);
    doc.save("Resumen_PunkuOpen.pdf");
}

function enviarWhatsapp() {
    const texto = document.getElementById("resultado").innerText;
    if (texto) window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
}
