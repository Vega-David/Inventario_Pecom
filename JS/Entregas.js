// ------------------------------
// Integración con pedidos "Listo para entrega"
// ------------------------------
const selectUsuario = document.getElementById("selectUsuario");
const selectPedido = document.getElementById("selectPedido");

// Cargar usuarios con pedidos "Listo para entrega"
function cargarUsuariosPedidos() {
  const orders = JSON.parse(localStorage.getItem("ordersTest")) || [];
  // Filtrar pedidos en estado "Listo para entrega"
  const pedidosListos = orders.filter(o => o.estado && o.estado.startsWith("Listo para entrega"));
  // Obtener usuarios únicos y contar pedidos por usuario
  const usuariosUnicos = [];
  pedidosListos.forEach(o => {
    const key = `${o.usuario.nombre}|||${o.usuario.apellido}|||${o.usuario.documento||''}`;
    let usuario = usuariosUnicos.find(u => u.key === key);
    if (!usuario) {
      usuario = {
        key,
        nombre: o.usuario.nombre,
        apellido: o.usuario.apellido,
        documento: o.usuario.documento || '',
        cantidad: 0
      };
      usuariosUnicos.push(usuario);
    }
    usuario.cantidad++;
  });
  // Poblar el selector con nombre, apellido, documento y cantidad de pedidos
  selectUsuario.innerHTML = '<option value="">-- Seleccione un usuario --</option>';
  usuariosUnicos.forEach(u => {
    selectUsuario.innerHTML += `<option value="${u.key}">${u.nombre} ${u.apellido} ${u.documento} (${u.cantidad})</option>`;
  });
  // Limpiar selector de pedidos
  selectPedido.innerHTML = '<option value="">-- Seleccione un pedido --</option>';
  selectPedido.disabled = true;
}

// Al cambiar usuario, poblar pedidos
selectUsuario.addEventListener("change", function() {
  const key = this.value;
  if (!key) {
    selectPedido.innerHTML = '<option value="">-- Seleccione un pedido --</option>';
    selectPedido.disabled = true;
    return;
  }
  const [nombre, apellido, documento] = key.split("|||");
  const orders = JSON.parse(localStorage.getItem("ordersTest")) || [];
  const pedidosUsuario = orders.filter(o =>
    o.estado && o.estado.startsWith("Listo para entrega") &&
    o.usuario.nombre === nombre && o.usuario.apellido === apellido
  );
  selectPedido.innerHTML = '<option value="">-- Seleccione un pedido --</option>';
  pedidosUsuario.forEach(o => {
    const cantidadItems = o.productos ? o.productos.length : 0;
    selectPedido.innerHTML += `<option value="${o.id}">Pedido #${o.id} - ${o.fecha} - Cantidad items ${cantidadItems}</option>`;
  });
  selectPedido.disabled = false;
  // Autocompletar datos personales si hay solo un pedido
  if (pedidosUsuario.length === 1) {
    selectPedido.value = pedidosUsuario[0].id;
    selectPedido.dispatchEvent(new Event('change'));
  }
});

// Al cambiar pedido, poblar datos y materiales
selectPedido.addEventListener("change", function() {
  const pedidoId = parseInt(this.value);
  if (!pedidoId) {
    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("documento").value = "";
    materiales = [];
    actualizarListaMateriales();
    return;
  }
  const orders = JSON.parse(localStorage.getItem("ordersTest")) || [];
  const pedido = orders.find(o => o.id === pedidoId);
  if (pedido) {
    document.getElementById("nombre").value = pedido.usuario.nombre || "";
    document.getElementById("apellido").value = pedido.usuario.apellido || "";
    document.getElementById("documento").value = pedido.usuario.documento || "";
    materiales = pedido.productos.map(p => ({ elemento: p.elemento, descripcion: p.descripcion, cantidad: p.cantidad }));
    actualizarListaMateriales();
  }
});

// Inicializar selectores al cargar la página
window.addEventListener("DOMContentLoaded", cargarUsuariosPedidos);
// ------------------------------
// Manejo de Materiales
// ------------------------------
let materiales = [];

function agregarMaterial() {
  const elemento = document.getElementById("elemento").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const cantidad = document.getElementById("cantidad").value.trim();

  if (!elemento || !descripcion || !cantidad) {
    alert("Complete todos los campos para el material.");
    return;
  }

  materiales.push({ elemento, descripcion, cantidad });
  actualizarListaMateriales();

  // Limpiar inputs
  document.getElementById("elemento").value = "";
  document.getElementById("descripcion").value = "";
  document.getElementById("cantidad").value = "";
}

function actualizarListaMateriales() {
  const lista = document.getElementById("listaMateriales");
  lista.innerHTML = "";
  materiales.forEach((mat, index) => {
    const li = document.createElement("li");
    li.textContent = `${mat.elemento} - ${mat.descripcion} - ${mat.cantidad}`;
    
    // Botón para eliminar el material
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.onclick = () => {
      materiales.splice(index, 1);
      actualizarListaMateriales();
    };
    
    li.appendChild(btnEliminar);
    lista.appendChild(li);
  });
}

