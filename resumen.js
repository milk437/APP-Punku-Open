/**
 * Lógica Sincronizada para Punku Open
 */

// 1. Manejo de visibilidad de los campos según selección
document.getElementById('tipoRecurso').addEventListener('change', function() {
    const esLibro = this.value === 'libro';
    document.getElementById('seccionLibro').style.display = esLibro ? 'block' : 'none';
    document.getElementById('seccionEnlace').style.display = esLibro ? 'none' : 'block';
});

// 2. Función Principal vinculada al botón del HTML
function generarPromptResumen() {
    const tipo = document.getElementById('tipoRecurso').value;
    const palabras = document.getElementById('longitudResumen').value;
    const output = document.getElementById('promptOutput');
    const areaResultado = document.getElementById('resultadoArea');

    let promptFinal = "";

    if (tipo === 'libro') {
        const titulo = document.getElementById('tituloLibro').value;
        const autor = document.getElementById('autorLibro').value;

        if (!titulo) {
            alert("Por favor, ingresa el título del libro.");
            return;
        }

        promptFinal = `Actúa como Especialista en Literatura y Pedagogía. 
Realiza un RESUMEN ACADÉMICO de la obra: "${titulo}" de ${autor || 'Autor reconocido'}.

REQUERIMIENTOS:
1. EXTENSIÓN: Aprox. ${palabras} palabras.
2. ESTRUCTURA: Contexto, resumen de trama, TABLA de personajes y 3 temas para trabajar en clase (CNEB).
3. LENGUAJE: Técnico-pedagógico, humano y sin saludos de IA.`;

    } else {
        const url = document.getElementById('urlWeb').value;
        if (!url) {
            alert("Por favor, ingresa una URL válida.");
            return;
        }

        promptFinal = `Actúa como Analista Curricular. 
Analiza y resume el contenido de este enlace: ${url}

REQUERIMIENTOS:
1. SÍNTESIS: Ideas principales en ${palabras} palabras.
2. DATOS: TABLA con hechos o estadísticas clave del texto.
3. REGLA: Entrega el contenido directamente, sin introducciones ni despedidas de IA.`;
    }

    // Mostrar el resultado y desplazar la vista
    output.value = promptFinal;
    areaResultado.style.display = 'block';
    areaResultado.scrollIntoView({ behavior: 'smooth' });
}

// 3. Función para copiar al portapapeles
function copiarPrompt() {
    const promptText = document.getElementById("promptOutput");
    if (!promptText.value) return;
    
    promptText.select();
    document.execCommand("copy");
    alert("✅ ¡Copiado! Pégalo ahora en tu IA favorita.");
}

// 4. Función para enviar vía WhatsApp
function enviarWhatsApp() {
    const texto = document.getElementById("promptOutput").value;
    if (!texto) return;
    
    const codificado = encodeURIComponent("Punku Open - Instrucción: " + texto);
    window.open(`https://wa.me/?text=${codificado}`, '_blank');
}
