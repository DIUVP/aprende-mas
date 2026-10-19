/* Banco de proyectos formativos · lógica de la página (filtros, tarjetas que se voltean, ficha, copiar al Amoxtli, selección) */
(function(){
"use strict";
var PF = window.PF || [];
var $ = function(s,r){return (r||document).querySelector(s)};
var esc = function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};

var NIVELES = [["b","Bachillerato"],["l","Licenciatura"],["p","Posgrado"]];
var TIPOS = ["Prototipo","Proyecto","Problema","Experiencia","Investigación"];
var LOGT = {1:"Baja",2:"Media",3:"Alta"};
var BLOOM = [["Conocer y comprender",33],["Aplicar y analizar",67],["Evaluar y crear",100]];
var ICONO = {
  "Prototipo":'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  "Proyecto":'<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
  "Problema":'<circle cx="12" cy="12" r="9"/><path d="M9.2 9.2a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.6-2.8 4M12 17.6h.01"/>',
  "Experiencia":'<path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  "Investigación":'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.9-4.9"/>'
};
var svg = function(t){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONO[t]+'</svg>'};

/* ---- almacenamiento (puede fallar en ventanas privadas o con datos bloqueados) ---- */
var mem = {};
function leer(k,def){try{var v=localStorage.getItem("pf-"+k);return v==null?(k in mem?mem[k]:def):JSON.parse(v)}catch(e){return k in mem?mem[k]:def}}
function guardar(k,v){mem[k]=v;try{localStorage.setItem("pf-"+k,JSON.stringify(v))}catch(e){}}

var estado = {nivel:leer("nivel","l"), tipo:"", q:"", nat:"", ent:"", area:"", log:"", eq:"", orden:null};
var fav = leer("fav",[]);
var porId = {}; PF.forEach(function(p){porId[p.id]=p});
fav = fav.filter(function(id){return porId[id]});

/* ---- filtros ---- */
function opciones(sel, valores){valores.forEach(function(v){var o=document.createElement("option");o.textContent=v;sel.appendChild(o)})}
var ents = [], areas = [];
PF.forEach(function(p){ if(ents.indexOf(p.ent)<0) ents.push(p.ent); p.areas.forEach(function(a){if(areas.indexOf(a)<0) areas.push(a)}) });
ents.sort(); areas.sort(function(a,b){return a==="Transversal"?-1:b==="Transversal"?1:a.localeCompare(b,"es")});
opciones($("#f-ent"),ents); opciones($("#f-area"),areas);

function pintarChips(){
  $("#f-nivel").innerHTML = NIVELES.map(function(n){return '<button type="button" class="chip" data-nivel="'+n[0]+'" aria-pressed="'+(estado.nivel===n[0])+'">'+n[1]+'</button>'}).join("");
  $("#f-tipo").innerHTML = ['<button type="button" class="chip" data-tipo-f="" aria-pressed="'+(estado.tipo==="")+'">Todos</button>']
    .concat(TIPOS.map(function(t){return '<button type="button" class="chip" data-tipo="'+t+'" data-tipo-f="'+t+'" aria-pressed="'+(estado.tipo===t)+'"><i></i>'+t+'</button>'})).join("");
}

function visibles(){
  var q = estado.q.trim().toLowerCase();
  var lista = PF.filter(function(p){
    if(estado.tipo && p.tipo!==estado.tipo) return false;
    if(estado.nat && p.nat!==estado.nat) return false;
    if(estado.ent && p.ent!==estado.ent) return false;
    if(estado.area && p.areas.indexOf(estado.area)<0) return false;
    if(estado.log && String(p.log)!==estado.log) return false;
    if(estado.eq && p.eq!==estado.eq) return false;
    if(q){
      var h = (p.t+" "+p.gancho+" "+p.idea+" "+p.tipo+" "+p.areas.join(" ")+" "+p.ent+" "+p.nat).toLowerCase();
      if(h.indexOf(q)<0) return false;
    }
    return true;
  });
  if(estado.orden){ lista.sort(function(a,b){return estado.orden.indexOf(a.id)-estado.orden.indexOf(b.id)}); }
  return lista;
}

/* ---- tarjetas ---- */
function logPuntos(n){return '<span class="log" aria-hidden="true">'+[1,2,3].map(function(i){return '<i class="'+(i<=n?"on":"")+'"></i>'}).join("")+'</span>'}
function nivelNombre(){return NIVELES.filter(function(n){return n[0]===estado.nivel})[0][1]}

function carta(p){
  var esFav = fav.indexOf(p.id)>=0;
  var nv = p.niv[estado.nivel];
  var areasTxt = p.areas.length>2 ? p.areas.slice(0,2).join(" · ")+" +" : p.areas.join(" · ");
  return '<article class="carta" data-tipo="'+p.tipo+'" data-id="'+p.id+'">'+
   '<div class="carta-i">'+
    '<div class="cara frente">'+
      '<div class="cara-t"><span class="tag-t">'+svg(p.tipo)+p.tipo+'</span>'+
        '<button type="button" class="fav" data-fav="'+p.id+'" aria-pressed="'+esFav+'" aria-label="Guardar «'+esc(p.t)+'» en mi selección"><svg viewBox="0 0 24 24" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/></svg></button></div>'+
      '<h3>'+esc(p.t)+'</h3>'+
      '<p class="gancho">'+esc(p.gancho)+'</p>'+
      '<ul class="meta" aria-label="Características">'+
        '<li><b>'+p.nat+'</b></li><li>'+esc(p.ent)+'</li><li>'+p.eq+'</li>'+
        '<li>'+logPuntos(p.log)+'Dificultad '+LOGT[p.log].toLowerCase()+'</li></ul>'+
      '<p class="sub" style="font-size:14px;color:var(--tinta2)">'+esc(areasTxt)+'</p>'+
      '<div class="pie-c"><button type="button" class="voltear" data-voltear="'+p.id+'" aria-label="Voltear la tarjeta: '+esc(p.t)+'">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"/></svg>Voltear</button></div>'+
    '</div>'+
    '<div class="cara reverso">'+
      '<div class="cara-t"><span class="tag-t">'+svg(p.tipo)+p.tipo+'</span><span class="rev-b" style="font-size:11px">'+esc(nivelNombre())+'</span></div>'+
      '<div><span class="rev-b">La idea</span><p class="rev-p">'+esc(p.idea)+'</p></div>'+
      '<div class="rev-e"><span class="rev-b">Entregable · '+esc(nivelNombre())+'</span><br>'+esc(nv[0])+'<small>'+esc(nv[1])+'</small></div>'+
      '<div class="pie-c"><button type="button" class="voltear" data-ficha="'+p.id+'">Ver ficha completa</button>'+
        '<button type="button" class="voltear s" data-voltear="'+p.id+'" aria-label="Regresar la tarjeta al frente">Volver</button></div>'+
    '</div>'+
   '</div></article>';
}

function pintar(){
  var lista = visibles();
  $("#mazo").innerHTML = lista.map(carta).join("");
  $("#vacio").hidden = lista.length>0;
  $("#cuenta").textContent = "Mostrando "+lista.length+" de "+PF.length+" ideas";
  $("#n-sel").textContent = fav.length;
}

/* ---- ficha completa ---- */
var fichaId = null, fichaNivel = estado.nivel;
function abrirFicha(id, nivel){
  var p = porId[id]; if(!p) return;
  fichaId = id; fichaNivel = nivel || estado.nivel;
  var dlg = $("#ficha");
  dlg.setAttribute("data-tipo", p.tipo);
  $("#fi-tag").innerHTML = svg(p.tipo)+p.tipo; $("#fi-tag").className = "tag-t";
  $("#fi-t").textContent = p.t;
  pintarFicha();
  if(typeof dlg.showModal==="function") dlg.showModal(); else dlg.setAttribute("open","");
  $("#fi-c").scrollTop = 0;
}
function pintarFicha(){
  var p = porId[fichaId], nv = p.niv[fichaNivel];
  var total = p.rapa.reduce(function(s,r){return s+r[2]},0);
  $("#fi-fav").setAttribute("aria-pressed", fav.indexOf(p.id)>=0);
  $("#fi-fav").textContent = fav.indexOf(p.id)>=0 ? "★ Guardado" : "☆ Guardar";
  $("#fi-c").innerHTML =
   '<section><ul class="meta"><li><b>'+p.nat+'</b></li><li>'+esc(p.ent)+'</li><li>'+p.eq+'</li><li>'+logPuntos(p.log)+'Dificultad '+LOGT[p.log].toLowerCase()+'</li>'+p.areas.map(function(a){return '<li>'+esc(a)+'</li>'}).join("")+'</ul>'+
     '<p style="font-size:18px"><i>'+esc(p.gancho)+'</i></p><p>'+esc(p.idea)+'</p></section>'+
   '<section><h3>Entregable según tu nivel</h3>'+
     '<div class="niv-tabs" role="tablist" aria-label="Nivel">'+NIVELES.map(function(n){return '<button type="button" role="tab" data-fnivel="'+n[0]+'" aria-selected="'+(fichaNivel===n[0])+'">'+n[1]+'</button>'}).join("")+'</div>'+
     '<div class="rev-e" style="font-size:17px">'+esc(nv[0])+'<small>'+esc(nv[1])+'</small></div></section>'+
   '<section><h3>Situación cotidiana, profesional o laboral</h3><p class="sub">Punto de partida para la sección del Amoxtli (mínimo 100 palabras). Ajústala al contexto de tu asignatura.</p><div class="sit">'+esc(p.sit)+'</div></section>'+
   '<section><h3>Tres avances que suben de nivel</h3><ol class="avs">'+p.av.map(function(a,i){var b=BLOOM[i];return '<li><span class="bl">Avance '+(i+1)+' · '+b[0]+'</span><div class="bar" aria-hidden="true"><i style="width:'+b[1]+'%"></i></div><span>'+esc(a.replace(/^Avance \d · /,""))+'</span></li>'}).join("")+'</ol>'+
     '<p class="sub">Escolarizado: avances en las semanas 6, 11 y 17. Bachillerato: tres momentos de evaluación. Posgrados B-learning (4–5 semanas): agrupa los avances en dos o tres entregas.</p></section>'+
   '<section><h3>Requisitos de entrega</h3><ol class="req">'+p.req.map(function(r){return '<li>'+esc(r)+'</li>'}).join("")+'</ol></section>'+
   '<section><h3>Criterios de calidad (RAPA)</h3><div class="tabla"><table><thead><tr><th>Criterio</th><th>Descripción de la entrega óptima</th><th style="text-align:right">% de calificación</th></tr></thead><tbody>'+
     p.rapa.map(function(r){return '<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td class="pc">'+r[2]+'</td></tr>'}).join("")+
     '</tbody><tfoot><tr><td colspan="2">Sumatoria</td><td class="pc">'+total+' %</td></tr></tfoot></table></div></section>'+
   '<div class="ojo"><b>Ojo con…</b> '+esc(p.ojo)+'</div>';
}

/* ---- copiar al Amoxtli ---- */
function textoAmoxtli(p, nivel){
  var nv = p.niv[nivel], nn = NIVELES.filter(function(n){return n[0]===nivel})[0][1];
  var L = [];
  L.push("ALINEACIÓN AL MODELO EDUCATIVO TLAMATINI");
  L.push("Tipo de proyecto formativo integrador: "+p.tipo,"");
  L.push("ENTREGABLE ("+nn+")", nv[0], "");
  L.push("SITUACIÓN COTIDIANA, PROFESIONAL O LABORAL", p.sit, "");
  L.push("REQUISITOS DE ENTREGA");
  p.req.forEach(function(r,i){L.push((i+1)+". "+r)}); L.push("");
  L.push("CRITERIOS DE CALIDAD (RAPA)");
  p.rapa.forEach(function(r){L.push("- "+r[0]+": "+r[1]+" ("+r[2]+" %)")});
  L.push("Sumatoria: "+p.rapa.reduce(function(s,r){return s+r[2]},0)+" %","");
  L.push("AVANCES SUGERIDOS"); p.av.forEach(function(a){L.push(a)}); L.push("");
  L.push("Idea adaptada del Banco de proyectos formativos de Diseño Instruccional UVP. Revísala y ajústala a tu asignatura; después copia cada parte a su campo en la hoja digital del Amoxtli.");
  return L.join("\n");
}
function copiar(texto, aviso){
  function listo(){var a=$(aviso); a.hidden=false; clearTimeout(a._t); a._t=setTimeout(function(){a.hidden=true},2200)}
  function alterno(){
    var t=document.createElement("textarea"); t.value=texto; t.setAttribute("readonly",""); t.style.cssText="position:fixed;opacity:0;top:0";
    document.body.appendChild(t); t.select(); try{document.execCommand("copy"); listo()}catch(e){window.prompt("Copia el texto con Ctrl+C:",texto.slice(0,500))} document.body.removeChild(t);
  }
  if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(texto).then(listo,alterno) } else alterno();
}

