# Programación Web Full Stack

## Entrega: router público, privado y protegido por rol

Se reutiliza el backend Express + TypeScript + MongoDB y se agrega un frontend
HTML/CSS/JavaScript en `frontend/`, servido por el mismo backend.

### Ejecutar

1. Instalar dependencias con `npm install` (en PowerShell, `npm.cmd install`).
2. Copiar `.env.example` a `.env`, configurar MongoDB y reemplazar los dos secretos JWT por valores aleatorios distintos.
3. Tener MongoDB disponible y ejecutar `npm run dev` (`npm.cmd run dev` en PowerShell).
4. Abrir <http://localhost:3000>.

También se puede ejecutar `npm run build` y luego `npm start`.
El frontend no requiere instalación ni compilación adicional.

### Rutas del frontend

| Ruta | Tipo | Comportamiento |
|---|---|---|
| `#/` | Pública | Página de bienvenida |
| `#/login` | Pública | Inicio de sesión |
| `#/register` | Pública | Registro de cuentas USER |
| `#/panel` | Privada | Lista estudiantes y materias; sin sesión redirige al login |
| `#/admin` | Privada con rol ADMIN | Panel de administración; USER recibe acceso denegado |

El router de `frontend/app.js` consulta `/api/v1/auth/me` antes de renderizar cada
página. La sesión persiste mediante cookies httpOnly, incluso al recargar la página.
El backend vuelve a verificar los permisos en cada solicitud a la API.

### Rutas del backend

Todos los siguientes paths tienen el prefijo `/api/v1`.

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | Público |
| GET | `/auth/me` | USER o ADMIN autenticado |
| GET | `/admin` | ADMIN autenticado |
| POST | `/students/search`, `/subjects/search` | USER o ADMIN autenticado |
| GET | `/students/:id`, `/subjects/:id` | USER o ADMIN autenticado |
| POST | `/students`, `/subjects` | ADMIN autenticado |
| PUT, DELETE | `/students/:id`, `/subjects/:id` | ADMIN autenticado |

Los listados usan POST `/search` con filtros JSON (por ejemplo `{ "page": 1,
"limit": 20 }`) para conservar la validación del body existente y reemplazar
el método no estándar `router.query!`.

`authMiddleware` verifica el JWT y renueva el access token mediante el refresh
token cuando corresponde. `requireRole` verifica el rol antes de validar el body
o ejecutar los controladores. Sin sesión válida se responde **401**; con un rol
insuficiente se responde **403**.

### Probar ambos roles

1. Registrarse desde el frontend e ingresar. Las cuentas nuevas siempre son USER;
   enviar un campo `role` en el registro no permite crear un administrador.
2. Abrir `#/panel`: se muestran los listados. Abrir `#/admin`: se deniega el acceso.
3. Crear una segunda cuenta para el administrador y actualizar su rol desde
   MongoDB Compass o `mongosh`, en la base configurada en `MONGODB_URI`:

   ```js
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "ADMIN" } }
   )
   ```

4. Cerrar sesión e ingresar con esa cuenta para emitir tokens con el nuevo rol.
   Abrir `#/admin`: ahora se permite el acceso.
5. Cerrar sesión y abrir `#/panel` directamente: se redirige a `#/login`.

Para probar las escrituras de la API se puede usar Postman con las cookies
obtenidas al hacer login. Por ejemplo, POST `/api/v1/subjects`:

```json
{ "name": "Programación Web", "career": "Sistemas", "year": 2 }
```

USER recibe 403; ADMIN recibe 201 si los datos son válidos y MongoDB está disponible.

### Verificación automática

`npm test` (`npm.cmd test` en PowerShell) compila TypeScript y ejecuta las pruebas
HTTP de `tests/routes.test.cjs`: rutas públicas, sesiones ausentes o inválidas,
acceso privado, denegación de escrituras para USER, permisos ADMIN y renovación
de sesión. Estas pruebas no requieren MongoDB; el registro/login completo y el
CRUD persistente se prueban con la base configurada usando los pasos anteriores.

---

Stack: Node.js + Express + TypeScript · MongoDB + Mongoose · bcrypt + JWT en cookie `httpOnly` · React + React Router + React Hook Form · Redux Toolkit + RTK Query · Zod · LangChain · Vercel + Render/Railway.

## Cronograma de clases

| ✓ | Clase | Descripción |
|---|-------|-------------|
| [x] | Clase 1 — 11/08 — Fundamentos de Node | Node, Express + TypeScript, tsconfig, tipos básicos |
| [x] | Clase 2 — 18/08 — Persistencia y rutas | MongoDB + Mongoose, generics, CRUD completo |
| [x] | Clase 3 — 25/08 — Middlewares y validación | Middlewares, validación con Zod |
| [ ] | Clase 4 — 01/09 — Auth I: credenciales | bcrypt, registro y login, sesiones vs tokens |
| [ ] | Clase 5 — 08/09 — Auth II: JWT a fondo | Anatomía JWT, claims, roles, refresh tokens, cookies httpOnly |
| [ ] | Clase 6 — 15/09 — 📝 Parcial I | clases 1–5 |
| [ ] | Clase 7 — 22/09 — React fundamentos | Vite, componentes, hooks, consumo de la API propia |
| [ ] | Clase 8 — 29/09 — 🔧 Taller de portfolio | Laboratorio práctico, maquetado one-page |
| [ ] | Clase 9 — 06/10 — React Router | Rutas anidadas, params, rutas privadas |
| [ ] | Clase 10 — 13/10 — Formularios | React Hook Form + Zod, login, panel admin |
| [ ] | Clase 11 — 20/10 — Estado global | Redux Toolkit + RTK Query, sesión persistente |
| [ ] | Clase 12 — 27/10 — 📝 Parcial II | clases 7–11 |
| [ ] | Clase 13 — 03/11 — LLMs y LangChain I | Prompting, chains, endpoint `/chat` |
| [ ] | Clase 14 — 10/11 — LangChain II: RAG | Embeddings, vector store, chatbot sobre el propio perfil |
| [ ] | Clase 15 — 17/11 — Deploy y defensa | Deploy Vercel/Render, CORS producción, demo final |
| [ ] | Clase 16 — 24/11 — 📝 Recuperatorio | Sin contenido nuevo |
