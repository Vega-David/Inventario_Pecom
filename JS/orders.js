// ------------------------------
// Pedidos de prueba
// ------------------------------
// MARCA TEMPORAL: Cargar pedidos desde pedidos.json si existe y no hay datos en localStorage
const SAMPLE_ORDERS = [
  // ...array de ejemplo original (puedes dejarlo vacío si solo quieres usar pedidos.json)...
];

function loadOrders() {
  const stored = localStorage.getItem("ordersTest");
  if (stored) return JSON.parse(stored);
  // Intentar cargar desde pedidos.json
  // MARCA TEMPORAL: Este bloque puede eliminarse en producción
  let pedidos = SAMPLE_ORDERS;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '../pedidos.json', false); // Sincrónico para inicialización
  try {
    xhr.send(null);
    if (xhr.status === 200) {
      pedidos = JSON.parse(xhr.responseText);
    }
  } catch (e) {
    // Si falla, usar SAMPLE_ORDERS
  }
  localStorage.setItem("ordersTest", JSON.stringify(pedidos));
  return pedidos;
}
function saveOrders(arr) { localStorage.setItem("ordersTest", JSON.stringify(arr)); }


let orders = loadOrders();
const Datos = JSON.parse(sessionStorage.getItem("Datos"));
if (!Datos.usuario || !Datos.rol) window.location.href = "../login.html";
// Definir currentUser globalmente para todo el archivo
const currentUser = Datos.usuario ? `${Datos.usuario.nombre} ${Datos.usuario.apellido}` : "";

// ------------------------------
// Filtrado según rol (incluye "Preparado")
// ------------------------------
function filterOrders() {
  if (Datos.rol === "usuario") {
    return orders.filter(o =>
      `${o.usuario.nombre} ${o.usuario.apellido}` === currentUser
    );
  }
  if (Datos.rol === "supervisor") return orders;
  if (Datos.rol === "paniol") {
    // Ahora el pañol ve los pedidos "Aprobado", "Preparado" y "Listo para entrega"
    return orders.filter(o =>
      o.estado.startsWith("Aprobado") || o.estado.startsWith("Preparado") || o.estado.startsWith("Listo para entrega")
    );
  }
  return [];
}

// ------------------------------
// Render de tarjetas con estado
// ------------------------------
function renderCards() {
  orders = loadOrders(); // <-- Recargar siempre los pedidos actualizados
  const container = document.getElementById("cardsContainer");
  container.innerHTML = "";
  filterOrders().forEach(o => {
    let cls = "state-pending";
    if (o.estado.startsWith("Aprobado")) cls = "state-approved";
    if (o.estado.startsWith("Rechazado")) cls = "state-rejected";
    if (o.estado.startsWith("Preparado")) cls = "state-prepared";
    if (o.estado.startsWith("Listo para entrega")) cls = "state-ready";
    if (o.estado.startsWith("Entregado") || o.estado.startsWith("Retirado")) cls = "state-delivered";

    const card = document.createElement("div");
    card.className = `card ${cls}`;
    card.innerHTML = `
      <p><strong>#${o.id}</strong></p>
      <p>${o.usuario.nombre+' '+o.usuario.apellido}</p>
      <p>${o.fecha}</p>
      <p>Items: ${o.productos.length}</p>
      <span class="state-badge">${o.estado}</span>
    `;
    card.onclick = () => openModal(o.id);
    container.appendChild(card);
  });
}

// ------------------------------
// Modal detalle
// ------------------------------
const modal = document.getElementById("orderModal");
const tbody  = document.querySelector("#detailTable tbody");

