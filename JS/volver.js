export function Volver(){
    const params = new URLSearchParams(window.location.search);
    const rol = params.get("rol");

    if (rol === "paniol") {
        window.location.href = "/Html/paniol/index.html";
    } else if (rol === "supervisor") {
        window.location.href = "/Html/supervisor/index.html";
    } else {
        window.location.href = "/Html/usuario/index.html"; // Por defecto
    }
}

document.getElementById("btnVolver").addEventListener("click",()=>{Volver()})