/* ---- selección ---- */
function pintarSeleccion(){
  var c = $("#se-c");
  if(!fav.length){ c.innerHTML='<p class="sub" style="color:var(--tinta2)">Aún no guardas ideas. Toca la estrella de una tarjeta para agregarla aquí.</p>'; return; }
  c.innerHTML='<ul class="sel-lista">'+fav.map(function(id){var p=porId[id];
    return '<li data-tipo="'+p.tipo+'"><span><b>'+esc(p.t)+'</b><small>'+p.tipo+' · '+p.nat+' · '+esc(p.ent)+' · Dificultad '+LOGT[p.log].toLowerCase()+'</small></span>'+
    '<span class="d-acc"><button class="btn" type="button" data-ficha="'+id+'" data-desde-sel="1">Ver ficha</button><button class="btn" type="button" data-quitar="'+id+'">Quitar</button></span></li>'}).join("")+'</ul>';
}
function textoSeleccion(){
  var nn = nivelNombre();
  return "MI SELECCIÓN DE PROYECTOS FORMATIVOS ("+nn+")\n\n"+fav.map(function(id,i){var p=porId[id];
    return (i+1)+". "+p.t+" — "+p.tipo+" · "+p.nat+" · "+p.ent+"\n   Entregable: "+p.niv[estado.nivel][0]}).join("\n")+
    "\n\nBanco de proyectos formativos · Diseño Instruccional UVP";
}
function alternarFav(id){
  var i = fav.indexOf(id); if(i<0) fav.push(id); else fav.splice(i,1);
  guardar("fav",fav); $("#n-sel").textContent = fav.length;
  var b = document.querySelector('.carta[data-id="'+id+'"] [data-fav]'); if(b) b.setAttribute("aria-pressed", fav.indexOf(id)>=0);
  if($("#ficha").open && fichaId===id) pintarFicha();
  if($("#seleccion").open) pintarSeleccion();
}

