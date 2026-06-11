window.SACE_SECUestro = (() => {
  const storageKey = 'os9_sace_secuestro_borrador_v6';
  const SELECT_BY_LABEL = {
    'TIPO PROCEDIMIENTO': () => window.SACE_OPTIONS.tipoProcedimiento,
    'DELITO': () => ['SECUESTRO', 'SECUESTRO EXTORSIVO', 'ROBO CON RETENCIÓN', 'EXTORSIÓN', 'OTRO'],
    'FISCALIA': () => window.SACE_OPTIONS.fiscalia,
    'FISCALÍA': () => window.SACE_OPTIONS.fiscalia,
    'SEXO': () => window.SACE_OPTIONS.sexo,
    'NACIONALIDAD': () => window.SACE_OPTIONS.nacionalidad,
    'ESTADO CIVIL': () => window.SACE_OPTIONS.estadoCivil,
    'MAYOR/MENOR': () => window.SACE_OPTIONS.mayorMenor,
    'CALIDAD': () => window.SACE_OPTIONS.calidad
  };

  function render(schema) {
    return `
      <div class="work-header">
        <div>
          <p class="eyebrow">Módulo investigativo</p>
          <h3>Registro de Secuestro</h3>
          <p>Formulario principal editable por analistas. Los campos se completan progresivamente durante la investigación.</p>
        </div>
        <div class="status-pill">Registro editable</div>
      </div>
      <div class="section-stack">
        ${schema.sections.map((sec, i) => `
          <details class="section" ${i === 1 ? 'open' : ''}>
            <summary>
              <span class="summary-title">${sec.title}</span>
              <span class="badge">${sec.fields.length} campos</span>
            </summary>
            <div class="fields">${sec.fields.map(fieldHtml).join('')}</div>
          </details>
        `).join('')}
      </div>`;
  }

  function fieldHtml(f) {
    const label = normalizeLabel(f.label);
    const optionsGetter = SELECT_BY_LABEL[label];
    const options = optionsGetter ? optionsGetter() : (f.type === 'select' && Array.isArray(f.options) ? f.options : null);
    const full = f.type === 'textarea' || longField(f.label) ? ' full' : '';
    const required = ['RUC', 'N°FOLIO', 'N° FOLIO', 'FISCALIA', 'FISCALÍA', 'TIPO PROCEDIMIENTO'].includes(label) ? '<span class="required">*</span>' : '';

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

  function bind(container) {
    container.querySelectorAll('details.section').forEach(d => {
      d.addEventListener('toggle', () => {
        if (d.open) container.querySelectorAll('details.section').forEach(o => { if (o !== d) o.open = false; });
      });
    });
    loadDraft(container);
  }

  function collect(container) {
    const values = {};
    container.querySelectorAll('input, select, textarea').forEach(el => values[el.name] = el.value);
    return values;
  }

  function save(container) {
    localStorage.setItem(storageKey, JSON.stringify({ module: 'Secuestro', updatedAt: new Date().toISOString(), values: collect(container) }));
  }

  function loadDraft(container) {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      Object.entries(data.values || {}).forEach(([name, value]) => {
        const el = container.querySelector(`[name="${CSS.escape(name)}"]`);
        if (el) el.value = value;
      });
    } catch {}
  }

  function clear(container) {
    container.querySelectorAll('input, select, textarea').forEach(el => el.value = '');
    localStorage.removeItem(storageKey);
  }

  function exportData(container) {
    return { module: 'Secuestro', exportedAt: new Date().toISOString(), values: collect(container) };
  }

  function normalizeLabel(value) { return String(value || '').trim().replace(/\s+/g, ' ').toUpperCase(); }
  function longField(label) { return /direcci|observaci|detalle|descripci|relato|modus|coordenada/i.test(label || ''); }
  function escapeHtml(value) { return String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  return { render, bind, save, clear, exportData };
})();
