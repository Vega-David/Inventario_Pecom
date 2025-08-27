// saludo.js
// Función reutilizable para mostrar el saludo dinámico según el usuario logueado
function mostrarSaludo(idElemento) {
  const Datos = JSON.parse(sessionStorage.getItem("Datos"));
  if (!Datos) {
    document.getElementById(idElemento).textContent = "¡Hola!";
    return;
  }
  // Prioridad: Datos.nombre, luego Datos.usuario
  const nombre = Datos.nombre || Datos.usuario || "";
  const apellido = Datos.apellido ? ` ${Datos.apellido}` : "";
  document.getElementById(idElemento).textContent = `¡Hola, ${nombre}${apellido}!`;
}
