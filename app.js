const state = { module: '', schema: null, profile: 'analista', user: '' };
const $ = s => document.querySelector(s);

async function init() {
  state.schema = await fetch('data/matriz_campos.json?v=6').then(r => r.json());

  $('#loginBtn').onclick = login;
  $('#logoutBtn').onclick = () => location.reload();
  $('#saveBtn').onclick = saveCurrent;
  $('#exportBtn').onclick = exportCurrent;
  $('#clearBtn').onclick = clearCurrent;
  $('#newCaseBtn').onclick = newCurrent;
}

function login() {
  state.profile = $('#profileSelect').value || 'analista';
  state.user = $('#userInput').value.trim() || demoUserName(state.profile);
  const profile = window.SACE_PROFILES[state.profile];

  $('#loginView').classList.add('hidden');
  $('#appView').classList.remove('hidden');
  $('#activeProfileLabel').textContent = profile.label;
  $('#activeUserLabel').textContent = state.user;

  buildNav();
  selectModule(profile.modules[0]);
}

function buildNav() {
  const nav = $('#moduleNav');
  const profile = window.SACE_PROFILES[state.profile];
  const icons = {
    'Nueva Concurrencia': '＋', 'Mis Concurrencias': '◷', 'Concurrencias Pendientes': '▤',
    'Secuestro': '▣', 'Robos': '▣', 'Homicidios': '▣', 'Medio Ambiente': '▣', 'Drogas': '▣', 'Crimen Organizado': '▣',
    'Panel de Revisión': '▦', 'Consultas': '⌕', 'Reportes': '▥', 'Usuarios y Permisos': '⚙'
  };
  nav.innerHTML = '';
  profile.modules.forEach(m => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span>${icons[m] || '▣'}</span>${m}`;
    b.className = m === state.module ? 'active' : '';
    b.onclick = () => selectModule(m);
    nav.appendChild(b);
  });
}

function selectModule(moduleName) {
  state.module = moduleName;
  buildNav();
  $('#moduleTitle').textContent = moduleName;
  $('#contextEyebrow').textContent = window.SACE_PROFILES[state.profile].label;

  $('#dashboard').classList.add('hidden');
  $('#caseForm').classList.add('hidden');
  $('#caseForm').innerHTML = '';
  configureActions(moduleName);

  if (moduleName === 'Secuestro') return showSecuestro();
  if (moduleName === 'Nueva Concurrencia') return showNuevaConcurrencia();
  if (moduleName === 'Mis Concurrencias') return showConcurrencias('mis');
  if (moduleName === 'Concurrencias Pendientes') return showConcurrencias('pendientes');
  showPending(moduleName);
}

function configureActions(moduleName) {
  const formModules = ['Secuestro', 'Nueva Concurrencia'];
  const isForm = formModules.includes(moduleName);
  $('#actionBar').style.display = isForm ? 'flex' : 'none';
  $('#newCaseBtn').style.display = isForm ? 'inline-flex' : 'none';
  $('#saveBtn').style.display = isForm ? 'inline-flex' : 'none';
  $('#clearBtn').style.display = isForm ? 'inline-flex' : 'none';
  // Acción técnica: útil para desarrollo, no visible en el flujo normal.
  $('#exportBtn').style.display = state.profile === 'admin' && moduleName === 'Secuestro' ? 'inline-flex' : 'none';
}

function showSecuestro() {
  $('#moduleSubtitle').textContent = 'Formulario principal · Editable por analistas';
  const form = $('#caseForm');
  form.classList.remove('hidden');
  form.innerHTML = window.SACE_SECUestro.render(state.schema);
  window.SACE_SECUestro.bind(form);
}

function showNuevaConcurrencia() {
  $('#moduleSubtitle').textContent = 'Ingreso preliminar · Perfil Guardia';
  const form = $('#caseForm');
  form.classList.remove('hidden');
  form.innerHTML = window.SACE_CONCURRENCIAS.renderNueva();
  window.SACE_CONCURRENCIAS.bindNueva(form, flash);
}

function showConcurrencias(mode) {
  $('#moduleSubtitle').textContent = mode === 'mis' ? 'Registros ingresados por guardia' : 'Bandeja de revisión analista';
  const dash = $('#dashboard');
  dash.classList.remove('hidden');
  dash.innerHTML = window.SACE_CONCURRENCIAS.renderListado(mode);
  window.SACE_CONCURRENCIAS.bindListado(dash, id => {
    const item = window.SACE_CONCURRENCIAS.take(id);
    flash(item && item.delito === 'SECUESTRO' ? 'Concurrencia marcada como tomada para Secuestro.' : 'Concurrencia tomada.');
    showConcurrencias(mode);
  });
}

function showPending(moduleName) {
  $('#moduleSubtitle').textContent = 'Módulo reservado para etapa posterior';
  const dash = $('#dashboard');
  dash.classList.remove('hidden');
  dash.innerHTML = `<article class="empty-module"><h3>${moduleName}</h3><p>Este módulo quedó reservado para configurar su flujo, campos y permisos en una siguiente etapa.</p></article>`;
}

function saveCurrent() {
  const form = $('#caseForm');
  if (state.module === 'Secuestro') {
    window.SACE_SECUestro.save(form);
    flash('Registro de Secuestro guardado localmente.');
  } else if (state.module === 'Nueva Concurrencia') {
    const item = window.SACE_CONCURRENCIAS.saveNueva(form);
    flash(item.delito === 'SECUESTRO' ? 'Concurrencia guardada y disponible para analista en Secuestro.' : 'Concurrencia guardada.');
  }
}

function clearCurrent() {
  const form = $('#caseForm');
  if (!confirm('¿Limpiar los campos visibles?')) return;
  if (state.module === 'Secuestro') window.SACE_SECUestro.clear(form);
  else form.querySelectorAll('input, select, textarea').forEach(el => el.value = '');
  flash('Campos limpiados.');
}

function newCurrent() {
  if (state.module === 'Secuestro') {
    window.SACE_SECUestro.clear($('#caseForm'));
    flash('Nuevo registro de Secuestro listo.');
  } else if (state.module === 'Nueva Concurrencia') {
    $('#caseForm').querySelectorAll('input, textarea').forEach(el => el.value = '');
    const tipo = $('#caseForm').querySelector('[name="tipo_procedimiento"]');
    if (tipo) tipo.value = 'CONCURRENCIA';
    flash('Nueva concurrencia lista para ingresar.');
  }
}

function exportCurrent() {
  if (state.module !== 'Secuestro') return;
  const data = window.SACE_SECUestro.exportData($('#caseForm'));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `registro_secuestro_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function demoUserName(profile) {
  return { guardia: 'guardia.turno', analista: 'analista.os9', jefatura: 'jefatura.os9', admin: 'admin.sace' }[profile] || 'usuario.demo';
}

function flash(text) {
  const msg = document.createElement('div');
  msg.className = 'toast';
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2600);
}

document.addEventListener('DOMContentLoaded', init);
