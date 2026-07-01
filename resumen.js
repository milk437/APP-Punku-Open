// ============================================================
// CONFIGURACIÓN - OpenRouter API
// ============================================================
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ============================================================
// PEDIR CLAVE AL USUARIO
// ============================================================
let OPENROUTER_API_KEY = sessionStorage.getItem('openrouter_key');

if (!OPENROUTER_API_KEY) {
    OPENROUTER_API_KEY = prompt(
        '🔑 Ingresa tu clave de API de OpenRouter:\n\n' +
        'La clave comienza con "sk-or-v1-..."\n' +
        'Puedes obtenerla en: https://openrouter.ai/keys\n\n' +
        '⚠️ La clave se guarda SOLO en tu navegador.',
        'sk-or-v1-'
    );
    
    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY.length > 10) {
        sessionStorage.setItem('openrouter_key', OPENROUTER_API_KEY);
        alert('✅ Clave guardada correctamente');
    } else {
        alert('⚠️ No se ingresó una clave válida');
    }
}

// ============================================================
// ELEMENTOS DOM
// ============================================================
const tipoRecurso = document.getElementById('tipoRecurso');
const seccionLibro = document.getElementById('seccionLibro');
const seccionEnlace = document.getElementById('seccionEnlace');
const tituloLibro = document.getElementById('tituloLibro');
const autorLibro = document.getElementById('autorLibro');
const urlWeb = document.getElementById('urlWeb');
const longitudResumen = document.getElementById('longitudResumen');
const resumenOutput = document.getElementById('resumenOutput');
const resultado = document.getElementById('resultado');
const btnGenerar = document.getElementById('btnGenerar');
const loading = document.getElementById('loading');
const toast = document.getElementById('toast');

// ============================================================
// MANEJO DE VISIBILIDAD
// ============================================================
tipoRecurso.addEventListener('change', function() {
    const esLibro = this.value === 'libro';
    seccionLibro.style.display = esLibro ? 'block' : 'none';
    seccionEnlace.style.display = esLibro ? 'none' : 'block';
    if (esLibro) { urlWeb.value = ''; } else { tituloLibro.value = ''; autorLibro.value = ''; }
});

// ============================================================
// GENERAR RESUMEN
// ============================================================
btnGenerar.addEventListener('click', async function() {
    const tipo = tipoRecurso.value;
    const palabras = parseInt(longitudResumen.value);
    
    // Verificar clave
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.length < 10) {
        alert('⚠️ Necesitas una clave de OpenRouter. Recarga la página.');
        return;
    }
    
    // Validar campos
    if (tipo === 'libro') {
        const t = tituloLibro.value.trim();
        if (!t) { alert('⚠️ Ingresa el título del libro'); tituloLibro.focus(); return; }
    } else {
        const u = urlWeb.value.trim();
        if (!u) { alert('⚠️ Ingresa la URL del artículo'); urlWeb.focus(); return; }
    }
    
    // Mostrar loading
    loading.style.display = 'block';
    btnGenerar.disabled = true;
    btnGenerar.textContent = '⏳ Generando...';
    resultado.style.display = 'none';
    resumenOutput.value = '';
    
    try {
        const mensaje = construirPrompt(tipo, palabras);
        const resumen = await llamarOpenRouter(mensaje);
        resumenOutput.value = resumen;
        resultado.style.display = 'block';
        resultado.scrollIntoView({ behavior: 'smooth' });
        mostrarToast('✅ ¡Resumen generado exitosamente!');
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
    } finally {
        loading.style.display = 'none';
        btnGenerar.disabled = false;
        btnGenerar.textContent = '✨ Generar Resumen con IA';
    }
});

// ============================================================
// CONSTRUIR PROMPT
// ============================================================
function construirPrompt(tipo, palabras) {
    let mensaje = `Eres un experto en educación y pedagogía. `;
    if (tipo === 'libro') {
        const titulo = tituloLibro.value.trim();
        const autor = autorLibro.value.trim();
        mensaje += `Genera un resumen académico de aproximadamente ${palabras} palabras sobre la obra "${titulo}"`;
        if (autor) mensaje += ` del autor ${autor}`;
        mensaje += `. El resumen debe incluir: contexto histórico y literario, análisis de la trama, temas principales, personajes clave y su relevancia educativa.`;
    } else {
        const url = urlWeb.value.trim();
        mensaje += `Genera un resumen analítico de aproximadamente ${palabras} palabras del artículo disponible en: ${url}. `;
        mensaje += `Debes identificar: los argumentos principales, las evidencias presentadas, el contexto de publicación y la relevancia educativa del contenido.`;
    }
    mensaje += ` El resumen debe ser profesional, estructurado en párrafos y útil para docentes. No incluyas saludos ni despedidas.`;
    return mensaje;
}

// ============================================================
// LLAMAR A OPENROUTER
// ============================================================
async function llamarOpenRouter(mensaje) {
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://milk437.github.io',
            'X-Title': 'Punku Open'
        },
        body: JSON.stringify({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
                { role: 'system', content: 'Eres un experto en educación y pedagogía. Generas resúmenes profesionales, detallados y estructurados.' },
                { role: 'user', content: mensaje }
            ],
            max_tokens: 1200,
            temperature: 0.7
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error en la API de OpenRouter');
    }
    
    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content || '';
    
    if (!texto) {
        throw new Error('No se pudo generar el resumen');
    }
    
    return texto;
}

// ============================================================
// COPIAR TEXTO
// ============================================================
async function copiarResumen() {
    const texto = resumenOutput.value;
    if (!texto) { alert('⚠️ No hay texto para copiar'); return; }
    try {
        await navigator.clipboard.writeText(texto);
        mostrarToast('✅ ¡Copiado al portapapeles!');
    } catch (err) {
        resumenOutput.select();
        document.execCommand('copy');
        mostrarToast('✅ ¡Copiado al portapapeles!');
    }
}

// ============================================================
// ENVIAR POR WHATSAPP
// ============================================================
function enviarWhatsApp() {
    const texto = resumenOutput.value;
    if (!texto) { alert('⚠️ No hay texto para compartir'); return; }
    const msg = encodeURIComponent(`📚 Punku Open - Resumen\n\n${texto}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// ============================================================
// GUARDAR COMO ARCHIVO .TXT
// ============================================================
function guardarResumen() {
    const texto = resumenOutput.value;
    if (!texto) { alert('⚠️ No hay texto para guardar'); return; }
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumen-punku-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast('💾 ¡Resumen guardado!');
}

// ============================================================
// EXPORTAR A PDF
// ============================================================
function exportarPDF() {
    const texto = resumenOutput.value;
    if (!texto) { alert('⚠️ No hay texto para exportar'); return; }
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html><head><title>Resumen Punku Open</title>
        <style>body{font-family:'Segoe UI',Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8}
        h1{color:#ffd700;border-bottom:2px solid #ffd700;padding-bottom:10px}
        .footer{margin-top:30px;color:#888;font-size:0.9em;border-top:1px solid #ddd;padding-top:10px}
        .content{white-space:pre-wrap}</style></head>
        <body><h1>📚 Punku Open - Resumen</h1>
        <div class="content">${texto.replace(/\n/g, '<br>')}</div>
        <div class="footer">Generado el ${new Date().toLocaleDateString('es-PE')} - Punku Open</div>
        <script>window.onload=function(){window.print()}<\\/script></body></html>
    `);
    ventana.document.close();
}

// ============================================================
// TOAST (NOTIFICACIONES)
// ============================================================
function mostrarToast(mensaje, color = '#ffd700') {
    toast.textContent = mensaje;
    toast.style.background = color;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3000);
}