function openModal(id) {
  const pedido = orders.find(o => o.id === id);
  document.getElementById("detailTitle").textContent = `Pedido #${pedido.id}`;
  document.getElementById("detailUser").textContent  = `${pedido.usuario.nombre} ${pedido.usuario.apellido}`;
  document.getElementById("detailDate").textContent  = pedido.fecha;
  document.getElementById("detailState").textContent = pedido.estado;

  // Llenar tabla
  tbody.innerHTML = "";
  pedido.productos.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.elemento}</td>
      <td>${p.descripcion}</td>
      <td>${p.cantidad}</td>
      <td class="col-edit"></td>
    `;
    tbody.appendChild(tr);
  });

  // Mostrar botones según rol y estado
  document.getElementById("btnModify").style.display  =
    (Datos.rol==="supervisor" && pedido.estado==="Pendiente") ? "inline-block":"none";
  document.getElementById("btnApprove").style.display =
    (Datos.rol==="supervisor" && pedido.estado==="Pendiente") ? "inline-block":"none";
  document.getElementById("btnReject").style.display  =
    (Datos.rol==="supervisor" && pedido.estado==="Pendiente") ? "inline-block":"none";
  document.getElementById("btnPrepare").style.display =
    (Datos.rol==="paniol" && pedido.estado.startsWith("Aprobado")) ? "inline-block":"none";
  document.getElementById("btnDeliver").style.display =
    (Datos.rol==="paniol" && pedido.estado.startsWith("Preparado")) ? "inline-block":"none";

  // Acciones
  document.getElementById("btnApprove").onclick = () => doApprove(id);
  document.getElementById("btnReject").onclick  = () => doReject(id);
  document.getElementById("btnPrepare").onclick = () => doPrepare(id);
  document.getElementById("btnDeliver").onclick = () => doDeliver(id);
  document.getElementById("btnModify").onclick  = () => doModify(id);

  modal.style.display = "flex";
}
document.getElementById("modalClose").onclick = () => {
  modal.style.display = "none";
};

// ------------------------------
// Acciones con fecha
// ------------------------------
function doApprove(id) {
  const o = orders.find(x=>x.id===id);
  const d = new Date(), f = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  o.estado="Aprobado - Esperando preparación";
  o.approvedBy   = currentUser; o.approvedDate   = f;
  saveOrders(orders); renderCards(); openModal(id);
}
function doReject(id) {
  const reason=prompt("Motivo del rechazo:"); if(!reason) return;
  const o = orders.find(x=>x.id===id);
  const d = new Date(), f = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  o.estado="Rechazado"; o.rejectedBy= currentUser; o.rejectedDate = f; o.rejectReason=reason;
  saveOrders(orders); renderCards(); openModal(id);
}
function doPrepare(id) {
  const o = orders.find(x=>x.id===id);
  const d = new Date(), f = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  o.estado = "Listo para entrega";
  o.preparedBy   = currentUser; o.preparedDate   = f;
  saveOrders(orders); renderCards(); openModal(id);
}
function doDeliver(id) {
  const o = orders.find(x=>x.id===id);
  const d = new Date(), f = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  o.estado="Entregado"; o.deliveredBy = currentUser; o.deliveredDate = f;
  saveOrders(orders); renderCards(); modal.style.display="none";
}

// ------------------------------
// Editar items (solo Pendiente & supervisor)
// ------------------------------
function doModify(id) {
  const o = orders.find(x=>x.id===id);
  tbody.innerHTML="";
  o.productos.forEach((p,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML=`
      <td><input disabled value="${p.elemento}"></td>
      <td><input value="${p.descripcion}"></td>
      <td><input type="number" value="${p.cantidad}" min="1"></td>
      <td><button class="btn" onclick="applyDelete(${id},${i})">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
  const btnM=document.getElementById("btnModify");
  btnM.textContent="Guardar Cambios";
  btnM.onclick=()=>{
    const rows=tbody.querySelectorAll("tr");
    rows.forEach((tr,idx)=>{
      const inp=tr.querySelectorAll("input");
      o.productos[idx].descripcion=inp[1].value;
      o.productos[idx].cantidad   =parseInt(inp[2].value);
    });
    saveOrders(orders);
    btnM.textContent="Modificar Items";
    btnM.onclick=()=>doModify(id);
    openModal(id);
  };
}

function applyDelete(orderId,idx){
  const o=orders.find(x=>x.id===orderId);
  o.productos.splice(idx,1);
  saveOrders(orders);
  openModal(orderId);
}

// Inicial
renderCards();