/* ---- eventos ---- */
function volteo(id){
  var c = document.querySelector('.carta[data-id="'+id+'"]'); if(!c) return;
  var v = c.classList.toggle("volteada");
  var foco = c.querySelector(v ? ".reverso .voltear" : ".frente .voltear"); if(foco) foco.focus({preventScroll:true});
}
document.addEventListener("click", function(e){
  var t;
  if((t=e.target.closest("[data-nivel]"))){ estado.nivel=t.dataset.nivel; guardar("nivel",estado.nivel); pintarChips(); pintar(); return; }
  if((t=e.target.closest("[data-tipo-f]"))){ estado.tipo=t.dataset.tipoF; pintarChips(); pintar(); return; }
  if((t=e.target.closest("[data-fav]"))){ alternarFav(t.dataset.fav); return; }
  if((t=e.target.closest("[data-voltear]"))){ volteo(t.dataset.voltear); return; }
  if((t=e.target.closest("[data-ficha]"))){ abrirFicha(t.dataset.ficha); return; }
  if((t=e.target.closest("[data-fnivel]"))){ fichaNivel=t.dataset.fnivel; pintarFicha(); return; }
  if((t=e.target.closest("[data-quitar]"))){ alternarFav(t.dataset.quitar); return; }
  // tocar el frente de la tarjeta también la voltea
  if((t=e.target.closest(".frente")) && !e.target.closest("button")){ volteo(t.closest(".carta").dataset.id); }
});
[["#f-nat","nat"],["#f-ent","ent"],["#f-area","area"],["#f-log","log"],["#f-eq","eq"]].forEach(function(x){
  $(x[0]).addEventListener("change", function(e){estado[x[1]]=e.target.value; pintar()});
});
$("#f-q").addEventListener("input", function(e){estado.q=e.target.value; pintar()});
function limpiar(){
  estado.tipo=estado.q=estado.nat=estado.ent=estado.area=estado.log=estado.eq=""; estado.orden=null;
  ["#f-nat","#f-ent","#f-area","#f-log","#f-eq","#f-q"].forEach(function(s){$(s).value=""});
  pintarChips(); pintar();
}
$("#b-limpiar").addEventListener("click", limpiar);
$("#b-limpiar2").addEventListener("click", limpiar);
$("#b-barajar").addEventListener("click", function(){
  var ids = PF.map(function(p){return p.id});
  for(var i=ids.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)); var x=ids[i]; ids[i]=ids[j]; ids[j]=x}
  estado.orden = ids; pintar();
});
$("#b-sorpresa").addEventListener("click", function(){
  var l = visibles(); if(!l.length){ limpiar(); l = visibles(); }
  var p = l[Math.floor(Math.random()*l.length)];
  var c = document.querySelector('.carta[data-id="'+p.id+'"]'); if(!c) return;
  c.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth", block:"center"});
  if(!c.classList.contains("volteada")) setTimeout(function(){volteo(p.id)},350);
});
$("#b-sel").addEventListener("click", function(){ pintarSeleccion(); var d=$("#seleccion"); if(d.showModal) d.showModal(); else d.setAttribute("open",""); });

