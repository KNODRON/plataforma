const state = { profile:null, user:null, view:null };
const storageKey = 'sace_concurrencias_v2';

const menus = {
  guardia: [ ['concurrenciaNueva','Nueva Concurrencia'], ['misConcurrencias','Mis Concurrencias'] ],
  analista: [ ['concurrenciasPendientes','Concurrencias Pendientes'], ['secuestro','Secuestro'], ['robos','Robos'], ['homicidios','Homicidios'], ['medioAmbiente','Medio Ambiente'], ['drogas','Drogas'], ['crimen','Crimen Organizado'] ],
  jefatura: [ ['concurrenciasPendientes','Concurrencias'], ['secuestro','Secuestro'], ['reportes','Reportes'] ],
  admin: [ ['concurrenciaNueva','Nueva Concurrencia'], ['misConcurrencias','Mis Concurrencias'], ['concurrenciasPendientes','Concurrencias Pendientes'], ['secuestro','Secuestro'], ['robos','Robos'], ['homicidios','Homicidios'], ['medioAmbiente','Medio Ambiente'], ['drogas','Drogas'], ['crimen','Crimen Organizado'], ['admin','Administración'] ]
};

const opciones = {
  tipoProcedimiento:['CONCURRENCIA','ORDEN DE INVESTIGAR','ALLANAMIENTO','FLAGRANCIA','DENUNCIA','OTRO'],
  delito:['SECUESTRO','ROBO','HOMICIDIO','MEDIO AMBIENTE','DROGAS','CRIMEN ORGANIZADO','OTRO'],
  fiscalia:['FISCALÍA REGIONAL METROPOLITANA CENTRO NORTE','FISCALÍA REGIONAL METROPOLITANA ORIENTE','FISCALÍA REGIONAL METROPOLITANA OCCIDENTE','FISCALÍA REGIONAL METROPOLITANA SUR','OTRA'],
  siNo:['NO','SÍ'],
  siNoDepto:['NO, POR PARTE DE ESTE DEPTO.','SÍ, POR PARTE DE ESTE DEPTO.'],
  comunas:['CERRILLOS','CERRO NAVIA','CONCHALÍ','EL BOSQUE','ESTACIÓN CENTRAL','HUECHURABA','INDEPENDENCIA','LA CISTERNA','LA FLORIDA','LA GRANJA','LA PINTANA','LA REINA','LAS CONDES','LO BARNECHEA','LO ESPEJO','LO PRADO','MACUL','MAIPÚ','ÑUÑOA','PEDRO AGUIRRE CERDA','PEÑALOLÉN','PROVIDENCIA','PUDAHUEL','QUILICURA','QUINTA NORMAL','RECOLETA','RENCA','SAN JOAQUÍN','SAN MIGUEL','SAN RAMÓN','SANTIAGO','VITACURA','OTRA'],
  seccionesOs9:['ANÁLISIS E INTELIGENCIA CRIMINAL','DERECHOS HUMANOS','HOMICIDIOS','SECUESTROS','ROBOS','APOYO OPERATIVO','OTRA']
};

