/**
 * nav.js — Navegación compartida PROTEQLIFE
 * CORRECCIONES v2:
 * - Nombres correctos: "Seguridad Integral", "Sist. Integrado de Gestión", "Desarrollo Empresarial"
 * - Aula Virtual → aula-virtual.html (NO contacto)
 * - Dropdown no se cierra al pasar al menú
 * - Click en curso → curso-detalle.html?slug=...
 */
(function () {

  // ── Inyectar HTML del nav ─────────────────────
  var NAV_HTML = `
<nav id="mainNav">
  <div class="nav-top-bar">
    <div class="container">
      <div class="nav-top-inner">
        <span>📧 informes@proteqlife.com</span>
        <span>📱 +51 999 000 000</span>
        <span>🕐 Lun–Vie 8am–6pm</span>
      </div>
    </div>
  </div>
  <div class="nav-main">
    <div class="container">
      <div class="nav-inner">

        <a href="index.html" class="nav-logo">
          <div class="logo-box"><span>PQ</span></div>
          <div>
            <div class="logo-name">PROTEQLIFE</div>
            <div class="logo-tagline">Consulting</div>
          </div>
        </a>

        <div class="nav-links" id="navLinks">
          <a href="index.html" class="nav-item" id="navInicio">Inicio</a>

          <!-- CURSOS DROPDOWN -->
          <div class="nav-dd-wrap" id="ddCursos">
            <span class="nav-item nav-dd-trigger">
              Cursos <span class="dd-caret">▾</span>
            </span>
            <div class="nav-mega" id="megaCursos">
              <div class="mega-inner">

                <div class="mega-col">
                  <a href="cursos-sso.html" class="mega-col-hd">
                    <span class="mega-col-ic" style="background:#E3F2FD">🛡️</span>
                    <div>
                      <div class="mega-col-title">Seguridad Integral</div>
                      <div class="mega-col-sub">SST y prevención de riesgos</div>
                    </div>
                  </a>
                  <a href="cursos-sso.html?f=ley-29783"   class="mega-link">Ley 29783 — SST</a>
                  <a href="cursos-sso.html?f=iperc"       class="mega-link">IPERC</a>
                  <a href="cursos-sso.html?f=alto-riesgo" class="mega-link">Trabajos de Alto Riesgo</a>
                  <a href="cursos-sso.html?f=primeros"    class="mega-link">Primeros Auxilios</a>
                  <a href="cursos-sso.html" class="mega-link mega-link-all">Ver todos los cursos →</a>
                </div>

                <div class="mega-sep"></div>

                <div class="mega-col">
                  <a href="cursos-calidad.html" class="mega-col-hd">
                    <span class="mega-col-ic" style="background:#FFF3EE">📊</span>
                    <div>
                      <div class="mega-col-title">Sist. Integrado de Gestión</div>
                      <div class="mega-col-sub">Calidad y Medio Ambiente</div>
                    </div>
                  </a>
                  <a href="cursos-calidad.html?f=5s"     class="mega-link">Técnica de las 5S</a>
                  <a href="cursos-calidad.html?f=iso9001" class="mega-link">ISO 9001:2015</a>
                  <a href="cursos-calidad.html?f=audit"  class="mega-link">Auditorías internas</a>
                  <a href="cursos-calidad.html?f=ambiental" class="mega-link">Gestión Ambiental</a>
                  <a href="cursos-calidad.html" class="mega-link mega-link-all">Ver todos los cursos →</a>
                </div>

                <div class="mega-sep"></div>

                <div class="mega-col">
                  <a href="cursos-liderazgo.html" class="mega-col-hd">
                    <span class="mega-col-ic" style="background:#FFFBEB">🎯</span>
                    <div>
                      <div class="mega-col-title">Desarrollo Empresarial</div>
                      <div class="mega-col-sub">& Liderazgo</div>
                    </div>
                  </a>
                  <a href="cursos-liderazgo.html?f=ia"        class="mega-link">Inteligencia Artificial</a>
                  <a href="cursos-liderazgo.html?f=marketing"  class="mega-link">Marketing Digital</a>
                  <a href="cursos-liderazgo.html?f=startup"   class="mega-link">StartUp y Emprendimiento</a>
                  <a href="cursos-liderazgo.html?f=talento"   class="mega-link">Talento Humano</a>
                  <a href="cursos-liderazgo.html" class="mega-link mega-link-all">Ver todos los cursos →</a>
                </div>

              </div>
            </div>
          </div><!-- /ddCursos -->

          <!-- SERVICIOS DROPDOWN -->
          <div class="nav-dd-wrap" id="ddServicios">
            <span class="nav-item nav-dd-trigger">
              Servicios <span class="dd-caret">▾</span>
            </span>
            <div class="nav-drop" id="dropServicios">
              <div class="drop-inner">
                <a href="index.html#servicios" class="drop-item">
                  <span class="drop-ic">✅</span>
                  <div><div class="drop-name">Homologaciones</div><div class="drop-sub">Proveedores y contratistas</div></div>
                </a>
                <a href="index.html#servicios" class="drop-item">
                  <span class="drop-ic">🔄</span>
                  <div><div class="drop-name">Actualización Gestión SST</div><div class="drop-sub">Sistema al día</div></div>
                </a>
                <a href="index.html#servicios" class="drop-item">
                  <span class="drop-ic">🏆</span>
                  <div><div class="drop-name">Certificación ISO 9001</div><div class="drop-sub">Acompañamiento completo</div></div>
                </a>
                <a href="index.html#servicios" class="drop-item">
                  <span class="drop-ic">📋</span>
                  <div><div class="drop-name">Asesoría de SST</div><div class="drop-sub">Consultoría especializada</div></div>
                </a>
                <a href="index.html#servicios" class="drop-item">
                  <span class="drop-ic">🏠</span>
                  <div><div class="drop-name">Seguimiento SST In House</div><div class="drop-sub">Gestión en tu empresa</div></div>
                </a>
                <a href="index.html#servicios" class="drop-item">
                  <span class="drop-ic">🔍</span>
                  <div><div class="drop-name">Auditorías Internas</div><div class="drop-sub">Evaluación y mejora</div></div>
                </a>
              </div>
            </div>
          </div><!-- /ddServicios -->

          <a href="index.html#contacto" class="nav-item">Contáctanos</a>
          <a href="aula-virtual.html"   class="nav-aula" id="navAulaBtn">🎓 Aula Virtual</a>
        </div><!-- /nav-links -->

        <button class="nav-hamburger" id="navHamburger" onclick="navToggleMobile()" aria-label="Menú">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </div><!-- /nav-main -->

  <!-- MENÚ MÓVIL -->
  <div class="nav-mobile" id="navMobile">
    <a href="index.html" class="mob-link">🏠 Inicio</a>
    <div class="mob-acc" id="mobCursos">
      <div class="mob-acc-hd" onclick="navToggleAcc('mobCursos')">📚 Cursos <span class="mob-caret">▾</span></div>
      <div class="mob-acc-body">
        <div class="mob-sec-label">🛡️ Seguridad Integral</div>
        <a href="cursos-sso.html" class="mob-sub">Ver todos los cursos de SST →</a>
        <div class="mob-sec-label" style="margin-top:8px">📊 Sist. Integrado de Gestión</div>
        <a href="cursos-calidad.html" class="mob-sub">Ver todos los cursos →</a>
        <div class="mob-sec-label" style="margin-top:8px">🎯 Desarrollo Empresarial & Liderazgo</div>
        <a href="cursos-liderazgo.html" class="mob-sub">Ver todos los cursos →</a>
      </div>
    </div>
    <div class="mob-acc" id="mobServicios">
      <div class="mob-acc-hd" onclick="navToggleAcc('mobServicios')">🔧 Servicios <span class="mob-caret">▾</span></div>
      <div class="mob-acc-body">
        <a href="index.html#servicios" class="mob-sub">Homologaciones</a>
        <a href="index.html#servicios" class="mob-sub">Actualización SST</a>
        <a href="index.html#servicios" class="mob-sub">Certificación ISO 9001</a>
        <a href="index.html#servicios" class="mob-sub">Asesoría SST</a>
        <a href="index.html#servicios" class="mob-sub">Seguimiento In House</a>
        <a href="index.html#servicios" class="mob-sub">Auditorías Internas</a>
      </div>
    </div>
    <a href="index.html#contacto" class="mob-link">📩 Contáctanos</a>
    <a href="aula-virtual.html"   class="mob-link mob-aula">🎓 Aula Virtual</a>
  </div><!-- /nav-mobile -->

</nav>`;

  // ── Inyectar CSS ──────────────────────────────
  var CSS = `
#mainNav { position:sticky; top:0; z-index:1000; }
.nav-top-bar { background:#05192D; padding:6px 0; }
.nav-top-inner { display:flex; gap:24px; align-items:center; justify-content:flex-end; font-size:11px; color:rgba(255,255,255,.6); }
.nav-main { background:rgba(255,255,255,.97); backdrop-filter:blur(12px); border-bottom:1px solid #E8ECF0; }
.nav-inner { display:flex; align-items:center; justify-content:space-between; height:60px; }
.nav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
.logo-box { width:36px; height:36px; background:#05192D; border-radius:8px; display:flex; align-items:center; justify-content:center; }
.logo-box span { font-family:'Syne',sans-serif; font-size:12px; font-weight:800; color:#fff; letter-spacing:-.5px; }
.logo-name { font-family:'Syne',sans-serif; font-size:15px; font-weight:800; color:#05192D; }
.logo-tagline { font-size:10px; color:#9BA3AD; margin-top:-2px; }
.nav-links { display:flex; gap:2px; align-items:center; }
.nav-item { font-size:13px; font-weight:500; color:#5A6472; padding:6px 11px; border-radius:6px; transition:all .15s; cursor:pointer; white-space:nowrap; text-decoration:none; display:inline-flex; align-items:center; gap:4px; }
.nav-item:hover { background:#F5F7FA; color:#05192D; }
.nav-item.nav-active { color:#1565C0; font-weight:600; }
.dd-caret { font-size:9px; opacity:.5; transition:transform .2s; }
.nav-aula { background:#1565C0; color:#fff!important; padding:8px 16px!important; border-radius:10px; font-size:13px; font-weight:600; white-space:nowrap; transition:background .15s; margin-left:4px; text-decoration:none; }
.nav-aula:hover { background:#0C3254!important; color:#fff!important; }

/* Dropdown wrapper */
.nav-dd-wrap { position:relative; display:inline-flex; align-items:center; }
.nav-mega, .nav-drop { display:none; position:absolute; top:100%; padding-top:8px; z-index:9999; }
.nav-mega { left:-100px; width:680px; }
.nav-drop { left:0; min-width:280px; }
.nav-dd-wrap.dd-open .nav-mega,
.nav-dd-wrap.dd-open .nav-drop { display:block; }
.nav-dd-wrap.dd-open .dd-caret { transform:rotate(180deg); }

/* Mega menu */
.mega-inner { background:#fff; border:1px solid #E8ECF0; border-radius:16px; box-shadow:0 12px 40px rgba(5,25,45,.14); display:grid; grid-template-columns:1fr 1px 1fr 1px 1fr; padding:20px; }
.mega-sep { background:#E8ECF0; width:1px; margin:0 16px; }
.mega-col { display:flex; flex-direction:column; gap:2px; }
.mega-col-hd { display:flex; align-items:center; gap:10px; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #E8ECF0; text-decoration:none; border-radius:8px; padding:8px; }
.mega-col-hd:hover { background:#F5F7FA; }
.mega-col-ic { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.mega-col-title { font-size:12px; font-weight:700; color:#05192D; line-height:1.3; }
.mega-col-sub { font-size:10px; color:#9BA3AD; }
.mega-link { font-size:12px; color:#5A6472; padding:6px 8px; border-radius:6px; transition:all .15s; text-decoration:none; }
.mega-link:hover { background:#F5F7FA; color:#05192D; }
.mega-link-all { color:#1565C0!important; font-weight:600; margin-top:6px; padding-top:8px; border-top:1px solid #E8ECF0; }
.mega-link-all:hover { background:#E3F2FD!important; }

/* Simple dropdown */
.drop-inner { background:#fff; border:1px solid #E8ECF0; border-radius:16px; box-shadow:0 12px 40px rgba(5,25,45,.14); padding:8px; min-width:280px; }
.drop-item { display:flex; align-items:center; gap:12px; padding:9px 10px; border-radius:8px; transition:all .15s; text-decoration:none; }
.drop-item:hover { background:#F5F7FA; }
.drop-ic { width:32px; height:32px; border-radius:8px; background:#E3F2FD; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; line-height:1; }
.drop-name { font-size:13px; font-weight:500; color:#05192D; }
.drop-sub { font-size:11px; color:#9BA3AD; }

/* Hamburger */
.nav-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; padding:6px; border:none; background:none; border-radius:6px; }
.nav-hamburger span { display:block; width:22px; height:2px; background:#05192D; border-radius:2px; transition:all .3s; }
.nav-hamburger.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.nav-hamburger.open span:nth-child(2) { opacity:0; }
.nav-hamburger.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

/* Mobile menu */
.nav-mobile { display:none; flex-direction:column; background:#fff; border-top:1px solid #E8ECF0; }
.nav-mobile.open { display:flex; }
.mob-link { font-size:14px; font-weight:500; color:#5A6472; padding:13px 24px; border-bottom:1px solid #F5F7FA; display:block; text-decoration:none; }
.mob-link:hover { background:#F5F7FA; }
.mob-aula { color:#1565C0!important; font-weight:700; }
.mob-acc-hd { font-size:14px; font-weight:600; color:#05192D; padding:13px 24px; border-bottom:1px solid #F5F7FA; display:flex; justify-content:space-between; cursor:pointer; }
.mob-acc-hd:hover { background:#F5F7FA; }
.mob-acc-body { display:none; padding:8px 24px 12px; background:#F5F7FA; }
.mob-acc.open .mob-acc-body { display:block; }
.mob-sec-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#9BA3AD; padding:8px 0 4px; }
.mob-sub { display:block; font-size:13px; color:#5A6472; padding:6px 0; border-bottom:1px solid #E8ECF0; text-decoration:none; }
.mob-sub:hover { color:#1565C0; }

/* Breadcrumb */
.breadcrumb { background:#F5F7FA; padding:12px 0; border-bottom:1px solid #E8ECF0; }
.breadcrumb-inner { display:flex; align-items:center; gap:8px; font-size:12px; color:#9BA3AD; }
.breadcrumb-inner a { color:#9BA3AD; transition:color .15s; text-decoration:none; }
.breadcrumb-inner a:hover { color:#1565C0; }
.bc-sep { color:#9BA3AD; }
.bc-current { color:#05192D!important; font-weight:600; }

@media(max-width:900px) {
  .nav-top-bar { display:none; }
  .nav-links { display:none!important; }
  .nav-hamburger { display:flex; }
}
@media(max-width:600px) {
  .mega-inner { grid-template-columns:1fr; }
  .mega-sep { display:none; }
}`;

  // ── Insertar en el DOM ────────────────────────
  var styleEl = document.createElement('style');
  styleEl.id  = 'navCSS';
  styleEl.textContent = CSS;
  document.head.insertBefore(styleEl, document.head.firstChild);

  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

  // ── Marcar página activa ──────────────────────
  var page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html' || page === '')
    document.getElementById('navInicio')?.classList.add('nav-active');

  // ── Dropdown hover con delay ──────────────────
  var ddTimers = {};

  function ddOpen(id) {
    clearTimeout(ddTimers[id]);
    document.querySelectorAll('.nav-dd-wrap.dd-open').forEach(function(el) {
      if (el.id !== id) el.classList.remove('dd-open');
    });
    document.getElementById(id)?.classList.add('dd-open');
  }

  function ddScheduleClose(id) {
    ddTimers[id] = setTimeout(function() {
      document.getElementById(id)?.classList.remove('dd-open');
    }, 180);
  }

  function ddCancelClose(id) { clearTimeout(ddTimers[id]); }

  ['ddCursos', 'ddServicios'].forEach(function(id) {
    var wrap = document.getElementById(id);
    if (!wrap) return;

    var trigger = wrap.querySelector('.nav-dd-trigger');
    var panel   = wrap.querySelector('.nav-mega, .nav-drop');

    trigger?.addEventListener('mouseenter', function() { ddOpen(id); });
    trigger?.addEventListener('mouseleave', function() { ddScheduleClose(id); });
    panel?.addEventListener('mouseenter',   function() { ddCancelClose(id); });
    panel?.addEventListener('mouseleave',   function() { ddScheduleClose(id); });

    // Click para móvil
    trigger?.addEventListener('click', function(e) {
      e.preventDefault();
      wrap.classList.toggle('dd-open');
    });
  });

  // Cerrar al hacer click fuera
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dd-wrap')) {
      document.querySelectorAll('.nav-dd-wrap.dd-open').forEach(function(el) {
        el.classList.remove('dd-open');
      });
    }
  });

})(); // fin IIFE

// ── FUNCIONES GLOBALES (accesibles desde HTML) ─
function navToggleMobile() {
  var menu = document.getElementById('navMobile');
  var btn  = document.getElementById('navHamburger');
  menu?.classList.toggle('open');
  btn?.classList.toggle('open');
}

function navToggleAcc(id) {
  var el = document.getElementById(id);
  el?.classList.toggle('open');
  var caret = el?.querySelector('.mob-caret');
  if (caret) caret.textContent = el.classList.contains('open') ? '▴' : '▾';
}
