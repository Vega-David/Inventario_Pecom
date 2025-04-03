// Verificar si ya existe el objeto en localStorage; de lo contrario, inicializarlo.
if (!localStorage.getItem("roles")) {
    // Usaremos la opción de objeto con el nombre de usuario como clave.
    let roles = {
        "David":   { "rol": "usuario",    "pass": "1234" },
        "Juan":    { "rol": "supervisor", "pass": "1234" },
        "Leandro": { "rol": "pañol",      "pass": "1234" }
    };
    localStorage.setItem("roles", JSON.stringify(roles));
}

// Función para el login
function login(event) {
    event.preventDefault(); // Prevenir el envío del formulario

    // Obtener valores del formulario
    const username = document.getElementById("nombreUsuario").value;
    const pass = document.getElementById("pass").value;

    // Recuperar objeto roles del localStorage
    const roles = JSON.parse(localStorage.getItem("roles"));

    // Verificar si el usuario existe y la pass es "1234"
    if (roles[username] && pass === roles[username].pass) {
        // Según el rol, redireccionar a diferentes páginas
        const rol = roles[username].rol;
        if (rol === "usuario") {
            window.location.href = "Html/usuario/index.html";
        } else if (rol === "supervisor") {
            window.location.href = "Html/supervisor/index.html";
        } else if (rol === "pañol") {
            window.location.href = "Html/pañol/index.html";
        } else {
            alert("Rol no reconocido.");
        }
    } else {
        alert("Usuario o contraseña incorrecta");
    }
}

// Asumamos que tu formulario tiene id="Ingreso"
document.getElementById("Ingreso").addEventListener("submit", login);
