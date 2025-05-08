// Verificar si ya existe el objeto en localStorage; de lo contrario, inicializarlo
if (!localStorage.getItem("roles")) {
    const roles = {
        "David":   { "rol": "usuario",    "pass": "1234" },
        "Juan":    { "rol": "supervisor", "pass": "1234" },
        "Leandro": { "rol": "paniol",     "pass": "1234" }
    };
    localStorage.setItem("roles", JSON.stringify(roles));
}

// Función para el login
function login(event) {
    event.preventDefault(); // Prevenir el envío del formulario

    // Obtener y limpiar valores del formulario
    let username = document.getElementById("nombreUsuario").value.trim();
    const pass = document.getElementById("pass").value.trim();

    // Capitalizar el nombre (primera letra mayúscula, resto minúscula)
    username = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();

    const roles = JSON.parse(localStorage.getItem("roles"));

    console.log("Intentando login con:", username);
    console.log("Roles guardados:", roles);

    // Guardar el nombre de usuario en sessionStorage
    sessionStorage.setItem("usuario", username);
    

    // Verificar si el usuario existe y la contraseña coincide
    if (roles[username] && pass === roles[username].pass) {
        const rol = roles[username].rol;
        switch (rol) {
            case "usuario":
                sessionStorage.setItem("rol","usuario")
                window.location.href = "Html/usuario/index.html";
                break;
            case "supervisor":
                sessionStorage.setItem("rol","supervisor")
                window.location.href = "Html/supervisor/index.html";
                break;
            case "paniol":
                sessionStorage.setItem("rol","paniol")
                window.location.href = "Html/paniol/index.html";
                break;
            default:
                alert("Rol no reconocido.");
                break;
        }
    } else {
        alert("Usuario o contraseña incorrecta.");
    }
}

// Asignar evento al formulario
document.getElementById("Ingreso").addEventListener("submit", login);

// Función para visibilidad de la contraseña
function togglePasswordVisibility(inputId, buttonElement) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';

    input.type = isPassword ? 'text' : 'password';
    buttonElement.textContent = isPassword ? '🙈' : '👁️';
}

// (Opcional) Si querés resetear localStorage manualmente en pruebas
// localStorage.removeItem("roles");