function $(id){ return document.getElementById(id); }
function getConcurrencias(){ return JSON.parse(localStorage.getItem(storageKey) || '[]'); }
function setConcurrencias(items){ localStorage.setItem(storageKey, JSON.stringify(items)); }
function select(name, list, required=false, selected=''){
  return `<select name="${name}" ${required?'required':''}><option value="">Seleccione...</option>${list.map(x=>`<option ${x===selected?'selected':''}>${x}</option>`).join('')}</select>`;
}
function input(name,type='text',required=false, extra=''){
  return `<input name="${name}" type="${type}" ${required?'required':''} ${extra}>`;
}
function textarea(name,required=false){ return `<textarea name="${name}" ${required?'required':''}></textarea>`; }
function escapeHtml(v=''){ return String(v).replace(/[&<>'"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); }

$('loginForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  state.profile = $('profileSelect').value;
  state.user = $('loginUser').value || 'usuario';
  $('loginView').classList.add('hidden');
  $('appView').classList.remove('hidden');
  buildMenu();
  go(menus[state.profile][0][0]);
});
$('logoutBtn').addEventListener('click', ()=>{ location.reload(); });

function buildMenu(){
  $('sideMenu').innerHTML = menus[state.profile].map(([id,label])=>`<button class="menu-btn" data-view="${id}">▣ ${label}</button>`).join('');
  document.querySelectorAll('.menu-btn').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.view)));
}
function setActive(view){ document.querySelectorAll('.menu-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===view)); }
function setHeader(title,sub,actions=''){$('pageTitle').textContent=title;$('pageSub').textContent=sub;$('topActions').innerHTML=actions;}
function go(view){
  state.view=view; setActive(view);
  if(view==='concurrenciaNueva') renderNuevaConcurrencia();
  else if(view==='misConcurrencias') renderMisConcurrencias();
  else if(view==='concurrenciasPendientes') renderPendientes();
  else if(view==='secuestro') renderSecuestro();
  else renderPlaceholder(view);
}

function renderNuevaConcurrencia(){
  setHeader('Nueva Concurrencia','Ingreso exclusivo para Guardia / registro preliminar', '<button class="btn light" onclick="go(\'misConcurrencias\')">Ver mis concurrencias</button>');
  $('content').innerHTML = `
    <section class="panel hero"><div class="eyebrow">Registro preliminar</div><h3>Da Cuenta / Concurrencia</h3><p>Al guardar una concurrencia con delito SECUESTRO, quedará disponible para revisión del analista OS.9.</p></section>
    <form id="conForm" class="panel">
      <div id="formErrors" class="error-box hidden"></div>

      <section class="form-block">
        <h3>Datos del procedimiento</h3>
        <div class="grid four compact">
          <label>Tipo procedimiento (*) ${select('tipoProcedimiento', opciones.tipoProcedimiento, true, 'CONCURRENCIA')}</label>
          <label>Delito (*) ${select('delito', opciones.delito, true)}</label>
          <label>Hora (*) ${input('hora','time',true)}</label>
          <label>Fecha (*) ${input('fecha','date',true)}</label>
        </div>
        <div class="grid four compact">
          <label>Hora requerimiento ${input('horaRequerimiento','time')}</label>
          <label>Comuna (*) ${select('comuna', opciones.comunas, true)}</label>
          <label>Coordenadas ${input('coordenadas','text',false,'placeholder="-33.000000, -70.000000"')}</label>
          <label>Unidad ${input('unidad','text',false,'placeholder="Ej: 34ª Comisaría Vista Alegre"')}</label>
        </div>
        <label>Lugar (*) ${input('lugar','text',true,'placeholder="Dirección o referencia del procedimiento"')}</label>
      </section>

      <section class="form-block">
        <h3>Hecho</h3>
        <label>Hecho (*) ${textarea('hecho',true)}</label>
      </section>

      <section class="form-block">
        <h3>Detenidos</h3>
        <div class="grid two compact">
          <label>Identidad detenidos (*) ${select('identidadDetenidos', opciones.siNo, true, 'NO')}</label>
          <div class="field-actions"><button type="button" id="addDetenidoBtn" class="btn gold hidden">+ Agregar detenido</button></div>
        </div>
        <div id="detenidosHelp" class="empty small">Seleccione “SÍ” si existen detenidos individualizados.</div>
        <div id="detenidosContainer" class="detenidos-container hidden"></div>
      </section>

      <section class="form-block">
        <h3>Resultado preliminar / Ministerio Público</h3>
        <div class="grid three compact">
          <label>Incautación (*) ${select('incautacion', opciones.siNo, true, 'NO')}</label>
          <label>Fiscalía (*) ${select('fiscalia', opciones.fiscalia, true)}</label>
          <label>Fiscal (*) ${input('fiscal','text',true)}</label>
        </div>
        <div class="grid three compact">
          <label>Folio (*) ${input('folio','text',true)}</label>
          <label>Cuenta O.S.1 ${select('cuentaOs1', opciones.siNoDepto)}</label>
          <label>S.A.C N° ${input('sac')}</label>
        </div>
        <div class="grid two compact">
          <label>DATADIC AUPOL N° ${input('datadicAupol')}</label>
          <label>Instrucciones Ministerio Público ${input('instruccionesMp','text',false,'placeholder="Ej: Instruyó OS.9"')}</label>
        </div>
      </section>

      <section class="form-block">
        <h3>Funcionarios</h3>
        <div class="grid three compact">
          <label>Funcionario a cargo del procedimiento (*) ${input('funcionarioProcedimiento','text',true)}</label>
          <label>Funcionario a cargo del procedimiento OS-9 (*) ${input('funcionarioOs9','text',true)}</label>
          <label>Sección funcionario Depto. OS-9 (*) ${select('seccionOs9', opciones.seccionesOs9, true)}</label>
        </div>
      </section>

      <div class="form-footer"><button class="btn primary" type="submit">Guardar concurrencia</button></div>
    </form>`;

  const detSelect = document.querySelector('[name="identidadDetenidos"]');
  detSelect.addEventListener('change', onDetenidosChange);
  $('addDetenidoBtn').addEventListener('click', ()=>addDetenidoCard());
  $('conForm').addEventListener('submit', saveConcurrencia);
  onDetenidosChange();
}

function onDetenidosChange(){
  const value = document.querySelector('[name="identidadDetenidos"]').value;
  const show = value === 'SÍ';
  $('addDetenidoBtn').classList.toggle('hidden', !show);
  $('detenidosContainer').classList.toggle('hidden', !show);
  $('detenidosHelp').classList.toggle('hidden', show);
  if(show && $('detenidosContainer').children.length === 0) addDetenidoCard();
  if(!show) $('detenidosContainer').innerHTML = '';
}

function addDetenidoCard(){
  const container = $('detenidosContainer');
  const index = container.children.length + 1;
  const card = document.createElement('section');
  card.className = 'detenido-card';
  card.innerHTML = `
    <div class="detenido-head"><strong>Detenido N° ${index}</strong><button type="button" class="btn light btn-mini eliminar-detenido">Eliminar</button></div>
    <div class="grid four compact">
      <label>Nombres (*) ${input('detenidoNombres','text',true)}</label>
      <label>Apellidos (*) ${input('detenidoApellidos','text',true)}</label>
      <label>Cédula ID / Pasaporte (*) ${input('detenidoDocumento','text',true,'placeholder="00.000.000-0 o pasaporte"')}</label>
      <label>Edad (*) ${input('detenidoEdad','number',true,'min="0" max="120"')}</label>
    </div>
    <div class="grid three compact">
      <label>Nacionalidad (*) ${input('detenidoNacionalidad','text',true)}</label>
      <label>Antepol ${select('detenidoAntepol', opciones.siNo, false, 'NO')}</label>
      <label>Antepen ${select('detenidoAntepen', opciones.siNo, false, 'NO')}</label>
    </div>`;
  container.appendChild(card);
  card.querySelector('.eliminar-detenido').addEventListener('click', ()=>{ card.remove(); renumerarDetenidos(); });
}

function renumerarDetenidos(){
  document.querySelectorAll('.detenido-card').forEach((card,i)=>{ card.querySelector('strong').textContent = `Detenido N° ${i+1}`; });
}

function collectDetenidos(){
  return [...document.querySelectorAll('.detenido-card')].map(card=>({
    nombres: card.querySelector('[name="detenidoNombres"]').value.trim(),
    apellidos: card.querySelector('[name="detenidoApellidos"]').value.trim(),
    documento: card.querySelector('[name="detenidoDocumento"]').value.trim(),
    edad: card.querySelector('[name="detenidoEdad"]').value.trim(),
    nacionalidad: card.querySelector('[name="detenidoNacionalidad"]').value.trim(),
    antepol: card.querySelector('[name="detenidoAntepol"]').value,
    antepen: card.querySelector('[name="detenidoAntepen"]').value
  }));
}

function validarConcurrencia(form){
  const labels = {
    tipoProcedimiento:'Tipo procedimiento', delito:'Delito', hora:'Hora', fecha:'Fecha', lugar:'Lugar', comuna:'Comuna', hecho:'Hecho', identidadDetenidos:'Identidad detenidos', incautacion:'Incautación', fiscalia:'Fiscalía', fiscal:'Fiscal', folio:'Folio', funcionarioProcedimiento:'Funcionario a cargo del procedimiento', funcionarioOs9:'Funcionario a cargo del procedimiento OS-9', seccionOs9:'Sección funcionario Depto. OS-9'
  };
  const obligatorios = Object.keys(labels);
  const faltantes = obligatorios.filter(name=>!form.elements[name]?.value?.trim()).map(name=>labels[name]);
  if(form.elements.identidadDetenidos.value === 'SÍ'){
    const detenidos = collectDetenidos();
    if(detenidos.length === 0) faltantes.push('Agregar al menos un detenido');
    detenidos.forEach((d,i)=>{
      if(!d.nombres) faltantes.push(`Detenido N° ${i+1}: nombres`);
      if(!d.apellidos) faltantes.push(`Detenido N° ${i+1}: apellidos`);
      if(!d.documento) faltantes.push(`Detenido N° ${i+1}: cédula ID / pasaporte`);
      if(!d.edad) faltantes.push(`Detenido N° ${i+1}: edad`);
      if(!d.nacionalidad) faltantes.push(`Detenido N° ${i+1}: nacionalidad`);
    });
  }
  return faltantes;
}

function showErrors(errors){
  const box = $('formErrors');
  if(!errors.length){ box.classList.add('hidden'); box.innerHTML=''; return; }
  box.classList.remove('hidden');
  box.innerHTML = `<strong>No es posible guardar. Faltan campos obligatorios:</strong><ul>${errors.map(e=>`<li>${escapeHtml(e)}</li>`).join('')}</ul>`;
  box.scrollIntoView({behavior:'smooth',block:'center'});
}

function saveConcurrencia(e){
  e.preventDefault();
  const form = e.target;
  const errors = validarConcurrencia(form);
  showErrors(errors);
  if(errors.length) return;
  const fd = new FormData(form);
  const obj = Object.fromEntries(fd.entries());
  obj.detenidos = obj.identidadDetenidos === 'SÍ' ? collectDetenidos() : [];
  obj.id = 'CON-' + Date.now();
  obj.estado = obj.delito === 'SECUESTRO' ? 'Pendiente Secuestro' : 'Pendiente revisión';
  obj.creadoPor = state.profile;
  obj.creadoEn = new Date().toLocaleString('es-CL');
  const items = getConcurrencias(); items.unshift(obj); setConcurrencias(items);
  alert('Concurrencia registrada. Disponible para revisión de Analista OS.9.');
  form.reset();
  document.querySelector('[name="tipoProcedimiento"]').value = 'CONCURRENCIA';
  document.querySelector('[name="identidadDetenidos"]').value = 'NO';
  document.querySelector('[name="incautacion"]').value = 'NO';
  onDetenidosChange();
  showErrors([]);
}

function renderMisConcurrencias(){
  setHeader('Mis Concurrencias','Registros ingresados en este navegador');
  const items = getConcurrencias().filter(x=>x.creadoPor==='guardia'||state.profile==='admin');
  renderTabla(items, false);
}
function renderPendientes(){
  setHeader('Concurrencias Pendientes','Bandeja de revisión para analistas OS.9', '<button class="btn light" onclick="go(\'secuestro\')">Ir a Secuestro</button>');
  renderTabla(getConcurrencias(), true);
}
function renderTabla(items, showAction=true){
  $('content').innerHTML = `<section class="panel"><h3>Listado</h3>${items.length?`<table class="table"><thead><tr><th>Fecha / Hora</th><th>Delito</th><th>Comuna</th><th>Lugar</th><th>Folio</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${items.map(x=>`<tr><td>${escapeHtml(x.fecha||'')} ${escapeHtml(x.hora||'')}</td><td>${escapeHtml(x.delito||'')}</td><td>${escapeHtml(x.comuna||'')}</td><td>${escapeHtml(x.lugar||'')}</td><td>${escapeHtml(x.folio||'')}</td><td>${escapeHtml(x.estado||'')}</td><td>${showAction?`<button class="btn light" onclick="tomarConcurrencia('${x.id}')">Tomar para Secuestro</button>`:'-'}</td></tr>`).join('')}</tbody></table>`:`<div class="empty">Aún no existen concurrencias guardadas.</div>`}</section>`;
}
function tomarConcurrencia(id){ localStorage.setItem('sace_concurrencia_activa', id); go('secuestro'); }

function accordion(title,count,body,open=false){ return `<section class="accordion"><button class="acc-head" type="button"><span>${title}</span><span class="badge">${count} campos</span></button><div class="acc-body" style="display:${open?'block':'none'}">${body}</div></section>`; }
function renderSecuestro(){
  setHeader('Secuestro','Nuevo registro · Formulario de ingreso', '<button class="btn primary">Nuevo registro</button><button class="btn primary">Guardar local</button><button class="btn danger">Limpiar</button>');
  const activeId = localStorage.getItem('sace_concurrencia_activa');
  const con = activeId ? getConcurrencias().find(x=>x.id===activeId) : null;
  $('content').innerHTML = `
    <section class="panel hero"><div class="eyebrow">Departamento OS.9</div><h3>Registro de Secuestro</h3><p>Formulario de trabajo para completar datos investigativos.</p></section>
    ${con?`<div class="notice"><strong>Pre-registro por concurrencia:</strong> ${escapeHtml(con.fecha||'')} · ${escapeHtml(con.comuna||'')} · Folio ${escapeHtml(con.folio||'S/I')}.</div>`:''}
    <form id="secForm">
      ${accordion('Control Interno',1,`<div class="grid four"><label>N° ${input('numero')}</label></div>`)}
      ${accordion('Antecedentes Investigación',5,`<div class="grid four"><label>Tipo procedimiento ${select('tipoProcedimiento', opciones.tipoProcedimiento, true)}</label><label>Delito ${select('delito', opciones.delito)}</label><label>RUC ${input('ruc')}</label><label>N° Folio ${input('folio')}</label><label>Fiscalía ${select('fiscalia', opciones.fiscalia)}</label></div>`,true)}
      ${accordion('Fecha y Hora Denuncia',4,`<div class="grid four"><label>Día ${input('dia')}</label><label>Mes ${input('mes')}</label><label>Año ${input('anio')}</label><label>Hora ${input('hora','time')}</label></div>`)}
      ${accordion('Sitio del Suceso Denuncia',6,`<div class="grid three"><label>Región ${input('region')}</label><label>Comuna ${select('comuna', opciones.comunas)}</label><label>Dirección ${input('direccion')}</label></div>`)}
      ${accordion('Víctima',23,`<div class="grid four"><label>Nombre víctima ${input('victimaNombre')}</label><label>Edad ${input('victimaEdad','number')}</label><label>Nacionalidad ${input('victimaNacionalidad')}</label><label>RUN / ID ${input('victimaRun')}</label></div>`)}
      ${accordion('Imputado / Detenido',24,`<div class="empty">Sección pendiente de poblar con campos específicos.</div>`)}
      ${accordion('Organización Criminal',16,`<div class="empty">Sección pendiente de poblar con campos específicos.</div>`)}
      ${accordion('Delito',4,`<div class="empty">Sección pendiente de poblar con campos específicos.</div>`)}
      ${accordion('Armamento',6,`<div class="empty">Sección pendiente de poblar con campos específicos.</div>`)}
      ${accordion('Medio Transporte',10,`<div class="empty">Sección pendiente de poblar con campos específicos.</div>`)}
    </form>`;
  document.querySelectorAll('.acc-head').forEach(h=>h.addEventListener('click',()=>{ const b=h.nextElementSibling; b.style.display=b.style.display==='none'?'block':'none'; }));
  if(con){
    const form=$('secForm');
    form.elements.tipoProcedimiento.value=con.tipoProcedimiento||'CONCURRENCIA';
    form.elements.delito.value=con.delito||'SECUESTRO';
    form.elements.folio.value=con.folio||'';
    form.elements.fiscalia.value=con.fiscalia||'';
    form.elements.hora.value=con.hora||'';
    form.elements.comuna.value=con.comuna||'';
    form.elements.direccion.value=con.lugar||'';
    if(con.fecha){ const [y,m,d]=con.fecha.split('-'); form.elements.dia.value=d||''; form.elements.mes.value=m||''; form.elements.anio.value=y||''; }
  }
}
function renderPlaceholder(view){ setHeader(view,'Módulo preparado para próxima etapa'); $('content').innerHTML = `<section class="panel"><div class="empty">Este módulo está reservado para continuar el desarrollo sin mezclar código.</div></section>`; }
