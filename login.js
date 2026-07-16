// login.js – Autenticación real contra backend de Apps Script (Punku Open)

// ⚠️ PEGA AQUÍ la URL de tu implementación del proyecto "Punku Open - Auth"
// (la consigues en el paso "Implementar > Nueva implementación" del editor).
const AUTH_URL = "https://script.google.com/macros/s/AKfycbzq2M9p4zVWipETeb048NEVXGgY42J9ovCygcHJU2dind51cj3Id4gspD_S7LIbThsLkg/exec";

let intentosRestantes = 3;

async function iniciarSesion() {
  const usuarioInput = document.getElementById("usuario").value.trim();
  const pinInput = document.getElementById("pin").value.trim();
  const mensaje = document.getElementById("mensaje");
  const boton = document.querySelector("button");
  mensaje.textContent = "";

  if (!usuarioInput || !pinInput) {
    mensaje.textContent = "Completa todos los campos.";
    return;
  }

  boton.disabled = true;
  boton.textContent = "Verificando...";

  try {
    const resp = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita el preflight CORS
      body: JSON.stringify({ accion: "login", usuario: usuarioInput, pin: pinInput })
    });
    const data = await resp.json();

    boton.disabled = false;
    boton.textContent = "Iniciar sesión";

    if (data.ok) {
      // Guardamos el TOKEN de sesión, nunca el PIN.
      localStorage.setItem("punkuAuthToken", data.token);
      localStorage.setItem("usuarioActivoPunku", data.usuario);
      location.href = "index.html";
    } else {
      intentosRestantes--;
      mensaje.textContent = `${data.error || "Usuario o PIN incorrecto."} Intentos restantes: ${intentosRestantes}`;
      if (intentosRestantes <= 0) {
        mensaje.textContent = "Demasiados intentos. Cierra y vuelve a intentar.";
        document.querySelectorAll("button").forEach(btn => btn.disabled = true);
      }
    }
  } catch (err) {
    boton.disabled = false;
    boton.textContent = "Iniciar sesión";
    mensaje.textContent = "Error de conexión con el servidor de autenticación.";
    console.error(err);
  }
}