/* diálogos */
function cerrar(d){ document.body.classList.remove("imp"); if(d.open){ if(d.close) d.close(); else d.removeAttribute("open"); } }
$("#fi-x").addEventListener("click", function(){cerrar($("#ficha"))});
$("#se-x").addEventListener("click", function(){cerrar($("#seleccion"))});
["#ficha","#seleccion"].forEach(function(s){ $(s).addEventListener("click", function(e){ if(e.target===this) cerrar(this) }); });
$("#fi-copiar").addEventListener("click", function(){ copiar(textoAmoxtli(porId[fichaId], fichaNivel), "#fi-ok") });
$("#fi-fav").addEventListener("click", function(){ alternarFav(fichaId) });
$("#se-copiar").addEventListener("click", function(){ copiar(textoSeleccion(), "#se-ok") });
function imprimir(){ document.body.classList.add("imp"); setTimeout(function(){ window.print(); },50) }
$("#fi-imp").addEventListener("click", imprimir);
$("#se-imp").addEventListener("click", imprimir);
window.addEventListener("afterprint", function(){ document.body.classList.remove("imp") });

/* ---- ¿Qué nivel pide tu competencia? (Modelo Tlamatini, Tabla 3, p. 103) ---- */
var NIV_TL = [
  ["Conocimiento","Primer nivel: el estudiante recuerda la información.",["Organizador gráfico","Prueba objetiva"],["Investigación"],"Es un nivel de entrada: conviene más para las evidencias de los primeros avances que para el proyecto completo."],
  ["Comprensión","Segundo nivel: además de saber los conceptos, los explica con sus propias palabras.",["Presentación oral","Mapa mental","Mapa conceptual"],["Investigación","Problema"],"Úsalo para el 1.er avance: que expliquen el problema o el tema con sus palabras."],
  ["Aplicación","Tercer nivel: pone en práctica lo que ya comprendió.",["Experimentación"],["Experiencia","Prototipo"],""],
  ["Análisis","Cuarto nivel: divide el objeto de estudio en sus partes y las relaciona entre sí.",["Proyecto","Reporte"],["Proyecto","Problema"],""],
  ["Evaluación","Quinto nivel: emite juicios basados en criterios y valora el conocimiento.",["Ensayo","Reflexión teórica"],["Problema","Investigación"],""],
  ["Creación","Sexto nivel: usa lo aprendido para desarrollar conocimiento nuevo.",["Investigación empírica"],["Investigación","Prototipo","Proyecto"],""]
];
var tlN = $("#tl-niveles"), tlR = $("#tl-res");
if(tlN && tlR){
  tlN.innerHTML = NIV_TL.map(function(n,i){return '<button type="button" class="chip" data-tl="'+i+'" aria-pressed="false">'+(i+1)+'. '+n[0]+'</button>'}).join("");
  tlR.innerHTML = '<p class="tl-ayuda">Elige el nivel que corresponde al verbo de tu competencia (por ejemplo, «explica» es comprensión; «diseña» o «propone» es creación).</p>';
  tlN.addEventListener("click", function(e){
    var b = e.target.closest("[data-tl]"); if(!b) return;
    var n = NIV_TL[+b.dataset.tl];
    tlN.querySelectorAll("[data-tl]").forEach(function(x){x.setAttribute("aria-pressed", x===b)});
    tlR.innerHTML = '<p><b>'+n[0]+'.</b> '+esc(n[1])+'</p>'+
      '<p><span class="tl-k">El modelo sugiere:</span> '+n[2].map(esc).join(", ")+'.</p>'+
      '<p><span class="tl-k">Tipos del banco que encajan:</span></p><div class="chips">'+n[3].map(function(t){return '<button type="button" class="chip" data-tipo="'+t+'" data-tl-tipo="'+t+'"><i></i>Ver ideas de '+t+'</button>'}).join("")+'</div>'+
      (n[4] ? '<p class="tl-ayuda">'+esc(n[4])+'</p>' : "");
  });
  tlR.addEventListener("click", function(e){
    var t = e.target.closest("[data-tl-tipo]"); if(!t) return;
    estado.tipo = t.dataset.tlTipo; pintarChips(); pintar();
    $("#mazo").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth", block:"start"});
  });
}

/* inicio */
pintarChips(); pintar();
})();
