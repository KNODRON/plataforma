const state={module:'Dashboard',schema:null};
const storageKey='os9_analisis_criminal_registros_v1';
const $=s=>document.querySelector(s);

async function init(){
  state.schema=await fetch('data/matriz_campos.json').then(r=>r.json());
  buildNav(); showDashboard(); updateActionVisibility();
  $('#loginBtn').onclick=()=>{$('#loginView').classList.add('hidden');$('#appView').classList.remove('hidden');};
  $('#logoutBtn').onclick=()=>location.reload();
  $('#newCaseBtn').onclick=()=>selectModule('Secuestro');
  $('#saveBtn').onclick=saveLocal; $('#exportBtn').onclick=exportJson; $('#clearBtn').onclick=clearForm;
}

function menuItems(){return ['Dashboard',...state.schema.modules];}
function buildNav(){
  const labels={Dashboard:'Dashboard',Secuestro:'Secuestro',Robos:'Robos',Homicidios:'Homicidios','Medio Ambiente':'Medio Ambiente',Drogas:'Drogas','Crimen Organizado':'Crimen Organizado'};
  const nav=$('#moduleNav'); nav.innerHTML='';
  menuItems().forEach(m=>{const b=document.createElement('button'); b.textContent=labels[m]||m; b.className=m===state.module?'active':''; b.onclick=()=>selectModule(m); nav.appendChild(b);});
}

function selectModule(m){
  state.module=m; $('#moduleTitle').textContent=m; buildNav(); updateActionVisibility();
  if(m==='Dashboard') showDashboard(); else if(m==='Secuestro') showForm(); else showPlaceholder(m);
}

function updateActionVisibility(){
  const inForm=state.module==='Secuestro';
  $('#saveBtn').style.display=inForm?'inline-block':'none';
  $('#exportBtn').style.display=inForm?'inline-block':'none';
  $('#clearBtn').style.display=inForm?'inline-block':'none';
  $('#newCaseBtn').style.display=state.module==='Dashboard'?'inline-block':'none';
}

function getAll(){return JSON.parse(localStorage.getItem(storageKey)||'[]');}
function showDashboard(){
  $('#caseForm').classList.add('hidden'); const dash=$('#dashboard'); dash.classList.remove('hidden');
  const all=getAll(); const last=all[all.length-1];
  const sampleTotals={secuestro:all.length,robos:0,homicidios:0,ambiente:0};
  dash.innerHTML=`
    <section class="kpi-grid">
      <article class="kpi"><span>Registros locales</span><strong>${all.length}</strong></article>
      <article class="kpi"><span>Último guardado</span><strong>${last?new Date(last.updatedAt).toLocaleDateString('es-CL'):'—'}</strong></article>
      <article class="kpi"><span>Módulos activos</span><strong>1</strong></article>
      <article class="kpi"><span>Estado sistema</span><strong>Prueba</strong></article>
    </section>
    <section class="dashboard-grid">
      <article class="panel">
        <h3>Distribución de registros</h3>
        <div class="bars">
          ${bar('Secuestro',Math.max(sampleTotals.secuestro,1),Math.max(sampleTotals.secuestro,1))}
          ${bar('Robos',sampleTotals.robos,Math.max(sampleTotals.secuestro,1))}
          ${bar('Homicidios',sampleTotals.homicidios,Math.max(sampleTotals.secuestro,1))}
          ${bar('Medio Ambiente',sampleTotals.ambiente,Math.max(sampleTotals.secuestro,1))}
        </div>
      </article>
      <article class="panel">
        <h3>Accesos rápidos</h3>
        <div class="quick-modules">
          ${state.schema.modules.map(m=>`<article class="module-card" onclick="selectModule('${m}')"><h3>${m}</h3><p>${m==='Secuestro'?'Formulario funcional disponible.':'Módulo en preparación.'}</p></article>`).join('')}
        </div>
      </article>
    </section>
    <article class="panel">
      <h3>Últimos registros locales</h3>
      ${recentTable(all)}
    </article>`;
}
function bar(name,value,max){const pct=max?Math.round((value/max)*100):0;return `<div class="bar-row"><span>${name}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><strong>${value}</strong></div>`;}
function recentTable(all){
  if(!all.length)return '<p class="form-hint">Aún no existen registros guardados en este navegador.</p>';
  return `<table class="recent-table"><thead><tr><th>Fecha</th><th>Módulo</th><th>RUC</th><th>Fiscalía</th></tr></thead><tbody>${all.slice(-5).reverse().map(r=>`<tr><td>${new Date(r.updatedAt).toLocaleString('es-CL')}</td><td>${r.module}</td><td>${r.values.ruc||'—'}</td><td>${r.values.fiscalia||'—'}</td></tr>`).join('')}</tbody></table>`;
}

function showPlaceholder(m){
  $('#caseForm').classList.add('hidden'); const dash=$('#dashboard'); dash.classList.remove('hidden');
  dash.innerHTML=`<article class="panel"><h3>${m}</h3><p class="form-hint">Módulo preparado para próxima etapa. La estructura se activará cuando se cargue la matriz correspondiente.</p></article>`;
}
function showForm(){
  $('#dashboard').classList.add('hidden'); const form=$('#caseForm'); form.classList.remove('hidden');
  form.innerHTML=`<p class="form-hint">Registro local de prueba. Use datos ficticios durante la etapa de validación.</p>`+state.schema.sections.map((sec,i)=>`<details class="section" ${i===1?'open':''}><summary><span class="summary-title">${sec.title}</span><span class="badge">${sec.fields.length} campos</span></summary><div class="fields">${sec.fields.map(fieldHtml).join('')}</div></details>`).join('');
  form.querySelectorAll('details.section').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)form.querySelectorAll('details.section').forEach(o=>{if(o!==d)o.open=false;});}));
  loadLocal();
}
function fieldHtml(f){
  const full=f.type==='textarea'?' full':'';
  if(f.type==='textarea') return `<div class="field${full}"><label>${f.label}</label><textarea name="${f.id}"></textarea></div>`;
  return `<div class="field${full}"><label>${f.label}</label><input name="${f.id}" type="${f.type||'text'}" /></div>`;
}
function collect(){const data={module:'Secuestro',updatedAt:new Date().toISOString(),values:{}}; document.querySelectorAll('#caseForm [name]').forEach(el=>data.values[el.name]=el.value); return data;}
function saveLocal(){const data=collect(); const all=getAll(); all.push(data); localStorage.setItem(storageKey,JSON.stringify(all)); alert('Registro guardado localmente en este navegador.'); selectModule('Dashboard');}
function loadLocal(){const all=getAll(); const last=all[all.length-1]; if(!last)return; document.querySelectorAll('#caseForm [name]').forEach(el=>{if(last.values[el.name])el.value=last.values[el.name];});}
function exportJson(){const blob=new Blob([JSON.stringify(collect(),null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='registro_secuestro_os9.json'; a.click(); URL.revokeObjectURL(a.href);}
function clearForm(){if(!confirm('¿Limpiar formulario actual?'))return; document.querySelectorAll('#caseForm [name]').forEach(el=>el.value='');}
window.selectModule=selectModule; init();
