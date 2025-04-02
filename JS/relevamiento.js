// Función para obtener el stock desde localStorage
function getStock() {
    return JSON.parse(localStorage.getItem("Stock")) || [];
}

// Evento de click para agregar un nuevo producto al stock
document.getElementById("Btn").addEventListener("click", (event) => {
    event.preventDefault();

    // Obtiene y limpia (trim) los valores del formulario
    const codigo = document.getElementById("Codigo").value.trim();
    const existenteStr = document.getElementById("Existente").value.trim();

    // Validación básica: Se exige la cantidad existente
    if (!existenteStr) {
        alert("Por favor, ingrese la cantidad existente.");
        return;
    }

    // Convierte el valor de 'Existente' a número
    const existenteNum = parseFloat(existenteStr);
    if (isNaN(existenteNum)) {
        alert("El campo 'Existente' debe ser un número válido.");
        return;
    }

    // Obtiene el stock actual
    const Stock = getStock();

    // Si se ingresó un código, se busca si ya existe un producto con el mismo código
    if (codigo !== "") {
        const indexExistente = Stock.findIndex(item => item.codigo === codigo);

        if (indexExistente !== -1) {
            // Producto ya existe: simplemente suma la cantidad existente
            Stock[indexExistente].existente = parseFloat(Stock[indexExistente].existente) + existenteNum;
            alert(`Se actualizó el producto con código ${codigo}. La cantidad existente se incrementó.`);
            localStorage.setItem("Stock", JSON.stringify(Stock));
            document.getElementById("Formu").reset();
            actualizarTabla();
            document.getElementById("Codigo").focus();
            return;
        }
    }

    // Producto nuevo: se requieren los otros campos obligatorios
    const nombre = document.getElementById("Nombre").value.trim();
    const descripcion = document.getElementById("Descripcion").value.trim();
    const minimoStr = document.getElementById("Minimo").value.trim();

    if (!nombre || !descripcion || !minimoStr) {
        alert("Por favor, complete todos los campos para un producto nuevo.");
        return;
    }

    const minimoNum = parseFloat(minimoStr);
    if (isNaN(minimoNum)) {
        alert("El campo 'Minimo' debe ser un número válido.");
        return;
    }

    // Crea el objeto producto nuevo (el campo código puede estar vacío)
    const producto = { codigo, nombre, descripcion, existente: existenteNum, minimo: minimoNum };
    Stock.push(producto);
    alert("Producto agregado correctamente al stock!");

    // Guarda el stock actualizado en localStorage
    localStorage.setItem("Stock", JSON.stringify(Stock));

    // Resetea el formulario, actualiza la tabla y enfoca el campo "Codigo"
    document.getElementById("Formu").reset();
    actualizarTabla();
    document.getElementById("Codigo").focus();
});

// Evento de click para exportar los productos a un archivo Excel
document.getElementById("Excel").addEventListener("click", (event) => {
    event.preventDefault();

    // Convierte el stock a una hoja de trabajo Excel y la descarga
    const Stock = getStock();
    const ws = XLSX.utils.json_to_sheet(Stock);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, "Inventario.xlsx");
});

// Función para actualizar la tabla con los productos almacenados
function actualizarTabla() {
    const Stock = getStock();
    const tablaBody = document.querySelector("#Relevamiento tbody");

    // Limpia la tabla antes de agregar los nuevos productos
    tablaBody.innerHTML = "";

    // Recorre los productos y agrega una fila para cada uno
    Stock.forEach((producto, index) => {
        const fila = document.createElement("tr");

        // Genera el ID del producto, usando el índice si no tiene un ID asignado
        fila.innerHTML = `
            <td>${producto.id || index + 1}</td>
            <td>${producto.codigo}</td>
            <td>${producto.nombre || ""}</td>
            <td>${producto.descripcion || ""}</td>
            <td>${producto.existente}</td>
            <td>${producto.minimo || ""}</td>
            <td><button onclick="modificarFila(${index}, this)">Modificar</button></td>
            <td><button onclick="eliminarFila(${index})" style="background-color: red; color: white;">Eliminar</button></td>
        `;

        // Agrega la fila a la tabla
        tablaBody.appendChild(fila);
    });
}

// Función para eliminar un producto con confirmación
function eliminarFila(index) {
    const Stock = getStock();
    // Obtiene el nombre del producto según el índice
    const producto = Stock[index];
    // Muestra el mensaje de confirmación con el nombre del producto entre paréntesis
    if (confirm(`¿Estás seguro de que deseas eliminar este producto? (${producto.nombre})`)) {
        Stock.splice(index, 1);
        localStorage.setItem("Stock", JSON.stringify(Stock));
        actualizarTabla();
    }
}

