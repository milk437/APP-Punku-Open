// ============================================================
// CONFIGURACIÓN API
// ============================================================
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

let OPENROUTER_API_KEY = sessionStorage.getItem('openrouter_key');
if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.length < 20) {
    OPENROUTER_API_KEY = prompt(
        '🔑 Ingresa tu clave de API de OpenRouter (sk-or-v1-...):\nSolo se solicitará una vez y quedará en tu navegador.'
    );
    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY.length > 20) {
        sessionStorage.setItem('openrouter_key', OPENROUTER_API_KEY);
    } else {
        alert('⚠️ Clave inválida. El sistema no funcionará correctamente.');
    }
}

// ============================================================
// ELEMENTOS DOM
// ============================================================
const DOM = {
    tipoRecurso: document.getElementById('tipoRecurso'),
    seccionLibro: document.getElementById('seccionLibro'),
    seccionEnlace: document.getElementById('seccionEnlace'),
    tituloLibro: document.getElementById('tituloLibro'),
    autorLibro: document.getElementById('autorLibro'),
    urlWeb: document.getElementById('urlWeb'),
    tipoEstructura: document.getElementById('tipoEstructura'),
    resumenOutput: document.getElementById('resumenOutput'),
    resultado: document.getElementById('resultado'),
    btnGenerar: document.getElementById('btnGenerar'),
    loading: document.getElementById('loading'),
    toast: document.getElementById('toast')
};

// ============================================================
// EVENTOS
// ============================================================
DOM.tipoRecurso.addEventListener('change', (e) => {
    const esLibro = e.target.value === 'libro';
    DOM.seccionLibro.classList.toggle('oculto', !esLibro);
    DOM.seccionEnlace.classList.toggle('oculto', esLibro);
});

DOM.btnGenerar.addEventListener('click', async () => {
    const tipo = DOM.tipoRecurso.value;
    const estructura = DOM.tipoEstructura.value;

    if (tipo === 'libro' && !DOM.tituloLibro.value.trim()) {
        alert('⚠️ Ingresa el título de la obra.');
        return DOM.tituloLibro.focus();
    }
    if (tipo === 'enlace' && !DOM.urlWeb.value.trim()) {
        alert('⚠️ Ingresa la URL del texto.');
        return DOM.urlWeb.focus();
    }

    DOM.loading.classList.remove('oculto');
    DOM.resultado.classList.add('oculto');
    DOM.btnGenerar.disabled = true;
    DOM.btnGenerar.textContent = '⏳ Procesando...';
    DOM.resumenOutput.value = '';

    try {
        const promptText = construirPrompt(tipo, estructura);
        const respuesta = await llamarOpenRouter(promptText);
        DOM.resumenOutput.value = respuesta;
        DOM.resultado.classList.remove('oculto');
        DOM.resultado.scrollIntoView({ behavior: 'smooth' });
        mostrarToast('✅ Documento generado');
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    } finally {
        DOM.loading.classList.add('oculto');
        DOM.btnGenerar.disabled = false;
        DOM.btnGenerar.textContent = '✨ Procesar con IA';
    }
});

// ============================================================
// CONSTRUCCIÓN DEL PROMPT
// ============================================================
function construirPrompt(tipo, estructura) {
    let base = `Actúa como un experto en lingüística, crítico literario senior y científico cognitivo. Posees dominio absoluto del análisis textual, la semiótica, la retórica y la teoría crítica. Tu formación te permite deconstruir cualquier texto con precisión quirúrgica, identificando capas de significado, estructuras subyacentes, tensiones discursivas y marcos epistemológicos. Expresate con rigor académico, precisión conceptual, elegancia estilística y uso impecable del lenguaje. Tus análisis son profundos, matizados y reveladores, capaces de iluminar aspectos que el lector común no percibe. No simplifiques, no trivialices, no uses lenguaje coloquial. Ve a la esencia, desentraña lo implícito, conecta con tradiciones intelectuales y ofrece una perspectiva original y fundamentada.`;

    let objetoAnalisis = '';
    if (tipo === 'libro') {
        const titulo = DOM.tituloLibro.value.trim();
        const autor = DOM.autorLibro.value.trim();
        objetoAnalisis = `la obra literaria "${titulo}"${autor ? ` de ${autor}` : ''}.`;
    } else {
        objetoAnalisis = `el texto disponible en: ${DOM.urlWeb.value.trim()}.`;
    }

    let formato = '';
    let palabras = '';
    switch(estructura) {
        case 'sintesis':
            palabras = '150-200';
            formato = `Genera un documento de aproximadamente ${palabras} palabras en UN (1) PÁRRAFO que contenga: idea principal, propósito del autor y conclusión puntual.`;
            break;
        case 'analisis':
            palabras = '350-450';
            formato = `Genera un análisis de aproximadamente ${palabras} palabras en TRES (3) PÁRRAFOS: 1. Contexto histórico/discursivo. 2. Análisis de argumentos o trama. 3. Conclusión crítica.`;
            break;
        case 'critica':
            palabras = '500-650';
            formato = `Genera una evaluación crítica de aproximadamente ${palabras} palabras en CUATRO (4) PÁRRAFOS: 1. Contexto de producción. 2. Análisis de evidencias. 3. Inferencia de temas subyacentes. 4. Relevancia educativa.`;
            break;
        case 'ejecutivo':
            palabras = '700-900';
            formato = `Genera un informe ejecutivo de aproximadamente ${palabras} palabras en SEIS (6) PÁRRAFOS: 1. Contexto general. 2. Análisis estructural. 3. Argumentos principales. 4. Subtextos y tensiones. 5. Implicancias. 6. Conclusiones y recomendaciones.`;
            break;
        case 'academico':
            palabras = '1000-1300';
            formato = `Genera un documento académico de aproximadamente ${palabras} palabras en OCHO (8) PÁRRAFOS: 1. Introducción. 2. Marco histórico. 3. Análisis estructural. 4. Argumentos centrales. 5. Temas transversales. 6. Análisis crítico. 7. Relevancia curricular. 8. Conclusiones y proyecciones.`;
            break;
        default:
            palabras = '500';
            formato = `Genera un resumen de aproximadamente ${palabras} palabras con la estructura que consideres más adecuada.`;
    }

    return `${base} Tu tarea es analizar ${objetoAnalisis} ${formato} No uses subtítulos, redáctalo en bloque continuo. No incluyas saludos ni texto de relleno. Ve directo al análisis.`;
}

