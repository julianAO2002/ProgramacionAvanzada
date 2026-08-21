// =====================================================================
// 01 - Ejercicios sobre Objetos
// TP2 - Ejercitación JavaScript - Programación Avanzada 2026
// Ejecutar con: node 01-objetos.js
// =====================================================================

// ---------------------------------------------------------------------
// 1. Creación de un Objeto Básico
// ---------------------------------------------------------------------
const libro = {
  titulo: "Rayuela",
  autor: "Julio Cortázar",
  anioDePublicacion: 1963,
};

console.log("--- 1. Objeto básico ---");
console.log("Título:", libro.titulo);
console.log("Autor:", libro.autor);
console.log("Año de publicación:", libro.anioDePublicacion);

// ---------------------------------------------------------------------
// 2. Anidación de Objetos
// ---------------------------------------------------------------------
const estudiante = {
  nombre: "Julián Olivera",
  edad: 23,
  direccion: {
    calle: "San Martín 1234",
    ciudad: "Concepción del Uruguay",
    pais: "Argentina",
  },
};

console.log("\n--- 2. Anidación de objetos ---");
const { calle, ciudad, pais } = estudiante.direccion;
console.log(`Dirección completa: ${calle}, ${ciudad}, ${pais}`);

// ---------------------------------------------------------------------
// 3. Métodos en Objetos
// ---------------------------------------------------------------------
libro.descripcion = function () {
  return `"${this.titulo}" fue escrito por ${this.autor}.`;
};

console.log("\n--- 3. Métodos en objetos ---");
console.log(libro.descripcion());

// ---------------------------------------------------------------------
// 4. Iteración sobre Propiedades de un Objeto
// ---------------------------------------------------------------------
const producto = {
  nombre: "Teclado mecánico",
  precio: 45000,
  disponible: true,
};

console.log("\n--- 4. Iteración con for...in ---");
for (const propiedad in producto) {
  console.log(`${propiedad}: ${producto[propiedad]}`);
}

// ---------------------------------------------------------------------
// 5. Actualización de Propiedades
// ---------------------------------------------------------------------
console.log("\n--- 5. Actualización de propiedades ---");
producto.precio = 52000;
console.log(producto);

// ---------------------------------------------------------------------
// 6. Comprobación de Propiedades
// ---------------------------------------------------------------------
function tienePropiedad(objeto, propiedad) {
  return Object.prototype.hasOwnProperty.call(objeto, propiedad);
}

console.log("\n--- 6. Comprobación de propiedades ---");
console.log('tienePropiedad(producto, "precio"):', tienePropiedad(producto, "precio"));
console.log('tienePropiedad(producto, "stock"):', tienePropiedad(producto, "stock"));

// ---------------------------------------------------------------------
// 7. Eliminación de Propiedades
// ---------------------------------------------------------------------
console.log("\n--- 7. Eliminación de propiedades ---");
console.log("Antes:", producto);
delete producto.disponible;
console.log("Después:", producto);

// ---------------------------------------------------------------------
// 8. Combinar Objetos
// ---------------------------------------------------------------------
const persona1 = { nombre: "Ana", edad: 30 };
const persona2 = { ciudad: "Paraná", profesion: "Ingeniera" };
const personaCombinada = Object.assign({}, persona1, persona2);

console.log("\n--- 8. Combinar objetos ---");
console.log(personaCombinada);

// ---------------------------------------------------------------------
// 9. Copiar Objetos (copia profunda)
// ---------------------------------------------------------------------
const copiaEstudiante = JSON.parse(JSON.stringify(estudiante));
copiaEstudiante.nombre = "Copia Modificada";
copiaEstudiante.direccion.ciudad = "Rosario";

console.log("\n--- 9. Copia profunda ---");
console.log("Original:", estudiante.nombre, "-", estudiante.direccion.ciudad);
console.log("Copia:   ", copiaEstudiante.nombre, "-", copiaEstudiante.direccion.ciudad);

// ---------------------------------------------------------------------
// 10. Métodos Getters y Setters
// ---------------------------------------------------------------------
Object.defineProperty(libro, "anio", {
  get() {
    return this.anioDePublicacion;
  },
  set(valor) {
    if (typeof valor !== "number" || valor < 0) {
      console.log("Año inválido, no se actualiza.");
      return;
    }
    this.anioDePublicacion = valor;
  },
});

console.log("\n--- 10. Getters y setters ---");
console.log("Getter (año original):", libro.anio);
libro.anio = 1970;
console.log("Getter (después del setter):", libro.anio);
libro.anio = -5; // Caso inválido
