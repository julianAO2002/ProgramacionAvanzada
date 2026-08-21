// =====================================================================
// 04 - Ejercicios sobre Operaciones con Arrays
// TP2 - Ejercitación JavaScript - Programación Avanzada 2026
// Ejecutar con: node 04-arrays.js
// =====================================================================

// ---------------------------------------------------------------------
// 1. Agregar y Eliminar Elementos
// ---------------------------------------------------------------------
const frutas = ["manzana", "banana", "pera"];

console.log("--- 1. push y pop ---");
console.log("Inicial:", frutas);
frutas.push("naranja");
console.log("Después de push:", frutas);
const eliminada = frutas.pop();
console.log("Después de pop:", frutas, "| eliminada:", eliminada);

// ---------------------------------------------------------------------
// 2. Array Bidimensional
// ---------------------------------------------------------------------
const matriz = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

console.log("\n--- 2. Array bidimensional ---");
console.log("matriz[1][1]:", matriz[1][1]); // El 5 está en fila 1, columna 1

// ---------------------------------------------------------------------
// 3. Iterar sobre un Array
// ---------------------------------------------------------------------
console.log("\n--- 3. Iteración con for ---");
for (let i = 0; i < frutas.length; i++) {
  console.log(`${i}: ${frutas[i]}`);
}

// ---------------------------------------------------------------------
// 4. Uso de map
// ---------------------------------------------------------------------
function elevarAlCuadrado(numeros) {
  return numeros.map((numero) => numero ** 2);
}

console.log("\n--- 4. map ---");
console.log("elevarAlCuadrado([1, 2, 3, 4, 5]):", elevarAlCuadrado([1, 2, 3, 4, 5]));

// ---------------------------------------------------------------------
// 5. Uso de filter
// ---------------------------------------------------------------------
function filtrarMayoresDe(numeros, referencia) {
  return numeros.filter((numero) => numero > referencia);
}

console.log("\n--- 5. filter ---");
console.log("filtrarMayoresDe([3, 8, 12, 5, 20], 7):", filtrarMayoresDe([3, 8, 12, 5, 20], 7));

// ---------------------------------------------------------------------
// 6. Uso de reduce
// ---------------------------------------------------------------------
function sumarElementos(numeros) {
  return numeros.reduce((acumulador, numero) => acumulador + numero, 0);
}

console.log("\n--- 6. reduce ---");
console.log("sumarElementos([1, 2, 3, 4, 5]):", sumarElementos([1, 2, 3, 4, 5]));

// ---------------------------------------------------------------------
// 7. Uso de some
// ---------------------------------------------------------------------
const numeros = [4, 7, 2, 15, 9];

console.log("\n--- 7. some ---");
console.log("numeros:", numeros);
console.log("¿Alguno mayor que 10?:", numeros.some((numero) => numero > 10));

// ---------------------------------------------------------------------
// 8. Uso de every
// ---------------------------------------------------------------------
console.log("\n--- 8. every ---");
console.log("¿Todos positivos?:", numeros.every((numero) => numero > 0));
console.log("¿Todos positivos en [4, -7, 2]?:", [4, -7, 2].every((numero) => numero > 0));

// ---------------------------------------------------------------------
// 9. Uso de find
// ---------------------------------------------------------------------
const personas = [
  { nombre: "Ana", edad: 25 },
  { nombre: "Bruno", edad: 34 },
  { nombre: "Carla", edad: 41 },
];

console.log("\n--- 9. find ---");
console.log("Primera persona mayor de 30:", personas.find((persona) => persona.edad > 30));

// ---------------------------------------------------------------------
// 10. Uso de sort
// ---------------------------------------------------------------------
const palabras = ["zapato", "árbol", "banana", "casa", "Ñandú", "auto"];

console.log("\n--- 10. sort ---");
console.log("Original:", palabras);
// Copia con slice() para no mutar el array original, y localeCompare
// para que los acentos y la ñ se ordenen según el español.
const ordenadas = palabras.slice().sort((a, b) => a.localeCompare(b, "es"));
console.log("Ordenadas:", ordenadas);