// ============================================================
// CONEXIÓN LLM
// ============================================================
async function llamarOpenRouter(mensaje) {
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://milk437.github.io/APP-Punku-Open/',
            'X-Title': 'Punku Open'
        },
        body: JSON.stringify({
            model: 'openrouter/free',
            messages: [{ role: 'user', content: mensaje }],
            max_tokens: 4000,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error en la API.');
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
}

// ============================================================
// UTILIDADES
// ============================================================
function mostrarToast(mensaje) {
    DOM.toast.textContent = mensaje;
    DOM.toast.classList.remove('oculto');
    clearTimeout(DOM.toast._timeout);
    DOM.toast._timeout = setTimeout(() => DOM.toast.classList.add('oculto'), 3000);
}

async function copiarResumen() {
    try {
        await navigator.clipboard.writeText(DOM.resumenOutput.value);
        mostrarToast('📋 Copiado al portapapeles');
    } catch {
        DOM.resumenOutput.select();
        document.execCommand('copy');
        mostrarToast('📋 Copiado al portapapeles');
    }
}

function enviarWhatsApp() {
    if (!DOM.resumenOutput.value) {
        alert('⚠️ No hay texto para compartir');
        return;
    }
    const msg = encodeURIComponent(`📚 Punku Open - Análisis\n\n${DOM.resumenOutput.value}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

function guardarResumen() {
    if (!DOM.resumenOutput.value) {
        alert('⚠️ No hay texto para guardar');
        return;
    }
    const blob = new Blob([DOM.resumenOutput.value], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Analisis_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    mostrarToast('💾 Archivo guardado');
}

// ============================================================
// EXPORTAR PDF PROFESIONAL
// ============================================================
function exportarPDF() {
    const texto = DOM.resumenOutput.value;
    if (!texto) {
        alert('⚠️ No hay texto para exportar');
        return;
    }

    const titulo = DOM.tituloLibro.value.trim() || 'Documento de Análisis';
    const autor = DOM.autorLibro.value.trim() || 'Análisis de Recurso Web';
    const fecha = new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const parrafos = texto.split('\n').filter(p => p.trim() !== '');
    const textoFormateado = parrafos.map(p => `<p>${p.trim()}</p>`).join('');

    const ventana = window.open('', '_blank');
    ventana.document.write(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Análisis - Punku Open</title>
    <style>
        @page { margin: 2.5cm; }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1a1a1a;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }
        .container { max-width: 100%; padding: 0; }
        .header {
            text-align: center;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 18px;
            margin-bottom: 25px;
        }
        .header h1 {
            font-size: 16pt;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 4px 0;
            letter-spacing: 0.5px;
        }
        .header .subtitulo {
            font-size: 11pt;
            color: #444;
            margin: 4px 0;
            font-weight: normal;
        }
        .header .meta {
            font-size: 10pt;
            color: #666;
            margin-top: 6px;
        }
        .header .meta span {
            display: inline-block;
            margin: 0 8px;
        }
        .contenido { text-align: justify; }
        .contenido p {
            margin: 0 0 12px 0;
            text-indent: 1.5cm;
            text-align: justify;
        }
        .footer {
            margin-top: 40px;
            padding-top: 12px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 9pt;
            color: #888;
        }
        .footer .logo {
            font-weight: 600;
            color: #1a1a1a;
        }
        @media print { body { margin: 0; } .container { padding: 0; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Punku Open</h1>
            <div class="subtitulo">Análisis Estructural con IA</div>
            <div class="meta">
                <span><strong>Obra:</strong> ${titulo}</span>
                <span><strong>Autor:</strong> ${autor}</span>
                <span><strong>Fecha:</strong> ${fecha}</span>
            </div>
        </div>
        <div class="contenido">
            ${textoFormateado}
        </div>
        <div class="footer">
            <span class="logo">Punku Open - Milton Ruiz</span>
        </div>
    </div>
    <script>window.onload = function() { window.print(); }</script>
</body>
</html>
    `);
    ventana.document.close();
}

// ============================================================
// EXPONER FUNCIONES GLOBALES
// ============================================================
window.copiarResumen = copiarResumen;
window.enviarWhatsApp = enviarWhatsApp;
window.guardarResumen = guardarResumen;
window.exportarPDF = exportarPDF;
