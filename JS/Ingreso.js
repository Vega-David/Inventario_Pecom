// Verificar si ya existe el objeto en localStorage; de lo contrario, inicializarlo
if (!localStorage.getItem("roles")) {
    const roles = {
        "David":   { "rol": "usuario",    "pass": "1234" },
        "Juan":    { "rol": "supervisor", "pass": "1234" },
        "Paniol":  { "rol": "paniol",     "pass": "1234" },
        "DiegoJ":  { "rol": "supervisor", "pass": "1234" }
    };
    localStorage.setItem("roles", JSON.stringify(roles));
}

// Función para el login
function login(event) {
    event.preventDefault(); // Prevenir el envío del formulario

    // Obtener y limpiar valores del formulario
    const username = document.getElementById("nombreUsuario").value.trim();
    const pass = document.getElementById("pass").value.trim();

    const roles = JSON.parse(localStorage.getItem("roles"));

    console.log("Intentando login con:", username);
    console.log("Roles guardados:", roles);

    

    // Verificar si el usuario existe y la contraseña coincide
    if (roles[username] && pass === roles[username].pass) {
        const rol = roles[username].rol;
        const apellido=roles[username].apellido;
        const usuario={
            usuario:username,
            apellido:apellido,
            rol:rol
        }
        sessionStorage.setItem("Datos",JSON.stringify(usuario))
        
        switch (rol) {
            case "usuario":
                window.location.href = "Html/usuario/index.html";
                break;
            case "supervisor":
                window.location.href = "Html/supervisor/index.html";
                break;
            case "paniol":
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
    buttonElement.textContent = isPassword ? '👁️' : '👁️';
}

// (Opcional) Si querés resetear localStorage manualmente en pruebas
// localStorage.removeItem("roles");