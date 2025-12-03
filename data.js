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
        
        // ✅ VALIDACIÓN: Verificar que Papa está cargado
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
        
        // 🔍 DEBUGGING MEJORADO: Ver TODAS las columnas y valores de PARQUE
        console.log('========== DIAGNÓSTICO COMPLETO ==========');
        console.log('Total filas parseadas:', parsed.data.length);
        console.log('Columnas disponibles:', Object.keys(parsed.data[0] || {}));
        console.log('Primeras 5 filas completas:', parsed.data.slice(0, 5));
        
        // Ver valores únicos de la columna PARQUE
        const valoresParque = [...new Set(parsed.data.map(r => r.PARQUE))];
        console.log('Valores únicos en PARQUE:', valoresParque);
        console.log('Cantidad de valores en PARQUE:', valoresParque.map(v => {
            const count = parsed.data.filter(r => r.PARQUE === v).length;
            return `"${v}": ${count} filas`;
        }));
        
        // Contar filas con PARQUE exactamente igual a "KG"
        const conParqueKG = parsed.data.filter(row => row.PARQUE === 'KG');
        console.log('Filas con PARQUE === "KG":', conParqueKG.length);
        
        // Contar filas con PARQUE que CONTENGA "KG" (case insensitive)
        const conParqueKGFlexible = parsed.data.filter(row => 
            row.PARQUE && row.PARQUE.toString().toUpperCase().includes('KG')
        );
        console.log('Filas con PARQUE que contiene "KG":', conParqueKGFlexible.length);
        
        // Mostrar algunas filas que SÍ tienen datos
        console.log('Muestra de filas con CARRIL y PILA:', 
            parsed.data.filter(r => r.CARRIL && r.PILA).slice(0, 3)
        );
        console.log('==========================================');
        
        // FILTRO ORIGINAL (estricto)
        datosOriginales = parsed.data.filter(row => row.CARRIL && row.PILA && row.PARQUE === 'KG');
        datos = [...datosOriginales];
        
        // ✅ VALIDACIÓN: Verificar que hay datos después del filtro
        if (datos.length === 0) {
            throw new Error('No se encontraron datos con PARQUE = "KG". Revisa la consola para ver qué valores existen.');
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
    const pilas = [...new Set(datos.map(r => r.PILA).filter(Boolean))].sort();
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
        const o = document.createElement('option');
        o.value = v; 
        o.textContent = v;
        formatoSelect.appendChild(o);
    });
    
    pilas.forEach(v => {
        const o = document.createElement('option');
        o.value = v; 
        o.textContent = v;
        pilaSelect.appendChild(o);
    });
    
    codEstados.forEach(v => {
        const o = document.createElement('option');
        o.value = v; 
        o.textContent = v;
        codEstadoSelect.appendChild(o);
    });
    
    estampados.forEach(v => {
        const o = document.createElement('option');
        o.value = v; 
        o.textContent = v;
        estampadoSelect.appendChild(o);
    });
    
    troqueles.forEach(v => {
        const o = document.createElement('option');
        o.value = v; 
        o.textContent = v;
        troquelSelect.appendChild(o);
    });
    
    resultsEnsMec.forEach(v => {
        const o = document.createElement('option');
        o.value = v; 
        o.textContent = v;
        resultEnsMecSelect.appendChild(o);
    });
    
    codUltCal.forEach(v => {
        const o = document.createElement('option');
        o.value = v; 
        o.textContent = v;
        codUltCalSelect.appendChild(o);
    });
}

function filtrarDatos() {
    const calidad = document.getElementById('calidad').value;
    const formato = document.getElementById('formato').value;
    const longMin = parseInt(document.getElementById('long_min').value) || 0;
    const longMax = parseInt(document.getElementById('long_max').value) || Infinity;
    const pila = document.getElementById('pila').value;
    const codEstado = document.getElementById('cod_estado').value;
    const estampado = document.getElementById('estampado').value;
    const troquel = document.getElementById('troquel').value;
    const resultEnsMec = document.getElementById('result_ens_mec').value;
    const codUltCal = document.getElementById('codig_ultima_cal').value;
    
    let filtrados = datosOriginales.filter(row => {
        return (!calidad || row.CALIDAD === calidad) &&
               (!formato || row.FORMATO === formato) &&
               (row.LONGITUD >= longMin && row.LONGITUD <= longMax) &&
               (!pila || row.PILA === pila) &&
               (!codEstado || row.COD_ESTADO === codEstado) &&
               (!estampado || row.ESTAMPADO === estampado) &&
               (!troquel || row.TROQUEL === troquel) &&
               (!resultEnsMec || row.RESULT_ENS_MEC === resultEnsMec) &&
               (!codUltCal || row.CODIG_ULTIMA_CAL === codUltCal);
    });
    
    const agrupado = {};
    filtrados.forEach(row => {
        const p = row.PILA;
        if (!agrupado[p]) {
            agrupado[p] = { count: 0, peso: 0 };
        }
        agrupado[p].count++;
        agrupado[p].peso += Number(row.PESO || 0);
    });
    
    mostrarResultados(agrupado, Object.keys(agrupado).length);
}

function mostrarResultados(agrupado, totalTipos) {
    const tbody = document.querySelector('#tabla_resultado tbody');
    const totalSpan = document.getElementById('total_filas');
    
    tbody.innerHTML = '';
    totalSpan.textContent = totalTipos;
    
    Object.entries(agrupado)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([pila, datos]) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><strong>${pila}</strong></td>
                <td><strong>${datos.count.toLocaleString()}</strong></td>
                <td><strong>${Math.round(datos.peso).toLocaleString()}</strong></td>
            `;
        });
    
    document.getElementById('resultado').classList.remove('oculto');
}

function limpiarFiltros() {
    document.getElementById('calidad').value = '';
    document.getElementById('formato').value = '';
    document.getElementById('long_min').value = '';
    document.getElementById('long_max').value = '';
    document.getElementById('pila').value = '';
    document.getElementById('cod_estado').value = '';
    document.getElementById('estampado').value = '';
    document.getElementById('troquel').value = '';
    document.getElementById('result_ens_mec').value = '';
    document.getElementById('codig_ultima_cal').value = '';
    
    document.getElementById('resultado').classList.add('oculto');
}
