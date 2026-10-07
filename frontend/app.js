const app = document.querySelector('#app');
const logout = document.querySelector('#logout');
let navigation = 0;

async function api(path, options = {}) {
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error?.message || 'No se pudo completar la solicitud');
    error.status = response.status;
    throw error;
  }
  return result.data;
}

// Each navigation checks the server session, including after a page reload.
const routes = {
  '/': { access: 'public', render: () => {
    app.innerHTML = '<h1>Bienvenido al campus</h1><p>Esta página es pública. Ingresá para consultar estudiantes y materias en tu panel.</p><p>La sección de administración requiere el rol ADMIN.</p>';
  } },
  '/login': { access: 'public', render: () => authForm(false) },
  '/register': { access: 'public', render: () => authForm(true) },
  '/panel': { access: 'private', render: async (user) => {
    app.innerHTML = '<h1>Mi panel</h1><p id="session"></p><h2>Estudiantes</h2><pre id="students"></pre><h2>Materias</h2><pre id="subjects"></pre>';
    document.querySelector('#session').textContent = `Sesión iniciada · Rol ${user.role}`;
    const studentsElement = document.querySelector('#students');
    const subjectsElement = document.querySelector('#subjects');
    await Promise.all([
      loadList('/students/search', studentsElement),
      loadList('/subjects/search', subjectsElement),
    ]);
  } },
  '/admin': { access: 'role', role: 'ADMIN', render: async () => {
    const data = await api('/admin');
    app.innerHTML = '<h1>Administración</h1><p id="welcome"></p><p>Tu rol permite crear, editar y eliminar estudiantes y materias mediante la API.</p>';
    document.querySelector('#welcome').textContent = data.message;
  } },
};

async function loadList(path, element) {
  try { element.textContent = JSON.stringify(await api(path, { method: 'POST', body: '{}' }), null, 2); }
  catch (error) { element.textContent = error.message; }
}

function authForm(register) {
  app.innerHTML = `<h1>${register ? 'Crear cuenta' : 'Ingresar'}</h1>
    <form>${register ? '<label>Nombre<input name="name" required maxlength="80" autocomplete="name"></label>' : ''}
      <label>Email<input name="email" type="email" required autocomplete="email"></label>
      <label>Contraseña<input name="password" type="password" required minlength="8" autocomplete="${register ? 'new-password' : 'current-password'}"></label>
      <button>${register ? 'Registrarse' : 'Ingresar'}</button><p id="message" role="status"></p>
    </form>`;
  const form = app.querySelector('form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    const message = form.querySelector('#message');
    button.disabled = true;
    try {
      await api(register ? '/auth/register' : '/auth/login', {
        method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (register) { message.textContent = 'Cuenta creada. Ya podés ingresar.'; }
      else { location.hash = '/panel'; }
    } catch (error) { message.textContent = error.message; message.className = 'error'; }
    finally { button.disabled = false; }
  });
}

async function navigate() {
  const current = ++navigation;
  const route = routes[location.hash.slice(1) || '/'];
  app.textContent = 'Cargando…';
  if (!route) { app.innerHTML = '<h1>404</h1><p>La página no existe.</p>'; return; }
  try {
    let user = null;
    try { user = await api('/auth/me'); }
    catch (error) { if (error.status !== 401) throw error; }
    if (current !== navigation) return;
    logout.hidden = !user;
    if (route.access !== 'public' && !user) { location.hash = '/login'; return; }
    if (route.access === 'role' && user.role !== route.role) {
      app.innerHTML = '<h1>Acceso denegado</h1><p>Esta sección requiere el rol ADMIN.</p>'; return;
    }
    await route.render(user);
  } catch (error) {
    if (current === navigation) app.textContent = error.message;
  }
}
logout.addEventListener('click', async () => {
  try { await api('/auth/logout', { method: 'POST' }); location.hash = '/'; await navigate(); }
  catch (error) { app.textContent = error.message; }
});
window.addEventListener('hashchange', navigate);
navigate();
