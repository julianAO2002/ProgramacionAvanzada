// =====================================================================
// 02 - Ejercicios sobre Funciones
// TP2 - Ejercitación JavaScript - Programación Avanzada 2026
// Ejecutar con: node 02-funciones.js
// =====================================================================

// ---------------------------------------------------------------------
// 1. Función Suma
// ---------------------------------------------------------------------
function sumar(a, b) {
  return a + b;
}

console.log("--- 1. sumar ---");
console.log("sumar(2, 3):", sumar(2, 3));
console.log("sumar(-4, 10):", sumar(-4, 10));
console.log("sumar(1.5, 2.25):", sumar(1.5, 2.25));

// ---------------------------------------------------------------------
// 2. Función que Multiplica
// ---------------------------------------------------------------------
function multiplicar(a, b) {
  return a * b;
}

console.log("\n--- 2. multiplicar ---");
console.log("multiplicar(3, 4):", multiplicar(3, 4));
console.log("multiplicar(-2, 6):", multiplicar(-2, 6));
console.log("multiplicar(0.5, 8):", multiplicar(0.5, 8));

// ---------------------------------------------------------------------
// 3. Función con Parámetro por Defecto
// ---------------------------------------------------------------------
function saludar(nombre = "Invitado") {
  return `Hola, ${nombre}`;
}

console.log("\n--- 3. saludar ---");
console.log(saludar("Julián"));
console.log(saludar());

// ---------------------------------------------------------------------
// 4. Función que Devuelve un Objeto
// ---------------------------------------------------------------------
function crearPersona(nombre, edad) {
  return { nombre, edad };
}

console.log("\n--- 4. crearPersona ---");
const persona = crearPersona("Lucía", 28);
console.log(persona);

// ---------------------------------------------------------------------
// 5. Función que Modifica un Objeto
// ---------------------------------------------------------------------
function actualizarEdad(persona, nuevaEdad) {
  persona.edad = nuevaEdad;
  return persona;
}

console.log("\n--- 5. actualizarEdad ---");
console.log("Antes:", persona);
actualizarEdad(persona, 29);
console.log("Después:", persona);

// ---------------------------------------------------------------------
// 6. Función Recursiva
// ---------------------------------------------------------------------
function factorial(n) {
  if (n < 0) return NaN;      // No definido para negativos
  if (n === 0 || n === 1) return 1; // Caso base
  return n * factorial(n - 1);      // Caso recursivo
}

console.log("\n--- 6. factorial ---");
console.log("factorial(0):", factorial(0));
console.log("factorial(5):", factorial(5));
console.log("factorial(10):", factorial(10));

// ---------------------------------------------------------------------
// 7. Función con Función Interna
// ---------------------------------------------------------------------
function despedir(nombre = "amigo") {
  function adios() {
    return `¡Adiós, ${nombre}! Nos vemos pronto.`;
  }
  return adios();
}

console.log("\n--- 7. despedir ---");
console.log(despedir("Ernesto"));

// ---------------------------------------------------------------------
// 8. Función que Usa Otra Función (callback)
// ---------------------------------------------------------------------
function procesarArray(array, callback) {
  const resultado = [];
  for (const elemento of array) {
    resultado.push(callback(elemento));
  }
  return resultado;
}

console.log("\n--- 8. procesarArray ---");
const numeros = [1, 2, 3, 4, 5];
console.log("Original:", numeros);
console.log("Por 2:   ", procesarArray(numeros, (n) => n * 2));

// ---------------------------------------------------------------------
// 9. Función que Devuelve Otra Función (closure)
// ---------------------------------------------------------------------
function crearMultiplicador(x) {
  return function (numero) {
    return numero * x;
  };
}

console.log("\n--- 9. crearMultiplicador ---");
const duplicar = crearMultiplicador(2);
const triplicar = crearMultiplicador(3);
console.log("duplicar(7):", duplicar(7));
console.log("triplicar(7):", triplicar(7));

// ---------------------------------------------------------------------
// 10. Función Anónima
// ---------------------------------------------------------------------
const sumarAnonima = function (a, b) {
  return a + b;
};

console.log("\n--- 10. sumarAnonima ---");
console.log("sumarAnonima(15, 27):", sumarAnonima(15, 27));
