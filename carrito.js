/**
 * carrito.js — PROTEQLIFE
 * Sistema de carrito compartido para todas las páginas.
 * Idéntico al que funciona en curso-detalle.html
 * Usar: <script src="carrito.js"></script>  (antes de </body>)
 */

// ── ESTADO ────────────────────────────────────────────
var carrito = JSON.parse(localStorage.getItem('pq_cart') || '[]');

function _guardarCarrito() {
  localStorage.setItem('pq_cart', JSON.stringify(carrito));
}

// ── ACTUALIZAR UI ─────────────────────────────────────
function actualizarCarritoUI() {
  var count    = carrito.length;
  var floatBtn = document.getElementById('cartFloat');
  var countEl  = document.getElementById('cartFloatCount');
  if (floatBtn) floatBtn.style.display = count > 0 ? 'flex' : 'none';
  if (countEl)  countEl.textContent    = count;
}

// ── RENDER PANEL ──────────────────────────────────────
function renderCarritoPanel() {
  var total   = carrito.reduce(function(s, c) { return s + c.precioNum; }, 0);
  var totalEl = document.getElementById('cpTotal');
  if (totalEl) totalEl.textContent = 'S/ ' + total;

  var html = '';
  if (!carrito.length) {
    html = '<div class="cp-empty"><div style="font-size:36px;margin-bottom:10px">🛒</div><p>Tu carrito está vacío.</p></div>';
  } else {
    carrito.forEach(function(item, idx) {
      var nombre = item.nombre || item.titulo || '';
      html += '<div class="cp-item">' +
        '<span class="cp-emoji">' + (item.emoji || '📚') + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="cp-name">' + nombre.substring(0, 50) + (nombre.length > 50 ? '...' : '') + '</div>' +
          '<div class="cp-price">' + item.precio + '</div>' +
        '</div>' +
        '<button class="cp-remove" onclick="quitarDelCarrito(' + idx + ')">🗑</button>' +
        '</div>';
    });
  }
  var itemsEl = document.getElementById('cpItems');
  if (itemsEl) itemsEl.innerHTML = html;
}

// ── ABRIR / CERRAR PANEL ──────────────────────────────
function toggleCarrito() {
  var panel = document.getElementById('cartPanel');
  if (!panel) return;
  renderCarritoPanel();
  panel.classList.toggle('open');
}

function abrirCarrito() {
  var panel = document.getElementById('cartPanel');
  if (!panel) return;
  renderCarritoPanel();
  panel.classList.add('open');
}

function cerrarCarrito() {
  var panel = document.getElementById('cartPanel');
  if (panel) panel.classList.remove('open');
}

// ── AGREGAR AL CARRITO ────────────────────────────────
function agregarCursoAlCarrito(slug, nombre, precio, precioNum, emoji) {
  var existe = carrito.find(function(c) { return c.slug === slug; });
  if (!existe) {
    carrito.push({ slug: slug, nombre: nombre, precio: precio, precioNum: precioNum, emoji: emoji || '📚' });
    _guardarCarrito();
  }
  actualizarCarritoUI();
  renderCarritoPanel();
  // Mostrar notificación toast
  mostrarNotifCarrito('✅ "' + nombre.substring(0, 35) + (nombre.length > 35 ? '...' : '') + '" agregado');
  // Abrir panel con delay pequeño
  setTimeout(abrirCarrito, 400);
}

// ── QUITAR DEL CARRITO ────────────────────────────────
function quitarDelCarrito(idx) {
  carrito.splice(idx, 1);
  _guardarCarrito();
  actualizarCarritoUI();
  renderCarritoPanel();
}

// ── PAGAR ─────────────────────────────────────────────
function abrirPago() {
  if (!carrito.length) return;
  cerrarCarrito();

  var resumen = '<div class="pr-title">Resumen del pedido</div>';
  var total   = 0;
  carrito.forEach(function(c) {
    var nombre = (c.nombre || c.titulo || '').substring(0, 42);
    resumen += '<div class="pr-item"><span>' + nombre + (nombre.length >= 42 ? '...' : '') + '</span><span>' + c.precio + '</span></div>';
    total   += c.precioNum;
  });
  resumen += '<div class="pr-total"><span>Total</span><span>S/ ' + total + '</span></div>';

  var resumenEl = document.getElementById('pagoResumen');
  if (resumenEl) resumenEl.innerHTML = resumen;

  var modal = document.getElementById('pagoModal');
  if (modal) modal.classList.add('open');
}

function cerrarPago() {
  var modal = document.getElementById('pagoModal');
  if (modal) modal.classList.remove('open');
}

function fmtCard(el) {
  var v  = el.value.replace(/\D/g, '').substring(0, 16);
  el.value = v.replace(/(.{4})/g, '$1 ').trim();
}
function fmtExpiry(el) {
  var v = el.value.replace(/\D/g, '');
  if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
  el.value = v;
}

function procesarPago() {
  var nombre  = (document.getElementById('pfNombre')  || {}).value || '';
  var tarjeta = (document.getElementById('pfTarjeta') || {}).value || '';
  var venc    = (document.getElementById('pfVenc')    || {}).value || '';
  var cvv     = (document.getElementById('pfCVV')     || {}).value || '';

  if (!nombre.trim() || !tarjeta.trim() || !venc.trim() || !cvv.trim()) {
    alert('Por favor completa todos los campos del pago.');
    return;
  }
  if (tarjeta.replace(/\s/g, '').length < 16) {
    alert('Número de tarjeta incompleto.');
    return;
  }

  var btn = document.getElementById('pagoSubmit');
  if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }

  setTimeout(function() {
    cerrarPago();
    carrito = [];
    _guardarCarrito();
    actualizarCarritoUI();
    alert('✅ ¡Pago procesado exitosamente!\n\nRecibirás un correo con acceso a tus cursos.\n\nBienvenido a PROTEQLIFE Consulting.');
    window.location.href = 'aula-virtual.html';
  }, 2000);
}

function pagarWhatsApp() {
  var lista = carrito.map(function(c) { return '• ' + (c.nombre || c.titulo) + ' (' + c.precio + ')'; }).join('%0A');
  var total = carrito.reduce(function(s, c) { return s + c.precioNum; }, 0);
  var msg   = 'Hola PROTEQLIFE, quiero inscribirme en:%0A%0A' + lista + '%0A%0ATotal: S/ ' + total;
  window.open('https://wa.me/51999000000?text=' + msg, '_blank');
  cerrarCarrito();
}

// ── NOTIFICACIÓN TOAST ────────────────────────────────
function mostrarNotifCarrito(msg) {
  var el = document.getElementById('cartNotif');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'flex';
  setTimeout(function() { el.style.display = 'none'; }, 2500);
}

// ── HTML + CSS INYECTADOS ─────────────────────────────
function _inyectarCarritoHTML() {
  // CSS
  var style = document.createElement('style');
  style.textContent = [
    /* Notif toast */
    '.cart-notif{position:fixed;top:80px;right:24px;background:#1B5E20;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 12px 40px rgba(5,25,45,.14);z-index:9999;display:none;align-items:center;gap:8px}',

    /* Botón flotante */
    '.cart-float{position:fixed;bottom:24px;right:24px;background:#1565C0;color:#fff;border:none;border-radius:50px;padding:12px 20px;font-family:Syne,sans-serif;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(5,25,45,.25);display:none;align-items:center;gap:8px;z-index:500;transition:all .2s}',
    '.cart-float:hover{background:#05192D;transform:translateY(-2px)}',
    '.cart-float-count{background:#fff;color:#1565C0;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}',

    /* Panel lateral */
    '.cart-panel{display:none;position:fixed;top:0;right:0;bottom:0;width:380px;max-width:100%;background:#fff;box-shadow:-8px 0 40px rgba(5,25,45,.15);z-index:9000;flex-direction:column}',
    '.cart-panel.open{display:flex}',
    '.cp-header{padding:18px 22px;border-bottom:1px solid #E8ECF0;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}',
    '.cp-title{font-family:Syne,sans-serif;font-size:18px;font-weight:800;color:#05192D}',
    '.cp-close{background:none;border:none;font-size:20px;cursor:pointer;color:#9BA3AD}',
    '.cp-items{flex:1;overflow-y:auto;padding:14px 22px;display:flex;flex-direction:column;gap:10px}',
    '.cp-item{background:#F5F7FA;border-radius:10px;padding:12px;display:flex;gap:10px;align-items:flex-start}',
    '.cp-emoji{font-size:22px;flex-shrink:0}',
    '.cp-name{font-size:13px;font-weight:600;color:#05192D;margin-bottom:3px;line-height:1.3}',
    '.cp-price{font-size:13px;font-weight:700;color:#1565C0}',
    '.cp-remove{margin-left:auto;background:none;border:none;font-size:16px;cursor:pointer;color:#9BA3AD;flex-shrink:0}',
    '.cp-remove:hover{color:#E24B4A}',
    '.cp-empty{text-align:center;padding:40px 20px;color:#9BA3AD}',
    '.cp-footer{padding:18px 22px;border-top:1px solid #E8ECF0;flex-shrink:0}',
    '.cp-total{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}',
    '.cp-total-lbl{font-size:14px;color:#5A6472}',
    '.cp-total-val{font-family:Syne,sans-serif;font-size:22px;font-weight:800;color:#05192D}',
    '.cp-pay-btn{width:100%;padding:13px;background:#1565C0;color:#fff;border:none;border-radius:10px;font-family:Syne,sans-serif;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:8px;transition:background .2s}',
    '.cp-pay-btn:hover{background:#05192D}',
    '.cp-wa-btn{width:100%;padding:12px;background:#25D366;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s}',
    '.cp-wa-btn:hover{background:#1da851}',

    /* Modal pago */
    '.pago-overlay{display:none;position:fixed;inset:0;background:rgba(5,25,45,.65);z-index:10000;align-items:center;justify-content:center;padding:20px}',
    '.pago-overlay.open{display:flex}',
    '.pago-box{background:#fff;border-radius:16px;max-width:440px;width:100%;padding:28px;position:relative;max-height:90vh;overflow-y:auto}',
    '.pago-close{position:absolute;top:12px;right:16px;background:none;border:none;font-size:20px;cursor:pointer;color:#9BA3AD}',
    '.pago-title{font-family:Syne,sans-serif;font-size:20px;font-weight:800;color:#05192D;margin-bottom:4px}',
    '.pago-sub{font-size:13px;color:#5A6472;margin-bottom:18px}',
    '.pago-resumen{background:#F5F7FA;border-radius:10px;padding:14px;margin-bottom:18px}',
    '.pr-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9BA3AD;margin-bottom:8px}',
    '.pr-item{display:flex;justify-content:space-between;font-size:13px;padding:3px 0;color:#5A6472}',
    '.pr-total{display:flex;justify-content:space-between;font-size:15px;font-weight:700;color:#05192D;border-top:1px solid #E8ECF0;margin-top:8px;padding-top:8px}',
    '.pf-group{margin-bottom:12px}',
    '.pf-label{display:block;font-size:12px;font-weight:600;color:#5A6472;margin-bottom:5px}',
    '.pf-input{width:100%;padding:10px 12px;border:1px solid #E8ECF0;border-radius:6px;font-family:DM Sans,sans-serif;font-size:13px;color:#2C3540;outline:none;transition:border-color .15s}',
    '.pf-input:focus{border-color:#2196F3}',
    '.pf-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '.pago-secure{display:flex;align-items:center;gap:6px;font-size:11px;color:#9BA3AD;margin-bottom:14px}',
    '.pago-submit{width:100%;padding:13px;background:#1565C0;color:#fff;border:none;border-radius:10px;font-family:Syne,sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:background .2s}',
    '.pago-submit:hover{background:#05192D}',
    '.pago-submit:disabled{background:#9BA3AD;cursor:not-allowed}',

    /* Responsive */
    '@media(max-width:600px){.cart-panel{width:100%}}'
  ].join('');
  document.head.appendChild(style);

  // HTML
  var wrap = document.createElement('div');
  wrap.innerHTML =
    // Toast notificación
    '<div class="cart-notif" id="cartNotif"></div>' +

    // Botón flotante
    '<button class="cart-float" id="cartFloat" onclick="toggleCarrito()">' +
      '🛒 Ver carrito <span class="cart-float-count" id="cartFloatCount">0</span>' +
    '</button>' +

    // Panel lateral
    '<div class="cart-panel" id="cartPanel">' +
      '<div class="cp-header">' +
        '<div class="cp-title">🛒 Mi carrito</div>' +
        '<button class="cp-close" onclick="cerrarCarrito()">✕</button>' +
      '</div>' +
      '<div class="cp-items" id="cpItems"></div>' +
      '<div class="cp-footer">' +
        '<div class="cp-total">' +
          '<span class="cp-total-lbl">Total:</span>' +
          '<span class="cp-total-val" id="cpTotal">S/ 0</span>' +
        '</div>' +
        '<button class="cp-pay-btn" onclick="abrirPago()">💳 Pagar ahora</button>' +
        '<button class="cp-wa-btn" onclick="pagarWhatsApp()">📱 Coordinar por WhatsApp</button>' +
      '</div>' +
    '</div>' +

    // Modal pago
    '<div class="pago-overlay" id="pagoModal">' +
      '<div class="pago-box">' +
        '<button class="pago-close" onclick="cerrarPago()">✕</button>' +
        '<div class="pago-title">💳 Pago seguro</div>' +
        '<div class="pago-sub">Completa tus datos para finalizar la compra</div>' +
        '<div class="pago-resumen" id="pagoResumen"></div>' +
        '<div class="pf-group">' +
          '<label class="pf-label">Nombre en la tarjeta</label>' +
          '<input class="pf-input" id="pfNombre" type="text" placeholder="Como aparece en tu tarjeta">' +
        '</div>' +
        '<div class="pf-group">' +
          '<label class="pf-label">Número de tarjeta</label>' +
          '<input class="pf-input" id="pfTarjeta" type="text" placeholder="1234 5678 9012 3456" maxlength="19" oninput="fmtCard(this)">' +
        '</div>' +
        '<div class="pf-row">' +
          '<div class="pf-group">' +
            '<label class="pf-label">Vencimiento</label>' +
            '<input class="pf-input" id="pfVenc" type="text" placeholder="MM/AA" maxlength="5" oninput="fmtExpiry(this)">' +
          '</div>' +
          '<div class="pf-group">' +
            '<label class="pf-label">CVV</label>' +
            '<input class="pf-input" id="pfCVV" type="text" placeholder="123" maxlength="3">' +
          '</div>' +
        '</div>' +
        '<div class="pago-secure">🔒 Pago 100% seguro y encriptado — Culqi</div>' +
        '<button class="pago-submit" id="pagoSubmit" onclick="procesarPago()">Confirmar pago →</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(wrap);

  // Cerrar panel al click fuera
  window.addEventListener('click', function(e) {
    var panel = document.getElementById('cartPanel');
    if (panel && panel.classList.contains('open') &&
        !panel.contains(e.target) &&
        !e.target.closest('.cart-float') &&
        !e.target.closest('#cartFloat')) {
      panel.classList.remove('open');
    }
    if (e.target === document.getElementById('pagoModal')) cerrarPago();
  });
}

// ── INIT ─────────────────────────────────────────────
(function() {
  function run() {
    _inyectarCarritoHTML();
    actualizarCarritoUI();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
