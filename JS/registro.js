document.getElementById("registroForm").addEventListener("submit", function(e) {
    e.preventDefault();
  
    // Obtener valores del formulario
    const username = document.getElementById("username").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const pass = document.getElementById("pass").value;
    const confirmPass = document.getElementById("confirmPass").value;
  
    // Validar que ambas contraseñas coincidan
    if (pass !== confirmPass) {
      alert("Las contraseñas no coinciden.");
      return;
    }
  
    // Recuperar el objeto roles del localStorage o inicializarlo si no existe
    let roles = localStorage.getItem("roles");
    roles = roles ? JSON.parse(roles) : {};
  
    // Comprobar si el nombre de usuario ya existe
    if (roles[username]) {
      alert("El nombre de usuario ya existe. Elige otro.");
      return;
    }
  
    // Crear el nuevo usuario con rol por defecto "usuario"
    roles[username] = {
      rol: "usuario",
      pass: pass,
      nombre:username,
      apellido:apellido
    };
  
    // Guardar el objeto actualizado en localStorage
    localStorage.setItem("roles", JSON.stringify(roles));
  
    alert("Usuario registrado exitosamente!");
  
    // Redireccionar a ingreso.html
    window.location.href = "index.html";
  });

  function togglePasswordVisibility(inputId, buttonElement) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    
    input.type = isPassword ? 'text' : 'password';
    buttonElement.textContent = isPassword ? '🙈' : '👁️'; // Alterna íconos
  }
  
  