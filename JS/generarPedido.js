let stock = JSON.parse(localStorage.getItem("stock"));

const cardsContainer = document.getElementById("cardsContainer");
const cartContainer = document.getElementById("cartContainer");
const buscador = document.getElementById("buscador");
const enviarPedidoBtn = document.getElementById("enviarPedido");

// Array para almacenar los ítems del carrito
let carrito = [];

// Función para renderizar las tarjetas de productos
function renderCards(products) {
  cardsContainer.innerHTML = "";
  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";

     // Creación del recuadro fake-image
    const fakeImage = document.createElement("div");
    fakeImage.className = "fake-image";
    fakeImage.style.backgroundColor = getRandomColor();
    card.appendChild(fakeImage);
    
    const titulo = document.createElement("h3");
    titulo.textContent = product.nombre;
    card.appendChild(titulo);
    
    const info = document.createElement("p");
    info.innerHTML = `<strong>Código SAP:</strong> ${product.codigoSap}<br>
                      <strong>Descripción:</strong> ${product.descripcion}<br>
                      <strong>Stock:</strong> ${product.cantidad}`;
    card.appendChild(info);
    
    // Input para cantidad a agregar
    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.min = "1";
    inputCantidad.max = product.cantidad;
    inputCantidad.placeholder = "Cantidad a agregar";
    inputCantidad.className = "cantidad";
    card.appendChild(inputCantidad);
    
    // Botón "Agregar a pedido"
    const btnAgregar = document.createElement("button");
    btnAgregar.textContent = "Agregar a pedido";
    btnAgregar.className = "agregar-btn";
    btnAgregar.addEventListener("click", () => {
      const cantidad = parseInt(inputCantidad.value);
      if (!cantidad || cantidad <= 0) {
        alert("Ingrese una cantidad válida.");
        return;
      }
      if (cantidad > product.cantidad) {
        alert("No hay suficiente stock disponible.");
        return;
      }
      // Descontar inmediatamente del stock
      product.cantidad -= cantidad;
      localStorage.setItem("stock", JSON.stringify(stock));
      
      // Agregar al carrito o acumular si ya existe
      const index = carrito.findIndex(item => item.id === product.id);
      if (index !== -1) {
        carrito[index].cantidadAgregada += cantidad;
      } else {
        carrito.push({
          id: product.id,
          codigoSap: product.codigoSap,
          nombre: product.nombre,
          descripcion: product.descripcion,
          cantidadAgregada: cantidad
        });
      }
      inputCantidad.value = "";
      renderCards(products);
      renderCart();
    });
    card.appendChild(btnAgregar);
    
    cardsContainer.appendChild(card);
  });
}

// Renderizar las tarjetas inicialmente
renderCards(stock);

// Función para mostrar los ítems del carrito, ahora con botones "+" y "–"
function renderCart() {
  cartContainer.innerHTML = "";
  if (carrito.length === 0) {
    cartContainer.textContent = "Carrito vacío.";
    return;
  }
  carrito.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    
    // Información del ítem
    const infoSpan = document.createElement("span");
    infoSpan.innerHTML = `<strong>${item.nombre}</strong> (x${item.cantidadAgregada})<br>
                          Código: ${item.codigoSap}`;
    div.appendChild(infoSpan);
    
    // Contenedor para los botones de ajuste
    const btnContainer = document.createElement("div");
    btnContainer.className = "btn-adjust-container";
    
    // Botón "+" (aumentar)
    const btnPlus = document.createElement("button");
    btnPlus.textContent = "+";
    btnPlus.className = "btn-accion btn-plus";
    btnPlus.addEventListener("click", () => {
      // Buscar el producto en el stock para validar si hay unidad disponible
      const prod = stock.find(p => p.id === item.id);
      if (prod.cantidad < 1) {
        alert("No hay más stock disponible para este producto.");
        return;
      }
      // Incrementar cantidad en el carrito y descontar del stock
      item.cantidadAgregada++;
      prod.cantidad--;
      localStorage.setItem("stock", JSON.stringify(stock));
      renderCards(stock);
      renderCart();
    });
    btnContainer.appendChild(btnPlus);
    
    // Botón "–" (disminuir)
    const btnMinus = document.createElement("button");
    btnMinus.textContent = "–";
    btnMinus.className = "btn-accion btn-minus";
    btnMinus.addEventListener("click", () => {
      // Si la cantidad en el carrito es mayor que 1, se disminuye; sino se elimina el item
      if (item.cantidadAgregada > 1) {
        item.cantidadAgregada--;
        // Al disminuir, se devuelve 1 unidad al stock
        const prod = stock.find(p => p.id === item.id);
        prod.cantidad++;
      } else {
        // Si se elimina el último, se devuelve esa unidad y se quita el item del carrito
        const prod = stock.find(p => p.id === item.id);
        prod.cantidad++;
        carrito = carrito.filter(i => i.id !== item.id);
      }
      localStorage.setItem("stock", JSON.stringify(stock));
      renderCards(stock);
      renderCart();
    });
    btnContainer.appendChild(btnMinus);
    
    div.appendChild(btnContainer);
    cartContainer.appendChild(div);
  });
}

// Buscador dinámico: Filtra según código, nombre y descripción
buscador.addEventListener("input", () => {
  const term = buscador.value.toLowerCase();
  const filtered = stock.filter(product => 
    product.codigoSap.toString().includes(term) ||
    product.nombre.toLowerCase().includes(term) ||
    product.descripcion.toLowerCase().includes(term)
  );
  renderCards(filtered);
});

// Enviar pedido: Como el stock se descuenta al agregar al carrito,
// se crea el pedido y se guarda en localStorage.
enviarPedidoBtn.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }
  
  const numeroPedido = Math.floor(Math.random() * 100000);
  const usuario = sessionStorage.getItem("usuario") || "UsuarioDesconocido";
  const fechaActual = new Date().toISOString();
  const pedidoFinal = {
    numeroPedido,
    usuario,
    fecha: fechaActual,
    estado: 0,  // 0: Esperando aprobación
    productos: carrito
  };

  let pedidosGuardados = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidosGuardados.push(pedidoFinal);
  localStorage.setItem("pedidos", JSON.stringify(pedidosGuardados));
  
  console.log("Pedido enviado:", pedidoFinal);
  alert(`Pedido #${numeroPedido} enviado para aprobación.`);
  
  carrito = [];
  renderCart();
});

function getRandomColor() {
    // Por ejemplo, un color aleatorio en formato #RRGGBB
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }