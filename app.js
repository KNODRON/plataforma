const state = { module: 'Secuestro', schema: null };
const storageKey = 'os9_sace_secuestro_borrador_v5';
const $ = s => document.querySelector(s);

async function init() {
  state.schema = await fetch('data/matriz_campos.json?v=5').then(r => r.json());

  $('#loginBtn').onclick = () => {
    $('#loginView').classList.add('hidden');
    $('#appView').classList.remove('hidden');
    selectModule('Secuestro');
  };

  $('#logoutBtn').onclick = () => location.reload();
  $('#saveBtn').onclick = saveDraft;
  $('#exportBtn').onclick = exportJson;
  $('#clearBtn').onclick = clearForm;
  $('#newCaseBtn').onclick = () => {
    clearForm(false);
    selectModule('Secuestro');
  };

  buildNav();
}

function menuItems() {
  return ['Secuestro', 'Robos', 'Homicidios', 'Medio Ambiente', 'Drogas', 'Crimen Organizado'];
}

function buildNav() {
  const icons = {
    Secuestro: '▣', Robos: '▣', Homicidios: '▣', 'Medio Ambiente': '▣', Drogas: '▣', 'Crimen Organizado': '▣'
  };
  const nav = $('#moduleNav');
  nav.innerHTML = '';
  menuItems().forEach(m => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span>${icons[m]}</span>${m}`;
    b.className = m === state.module ? 'active' : '';
    b.onclick = () => selectModule(m);
    nav.appendChild(b);
  });
}

function selectModule(moduleName) {
  state.module = moduleName;
  buildNav();
  $('#moduleTitle').textContent = moduleName;
  $('#moduleSubtitle').textContent = moduleName === 'Secuestro'
    ? 'Nuevo registro · Formulario de ingreso'
    : 'Módulo pendiente de configuración';

  const isSecuestro = moduleName === 'Secuestro';
  $('#saveBtn').style.display = isSecuestro ? 'inline-flex' : 'none';
  $('#exportBtn').style.display = isSecuestro ? 'inline-flex' : 'none';
  $('#clearBtn').style.display = isSecuestro ? 'inline-flex' : 'none';
  $('#newCaseBtn').style.display = isSecuestro ? 'inline-flex' : 'none';

  if (isSecuestro) showForm();
  else showPending(moduleName);
}

function showPending(moduleName) {
  $('#caseForm').classList.add('hidden');
  const dash = $('#dashboard');
  dash.classList.remove('hidden');
  dash.innerHTML = `
    <article class="empty-module">
      <h3>${moduleName}</h3>
      <p>Este módulo quedó reservado para cargar posteriormente su matriz de campos.</p>
    </article>`;
}

function showForm() {
  $('#dashboard').classList.add('hidden');
  const form = $('#caseForm');
  form.classList.remove('hidden');
  form.innerHTML = `
    <div class="work-header">
      <div>
        <p class="eyebrow">Departamento OS.9</p>
        <h3>Registro de Secuestro</h3>
        <p>Complete los campos disponibles. La información queda preparada para guardar localmente o exportar.</p>
      </div>
      <div class="status-pill">Formulario funcional</div>
    </div>
    <div class="section-stack">
      ${state.schema.sections.map((sec, i) => `
        <details class="section" ${i === 1 ? 'open' : ''}>
          <summary>
            <span class="summary-title">${sec.title}</span>
            <span class="badge">${sec.fields.length} campos</span>
          </summary>
          <div class="fields">${sec.fields.map(fieldHtml).join('')}</div>
        </details>
      `).join('')}
    </div>`;

  form.querySelectorAll('details.section').forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open) form.querySelectorAll('details.section').forEach(o => { if (o !== d) o.open = false; });
    });
  });

  loadDraft();
}

const SELECT_OPTIONS = {
  'TIPO PROCEDIMIENTO': ['CONCURRENCIA', 'ORDEN DE INVESTIGAR', 'FLAGRANCIA', 'DENUNCIA', 'DETENCIÓN', 'ALLANAMIENTO', 'OTRO'],
  'DELITO': ['SECUESTRO', 'SECUESTRO EXTORSIVO', 'ROBO CON RETENCIÓN', 'EXTORSIÓN', 'OTRO'],
  'FISCALIA': ['FISCALÍA REGIONAL METROPOLITANA CENTRO NORTE', 'FISCALÍA REGIONAL METROPOLITANA ORIENTE', 'FISCALÍA REGIONAL METROPOLITANA OCCIDENTE', 'FISCALÍA REGIONAL METROPOLITANA SUR', 'OTRA'],
  'SEXO': ['MASCULINO', 'FEMENINO', 'NO INFORMADO'],
  'NACIONALIDAD': ['CHILENA', 'VENEZOLANA', 'COLOMBIANA', 'PERUANA', 'BOLIVIANA', 'HAITIANA', 'OTRA'],
  'ESTADO CIVIL': ['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'AUC', 'NO INFORMADO'],
  'MAYOR/MENOR': ['MAYOR DE EDAD', 'MENOR DE EDAD', 'NO INFORMADO'],
  'CALIDAD': ['DETENIDO', 'IMPUTADO', 'PRÓFUGO', 'TESTIGO', 'VÍCTIMA', 'OTRO']
};

function fieldHtml(f) {
  const label = normalizeLabel(f.label);
  const options = SELECT_OPTIONS[label] || (f.type === 'select' && Array.isArray(f.options) ? f.options : null);
  const full = f.type === 'textarea' || longField(f.label) ? ' full' : '';
  const required = ['RUC', 'N°FOLIO', 'FISCALIA', 'FISCALÍA', 'TIPO PROCEDIMIENTO'].includes(label) ? '<span class="required">*</span>' : '';

  if (f.type === 'textarea') {
    return `<div class="field${full}"><label for="${f.id}">${f.label}${required}</label><textarea id="${f.id}" name="${f.id}" rows="3"></textarea></div>`;
  }

  if (options) {
    return `<div class="field${full}"><label for="${f.id}">${f.label}${required}</label><select id="${f.id}" name="${f.id}" class="select-field">
      <option value="">Seleccione...</option>
      ${options.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}
    </select></div>`;
  }

  return `<div class="field${full}"><label for="${f.id}">${f.label}${required}</label><input id="${f.id}" name="${f.id}" type="${f.type || 'text'}" /></div>`;
}

function normalizeLabel(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

function longField(label) {
  return /direcci|observaci|detalle|descripci|relato|modus|coordenada/i.test(label || '');
}

function collectValues() {
  const values = {};
  document.querySelectorAll('#caseForm input, #caseForm select, #caseForm textarea').forEach(el => values[el.name] = el.value);
  return values;
}

function saveDraft() {
  localStorage.setItem(storageKey, JSON.stringify({ module: 'Secuestro', updatedAt: new Date().toISOString(), values: collectValues() }));
  flash('Registro guardado localmente en este navegador.');
}

function loadDraft() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    Object.entries(data.values || {}).forEach(([name, value]) => {
      const el = document.querySelector(`[name="${CSS.escape(name)}"]`);
      if (el) el.value = value;
    });
  } catch {}
}

function exportJson() {
  const data = { module: 'Secuestro', exportedAt: new Date().toISOString(), values: collectValues() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `registro_secuestro_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearForm(confirmar = true) {
  if (confirmar && !confirm('¿Limpiar los campos del formulario?')) return;
  document.querySelectorAll('#caseForm input, #caseForm select, #caseForm textarea').forEach(el => el.value = '');
  localStorage.removeItem(storageKey);
  if (confirmar) flash('Formulario limpiado.');
}

function flash(text) {
  const msg = document.createElement('div');
  msg.className = 'toast';
  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2600);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

document.addEventListener('DOMContentLoaded', init);
