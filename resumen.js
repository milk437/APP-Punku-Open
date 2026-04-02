/**
 * Lógica de Punku Open para la generación de Prompts de Resumen
 * Diseñado para evitar bloqueos de API y maximizar calidad de IA externa.
 */

// Alternar campos según selección
document.getElementById('tipoRecurso').addEventListener('change', function() {
    const esLibro = this.value === 'libro';
    document.getElementById('seccionLibro').style.display = esLibro ? 'block' : 'none';
    document.getElementById('seccionEnlace').style.display = esLibro ? 'none' : 'block';
});

function generarPromptResumen() {
    const tipo = document.getElementById('tipoRecurso').value;
    const palabras = document.getElementById('longitudResumen').value;
    const output = document.getElementById('promptOutput');
    const areaResultado = document.getElementById('resultadoArea');

    let promptFinal = "";

    if (tipo === 'libro') {
        const titulo = document.getElementById('tituloLibro').value;
        const autor = document.getElementById('autorLibro').value;

        if (!titulo) return alert("Por favor, ingresa el título de la obra.");

        promptFinal = `Actúa como un Especialista en Literatura y Pedagogía Universitaria. 
Realiza un ANÁLISIS ACADÉMICO Y RESUMEN de la obra: "${titulo}" de ${autor || 'Autor reconocido'}.

REQUERIMIENTOS TÉCNICOS:
1. RESUMEN: Extensión de ${palabras} palabras aproximadamente.
2. ESTRUCTURA: 
   - Contexto de la obra y el autor.
   - Resumen ejecutivo por partes o capítulos clave.
   - Tabla de personajes principales y secundarios con sus roles.
   - 3 Ejes temáticos vinculados al Currículo Nacional (CNEB).
3. LENGUAJE: Humanizado, técnico-pedagógico y fluido.

⚠️ REGLA CRÍTICA: No des introducciones ("Aquí tienes el resumen..."). Entrega el contenido directamente en formato profesional Markdown.`;

    } else {
        const url = document.getElementById('urlWeb').value;
        if (!url) return alert("Por favor, ingresa una dirección URL válida.");

        promptFinal = `Actúa como un Analista de Información Pedagógica.
Procesa, analiza y resume el contenido del siguiente enlace: ${url}

REQUERIMIENTOS:
1. SÍNTESIS CRÍTICA: Resumen de ${palabras} palabras con las ideas fuerza del texto.
2. ORGANIZACIÓN: Presenta en una TABLA los datos relevantes, estadísticas o fechas clave.
3. CONCLUSIÓN: Breve párrafo sobre la utilidad de este contenido para un docente peruano.

⚠️ REGLA CRÍTICA: Entrega el texto técnico directamente. Sin saludos ni comentarios de IA al inicio o al final.`;
    }

    // Mostrar el prompt en el área de texto
    output.value = promptFinal;
    areaResultado.style.display = 'block';
    areaResultado.scrollIntoView({ behavior: 'smooth' });
}

function copiarAlPortapapeles() {
    const textarea = document.getElementById("promptOutput");
    textarea.select();
    document.execCommand("copy");
    alert("¡Instrucción copiada! Ahora pégala en Gemini o ChatGPT.");
}

function compartirWhatsApp() {
    const texto = document.getElementById("promptOutput").value;
    if (!texto) return;
    const msg = encodeURIComponent("Punku Open | Instrucción de Resumen: " + texto);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}
