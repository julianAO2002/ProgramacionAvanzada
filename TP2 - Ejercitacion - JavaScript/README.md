# TP2 - Ejercitación JavaScript

Resolución del TP2 de **Programación Avanzada 2026** (Licenciatura en Sistemas de
Información - FCyT, UADER). Consigna original: `TP2 - Ejercitacion - JavaScript - 2026.pdf`.

Son 40 ejercicios agrupados en 4 bloques temáticos, uno por archivo.

## Contenido

| Archivo | Bloque | Temas |
| --- | --- | --- |
| `01-objetos.js` | Objetos | creación, anidación, métodos, `for...in`, `delete`, `Object.assign`, copia profunda, getters/setters |
| `02-funciones.js` | Funciones | parámetros por defecto, recursión, funciones internas, callbacks, closures, funciones anónimas |
| `03-funciones-api.js` | Consumo de datos, mapeo y autenticación | `fetch` (GET/POST), `map`, `find`, validación, paginación, token JWT simulado con Base64 |
| `04-arrays.js` | Arrays | `push`/`pop`, matrices, `map`, `filter`, `reduce`, `some`, `every`, `find`, `sort` |

## Cómo ejecutar

Requiere **Node.js 18 o superior** (el bloque 03 usa `fetch`, disponible de forma nativa
a partir de esa versión; probado con Node 20.13.1).

```bash
node 01-objetos.js
node 02-funciones.js
node 03-funciones-api.js
node 04-arrays.js
```

Cada archivo imprime en consola el resultado de cada ejercicio, separado por
encabezados del tipo `--- N. nombre ---`.

## Notas de implementación

- **Bloque 03** consume la API pública
  [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com): `GET /users`
  para obtener usuarios y `POST /posts` para el envío de datos. Si no hay conexión a
  Internet, `obtenerUsuarios` avisa por consola y cae a un conjunto de datos local, de
  modo que el resto de los ejercicios se puede demostrar igual.
- El "token JWT" del ejercicio 03.9 es **simulado**: se arma con `btoa` (Base64) y una
  firma ficticia. No sirve para autenticación real, donde la firma se calcula con HMAC
  y una clave secreta en el servidor.
- El ejercicio 04.10 ordena con `localeCompare(a, b, "es")` sobre una copia del array,
  para respetar acentos y la `ñ` sin mutar el original.
- Los identificadores del PDF que llevan tilde (`año`, `descripción`) se escriben sin
  acento en el código (`anio`, `descripcion`), que es la convención habitual para
  nombres de variables.
