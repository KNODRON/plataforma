window.SACE_CONCURRENCIAS = (() => {
  const storageKey = 'os9_sace_concurrencias_v6';

  function all() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
    catch { return []; }
  }

  function persist(items) { localStorage.setItem(storageKey, JSON.stringify(items)); }

  function renderNueva() {
    return `
      <div class="work-header">
        <div>
          <p class="eyebrow">Ingreso Guardia</p>
          <h3>Nueva Concurrencia</h3>
          <p>Formulario breve para registrar el primer antecedente recibido por guardia.</p>
        </div>
        <div class="status-pill">Ingreso preliminar</div>
      </div>
      <div class="section-stack">
        <details class="section" open>
          <summary><span class="summary-title">Datos de la concurrencia</span><span class="badge">Formulario Guardia</span></summary>
          <div class="fields">
            ${select('tipo_procedimiento','Tipo procedimiento', window.SACE_OPTIONS.tipoProcedimiento, 'CONCURRENCIA')}
            ${select('delito','Delito', window.SACE_OPTIONS.delito)}
            ${input('fecha','Fecha','date')}
            ${input('hora','Hora','time')}
            ${input('lugar','Lugar / dirección')}
            ${input('comuna','Comuna')}
            ${input('unidad','Unidad territorial')}
            ${select('fiscalia','Fiscalía', window.SACE_OPTIONS.fiscalia)}
            ${input('folio','Folio')}
            ${textarea('hecho','Relato breve del hecho')}
            ${select('detenidos','Detenidos', window.SACE_OPTIONS.siNo)}
            ${select('incautacion','Incautación', window.SACE_OPTIONS.siNo)}
            ${input('funcionario_cargo','Funcionario a cargo')}
            ${input('telefono_funcionario','Teléfono funcionario')}
            ${input('funcionario_os9','Funcionario OS.9 informado')}
          </div>
        </details>
      </div>`;
  }

  function renderListado(mode='pendientes') {
    const items = all().filter(x => mode === 'mis' ? true : x.estado === 'PENDIENTE');
    if (!items.length) {
      return `<article class="empty-module"><h3>${mode === 'mis' ? 'Mis Concurrencias' : 'Concurrencias Pendientes'}</h3><p>No existen registros locales para mostrar en este navegador.</p></article>`;
    }
    return `
      <div class="work-header">
        <div>
          <p class="eyebrow">Bandeja de trabajo</p>
          <h3>${mode === 'mis' ? 'Mis Concurrencias' : 'Concurrencias Pendientes'}</h3>
          <p>Registros preliminares ingresados desde guardia. En versión real quedarían centralizados en servidor.</p>
        </div>
        <div class="status-pill">${items.length} registro(s)</div>
      </div>
      <div class="records-list">
        ${items.map((item, idx) => card(item, idx, mode)).join('')}
      </div>`;
  }

  function card(item, idx, mode) {
    const fecha = [item.fecha, item.hora].filter(Boolean).join(' ');
    return `<article class="record-card">
      <div>
        <strong>${escapeHtml(item.delito || 'Sin delito')}</strong>
        <span>${escapeHtml(fecha || 'Sin fecha/hora')} · ${escapeHtml(item.comuna || 'Sin comuna')}</span>
        <p>${escapeHtml(item.lugar || 'Sin lugar registrado')}</p>
      </div>
      <div class="record-actions">
        <span class="mini-pill">${escapeHtml(item.estado || 'PENDIENTE')}</span>
        ${mode !== 'mis' && item.delito === 'SECUESTRO' ? `<button type="button" data-tomar="${item.id}">Tomar para Secuestro</button>` : ''}
      </div>
    </article>`;
  }

  function bindNueva(container, flash) {
    const tipo = container.querySelector('[name="tipo_procedimiento"]');
    if (tipo && !tipo.value) tipo.value = 'CONCURRENCIA';
    const delito = container.querySelector('[name="delito"]');
    const status = container.querySelector('.status-pill');
    if (delito) delito.addEventListener('change', () => {
      if (status) status.textContent = delito.value === 'SECUESTRO' ? 'GUARDAR CONCURRENCIA' : 'Ingreso preliminar';
    });
  }

  function saveNueva(container) {
    const data = {};
    container.querySelectorAll('input, select, textarea').forEach(el => data[el.name] = el.value);
    data.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    data.estado = 'PENDIENTE';
    data.origen = 'GUARDIA';
    data.createdAt = new Date().toISOString();
    const items = all();
    items.unshift(data);
    persist(items);
    container.querySelectorAll('input, textarea').forEach(el => el.value = '');
    const tipo = container.querySelector('[name="tipo_procedimiento"]');
    if (tipo) tipo.value = 'CONCURRENCIA';
    return data;
  }

  function bindListado(container, onTake) {
    container.querySelectorAll('[data-tomar]').forEach(btn => {
      btn.addEventListener('click', () => onTake(btn.dataset.tomar));
    });
  }

  function take(id) {
    const items = all();
    const item = items.find(x => x.id === id);
    if (item) item.estado = 'TOMADA POR ANALISTA';
    persist(items);
    return item;
  }

  function input(name, label, type='text') { return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}"></div>`; }
  function textarea(name, label) { return `<div class="field full"><label for="${name}">${label}</label><textarea id="${name}" name="${name}" rows="4"></textarea></div>`; }
  function select(name, label, options, selected='') { return `<div class="field"><label for="${name}">${label}</label><select id="${name}" name="${name}" class="select-field"><option value="">Seleccione...</option>${options.map(o => `<option ${o===selected?'selected':''} value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}</select></div>`; }
  function escapeHtml(value) { return String(value || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  return { renderNueva, renderListado, bindNueva, bindListado, saveNueva, take };
})();
