let datos = [];
let datosOriginales = [];

// ✅ ESPERAR A QUE EL DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', function() {
    
    // Registrar event listeners DESPUÉS de que existan los elementos
    document.getElementById('buscar').addEventListener('click', filtrarDatos);
    document.getElementById('limpiar').addEventListener('click', limpiarFiltros);
    
    // Cargar datos automáticamente
    cargarDatos();
});

async function cargarDatos() {
    document.getElementById('cargando').classList.remove('oculto');
    
    try {
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        if (!response.ok) throw new Error('No se pudo cargar el CSV');
        
        const csvText = await response.text();
        
        if (typeof Papa === 'undefined') {
            throw new Error('PapaParse no está cargado. Verifica el CDN.');
        }
        
        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            delimiter: ',',
            dynamicTyping: {
                LONGITUD: true,
                PESO: true,
                TALADROS: true
            }
        });
        
        console.log('Total filas parseadas:', parsed.data.length);
        
        // ✅ FILTRO CORREGIDO: Solo requiere PARQUE="KG" (sin restricción de CARRIL ni PILA)
        datosOriginales = parsed.data.filter(row => 
            row.PARQUE && 
            row.PARQUE.trim() === 'KG'
        );
        
        console.log('Filas con PARQUE="KG":', datosOriginales.length);
        
        datos = [...datosOriginales];
        
        if (datos.length === 0) {
            throw new Error('No se encontraron datos con PARQUE = "KG"');
        }
        
        inicializarFiltros();
        document.getElementById('ultima_actualizacion').innerHTML = 
            `✅ Datos cargados: ${datos.length.toLocaleString()} carriles`;
            
    } catch (error) {
        console.error('Error detallado:', error);
        document.getElementById('error').innerHTML = 
            `❌ Error cargando datos: ${error.message}<br>
             <small>Abre la consola del navegador (F12) para más detalles</small>`;
        document.getElementById('error').classList.remove('oculto');
    } finally {
        document.getElementById('cargando').classList.add('oculto');
    }
}

function inicializarFiltros() {
    const calidades = [...new Set(datos.map(r => r.CALIDAD).filter(Boolean))].sort();
    const formatos = [...new Set(datos.map(r => r.FORMATO).filter(Boolean))].sort();
    
    // ✅ Incluir "SIN UBICACION" para pilas vacías
    const pilasRaw = datos.map(r => {
        if (!r.PILA || r.PILA.trim() === '') {
            return 'SIN UBICACION';
        }
        return r.PILA.trim();
    });
    const pilas = [...new Set(pilasRaw)].sort();
    
    const codEstados = [...new Set(datos.map(r => r.COD_ESTADO).filter(Boolean))].sort();
    const estampados = [...new Set(datos.map(r => r.ESTAMPADO).filter(Boolean))].sort();
    const troqueles = [...new Set(datos.map(r => r.TROQUEL).filter(Boolean))].sort();
    const resultsEnsMec = [...new Set(datos.map(r => r.RESULT_ENS_MEC).filter(Boolean))].sort();
    const codUltCal = [...new Set(datos.map(r => r.CODIG_ULTIMA_CAL).filter(Boolean))].sort();
    
    const calidadSelect = document.getElementById('calidad');
    const formatoSelect = document.getElementById('formato');
    const pilaSelect = document.getElementById('pila');
    const codEstadoSelect = document.getElementById('cod_estado');
    const estampadoSelect = document.getElementById('estampado');
    const troquelSelect = document.getElementById('troquel');
    const resultEnsMecSelect = document.getElementById('result_ens_mec');
    const codUltCalSelect = document.getElementById('codig_ultima_cal');
    
    calidades.forEach(v => {
        const o = document.createElement('option');
        o.value = v; 
        o.textContent = v;
        calidadSelect.appendChild(o);
    });
    
    formatos.forEach(v => {
        const o
