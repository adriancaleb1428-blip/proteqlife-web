/**
 * nav.js — Navegación PROTEQLIFE v4 DEFINITIVA
 * ═══════════════════════════════════════════════
 * Incluir en TODAS las páginas excepto index.html:
 *   <script src="nav.js"></script>   (en el <head>)
 *
 * Características:
 * - Mega menú de Cursos: 3 áreas en vertical + cursos al lado
 * - Al hover sobre un área → aparecen sus cursos
 * - Click en curso → curso-detalle.html?slug=...
 * - Servicios: dropdown simple con link a servicio.html?s=...
 * - Responsive con hamburger
 */
(function () {

  // ── CSS ──────────────────────────────────────
  var CSS = `
/* ── NAV WRAPPER ── */
#mainNav { position:sticky; top:0; z-index:2000; }

/* Barra superior */
.nav-topbar { background:#05192D; padding:6px 0; }
.nav-topbar-inner {
  max-width:1120px; margin:0 auto; padding:0 24px;
  display:flex; gap:24px; justify-content:flex-end;
  font-size:11px; color:rgba(255,255,255,.6);
}

/* Barra principal */
.nav-bar {
  background:rgba(255,255,255,.97);
  backdrop-filter:blur(12px);
  border-bottom:1px solid #E8ECF0;
  box-shadow:0 1px 0 rgba(5,25,45,.04);
}
.nav-bar-inner {
  max-width:1120px; margin:0 auto; padding:0 24px;
  display:flex; align-items:center; justify-content:space-between; height:62px;
}

/* Logo */
.nav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
.nav-logo-box {
  width:38px; height:38px; background:#05192D; border-radius:8px;
  display:flex; align-items:center; justify-content:center;
}
.nav-logo-box span { font-family:'Syne',sans-serif; font-size:13px; font-weight:800; color:#fff; }
.nav-logo-name { font-family:'Syne',sans-serif; font-size:15px; font-weight:800; color:#05192D; }
.nav-logo-sub  { font-size:10px; color:#9BA3AD; margin-top:-2px; }

/* Links */
.nav-links { display:flex; gap:2px; align-items:center; }
.nav-lnk {
  font-size:13px; font-weight:500; color:#5A6472;
  padding:6px 11px; border-radius:6px; transition:all .15s;
  cursor:pointer; white-space:nowrap; text-decoration:none;
  display:inline-flex; align-items:center; gap:4px;
  background:none; border:none; font-family:inherit;
}
.nav-lnk:hover { background:#F5F7FA; color:#05192D; }
.nav-lnk.active { color:#1565C0; font-weight:600; }
.nav-caret { font-size:9px; opacity:.5; transition:transform .2s; }
.nav-aula-btn {
  background:#1565C0; color:#fff !important; padding:8px 16px !important;
  border-radius:10px; font-size:13px; font-weight:600 !important;
  margin-left:4px; transition:background .15s;
}
.nav-aula-btn:hover { background:#0C3254 !important; }

/* ── DROPDOWN WRAPPER ── */
.nav-dd { position:relative; display:inline-flex; align-items:center; }
.nav-panel {
  display:none; position:absolute; top:calc(100% + 8px);
  z-index:9999; left:0;
}
.nav-dd.open .nav-panel   { display:block; }
.nav-dd.open .nav-caret   { transform:rotate(180deg); }

/* ── MEGA MENU CURSOS (2 columnas) ── */
.mega-wrap {
  background:#fff; border:1px solid #E8ECF0; border-radius:16px;
  box-shadow:0 12px 48px rgba(5,25,45,.13);
  display:flex; overflow:hidden; min-width:500px;
}

/* Columna izquierda — 3 áreas */
.mega-areas {
  display:flex; flex-direction:column; gap:2px;
  background:#F5F7FA; border-right:1px solid #E8ECF0;
  padding:8px; min-width:210px;
}
.mega-area {
  display:flex; align-items:center; gap:10px;
  padding:11px 12px; border-radius:10px; cursor:default;
  border:1.5px solid transparent; transition:all .15s;
}
.mega-area:hover,
.mega-area.on {
  background:#fff; border-color:#E8ECF0;
  box-shadow:0 1px 4px rgba(5,25,45,.08);
}
.mega-area.on .mega-area-arrow { opacity:1; }
.mega-area-ic {
  width:34px; height:34px; border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  font-size:16px; flex-shrink:0;
}
.mega-area-title { font-size:12px; font-weight:700; color:#05192D; line-height:1.25; }
.mega-area-sub   { font-size:10px; color:#9BA3AD; margin-top:2px; }
.mega-area-arrow { font-size:11px; color:#9BA3AD; margin-left:auto; opacity:0; transition:opacity .15s; }

/* Columna derecha — lista de cursos */
.mega-cursos { display:none; flex-direction:column; padding:14px 16px; min-width:270px; }
.mega-cursos.on { display:flex; }
.mega-cursos-hd {
  display:flex; align-items:center; gap:8px;
  padding-bottom:10px; margin-bottom:4px;
  border-bottom:1px solid #E8ECF0;
}
.mega-cursos-hd-ic {
  width:26px; height:26px; border-radius:6px;
  display:flex; align-items:center; justify-content:center; font-size:13px;
}
.mega-cursos-hd-txt { font-size:12px; font-weight:700; color:#05192D; }
.mega-curso-lnk {
  display:flex; align-items:center; gap:8px;
  font-size:12px; color:#5A6472; padding:6px 8px; border-radius:6px;
  text-decoration:none; transition:all .15s;
}
.mega-curso-lnk::before {
  content:''; width:4px; height:4px; border-radius:50%;
  background:#D1D9E0; flex-shrink:0; transition:background .15s;
}
.mega-curso-lnk:hover { background:#F5F7FA; color:#05192D; }
.mega-curso-lnk:hover::before { background:#1565C0; }
.mega-ver-todos {
  display:flex; align-items:center; gap:6px;
  font-size:12px; font-weight:700; color:#1565C0;
  padding:8px 8px 4px; margin-top:4px;
  border-top:1px solid #E8ECF0; text-decoration:none;
  transition:all .15s;
}
.mega-ver-todos:hover { background:#E3F2FD; border-radius:6px; }

/* ── DROPDOWN SERVICIOS (simple) ── */
.drop-wrap {
  background:#fff; border:1px solid #E8ECF0; border-radius:16px;
  box-shadow:0 12px 48px rgba(5,25,45,.13); padding:8px; min-width:280px;
}
.drop-item {
  display:flex; align-items:center; gap:12px;
  padding:9px 10px; border-radius:8px; transition:all .15s;
  text-decoration:none; cursor:pointer;
}
.drop-item:hover { background:#F5F7FA; }
.drop-ic {
  width:32px; height:32px; border-radius:8px; background:#E3F2FD;
  display:flex; align-items:center; justify-content:center;
  font-size:14px; flex-shrink:0;
}
.drop-name { font-size:13px; font-weight:500; color:#05192D; }
.drop-sub  { font-size:11px; color:#9BA3AD; }

/* ── HAMBURGER ── */
.nav-ham {
  display:none; flex-direction:column; gap:5px;
  cursor:pointer; padding:6px; border:none; background:none; border-radius:6px;
}
.nav-ham span { display:block; width:22px; height:2px; background:#05192D; border-radius:2px; transition:all .3s; }
.nav-ham.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.nav-ham.open span:nth-child(2) { opacity:0; }
.nav-ham.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

/* ── MOBILE MENU ── */
.nav-mob { display:none; flex-direction:column; background:#fff; border-top:1px solid #E8ECF0; }
.nav-mob.open { display:flex; }
.mob-link {
  font-size:14px; font-weight:500; color:#5A6472;
  padding:12px 24px; border-bottom:1px solid #F5F7FA;
  display:block; text-decoration:none;
}
.mob-link:hover { background:#F5F7FA; }
.mob-aula { color:#1565C0 !important; font-weight:700; }
.mob-acc-hd {
  font-size:14px; font-weight:600; color:#05192D;
  padding:12px 24px; border-bottom:1px solid #F5F7FA;
  display:flex; justify-content:space-between; cursor:pointer;
}
.mob-acc-hd:hover { background:#F5F7FA; }
.mob-acc-body { display:none; padding:8px 24px 12px; background:#F5F7FA; }
.mob-acc.open .mob-acc-body { display:block; }
.mob-sec-lbl { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#9BA3AD; padding:8px 0 4px; }
.mob-sub { display:block; font-size:13px; color:#5A6472; padding:6px 0; border-bottom:1px solid #E8ECF0; text-decoration:none; }
.mob-sub:hover { color:#1565C0; }
.mob-sub.all  { color:#1565C0; font-weight:600; }

/* ── BREADCRUMB ── */
.bc-bar { background:#F5F7FA; padding:12px 0; border-bottom:1px solid #E8ECF0; }
.bc-inner {
  max-width:1120px; margin:0 auto; padding:0 24px;
  display:flex; align-items:center; gap:8px; font-size:12px; color:#9BA3AD;
}
.bc-inner a { color:#9BA3AD; text-decoration:none; transition:color .15s; }
.bc-inner a:hover { color:#1565C0; }
.bc-inner .bc-sep { opacity:.5; }
.bc-inner .bc-now { color:#05192D; font-weight:600; }

@media(max-width:900px){
  .nav-topbar { display:none; }
  .nav-links   { display:none !important; }
  .nav-ham     { display:flex; }
}
@media(max-width:600px){
  .mega-wrap { flex-direction:column; min-width:280px; }
  .mega-areas { border-right:none; border-bottom:1px solid #E8ECF0; }
}`;

  // ── HTML ─────────────────────────────────────
  var HTML = `
<nav id="mainNav">

  <!-- Barra superior -->
  <div class="nav-topbar">
    <div class="nav-topbar-inner">
      <span>📧 analista.procesos@proteqlife.com.pe</span>
      <span>📱 +51 950 950 304</span>
      <span>🕐 Lun–Vie: 8am–6pm</span>
    </div>
  </div>

  <!-- Barra principal -->
  <div class="nav-bar">
    <div class="nav-bar-inner">

      <!-- Logo -->
      <a href="index.html" class="nav-logo">
        <div class="nav-logo-box"><span>PQ</span></div>
        <div>
          <div class="nav-logo-name">PROTEQLIFE</div>
          <div class="nav-logo-sub">Consulting</div>
        </div>
      </a>

      <!-- Links desktop -->
      <div class="nav-links">
        <a href="index.html" class="nav-lnk" id="navLnkInicio">Inicio</a>

        <!-- CURSOS -->
        <div class="nav-dd" id="navDdCursos">
          <button class="nav-lnk" id="navTrigCursos">
            Cursos <span class="nav-caret">▾</span>
          </button>
          <div class="nav-panel" style="left:-20px">
            <div class="mega-wrap">

              <!-- Áreas (izquierda) -->
              <div class="mega-areas">
                <div class="mega-area on" data-area="sso" onmouseenter="navActivarArea('sso',this)">
                  <span class="mega-area-ic" style="background:#E3F2FD">🛡️</span>
                  <div>
                    <div class="mega-area-title">Seguridad Integral</div>
                    <div class="mega-area-sub">SST y prevención de riesgos</div>
                  </div>
                  <span class="mega-area-arrow">›</span>
                </div>
                <div class="mega-area" data-area="calidad" onmouseenter="navActivarArea('calidad',this)">
                  <span class="mega-area-ic" style="background:#FFF3EE">📊</span>
                  <div>
                    <div class="mega-area-title">Sist. Integrado de Gestión</div>
                    <div class="mega-area-sub">Calidad y Medio Ambiente</div>
                  </div>
                  <span class="mega-area-arrow">›</span>
                </div>
                <div class="mega-area" data-area="liderazgo" onmouseenter="navActivarArea('liderazgo',this)">
                  <span class="mega-area-ic" style="background:#FFFBEB">🎯</span>
                  <div>
                    <div class="mega-area-title">Desarrollo Empresarial</div>
                    <div class="mega-area-sub">& Liderazgo</div>
                  </div>
                  <span class="mega-area-arrow">›</span>
                </div>
              </div>

              <!-- Panel SSO -->
              <div class="mega-cursos on" id="navPanel-sso">
                <div class="mega-cursos-hd">
                  <span class="mega-cursos-hd-ic" style="background:#E3F2FD">🛡️</span>
                  <span class="mega-cursos-hd-txt">Seguridad Integral</span>
                </div>
                <a href="curso-detalle.html?slug=ley-29783"             class="mega-curso-lnk">Ley 29783 — SST</a>
                <a href="curso-detalle.html?slug=iperc"                  class="mega-curso-lnk">IPERC</a>
                <a href="curso-detalle.html?slug=gestion-accidentes"     class="mega-curso-lnk">Gestión de Accidentes</a>
                <a href="curso-detalle.html?slug=gestion-incidentes"     class="mega-curso-lnk">Gestión de Incidentes</a>
                <a href="curso-detalle.html?slug=comite-supervisor-sst"  class="mega-curso-lnk">Comité o Supervisor SST</a>
                <a href="curso-detalle.html?slug=ats"                    class="mega-curso-lnk">Análisis de Trabajo Seguro</a>
                <a href="curso-detalle.html?slug=investigacion-accidentes" class="mega-curso-lnk">Investigación de Accidentes</a>
                <a href="curso-detalle.html?slug=primeros-auxilios"      class="mega-curso-lnk">Primeros Auxilios</a>
                <a href="curso-detalle.html?slug=ergonomia"              class="mega-curso-lnk">Ergonomía Laboral</a>
                <a href="curso-detalle.html?slug=prevencion-burnout"     class="mega-curso-lnk">Prevención del Burnout</a>
                <a href="curso-detalle.html?slug=manejo-defensivo"       class="mega-curso-lnk">Manejo Defensivo</a>
                <a href="cursos-sso.html" class="mega-ver-todos">Ver todos los cursos →</a>
              </div>

              <!-- Panel Calidad -->
              <div class="mega-cursos" id="navPanel-calidad">
                <div class="mega-cursos-hd">
                  <span class="mega-cursos-hd-ic" style="background:#FFF3EE">📊</span>
                  <span class="mega-cursos-hd-txt">Sist. Integrado de Gestión</span>
                </div>
                <a href="curso-detalle.html?slug=tecnica-5s"        class="mega-curso-lnk">Técnica de las 5S</a>
                <a href="curso-detalle.html?slug=ciclo-deming"       class="mega-curso-lnk">Ciclo de Deming (PHVA)</a>
                <a href="curso-detalle.html?slug=cantidad-vs-calidad" class="mega-curso-lnk">Cantidad vs Calidad</a>
                <a href="curso-detalle.html?slug=iso-9001"           class="mega-curso-lnk">ISO 9001:2015</a>
                <a href="curso-detalle.html?slug=auditorias-internas" class="mega-curso-lnk">Auditorías Internas</a>
                <a href="curso-detalle.html?slug=gestion-ambiental"  class="mega-curso-lnk">Gestión Ambiental ISO 14001</a>
                <a href="curso-detalle.html?slug=kpi-calidad"        class="mega-curso-lnk">Indicadores KPI de Calidad</a>
                <a href="curso-detalle.html?slug=atencion-cliente"   class="mega-curso-lnk">Atención al Cliente</a>
                <a href="curso-detalle.html?slug=trabajo-equipo"     class="mega-curso-lnk">Trabajo en Equipo</a>
                <a href="cursos-calidad.html" class="mega-ver-todos">Ver todos los cursos →</a>
              </div>

              <!-- Panel Liderazgo -->
              <div class="mega-cursos" id="navPanel-liderazgo">
                <div class="mega-cursos-hd">
                  <span class="mega-cursos-hd-ic" style="background:#FFFBEB">🎯</span>
                  <span class="mega-cursos-hd-txt">Desarrollo Empresarial & Liderazgo</span>
                </div>
                <a href="curso-detalle.html?slug=ia-fundamentos"      class="mega-curso-lnk">Fundamentos de IA</a>
                <a href="curso-detalle.html?slug=chatgpt-productividad" class="mega-curso-lnk">ChatGPT y herramientas IA</a>
                <a href="curso-detalle.html?slug=marketing-digital"    class="mega-curso-lnk">Marketing Digital y Ventas</a>
                <a href="curso-detalle.html?slug=startup-emprendimiento" class="mega-curso-lnk">StartUp y Emprendimiento</a>
                <a href="curso-detalle.html?slug=talento-humano"       class="mega-curso-lnk">Talento Humano</a>
                <a href="curso-detalle.html?slug=habilidades-blandas"  class="mega-curso-lnk">Habilidades Blandas</a>
                <a href="curso-detalle.html?slug=liderazgo-situacional" class="mega-curso-lnk">Liderazgo Situacional</a>
                <a href="curso-detalle.html?slug=marco-legal"          class="mega-curso-lnk">Marco Legal Empresarial</a>
                <a href="curso-detalle.html?slug=tributacion-basica"   class="mega-curso-lnk">Tributación Básica</a>
                <a href="cursos-liderazgo.html" class="mega-ver-todos">Ver todos los cursos →</a>
              </div>

            </div>
          </div>
        </div><!-- /navDdCursos -->

        <!-- SERVICIOS -->
        <div class="nav-dd" id="navDdServicios">
          <button class="nav-lnk" id="navTrigServicios">
            Servicios <span class="nav-caret">▾</span>
          </button>
          <div class="nav-panel">
            <div class="drop-wrap">
              <a href="servicio.html?s=homologaciones"  class="drop-item"><span class="drop-ic">✅</span><div><div class="drop-name">Homologaciones</div><div class="drop-sub">Proveedores y contratistas</div></div></a>
              <a href="servicio.html?s=gestion-sst"     class="drop-item"><span class="drop-ic">🔄</span><div><div class="drop-name">Actualización Gestión SST</div><div class="drop-sub">Sistema al día</div></div></a>
              <a href="servicio.html?s=iso9001"          class="drop-item"><span class="drop-ic">🏆</span><div><div class="drop-name">Certificación ISO 9001</div><div class="drop-sub">Acompañamiento completo</div></div></a>
              <a href="servicio.html?s=asesoria-sst"    class="drop-item"><span class="drop-ic">📋</span><div><div class="drop-name">Asesoría de SST</div><div class="drop-sub">Consultoría especializada</div></div></a>
              <a href="servicio.html?s=seguimiento-sst" class="drop-item"><span class="drop-ic">🏠</span><div><div class="drop-name">Seguimiento SST In House</div><div class="drop-sub">Gestión en tu empresa</div></div></a>
              <a href="servicio.html?s=auditorias"      class="drop-item"><span class="drop-ic">🔍</span><div><div class="drop-name">Auditorías Internas</div><div class="drop-sub">Evaluación y mejora</div></div></a>
            </div>
          </div>
        </div><!-- /navDdServicios -->

        <a href="index.html#contacto" class="nav-lnk">Contáctanos</a>
        <a href="aula-virtual.html"   class="nav-lnk nav-aula-btn">🎓 Aula Virtual</a>
      </div><!-- /nav-links -->

      <!-- Hamburger -->
      <button class="nav-ham" id="navHam" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div><!-- /nav-bar -->

  <!-- Menú móvil -->
  <div class="nav-mob" id="navMob">
    <a href="index.html" class="mob-link">🏠 Inicio</a>

    <div class="mob-acc" id="mobAccCursos">
      <div class="mob-acc-hd">📚 Cursos <span>▾</span></div>
      <div class="mob-acc-body">
        <div class="mob-sec-lbl">🛡️ Seguridad Integral</div>
        <a href="curso-detalle.html?slug=ley-29783"  class="mob-sub">Ley 29783 — SST</a>
        <a href="curso-detalle.html?slug=iperc"       class="mob-sub">IPERC</a>
        <a href="curso-detalle.html?slug=primeros-auxilios" class="mob-sub">Primeros Auxilios</a>
        <a href="cursos-sso.html" class="mob-sub all">Ver todos →</a>

        <div class="mob-sec-lbl" style="margin-top:8px">📊 Sist. Integrado de Gestión</div>
        <a href="curso-detalle.html?slug=tecnica-5s" class="mob-sub">Técnica de las 5S</a>
        <a href="curso-detalle.html?slug=iso-9001"   class="mob-sub">ISO 9001:2015</a>
        <a href="cursos-calidad.html" class="mob-sub all">Ver todos →</a>

        <div class="mob-sec-lbl" style="margin-top:8px">🎯 Desarrollo Empresarial</div>
        <a href="curso-detalle.html?slug=ia-fundamentos"     class="mob-sub">Fundamentos de IA</a>
        <a href="curso-detalle.html?slug=startup-emprendimiento" class="mob-sub">StartUp y Emprendimiento</a>
        <a href="cursos-liderazgo.html" class="mob-sub all">Ver todos →</a>
      </div>
    </div>

    <div class="mob-acc" id="mobAccServicios">
      <div class="mob-acc-hd">🔧 Servicios <span>▾</span></div>
      <div class="mob-acc-body">
        <a href="servicio.html?s=homologaciones"  class="mob-sub">Homologaciones</a>
        <a href="servicio.html?s=gestion-sst"     class="mob-sub">Actualización SST</a>
        <a href="servicio.html?s=iso9001"          class="mob-sub">Certificación ISO 9001</a>
        <a href="servicio.html?s=asesoria-sst"    class="mob-sub">Asesoría de SST</a>
        <a href="servicio.html?s=seguimiento-sst" class="mob-sub">Seguimiento In House</a>
        <a href="servicio.html?s=auditorias"      class="mob-sub">Auditorías Internas</a>
      </div>
    </div>

    <a href="index.html#contacto" class="mob-link">📩 Contáctanos</a>
    <a href="aula-virtual.html"   class="mob-link mob-aula">🎓 Aula Virtual</a>
  </div>

</nav>`;

  // ── INYECTAR ─────────────────────────────────
  var s = document.createElement('style');
  s.id  = 'navCSS';
  s.textContent = CSS;
  document.head.insertBefore(s, document.head.firstChild);
  document.body.insertAdjacentHTML('afterbegin', HTML);

  // ── MARCAR PÁGINA ACTIVA ──────────────────────
  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var map  = {
    'index.html':           'navLnkInicio',
    'cursos-sso.html':      'navDdCursos',
    'cursos-calidad.html':  'navDdCursos',
    'cursos-liderazgo.html':'navDdCursos',
    'curso-detalle.html':   'navDdCursos',
    'servicio.html':        'navDdServicios',
    'aula-virtual.html':    null
  };
  var activeId = map[page];
  if (activeId) {
    var el = document.getElementById(activeId);
    if (el) el.querySelector('.nav-lnk, a') && (el.querySelector('.nav-lnk, a') || el).classList.add('active');
  }

  // ── DROPDOWN CON DELAY ────────────────────────
  var _t = {};

  function _open(id) {
    clearTimeout(_t[id]);
    ['navDdCursos','navDdServicios'].forEach(function(d) {
      if (d !== id) { var e = document.getElementById(d); if (e) e.classList.remove('open'); }
    });
    var el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function _close(id) {
    _t[id] = setTimeout(function() {
      var el = document.getElementById(id);
      if (el) el.classList.remove('open');
    }, 180);
  }

  function _cancel(id) { clearTimeout(_t[id]); }

  ['navDdCursos','navDdServicios'].forEach(function(id) {
    var dd    = document.getElementById(id);
    var trig  = dd ? dd.querySelector('button.nav-lnk') : null;
    var panel = dd ? dd.querySelector('.nav-panel') : null;
    if (!dd || !trig) return;

    trig.addEventListener('mouseenter', function() { _open(id); });
    trig.addEventListener('mouseleave', function() { _close(id); });
    if (panel) {
      panel.addEventListener('mouseenter', function() { _cancel(id); });
      panel.addEventListener('mouseleave', function() { _close(id); });
    }
    trig.addEventListener('click', function(e) {
      e.stopPropagation();
      dd.classList.toggle('open');
    });
  });

  // Cerrar al click fuera
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#navDdCursos'))   { var el = document.getElementById('navDdCursos');   if (el) el.classList.remove('open'); }
    if (!e.target.closest('#navDdServicios')){ var el = document.getElementById('navDdServicios'); if (el) el.classList.remove('open'); }
  });

  // ── HAMBURGER ────────────────────────────────
  var ham = document.getElementById('navHam');
  var mob = document.getElementById('navMob');
  if (ham && mob) {
    ham.addEventListener('click', function() {
      mob.classList.toggle('open');
      ham.classList.toggle('open');
    });
  }

  // ── ACORDEÓN MÓVIL ───────────────────────────
  ['mobAccCursos','mobAccServicios'].forEach(function(id) {
    var acc = document.getElementById(id);
    if (!acc) return;
    var hd    = acc.querySelector('.mob-acc-hd');
    var body  = acc.querySelector('.mob-acc-body');
    var caret = hd ? hd.querySelector('span') : null;
    if (hd) {
      hd.addEventListener('click', function() {
        acc.classList.toggle('open');
        if (caret) caret.textContent = acc.classList.contains('open') ? '▴' : '▾';
      });
    }
  });

})();

// ── FUNCIÓN GLOBAL para activar área en mega menu ──
function navActivarArea(area, btn) {
  document.querySelectorAll('.mega-area').forEach(function(b) { b.classList.remove('on'); });
  document.querySelectorAll('.mega-cursos').forEach(function(p) { p.classList.remove('on'); });
  btn.classList.add('on');
  var panel = document.getElementById('navPanel-' + area);
  if (panel) panel.classList.add('on');
}
