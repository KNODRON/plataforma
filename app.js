const state={module:'Secuestro',schema:null};
const storageKey='os9_analisis_criminal_maqueta_v1';
const $=s=>document.querySelector(s);

async function init(){
  state.schema=await fetch('data/matriz_campos.json').then(r=>r.json());
  buildNav(); buildDashboard(); updateStats();
  $('#loginBtn').onclick=()=>{$('#loginView').classList.add('hidden');$('#appView').classList.remove('hidden');};
  $('#logoutBtn').onclick=()=>location.reload();
  $('#saveBtn').onclick=saveLocal; $('#exportBtn').onclick=exportJson; $('#clearBtn').onclick=clearForm;
}
function buildNav(){
  const nav=$('#moduleNav'); nav.innerHTML='';
  state.schema.modules.forEach(m=>{const b=document.createElement('button'); b.textContent=m; b.className=m===state.module?'active':''; b.onclick=()=>selectModule(m); nav.appendChild(b);});
}
function selectModule(m){state.module=m; $('#moduleTitle').textContent=m; buildNav(); m==='Secuestro'?showForm():showPlaceholder(m);}
function buildDashboard(){
  $('#dashboard').classList.remove('hidden'); $('#caseForm').classList.add('hidden');
  $('#dashboard').innerHTML=state.schema.modules.map(m=>`<article class="module-card" onclick="selectModule('${m}')"><h3>${m}</h3><p>${m==='Secuestro'?'Formulario funcional basado en matriz cargada.':'Módulo preparado para próxima etapa.'}</p></article>`).join('');
}
function showPlaceholder(m){
  $('#dashboard').classList.remove('hidden'); $('#caseForm').classList.add('hidden');
  $('#dashboard').innerHTML=`<article class="module-card"><h3>${m}</h3><p>Espacio reservado. La estructura se activará cuando se cargue la matriz correspondiente.</p></article>`;
}
function showForm(){
  $('#dashboard').classList.add('hidden'); const form=$('#caseForm'); form.classList.remove('hidden');
  form.innerHTML=state.schema.sections.map((sec,i)=>`<details class="section" ${i<3?'open':''}><summary>${sec.title}<span class="badge">${sec.fields.length} campos</span></summary><div class="fields">${sec.fields.map(fieldHtml).join('')}</div></details>`).join('');
  loadLocal();
}
function fieldHtml(f){
  const full=f.type==='textarea'?' full':'';
  if(f.type==='textarea') return `<div class="field${full}"><label>${f.label}</label><textarea name="${f.id}"></textarea></div>`;
  return `<div class="field${full}"><label>${f.label}</label><input name="${f.id}" type="${f.type||'text'}" /></div>`;
}
function collect(){const data={module:state.module,updatedAt:new Date().toISOString(),values:{}}; document.querySelectorAll('#caseForm [name]').forEach(el=>data.values[el.name]=el.value); return data;}
function saveLocal(){const data=collect(); const all=JSON.parse(localStorage.getItem(storageKey)||'[]'); all.push(data); localStorage.setItem(storageKey,JSON.stringify(all)); updateStats(); alert('Caso guardado localmente en este navegador.');}
function loadLocal(){const all=JSON.parse(localStorage.getItem(storageKey)||'[]'); const last=all[all.length-1]; if(!last)return; document.querySelectorAll('#caseForm [name]').forEach(el=>{if(last.values[el.name])el.value=last.values[el.name];});}
function exportJson(){const blob=new Blob([JSON.stringify(collect(),null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='caso_secuestro_maqueta.json'; a.click(); URL.revokeObjectURL(a.href);}
function clearForm(){if(!confirm('¿Limpiar formulario actual?'))return; document.querySelectorAll('#caseForm [name]').forEach(el=>el.value='');}
function updateStats(){const all=JSON.parse(localStorage.getItem(storageKey)||'[]'); $('#caseCount').textContent=all.length; $('#lastSaved').textContent=all.length?new Date(all[all.length-1].updatedAt).toLocaleString('es-CL'):'Sin registro';}
window.selectModule=selectModule; init();
