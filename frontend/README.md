# Estudiantes: rutas publicas, privadas y por rol

Proyecto React + TypeScript + Vite con API Express, MongoDB y autenticacion mediante cookies httpOnly.

## Ejecutar

Necesitas Node.js, npm y MongoDB disponible. Desde la raiz del repositorio, usa dos terminales:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
npm run dev
```

Antes de iniciar el backend, configura MONGODB_URI y reemplaza JWT_SECRET y JWT_REFRESH_SECRET por secretos distintos en backend/.env. CORS_ORIGIN debe coincidir con la direccion del frontend (por defecto http://localhost:5173).

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

VITE_API_URL debe ser http://localhost:3000/api/v1. Abri http://localhost:5173. No subas los archivos .env ni node_modules.

## Rutas del frontend

| Acceso | Rutas |
| --- | --- |
| Publico | /home, /students/:id, /login, /register |
| Autenticado | /perfil |
| ADMIN | /admin, /admin/sesiones |

La raiz / redirige a /home. ProtectedRoute espera la recuperacion de la sesion, redirige al login si no hay usuario y muestra un mensaje de acceso denegado si falta el rol. El menu muestra los enlaces correspondientes al usuario. Las paginas administrativas son demostraciones de acceso; no implementan un ABM ni un listado real de sesiones.

## Rutas del backend

Todas las rutas siguientes tienen el prefijo /api/v1.

| Acceso | Metodo y ruta |
| --- | --- |
| Publico | POST /auth/register, POST /auth/login, POST /auth/logout |
| Publico | QUERY /students, GET /students/:id |
| Publico | QUERY /subjects, GET /subjects/:id |
| Autenticado | GET /auth/me |
| ADMIN | POST /students, PUT /students/:id, DELETE /students/:id |
| ADMIN | POST /subjects, PUT /subjects/:id, DELETE /subjects/:id |

Los listados existentes utilizan QUERY con filtros JSON en el cuerpo. Las escrituras exigen authMiddleware y luego requireRole("ADMIN"); la validacion del cuerpo se ejecuta despues de comprobar permisos. Sin sesion la API responde 401; con rol insuficiente, 403.

## Preparar usuarios de prueba

1. Registra dos usuarios desde /register. El backend les asigna USER.
2. En MongoDB Compass, abre la base configurada en MONGODB_URI y la coleccion users.
3. Busca uno de los usuarios por email y cambia unicamente su campo role a ADMIN. Conserva el otro como USER.
4. Cierra la sesion del administrador si estaba abierta y vuelve a ingresar: los tokens contienen el rol del momento del login.

No se crean cuentas automaticamente ni se incluyen credenciales reales en el repositorio.

## Verificacion manual

- Sin sesion, /home y el detalle de un estudiante existente son accesibles.
- Sin sesion, /perfil redirige a /login; despues de ingresar vuelve a la ruta solicitada.
- Con USER, /perfil muestra los datos y /admin muestra acceso denegado.
- Con ADMIN, /admin y /admin/sesiones son accesibles.
- Al recargar /perfil se recupera la sesion mediante GET /auth/me.
- Despues de salir, las rutas privadas vuelven a pedir login.
- En Postman, GET /api/v1/auth/me sin cookies devuelve 401.
- Para comprobar permisos sin eliminar datos, usa POST /api/v1/students con cuerpo JSON {}: sin cookies devuelve 401, con USER devuelve 403 y con ADMIN devuelve 400 por validacion. Repite con /subjects.
- Para probar una escritura exitosa como ADMIN, usa datos validos y registros de prueba. Conserva las cookies devueltas por POST /api/v1/auth/login.

## Comprobaciones locales

En frontend: npm run build y npm run lint.
En backend: npm run build.

La proteccion del frontend controla la navegacion; la API comprueba los permisos tambien para solicitudes directas.
