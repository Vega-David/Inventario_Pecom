document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; 
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        document.getElementById('fileInput').style.display = 'none'; // Oculta el botón de carga
        document.getElementById('filterButton').style.display = 'block';
        document.getElementById('searchInput').style.display = 'block';
        document.getElementById('clearSearch').style.display = 'block';
        document.getElementById('resetTable').style.display = 'block';
        document.getElementById('counter').style.display = 'block';

        renderTable(jsonData);
    };
    reader.readAsArrayBuffer(file);
});

function renderTable(data) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';

    for (let i = 1; i < data.length; i++) { 
        if (data[i].length < 5) continue;

        const row = document.createElement('tr');
        let existente = parseInt(data[i][3]);
        let minimo = parseInt(data[i][4]);

        if (existente > minimo + 10) {
            row.classList.add('verde');
        } else if (existente > minimo) {
            row.classList.add('amarillo');
        } else {
            row.classList.add('rojo');
        }

        data[i].forEach(cell => {
            const cellElement = document.createElement('td');
            cellElement.textContent = cell;
            row.appendChild(cellElement);
        });

        tbody.appendChild(row);
    }
    updateCounter();
}

document.getElementById('filterButton').addEventListener('click', function() {
    const tbody = document.querySelector('#dataTable tbody');
    let rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        let stockA = parseInt(a.children[3].textContent) - parseInt(a.children[4].textContent);
        let stockB = parseInt(b.children[3].textContent) - parseInt(b.children[4].textContent);
        return stockA - stockB;
    });

    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
});

// Buscador dinámico
document.getElementById('searchInput').addEventListener('input', function() {
    let filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('#dataTable tbody tr');

    rows.forEach(row => {
        let text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });

    updateCounter();
});

// Botón para limpiar la búsqueda
document.getElementById('clearSearch').addEventListener('click', function() {
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('#dataTable tbody tr').forEach(row => row.style.display = '');
    updateCounter();
});

// Botón para restablecer la tabla original
document.getElementById('resetTable').addEventListener('click', function() {
    document.getElementById('searchInput').value = '';
    document.getElementById('fileInput').style.display = 'block';
    document.getElementById('filterButton').style.display = 'none';
    document.getElementById('searchInput').style.display = 'none';
    document.getElementById('clearSearch').style.display = 'none';
    document.getElementById('resetTable').style.display = 'none';
    document.getElementById('counter').style.display = 'none';

    document.querySelector('#dataTable tbody').innerHTML = '';
});

// Contador de filas visibles
function updateCounter() {
    const visibleRows = Array.from(document.querySelectorAll('#dataTable tbody tr'))
        .filter(row => row.style.display !== 'none').length;
    document.getElementById('counter').textContent = `Productos visibles: ${visibleRows}`;
}

// Ordenar columnas al hacer clic en los encabezados
document.querySelectorAll('#dataTable th').forEach(header => {
    header.addEventListener('click', function() {
        const columnIndex = this.getAttribute('data-column');
        sortTableByColumn(columnIndex);
    });
});

function sortTableByColumn(columnIndex) {
    const tbody = document.querySelector('#dataTable tbody');
    let rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        let textA = a.children[columnIndex].textContent.trim().toLowerCase();
        let textB = b.children[columnIndex].textContent.trim().toLowerCase();
        return textA.localeCompare(textB, 'es', { numeric: true });
    });

    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}
