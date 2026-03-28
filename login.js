// login.js – Gestión de usuarios y PIN para Punku Open
// Modificado para un usuario fijo y sin opción de registro.

let intentosRestantes = 3;

// *** CONFIGURACIÓN DEL USUARIO FIJO ***
// Por favor, cambia estos valores por el usuario y PIN que deseas usar.
const FIXED_USERNAME = "PunkuOpen"; // <-- ¡Cambia esto por tu usuario!
const FIXED_PIN = "032415";         // <-- ¡Cambia esto por tu PIN!
// *************************************

function iniciarSesion() {
  const usuarioInput = document.getElementById("usuario").value.trim();
  const pinInput = document.getElementById("pin").value.trim();
  const mensaje = document.getElementById("mensaje");

  mensaje.textContent = ""; // Limpiar mensajes anteriores

  if (!usuarioInput || !pinInput) {
    mensaje.textContent = "Completa todos los campos.";
    return;
  }

  // Validar contra el usuario y PIN fijos
  if (usuarioInput === FIXED_USERNAME && pinInput === FIXED_PIN) {
    // Inicio de sesión exitoso
    localStorage.setItem("usuarioActivoPunku", usuarioInput);
    location.href = "index.html";
  } else {
    // Credenciales incorrectas
    intentosRestantes--;
    mensaje.textContent = `Usuario o PIN incorrecto. Intentos restantes: ${intentosRestantes}`;
    if (intentosRestantes <= 0) {
      mensaje.textContent = "Demasiados intentos. Cierra y vuelve a intentar.";
      document.querySelectorAll("button").forEach(btn => btn.disabled = true);
    }
  }
}

// La función `registrarUsuario` ha sido eliminada por completo
// para evitar la creación de nuevos usuarios.
