const state = { module: 'Dashboard', schema: null };
const storageKey = 'os9_analisis_criminal_registros_v2';
const $ = s => document.querySelector(s);

async function init() {
  state.schema = await fetch('data/matriz_campos.json').then(r => r.json());
  buildNav();
  showDashboard();
  updateActionVisibility();

  $('#loginBtn').onclick = () => {
    $('#loginView').classList.add('hidden');
    $('#appView').classList.remove('hidden');
  };

  $('#logoutBtn').onclick = () => location.reload();
  $('#newCaseBtn').onclick = () => selectModule('Secuestro');
  $('#saveBtn').onclick = saveLocal;
  $('#exportBtn').onclick = exportJson;
  $('#clearBtn').onclick = clearForm;
}

function menuItems() {
  return ['Dashboard', ...state.schema.modules];
}

function buildNav() {
  const labels = {
    Dashboard: 'Dashboard',
    Secuestro: 'Secuestro',
    Robos: 'Robos',
    Homicidios: 'Homicidios',
    'Medio Ambiente': 'Medio Ambiente',
    Drogas: 'Drogas',
    'Crimen Organizado': 'Crimen Organizado'
  };

  const icons = {
    Dashboard: '📊',
    Secuestro: '🚨',
    Robos: '🏠',
    Homicidios: '🔎',
    'Medio Ambiente': '🌳',
    Drogas: '💊',
    'Crimen Organizado': '🕸️'
  };

  const nav = $('#moduleNav');
  nav.innerHTML = '';

  menuItems().forEach(m => {
    const b = document.createElement('button');
    b.innerHTML = `<span>${icons[m] || '•'}</span>${labels[m] || m}`;
    b.className = m === state.module ? 'active' : '';
    b.onclick = () => selectModule(m);
    nav.appendChild(b);
  });
}

function selectModule(m) {
  state.module = m;
  $('#moduleTitle').textContent = m;
  $('#moduleSubtitle').textContent = m === 'Dashboard'
    ? 'Panel general de registros y módulos'
    : 'Ingreso estructurado de información';
  buildNav();
  updateActionVisibility();

  if (m === 'Dashboard') showDashboard();
  else if (m === 'Secuestro') showForm();
  else showPlaceholder(m);
}

function updateActionVisibility() {
  const inForm = state.module === 'Secuestro';
  $('#saveBtn').style.display = inForm ? 'inline-block' : 'none';
  $('#exportBtn').style.display = inForm ? 'inline-block' : 'none';
  $('#clearBtn').style.display = inForm ? 'inline-block' : 'none';
  $('#newCaseBtn').style.display = state.module === 'Dashboard' ? 'inline-block' : 'none';
}

function getAll() {
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
}

function showDashboard() {
  $('#caseForm').classList.add('hidden');
  const dash = $('#dashboard');
  dash.classList.remove('hidden');

  const all = getAll();
  const last = all[all.length - 1];
  const today = new Date().toLocaleDateString('es-CL');

  dash.innerHTML = `
    <section class="dashboard-hero">
      <div>
        <p class="eyebrow">Departamento OS.9</p>
        <h3>Panel de Análisis Criminal</h3>
        <p>Resumen local de trabajo, módulos disponibles y últimos registros ingresados en este navegador.</p>
      </div>
      <button class="primary hero-action" onclick="selectModule('Secuestro')">Nuevo registro</button>
    </section>

    <section class="kpi-grid left-kpis">
      <article class="kpi"><span>Registros locales</span><strong>${all.length}</strong><small>Total guardado en este equipo</small></article>
      <article class="kpi"><span>Último guardado</span><strong>${last ? new Date(last.updatedAt).toLocaleDateString('es-CL') : '—'}</strong><small>${last ? new Date(last.updatedAt).toLocaleTimeString('es-CL') : 'Sin registros'}</small></article>
      <article class="kpi"><span>Módulo operativo</span><strong>Secuestro</strong><small>Formulario funcional</small></article>
      <article class="kpi"><span>Fecha sistema</span><strong>${today}</strong><small>Validación funcional</small></article>
    </section>

    <section class="dashboard-grid">
      <article class="panel">
        <h3>Módulos de análisis</h3>
        <div class="module-list">
          ${state.schema.modules.map(m => `
            <button class="module-row" onclick="selectModule('${m}')">
              <span>${m}</span>
              <small>${m === 'Secuestro' ? 'Disponible' : 'En preparación'}</small>
            </button>
          `).join('')}
        </div>
      </article>

      <article class="panel">
        <h3>Estado de avance</h3>
        <div class="bars">
          ${bar('Secuestro', 100, 100)}
          ${bar('Robos', 20, 100)}
          ${bar('Homicidios', 20, 100)}
          ${bar('Medio Ambiente', 20, 100)}
        </div>
      </article>
    </section>

    <article class="panel records-panel">
      <div class="panel-title-row">
        <div>
          <h3>Registros guardados</h3>
          <p class="form-hint">Listado local, alineado a la izquierda para revisión rápida. No corresponde a una base central.</p>
        </div>
      </div>
      ${recentTable(all)}
    </article>`;
}

