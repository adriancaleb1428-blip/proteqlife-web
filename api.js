/**
 * api.js — Cliente de API PROTEQLIFE
 * Incluir en todas las páginas: <script src="api.js"></script>
 */

const API_URL = 'http://localhost:3000/api'; // Cambiar en producción

// ── AUTH ──────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('pq_token'),
  getUser:  () => JSON.parse(localStorage.getItem('pq_user') || 'null'),
  isLogged: () => !!localStorage.getItem('pq_token'),

  async login(email, password) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      localStorage.setItem('pq_token', res.token);
      localStorage.setItem('pq_user', JSON.stringify(res.usuario));
    }
    return res;
  },

  async registro(data) {
    const res = await apiFetch('/auth/registro', { method: 'POST', body: JSON.stringify(data) });
    if (res.token) {
      localStorage.setItem('pq_token', res.token);
      localStorage.setItem('pq_user', JSON.stringify(res.usuario));
    }
    return res;
  },

  logout() {
    localStorage.removeItem('pq_token');
    localStorage.removeItem('pq_user');
    localStorage.removeItem('pq_cart');
    window.location.href = 'index.html';
  },

  async recuperarPassword(email) {
    return apiFetch('/auth/recuperar-password', { method: 'POST', body: JSON.stringify({ email }) });
  }
};

// ── CURSOS ────────────────────────────────────
const Cursos = {
  async getAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/cursos${qs ? '?' + qs : ''}`);
  },

  async getDetalle(slug) {
    return apiFetch(`/cursos/${slug}`);
  },

  async getCategorias() {
    return apiFetch('/cursos/categorias');
  }
};

// ── AULA ──────────────────────────────────────
const Aula = {
  async getMisCursos()    { return apiFetch('/aula/mis-cursos', { auth: true }); },
  async getProgreso(id)   { return apiFetch(`/aula/progreso/${id}`, { auth: true }); },
  async getCertificados() { return apiFetch('/aula/certificados', { auth: true }); },
  async getClases()       { return apiFetch('/aula/proximas-clases', { auth: true }); },

  async marcarLeccion(leccion_id, completado, tiempo_visto = 0) {
    return apiFetch('/aula/progreso', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ leccion_id, completado, tiempo_visto })
    });
  }
};

// ── CARRITO ───────────────────────────────────
const Carrito = {
  get() {
    return JSON.parse(localStorage.getItem('pq_cart') || '[]');
  },

  agregar(curso) {
    const cart = this.get();
    if (!cart.find(c => c.id === curso.id)) {
      cart.push({ id: curso.id, nombre: curso.nombre, precio: curso.precio, emoji: curso.emoji });
      localStorage.setItem('pq_cart', JSON.stringify(cart));
    }
    this.actualizarUI();
    return cart;
  },

  quitar(id) {
    const cart = this.get().filter(c => c.id !== id);
    localStorage.setItem('pq_cart', JSON.stringify(cart));
    this.actualizarUI();
    return cart;
  },

  limpiar() {
    localStorage.removeItem('pq_cart');
    this.actualizarUI();
  },

  total() {
    return this.get().reduce((s, c) => s + parseFloat(c.precio), 0);
  },

  actualizarUI() {
    const count = this.get().length;
    document.querySelectorAll('.cart-count, .cart-float-count').forEach(el => {
      el.textContent = count;
    });
    document.querySelectorAll('.cart-float, .cart-btn').forEach(el => {
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  async checkout(tokenPago) {
    if (!Auth.isLogged()) {
      mostrarLoginModal('Inicia sesión para completar tu compra.');
      return;
    }
    const ids = this.get().map(c => c.id);
    return apiFetch('/compras/checkout', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ curso_ids: ids, token_pago: tokenPago, metodo: 'culqi' })
    });
  }
};

// ── HELPER: FETCH CON AUTH ────────────────────
async function apiFetch(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (options.auth || options.requireAuth) {
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(API_URL + endpoint, {
      ...options,
      headers,
      credentials: 'include'
    });

    const data = await res.json();

    if (res.status === 401) {
      Auth.logout();
      return data;
    }

    return data;
  } catch (err) {
    console.error('API Error:', err);
    // Modo offline/demo: devolver datos estáticos
    return null;
  }
}

// ── MODAL DE LOGIN ────────────────────────────
function mostrarLoginModal(mensaje = '') {
  let modal = document.getElementById('loginModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.innerHTML = `
      <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(5,25,45,.65);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px">
        <div style="background:#fff;border-radius:16px;padding:32px;max-width:400px;width:100%;position:relative">
          <button onclick="document.getElementById('loginModal').remove()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:20px;cursor:pointer;color:#9BA3AD">✕</button>
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#05192D;margin-bottom:6px">Iniciar sesión</div>
          <div id="loginModalMsg" style="font-size:13px;color:#5A6472;margin-bottom:20px">${mensaje || 'Ingresa con tu cuenta PROTEQLIFE'}</div>
          <div style="margin-bottom:12px"><label style="display:block;font-size:12px;font-weight:600;color:#5A6472;margin-bottom:5px">Correo</label><input id="lmEmail" type="email" placeholder="correo@empresa.com" style="width:100%;padding:10px 12px;border:1px solid #E8ECF0;border-radius:6px;font-size:13px;outline:none"></div>
          <div style="margin-bottom:16px"><label style="display:block;font-size:12px;font-weight:600;color:#5A6472;margin-bottom:5px">Contraseña</label><input id="lmPass" type="password" placeholder="••••••••" style="width:100%;padding:10px 12px;border:1px solid #E8ECF0;border-radius:6px;font-size:13px;outline:none"></div>
          <div id="lmError" style="display:none;background:#FEE2E2;color:#991B1B;padding:8px 12px;border-radius:6px;font-size:12px;margin-bottom:12px"></div>
          <button onclick="procesarLoginModal()" style="width:100%;padding:12px;background:#1565C0;color:#fff;border:none;border-radius:10px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:8px">Ingresar →</button>
          <div style="text-align:center;font-size:12px;color:#9BA3AD">¿No tienes cuenta? <a href="aula-virtual.html" style="color:#1565C0;font-weight:600">Regístrate</a></div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
}

async function procesarLoginModal() {
  const email = document.getElementById('lmEmail')?.value;
  const pass  = document.getElementById('lmPass')?.value;
  const errEl = document.getElementById('lmError');

  if (!email || !pass) {
    errEl.textContent = 'Completa todos los campos.';
    errEl.style.display = 'block';
    return;
  }

  const res = await Auth.login(email, pass);
  if (res?.token) {
    document.getElementById('loginModal')?.remove();
    window.location.reload();
  } else {
    errEl.textContent = res?.error || 'Error al iniciar sesión.';
    errEl.style.display = 'block';
  }
}

// ── INICIALIZAR EN CADA PÁGINA ────────────────
document.addEventListener('DOMContentLoaded', () => {
  Carrito.actualizarUI();

  // Actualizar nav según estado de sesión
  const user = Auth.getUser();
  if (user) {
    document.querySelectorAll('.nav-aula').forEach(el => {
      el.textContent = '👤 ' + user.nombre;
      el.href = 'aula-virtual.html';
    });
  }
});

// Exportar para módulos
if (typeof module !== 'undefined') {
  module.exports = { Auth, Cursos, Aula, Carrito, apiFetch };
}
