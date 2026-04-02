// Manejo de visibilidad
document.getElementById('tipoRecurso').addEventListener('change', function() {
    const esLibro = this.value === 'libro';
    document.getElementById('seccionLibro').style.display = esLibro ? 'block' : 'none';
    document.getElementById('seccionEnlace').style.display = esLibro ? 'none' : 'block';
});

function generarPromptResumen() {
    const tipo = document.getElementById('tipoRecurso').value;
    const palabras = document.getElementById('longitudResumen').value;
    const output = document.getElementById('promptOutput');
    const area = document.getElementById('resultadoArea');

    let prompt = "";

    if (tipo === 'libro') {
        const t = document.getElementById('tituloLibro').value;
        const a = document.getElementById('autorLibro').value;
        if (!t) return alert("Ingresa el título.");
        prompt = `Actúa como Especialista Pedagógico CNEB. Analiza la obra "${t}" de ${a || 'autor reconocido'}. Resumen de ${palabras} palabras con TABLA de personajes y ejes temáticos. Sin saludos de IA.`;
    } else {
        const u = document.getElementById('urlWeb').value;
        if (!u) return alert("Ingresa la URL.");
        prompt = `Actúa como Analista Curricular. Resume este enlace: ${u} en ${palabras} palabras. Incluye TABLA de hechos clave. Entrega directa sin saludos de IA.`;
    }

    output.value = prompt;
    area.style.display = 'block';
    area.scrollIntoView({ behavior: 'smooth' });
}

// FUNCIÓN DE COPIADO ACTUALIZADA
async function copiarPrompt() {
    const texto = document.getElementById("promptOutput").value;
    if (!texto) return;

    try {
        await navigator.clipboard.writeText(texto);
        mostrarToast();
    } catch (err) {
        // Fallback por si el navegador es antiguo
        const temp = document.getElementById("promptOutput");
        temp.select();
        document.execCommand("copy");
        mostrarToast();
    }
}

function mostrarToast() {
    const toast = document.getElementById("toast");
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 2500);
}

function enviarWhatsApp() {
    const texto = document.getElementById("promptOutput").value;
    if (!texto) return;
    const msg = encodeURIComponent("Punku Open - Instrucción: " + texto);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}