function bar(name, value, max) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return `<div class="bar-row"><span>${name}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><strong>${pct}%</strong></div>`;
}

function recentTable(all) {
  if (!all.length) return '<div class="empty-records">Aún no existen registros guardados en este navegador.</div>';

  return `<div class="table-wrap"><table class="recent-table">
    <thead><tr><th>Fecha registro</th><th>Módulo</th><th>Tipo procedimiento</th><th>RUC</th><th>Fiscalía</th></tr></thead>
    <tbody>
      ${all.slice(-8).reverse().map(r => `
        <tr>
          <td>${new Date(r.updatedAt).toLocaleString('es-CL')}</td>
          <td>${r.module}</td>
          <td>${r.values['antecedentes-investigaci-n-tipo-procedimiento'] || '—'}</td>
          <td>${r.values['antecedentes-investigaci-n-ruc'] || '—'}</td>
          <td>${r.values['antecedentes-investigaci-n-fiscalia'] || '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table></div>`;
}

function showPlaceholder(m) {
  $('#caseForm').classList.add('hidden');
  const dash = $('#dashboard');
  dash.classList.remove('hidden');
  dash.innerHTML = `<article class="panel"><h3>${m}</h3><p class="form-hint">Módulo preparado para próxima etapa. La estructura se activará cuando se cargue la matriz correspondiente.</p></article>`;
}

function showForm() {
  $('#dashboard').classList.add('hidden');
  const form = $('#caseForm');
  form.classList.remove('hidden');

  form.innerHTML = `
    <div class="form-top-note">
      <strong>Registro Secuestro</strong>
      <span>Complete los campos según la matriz oficial. Los desplegables ya incorporan opciones base.</span>
    </div>
    ${state.schema.sections.map((sec, i) => `
      <details class="section" ${i === 1 ? 'open' : ''}>
        <summary><span class="summary-title">${sec.title}</span><span class="badge">${sec.fields.length} campos</span></summary>
        <div class="fields">${sec.fields.map(fieldHtml).join('')}</div>
      </details>
    `).join('')}`;

  form.querySelectorAll('details.section').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) form.querySelectorAll('details.section').forEach(o => { if (o !== d) o.open = false; });
  }));

  loadLocal();
}

function fieldHtml(f) {
  const full = f.type === 'textarea' ? ' full' : '';
  const required = ['RUC', 'N°FOLIO', 'FISCALIA', 'TIPO PROCEDIMIENTO'].includes(f.label) ? '<span class="required">*</span>' : '';

  if (f.type === 'textarea') {
    return `<div class="field${full}"><label>${f.label}${required}</label><textarea name="${f.id}"></textarea></div>`;
  }

  if (f.type === 'select' && Array.isArray(f.options)) {
    return `<div class="field${full}"><label>${f.label}${required}</label><select name="${f.id}">
      <option value="">Seleccione...</option>
      ${f.options.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}
    </select></div>`;
  }

  return `<div class="field${full}"><label>${f.label}${required}</label><input name="${f.id}" type="${f.type || 'text'}" /></div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function collect() {
  const data = { module: 'Secuestro', updatedAt: new Date().toISOString(), values: {} };
  document.querySelectorAll('#caseForm [name]').forEach(el => data.values[el.name] = el.value);
  return data;
}

function saveLocal() {
  const data = collect();
  const all = getAll();
  all.push(data);
  localStorage.setItem(storageKey, JSON.stringify(all));
  alert('Registro guardado localmente en este navegador.');
  selectModule('Dashboard');
}

function loadLocal() {
  const all = getAll();
  const last = all[all.length - 1];
  if (!last) return;
  document.querySelectorAll('#caseForm [name]').forEach(el => {
    if (last.values[el.name]) el.value = last.values[el.name];
  });
}

function exportJson() {
  const blob = new Blob([JSON.stringify(collect(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'registro_secuestro_os9.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function clearForm() {
  if (!confirm('¿Limpiar formulario actual?')) return;
  document.querySelectorAll('#caseForm [name]').forEach(el => el.value = '');
}

window.selectModule = selectModule;
init();
