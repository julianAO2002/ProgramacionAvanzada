// =====================================================================
// 03 - Ejercicios sobre Funciones
//      (Consumo de Datos, Mapeo de Información, Autenticación)
// TP2 - Ejercitación JavaScript - Programación Avanzada 2026
// Ejecutar con: node 03-funciones-api.js   (requiere Node 18+ por fetch)
// =====================================================================

const API_USERS = "https://jsonplaceholder.typicode.com/users";
const API_POSTS = "https://jsonplaceholder.typicode.com/posts";

// Datos de respaldo por si no hay conexión a Internet, así los ejercicios
// que dependen de la API igual pueden demostrarse.
const USUARIOS_FALLBACK = [
  { id: 1, name: "Leanne Graham", email: "Sincere@april.biz" },
  { id: 2, name: "Ervin Howell", email: "Shanna@melissa.tv" },
  { id: 3, name: "Clementine Bauch", email: "Nathan@yesenia.net" },
  { id: 4, name: "Patricia Lebsack", email: "Julianne.OConner@kory.org" },
  { id: 5, name: "Chelsey Dietrich", email: "Lucio_Hettinger@annie.ca" },
  { id: 6, name: "Mrs. Dennis Schulist", email: "Karley_Dach@jasper.info" },
];

// ---------------------------------------------------------------------
// 1. Consumo de Datos desde una API
// ---------------------------------------------------------------------
async function obtenerUsuarios() {
  try {
    const respuesta = await fetch(API_USERS);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return await respuesta.json();
  } catch (error) {
    console.log("(!) No se pudo consultar la API:", error.message);
    console.log("(!) Se usan datos de respaldo locales.");
    return USUARIOS_FALLBACK;
  }
}

// ---------------------------------------------------------------------
// 2. Procesamiento de Datos de una API
// ---------------------------------------------------------------------
async function imprimirNombresDeUsuarios() {
  const usuarios = await obtenerUsuarios();
  usuarios.forEach((usuario) => console.log("-", usuario.name));
}

// ---------------------------------------------------------------------
// 3. Autenticación Simulada
// ---------------------------------------------------------------------
const USUARIO_PREDEFINIDO = { usuario: "admin", contrasenia: "1234" };

function autenticarUsuario(credenciales) {
  if (!credenciales) return false;
  return (
    credenciales.usuario === USUARIO_PREDEFINIDO.usuario &&
    credenciales.contrasenia === USUARIO_PREDEFINIDO.contrasenia
  );
}

// ---------------------------------------------------------------------
// 4. Transformación de Datos
// ---------------------------------------------------------------------
function mapearUsuarios(usuarios) {
  return usuarios.map((usuario) => ({
    nombre: usuario.name,
    email: usuario.email,
  }));
}

// ---------------------------------------------------------------------
// 5. Validación de Formularios
// ---------------------------------------------------------------------
function validarFormulario(formulario) {
  if (!formulario) return false;
  const campos = ["nombre", "email", "password"];
  return campos.every((campo) => {
    const valor = formulario[campo];
    return typeof valor === "string" && valor.trim() !== "";
  });
}

// ---------------------------------------------------------------------
// 6. Paginación de Datos (5 elementos por página)
// ---------------------------------------------------------------------
function obtenerPagina(datos, numeroDePagina, tamanioPagina = 5) {
  if (numeroDePagina < 1) return [];
  const inicio = (numeroDePagina - 1) * tamanioPagina;
  return datos.slice(inicio, inicio + tamanioPagina);
}

// ---------------------------------------------------------------------
// 7. Envío de Datos a una API (POST)
// ---------------------------------------------------------------------
async function enviarDatos(data) {
  try {
    const respuesta = await fetch(API_POSTS, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(data),
    });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const resultado = await respuesta.json();
    console.log("Respuesta de la API:", resultado);
    return resultado;
  } catch (error) {
    console.log("(!) No se pudo enviar a la API:", error.message);
    return null;
  }
}

// ---------------------------------------------------------------------
// 8. Búsqueda de Usuarios
// ---------------------------------------------------------------------
function buscarUsuarioPorEmail(usuarios, email) {
  return usuarios.find(
    (usuario) => usuario.email.toLowerCase() === String(email).toLowerCase()
  );
}

// ---------------------------------------------------------------------
// 9. Generación de Token de Autenticación (JWT simulado con Base64)
// ---------------------------------------------------------------------
function generarToken(usuario) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: usuario.id ?? 0,
    nombre: usuario.name ?? usuario.nombre,
    email: usuario.email,
    iat: Math.floor(Date.now() / 1000),
  };
  // Firma simulada: un JWT real la calcula con HMAC y una clave secreta.
  const firma = btoa(`firma-simulada-${payload.sub}`);
  return [btoa(JSON.stringify(header)), btoa(JSON.stringify(payload)), firma].join(".");
}

// ---------------------------------------------------------------------
// 10. Actualización de Información del Usuario
// ---------------------------------------------------------------------
function actualizarUsuario(usuario, cambios) {
  return { ...usuario, ...cambios };
}

// =====================================================================
// Demostración
// =====================================================================
async function main() {
  console.log("--- 1. obtenerUsuarios ---");
  const usuarios = await obtenerUsuarios();
  console.log(`Se obtuvieron ${usuarios.length} usuarios. Primero:`, usuarios[0].name);

  console.log("\n--- 2. imprimirNombresDeUsuarios ---");
  await imprimirNombresDeUsuarios();

  console.log("\n--- 3. autenticarUsuario ---");
  console.log("Correctas:  ", autenticarUsuario({ usuario: "admin", contrasenia: "1234" }));
  console.log("Incorrectas:", autenticarUsuario({ usuario: "admin", contrasenia: "abcd" }));

  console.log("\n--- 4. mapearUsuarios ---");
  console.log(mapearUsuarios(usuarios).slice(0, 3));

  console.log("\n--- 5. validarFormulario ---");
  console.log("Completo:  ", validarFormulario({ nombre: "Ana", email: "ana@mail.com", password: "secreto" }));
  console.log("Incompleto:", validarFormulario({ nombre: "Ana", email: "", password: "secreto" }));

  console.log("\n--- 6. obtenerPagina ---");
  console.log("Página 1:", obtenerPagina(usuarios, 1).map((u) => u.name));
  console.log("Página 2:", obtenerPagina(usuarios, 2).map((u) => u.name));

  console.log("\n--- 7. enviarDatos ---");
  await enviarDatos({ title: "TP2", body: "Ejercitación JavaScript", userId: 1 });

  console.log("\n--- 8. buscarUsuarioPorEmail ---");
  const buscado = buscarUsuarioPorEmail(usuarios, usuarios[1].email);
  console.log("Encontrado: ", buscado ? buscado.name : "no encontrado");
  console.log("Inexistente:", buscarUsuarioPorEmail(usuarios, "nadie@mail.com"));

  console.log("\n--- 9. generarToken ---");
  const token = generarToken(usuarios[0]);
  console.log(token);
  console.log("Payload decodificado:", JSON.parse(atob(token.split(".")[1])));

  console.log("\n--- 10. actualizarUsuario ---");
  const original = { id: 1, nombre: "Leanne", email: "leanne@mail.com", ciudad: "Paraná" };
  console.log("Antes:  ", original);
  console.log("Después:", actualizarUsuario(original, { email: "nuevo@mail.com", ciudad: "Concordia" }));
}

main();
