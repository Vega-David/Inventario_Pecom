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
    event.preventDefault();

    // Permitir login por nombre de usuario o documento
    const userOrDoc = document.getElementById("nombreUsuario").value.trim();
    const pass = document.getElementById("pass").value.trim();
    const roles = JSON.parse(localStorage.getItem("roles"));

    let usuarioEncontrado = null;
    for (let key in roles) {
        const user = roles[key];
        if (
            key === userOrDoc ||
            (user.documento && user.documento === userOrDoc)
        ) {
            usuarioEncontrado = { ...user, usuario: key };
            break;
        }
    }

    if (usuarioEncontrado && pass === usuarioEncontrado.pass) {
        // Guardar todos los datos relevantes en sessionStorage
        sessionStorage.setItem("Datos", JSON.stringify(usuarioEncontrado));
        switch (usuarioEncontrado.rol) {
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
        alert("Usuario/documento o contraseña incorrecta.");
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