// ------------------------------
// Configuración del Canvas para la Firma
// ------------------------------
const canvas = document.getElementById("canvasFirma");
const ctx = canvas.getContext("2d");
let drawing = false;
let firmaDibujada = false; // Flag para saber si se ha dibujado algo

function iniciarFirma(e) {
  e.preventDefault();
  drawing = true;
  firmaDibujada = true; // Marca que se empezó a firmar
  ctx.beginPath();
  const pos = obtenerPos(e);
  ctx.moveTo(pos.x, pos.y);
}

function dibujarFirma(e) {
  if (!drawing) return;
  e.preventDefault();
  const pos = obtenerPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.stroke();
}

function finalizarFirma(e) {
  if (!drawing) return;
  e.preventDefault();
  drawing = false;
  ctx.beginPath();
}

function obtenerPos(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches && e.touches[0]) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  } else {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
}

// Eventos para mouse
canvas.addEventListener("mousedown", iniciarFirma);
canvas.addEventListener("mousemove", dibujarFirma);
canvas.addEventListener("mouseup", finalizarFirma);
canvas.addEventListener("mouseout", finalizarFirma);

// Eventos para touch
canvas.addEventListener("touchstart", iniciarFirma);
canvas.addEventListener("touchmove", dibujarFirma);
canvas.addEventListener("touchend", finalizarFirma);

function limpiarFirma() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  firmaDibujada = false;
}

// Función para obtener la firma en formato Base64
function obtenerFirma() {
  return canvas.toDataURL("image/png");
}

// ------------------------------
// Manejo del Formulario y Generación del PDF
// ------------------------------
document.getElementById("retiroForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Obtener datos personales
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const documento = document.getElementById("documento").value.trim();

  if (!nombre || !apellido || !documento) {
    alert("Complete los datos personales.");
    return;
  }
  // Validar lista de materiales
  if (materiales.length === 0) {
    alert("Agregue al menos un material a retirar.");
    return;
  }
  // Validar que se haya firmado
  if (!firmaDibujada) {
    alert("Por favor, firme en el área designada.");
    return;
  }

  // Cambiar estado del pedido a 'Retirado'
  const pedidoId = parseInt(document.getElementById("selectPedido").value);
  if (pedidoId) {
    let orders = JSON.parse(localStorage.getItem("ordersTest")) || [];
    const pedido = orders.find(o => o.id === pedidoId);
    if (pedido) {
      pedido.estado = "Retirado";
      pedido.retiradoPor = `${nombre} ${apellido}`;
      pedido.fechaRetiro = new Date().toISOString();
      localStorage.setItem("ordersTest", JSON.stringify(orders));
    }
  }

  const firmaImg = obtenerFirma();
  const usuario = sessionStorage.getItem("usuario") || "UsuarioDesconocido";
  const fecha = new Date();
  const fechaStr = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;

  // Crear PDF con jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título principal centrado
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text("Retiro de Materiales", pageWidth / 2, 20, { align: "center" });

  // Texto descriptivo
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  const descText = `En el día de la fecha ${fechaStr}\nYo: ${nombre} ${apellido}\nCon documento : ${documento}\nDejo asentado que hago retiro de los siguientes elementos:`;
  doc.text(descText, 10, 30, { maxWidth: pageWidth - 20 });

  // Tabla: Encabezados
  let startY = 50;
  doc.setFont(undefined, 'bold');
  doc.text("Elemento", 10, startY);
  doc.text("Descripción", 70, startY);
  doc.text("Cantidad", 140, startY);
  doc.setFont(undefined, 'normal');

  // Filas de la tabla
  materiales.forEach((mat, i) => {
    const y = startY + 8 + (i * 8);
    doc.text(mat.elemento, 10, y);
    doc.text(mat.descripcion, 70, y);
    doc.text(String(mat.cantidad), 140, y);
  });

  const yFinal = startY + 10 + (materiales.length * 8);

  // Subtítulos finales
  doc.setFont(undefined, 'bold');
  doc.text(`Entregado por: ${usuario}`, 10, yFinal + 10);
  doc.text("Firma de quien retira", pageWidth - 10, yFinal + 10, { align: "right" });
  doc.setFont(undefined, 'normal');

  // Agregar imagen de firma y nombre debajo
  doc.addImage(firmaImg, "PNG", pageWidth - 70, yFinal + 20, 60, 30);
  doc.text(`${nombre} ${apellido}`, pageWidth - 10, yFinal + 55, { align: "right" });

  // Guardar PDF con nombre "documento_[documento]_[nombre]_[apellido].pdf"
  const fileName = `documento_${documento}_${nombre}_${apellido}.pdf`;
  doc.save(fileName);

  // Refrescar selectores para que desaparezca el pedido entregado
  cargarUsuariosPedidos();
  selectUsuario.value = "";
  selectPedido.innerHTML = '<option value="">-- Seleccione un pedido --</option>';
  selectPedido.disabled = true;
  document.getElementById("nombre").value = "";
  document.getElementById("apellido").value = "";
  document.getElementById("documento").value = "";
  materiales = [];
  actualizarListaMateriales();
  limpiarFirma();
});
