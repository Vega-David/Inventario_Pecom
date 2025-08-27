// misPedidos.js - Panel dinámico de pedidos del usuario


function obtenerUsuarioActual() {
  const datos = JSON.parse(sessionStorage.getItem('Datos'));
  if (datos && datos.usuario && datos.apellido) {
    return { nombre: datos.usuario, apellido: datos.apellido };
  }
  // Compatibilidad si el objeto usuario es {nombre, apellido}
  if (datos && datos.usuario && datos.usuario.nombre && datos.usuario.apellido) {
    return { nombre: datos.usuario.nombre, apellido: datos.usuario.apellido };
  }
  return null;
}


function obtenerPedidosUsuario(usuario) {
  let pedidos = JSON.parse(localStorage.getItem('ordersTest')) || [];
  // Filtrar solo los pedidos del usuario actual (por nombre y apellido)
  return pedidos.filter(p => {
    if (!p.usuario) return false;
    // Soporta usuario como string o como objeto
    if (typeof p.usuario === 'string') {
      return p.usuario === usuario.nombre;
    }
    return (
      p.usuario.nombre === usuario.nombre &&
      p.usuario.apellido === usuario.apellido
    );
  });
}


function crearCardPedido(pedido) {
  const card = document.createElement('div');
  card.className = `pedido-card ${pedido.estado.toLowerCase()}`;
  // Mostrar productos como lista de nombres
  let materiales = '';
  if (pedido.productos && Array.isArray(pedido.productos)) {
    materiales = pedido.productos.map(m => m.elemento).join(', ');
  } else if (pedido.materiales && Array.isArray(pedido.materiales)) {
    materiales = pedido.materiales.map(m => m.nombre).join(', ');
  }
  card.innerHTML = `
    <div class="estado">${pedido.estado}</div>
    <div class="fecha">${pedido.fecha || ''}</div>
    <div class="materiales"><b>Materiales:</b> ${materiales}</div>
    <div class="ver-mas">Ver más detalles</div>
  `;
  card.addEventListener('click', () => mostrarDetallePedido(pedido));
  return card;
}


function mostrarDetallePedido(pedido) {
  const modal = document.getElementById('detallePedidoModal');
  let html = `<div class='modal-content'>`;
  html += `<button class='cerrar' onclick='document.getElementById("detallePedidoModal").style.display="none"'>&times;</button>`;
  html += `<h2>Detalle del Pedido</h2>`;
  html += `<div><b>Fecha:</b> ${pedido.fecha || ''}</div>`;
  html += `<div><b>Estado:</b> ${pedido.estado}</div>`;
  html += `<div><b>Materiales:</b><ul>`;
  if (pedido.productos && pedido.productos.length) {
    pedido.productos.forEach(m => {
      html += `<li>${m.elemento} (${m.cantidad})</li>`;
    });
  } else if (pedido.materiales && pedido.materiales.length) {
    pedido.materiales.forEach(m => {
      html += `<li>${m.nombre} (${m.cantidad})</li>`;
    });
  }
  html += `</ul></div>`;
  if (pedido.estado.toLowerCase() === 'rechazado') {
    // Soportar tanto rejectReason/rejectedBy (nuevo) como motivoRechazo/rechazadoPor (viejo)
    const motivo = pedido.rejectReason || pedido.motivoRechazo || 'No especificado.';
    const quien = pedido.rejectedBy || pedido.rechazadoPor || 'Desconocido';
    html += `<div class='motivo-rechazo'><b>Motivo del rechazo:</b> ${motivo}</div>`;
    html += `<div class='info-rechazo'><b>Rechazado por:</b> ${quien}</div>`;
  }
  if (pedido.estado.toLowerCase() === 'entregado' && pedido.firma) {
    html += `<div><b>Recibido por:</b> ${pedido.firma.nombre || ''}</div>`;
  }
  html += `</div>`;
  modal.innerHTML = html;
  modal.style.display = 'flex';
}

function renderPedidos() {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = 'index.html';
    return;
  }
  const pedidos = obtenerPedidosUsuario(usuario);
  const panel = document.getElementById('panelPedidos');
  panel.innerHTML = '';
  if (pedidos.length === 0) {
    panel.innerHTML = '<p>No tienes pedidos registrados.</p>';
    return;
  }
  pedidos.forEach(p => {
    panel.appendChild(crearCardPedido(p));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPedidos();
  // Cerrar modal al hacer click fuera del contenido
  const modal = document.getElementById('detallePedidoModal');
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.style.display = 'none';
  });
});
