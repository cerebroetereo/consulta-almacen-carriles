let datos = [];
let datosOriginales = [];

async function cargarDatos() {
    document.getElementById('cargando').classList.remove('oculto');
    
    try {
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        if (!response.ok) throw new Error('No se pudo cargar el CSV');
        
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            delimiter: ';',
            dynamicTyping: {
                LONGITUD: true,
                PESO: true,
                TALADROS: true
            }
        });
        
        datosOriginales = parsed.data.filter(row => row.CARRIL && row.PILA);
        datos = [...datosOriginales];
        
        inicializarFiltros();
        document.getElementById('ultima_actualizacion').innerHTML = 
            `✅ Datos cargados: ${datos.length.toLocaleString()} carriles`;
            
    } catch (error) {
        document.getElementById('error').innerHTML = 
            `❌ Error cargando datos: ${error.message}<br>
             Verifica que la Google Sheet esté publicada como CSV`;
        document.getElementById('error').classList.remove('oculto');
    } finally {
        document.getElementById('cargando').classList.add('oculto');
    }
}

function inicializarFiltros() {
    const calidades = [...new Set(datos.map(r => r.CALIDAD).filter(Boolean))].sort();
    const formatos = [...new Set(datos.map(r => r.FORMATO).filter(Boolean))].sort();
    const pilas = [...new Set(datos.map(r => r.PILA).filter(Boolean))].sort();
    
    const calidadSelect = document.getElementById('calidad');
    const formatoSelect = document.getElementById('formato');
    const pilaSelect = document.getElementById('pila');
    
    calidades.forEach(calidad => {
        const option = document.createElement('option');
        option.value = calidad;
        option.textContent = calidad;
        calidadSelect.appendChild(option);
    });
    
    formatos.forEach(formato => {
        const option = document.createElement('option');
        option.value = formato;
        option.textContent = formato;
        formatoSelect.appendChild(option);
    });
    
    pilas.forEach(pila => {
        const option = document.createElement('option');
        option.value = pila;
        option.textContent = pila;
        pilaSelect.appendChild(option);
    });
}

document.getElementById('buscar').addEventListener('click', filtrarDatos);
document.getElementById('limpiar').addEventListener('click', limpiarFiltros);

function filtrarDatos() {
    const calidad = document.getElementById('calidad').value;
    const formato = document.getElementById('formato').value;
    const longMin = parseInt(document.getElementById('long_min').value) || 0;
    const longMax = parseInt(document.getElementById('long_max').value) || Infinity;
    const pila = document.getElementById('pila').value;
    
    // Filtrar datos
    let filtrados = datosOriginales.filter(row => {
        return (!calidad || row.CALIDAD === calidad) &&
               (!formato || row.FORMATO === formato) &&
               (row.LONGITUD >= longMin && row.LONGITUD <= longMax) &&
               (!pila || row.PILA === pila);
    });
    
    // Agrupar por PILA
    const agrupado = {};
    filtrados.forEach(row => {
        const p = row.PILA;
        if (!agrupado[p]) {
            agrupado[p] = { count: 0, peso: 0 };
        }
        agrupado[p].count++;
        agrupado[p].peso += (row.PESO || 0);
    });
    
    // Mostrar resultados
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
    document.getElementById('resultado').classList.add('oculto');
}
