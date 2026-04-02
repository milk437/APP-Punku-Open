function generarPromptPodcast() {
    const tema = document.getElementById('temaPodcast').value;
    const grado = document.getElementById('gradoEstudiantes').value;
    const formato = document.getElementById('formatoPodcast').value;
    const duracion = document.getElementById('duracionPodcast').value;
    const output = document.getElementById('promptOutput');
    const area = document.getElementById('resultadoArea');

    if (!tema) {
        alert("⚠️ Por favor, ingresa el tema del podcast.");
        return;
    }

    const prompt = `Actúa como un Productor de Radio Educativa y Especialista en Comunicación del CNEB. 
Tu tarea es redactar un GUION TÉCNICO-LITERARIO para un podcast escolar.

DATOS DEL PROYECTO:
- TEMA: "${tema}"
- PÚBLICO: ${grado}
- FORMATO: ${formato}
- DURACIÓN ESTIMADA: ${duracion}

ESTRUCTURA OBLIGATORIA DEL GUION (PRESENTAR EN TABLA):
1. TIEMPO: (Ej: 00:00 - 00:30)
2. CONTROL (Audio/Efectos): Indicaciones de música de fondo, cortinillas o efectos de sonido.
3. LOCUCIÓN (Texto): Lo que dicen los locutores (usa un lenguaje humano, dinámico y adecuado para ${grado}).

CONTENIDO DEL GUION:
- INTRODUCCIÓN: Saludo creativo, nombre del podcast y planteamiento del tema/reto.
- CUERPO: Desarrollo de 3 ideas clave sobre el tema con datos interesantes.
- CIERRE: Conclusión, llamado a la acción (mensaje reflexivo) y despedida.

⚠️ REGLA CRÍTICA: No des saludos ni comentarios iniciales. Entrega directamente el guion técnico listo para que los estudiantes lo ensayen y graben.`;

    output.value = prompt;
    area.style.display = 'block';
    area.scrollIntoView({ behavior: 'smooth' });
}

async function copiarPrompt() {
    const texto = document.getElementById("promptOutput").value;
    if (!texto) return;
    try {
        await navigator.clipboard.writeText(texto);
        mostrarToast();
    } catch (err) {
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
    const msg = encodeURIComponent("Punku Open - Guion Podcast: " + texto);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}