// Función para modificar un producto en la tabla
function modificarFila(index, boton) {
    const fila = boton.parentElement.parentElement;
    const celdas = fila.getElementsByTagName("td");

    // Convierte las celdas (excepto la del ID) a inputs editables
    Array.from(celdas).slice(1, -2).forEach((celda) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = celda.textContent;
        celda.textContent = ""; // Borra el valor actual
        celda.appendChild(input);
    });

    // Cambia el botón a "Guardar cambios"
    boton.innerHTML = "Guardar cambios";
    boton.onclick = () => guardarCambio(index, fila, boton);
}

// Función para guardar los cambios de un producto
function guardarCambio(index, fila, boton) {
    const Stock = getStock();
    const celdas = fila.getElementsByTagName("td");

    // Obtiene y limpia los valores de los inputs
    const codigoNuevo = celdas[1].getElementsByTagName("input")[0].value.trim();
    const nombreNuevo = celdas[2].getElementsByTagName("input")[0].value.trim();
    const descripcionNueva = celdas[3].getElementsByTagName("input")[0].value.trim();
    const existenteNuevoStr = celdas[4].getElementsByTagName("input")[0].value.trim();
    const minimoNuevoStr = celdas[5].getElementsByTagName("input")[0].value.trim();

    // Validación: Asegura que ninguno de los campos editados esté vacío
    if (!codigoNuevo && !codigoNuevo === "" || !nombreNuevo || !descripcionNueva || !existenteNuevoStr || !minimoNuevoStr) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    // Convierte los valores numéricos a número
    const existenteNuevo = parseFloat(existenteNuevoStr);
    const minimoNuevo = parseFloat(minimoNuevoStr);

    if (isNaN(existenteNuevo) || isNaN(minimoNuevo)) {
        alert("Los campos 'Existente' y 'Minimo' deben ser números.");
        return;
    }

    // Actualiza el producto con los nuevos valores de los inputs
    const productoModificado = {
        codigo: codigoNuevo,
        nombre: nombreNuevo,
        descripcion: descripcionNueva,
        existente: existenteNuevo,
        minimo: minimoNuevo,
    };

    // Reemplaza el producto modificado en el arreglo
    Stock[index] = productoModificado;

    // Guarda el stock actualizado en localStorage
    localStorage.setItem("Stock", JSON.stringify(Stock));

    // Actualiza la tabla
    actualizarTabla();

    // Restaura el botón a su estado original ("Modificar")
    boton.innerHTML = "Modificar";
    boton.onclick = () => modificarFila(index, boton);
}

// Hace que las funciones sean accesibles globalmente para usarlas en atributos inline
window.modificarFila = modificarFila;
window.eliminarFila = eliminarFila;

// Actualiza la tabla cuando el documento se ha cargado
document.addEventListener("DOMContentLoaded", actualizarTabla);

// Espacio previo a buscador dinámico

// Función para actualizar la tabla usando un arreglo de productos dado
function actualizarTablaConStock(stockArray) {
    const tablaBody = document.querySelector("#Relevamiento tbody");
    tablaBody.innerHTML = "";

    if (stockArray.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="8">No se encontró el producto con ese código.</td>`;
        tablaBody.appendChild(fila);
    } else {
        stockArray.forEach((producto, i) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${producto.id || producto.originalIndex + 1}</td>
                <td>${producto.codigo}</td>
                <td>${producto.nombre || ""}</td>
                <td>${producto.descripcion || ""}</td>
                <td>${producto.existente}</td>
                <td>${producto.minimo || ""}</td>
                <td><button onclick="modificarFila(${producto.originalIndex !== undefined ? producto.originalIndex : i}, this)">Modificar</button></td>
                <td><button onclick="eliminarFila(${producto.originalIndex !== undefined ? producto.originalIndex : i})" style="background-color: red; color: white;">Eliminar</button></td>
            `;
            tablaBody.appendChild(fila);
        });
    }
}

// Función para filtrar el stock según el código ingresado
function filtrarStock() {
    const busqueda = document.getElementById("buscador").value.trim();
    const Stock = getStock();

    // Si el campo de búsqueda está vacío, se muestra todo el stock
    if (busqueda === "") {
        actualizarTabla();
        return;
    }

    // Se filtra el stock, guardando el índice original para mantener la funcionalidad de modificar/eliminar
    const stockFiltrado = [];
    Stock.forEach((item, index) => {
        if (item.codigo.toString().includes(busqueda)) {
            stockFiltrado.push({ ...item, originalIndex: index });
        }
    });

    actualizarTablaConStock(stockFiltrado);
}

// Evento 'input' para actualizar dinámicamente mientras el usuario escribe
document.getElementById("buscador").addEventListener("input", filtrarStock);
