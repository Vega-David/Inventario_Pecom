let Stock = JSON.parse(localStorage.getItem("Stock"));

const cardsContainer = document.getElementById("cardsContainer");
const cartContainer = document.getElementById("cartContainer");
const buscador = document.getElementById("buscador");
const enviarPedidoBtn = document.getElementById("enviarPedido");

let carrito = [];

function renderCards(products) {
  cardsContainer.innerHTML = "";
  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";

    // Identificador único: id || codigoSap || índice en Stock
    const stockIndex = Stock.findIndex(p => p === product);
    const productId = product.id !== undefined
      ? product.id
      : (product.codigoSap !== undefined
         ? product.codigoSap
         : stockIndex);

    const fakeImage = document.createElement("div");
    fakeImage.className = "fake-image";
    fakeImage.style.backgroundColor = getRandomColor();
    card.appendChild(fakeImage);

    const titulo = document.createElement("h3");
    titulo.textContent = product.nombre;
    card.appendChild(titulo);

    const codigoSapText = product.codigoSap || "no se cuenta todavia con el codigo";
    const info = document.createElement("p");
    info.innerHTML = `<strong>Código SAP:</strong> ${codigoSapText}<br>
                      <strong>Descripción:</strong> ${product.descripcion}<br>
                      <strong>Stock:</strong> ${product.existente}`;
    card.appendChild(info);

    const inputCantidad = document.createElement("input");
    inputCantidad.type = "number";
    inputCantidad.min = 1;
    inputCantidad.max = product.existente;
    inputCantidad.placeholder = "Cantidad a agregar";
    inputCantidad.className = "cantidad";
    card.appendChild(inputCantidad);

    const btnAgregar = document.createElement("button");
    btnAgregar.textContent = "Agregar a pedido";
    btnAgregar.className = "agregar-btn";
    btnAgregar.addEventListener("click", () => {
      const cantidad = parseInt(inputCantidad.value, 10);
      if (!cantidad || cantidad <= 0) {
        alert("Ingrese una cantidad válida.");
        return;
      }
      if (cantidad > product.existente) {
        alert("No hay suficiente stock disponible.");
        return;
      }
      product.existente -= cantidad;
      localStorage.setItem("Stock", JSON.stringify(Stock));

      const idx = carrito.findIndex(item => item.id === productId);
      if (idx !== -1) {
        carrito[idx].cantidadAgregada += cantidad;
      } else {
        carrito.push({
          id: productId,
          nombre: product.nombre,
          descripcion: product.descripcion,
          cantidadAgregada: cantidad
        });
      }
      inputCantidad.value = "";
      renderCards(Stock);
      renderCart();
    });
    card.appendChild(btnAgregar);

    cardsContainer.appendChild(card);
  });
}

renderCards(Stock);

function renderCart() {
  cartContainer.innerHTML = "";
  if (carrito.length === 0) {
    cartContainer.textContent = "Carrito vacío.";
    return;
  }
  carrito.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";

    const infoSpan = document.createElement("span");
    infoSpan.innerHTML = `<strong>${item.nombre}</strong> (x${item.cantidadAgregada})`;
    div.appendChild(infoSpan);

    const btnContainer = document.createElement("div");
    btnContainer.className = "btn-adjust-container";

    const btnPlus = document.createElement("button");
    btnPlus.textContent = "+";
    btnPlus.className = "btn-accion btn-plus";
    btnPlus.addEventListener("click", () => {
      const prod = Stock.find(p => {
        const id = p.id !== undefined ? p.id : (p.codigoSap !== undefined ? p.codigoSap : Stock.indexOf(p));
        return id === item.id;
      });
      if (!prod || prod.existente < 1) {
        alert("No hay más stock disponible para este producto.");
        return;
      }
      item.cantidadAgregada++;
      prod.existente--;
      localStorage.setItem("Stock", JSON.stringify(Stock));
      renderCards(Stock);
      renderCart();
    });
    btnContainer.appendChild(btnPlus);

    const btnMinus = document.createElement("button");
    btnMinus.textContent = "–";
    btnMinus.className = "btn-accion btn-minus";
    btnMinus.addEventListener("click", () => {
      const prod = Stock.find(p => {
        const id = p.id !== undefined ? p.id : (p.codigoSap !== undefined ? p.codigoSap : Stock.indexOf(p));
        return id === item.id;
      });
      if (item.cantidadAgregada > 1) {
        item.cantidadAgregada--;
        if (prod) prod.existente++;
      } else {
        if (prod) prod.existente++;
        carrito = carrito.filter(i => i.id !== item.id);
      }
      localStorage.setItem("Stock", JSON.stringify(Stock));
      renderCards(Stock);
      renderCart();
    });
    btnContainer.appendChild(btnMinus);

    div.appendChild(btnContainer);
    cartContainer.appendChild(div);
  });
}

buscador.addEventListener("input", () => {
  const term = buscador.value.toLowerCase();
  const filtered = Stock.filter(p =>
    ((p.codigoSap || "").toString().includes(term)) ||
    p.nombre.toLowerCase().includes(term) ||
    p.descripcion.toLowerCase().includes(term)
  );
  renderCards(filtered);
});

enviarPedidoBtn.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }
  let pedidosGuardados = JSON.parse(localStorage.getItem("ordersTest")) || [];
  const existingIds = pedidosGuardados.map(o => Number(o.id) || 0);
  const maxId = existingIds.length ? Math.max(...existingIds) : 0;
  const nuevoId = maxId + 1;
  const fechaActual = new Date().toISOString().split('T')[0];
  let usuario;
  try {
    usuario = JSON.parse(sessionStorage.getItem("usuario"));
  } catch {
    usuario = { nombre: "Usuario", apellido: "Desconocido" };
  }
  const productosFormateados = carrito.map(item => ({
    elemento: item.nombre,
    descripcion: item.descripcion,
    cantidad: item.cantidadAgregada
  }));

  const pedidoFinal = {
    id: nuevoId,
    fecha: fechaActual,
    estado: "Pendiente",
    usuario: usuario,
    productos: productosFormateados
  };

  pedidosGuardados.push(pedidoFinal);
  localStorage.setItem("ordersTest", JSON.stringify(pedidosGuardados));

  console.log("Pedido enviado:", pedidoFinal);
  alert(`Pedido #${nuevoId} enviado para aprobación.`);

  carrito = [];
  renderCart();
});

function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
