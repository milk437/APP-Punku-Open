// resumen.js – Generador de Resúmenes Punku Open PRO

document.getElementById("inputType").addEventListener("change", actualizarInputs);

function actualizarInputs() {
  const tipo = document.getElementById("inputType").value;
  document.getElementById("bookInputs").style.display = tipo === "book" ? "block" : "none";
  document.getElementById("urlInputs").style.display = tipo !== "book" ? "block" : "none";
}

function generarResumen() {
  const tipo = document.getElementById("inputType").value;
  const titulo = document.getElementById("inputTitle").value.trim();
  const autor = document.getElementById("inputAuthor").value.trim();
  const url = document.getElementById("inputUrl").value.trim();
  const palabras = document.getElementById("targetWordCount").value;

  const errorDiv = document.getElementById("error");
  const resultado = document.getElementById("resultado");
  const mensaje = document.getElementById("mensaje");

  errorDiv.textContent = "";
  resultado.innerHTML = "";
  mensaje.textContent = "⏳ Generando resumen...";

  let prompt = "";
  let longitud = palabras === "libre"
    ? "Proporciona un resumen claro, útil y completo."
    : `en aproximadamente ${palabras} palabras.`;

  if (tipo === "book") {
    if (!titulo) {
      mostrarError("⚠️ Debes ingresar el título del libro.");
      return;
    }
    prompt = `Resume el libro titulado "${titulo}"${autor ? `, escrito por ${autor}` : ""}, ${longitud}`;
  } else if (tipo === "url") {
    if (!url) {
      mostrarError("⚠️ Ingresa una URL válida.");
      return;
    }
    prompt = `Resume el contenido principal encontrado en la siguiente URL: ${url}. Si no se puede acceder directamente, resume la temática probable, ${longitud}`;
  } else if (tipo === "video") {
    if (!url) {
      mostrarError("⚠️ Ingresa la URL del video.");
      return;
    }
    prompt = `Resume el video ubicado en la URL: ${url}. Si no se puede acceder al video, resume el tema general estimado, ${longitud}`;
  }

  // API Gemini (coloca tu clave)
  const apiKey = AIzaSyAX6MkVumi5M4nSZ0totXbqphtiswSaS4s"; // 🔑 Inserta tu clave API de Gemini
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
  })
    .then(response => response.json())
    .then(data => {
      const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      if (texto) {
        resultado.innerHTML = `
          <h3>📝 Resumen generado:</h3>
          <div style="line-height: 1.6;">${texto.replace(/\n/g, "<br>")}</div>`;
        mensaje.textContent = "✅ Resumen listo.";
      } else {
        mostrarError("❌ No se pudo generar el resumen. Verifica tu API key.");
      }
    })
    .catch(err => {
      console.error(err);
      mostrarError("❌ Error de conexión al servicio de Gemini.");
    });
}

function mostrarError(msg) {
  document.getElementById("error").textContent = msg;
  document.getElementById("mensaje").textContent = "";
  document.getElementById("resultado").innerHTML = "";
}

function obtenerTextoPlano() {
  return document.getElementById("resultado").innerText.trim();
}

function descargarPDF() {
  const texto = obtenerTextoPlano();
  if (!texto) return;

  const blob = new Blob([texto], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "resumen_punku_open.pdf";
  link.click();
}

function descargarWord() {
  const texto = obtenerTextoPlano();
  if (!texto) return;

  const blob = new Blob([texto], { type: "application/msword" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "resumen_punku_open.doc";
  link.click();
}

function enviarCorreo() {
  const texto = obtenerTextoPlano();
  if (!texto) return;

  const body = encodeURIComponent("Aquí tienes tu resumen generado por Punku Open:\n\n" + texto);
  window.location.href = `mailto:?subject=Resumen%20Punku%20Open&body=${body}`;
}

function enviarWhatsapp() {
  const texto = obtenerTextoPlano();
  if (!texto) return;

  const body = encodeURIComponent("Aquí tienes tu resumen de Punku Open:\n\n" + texto);
  window.open(`https://wa.me/?text=${body}`, "_blank");
}
