/* Aprende Más · preferencias de accesibilidad compartidas.
   Se carga en el sitio, la guía, las fichas y el catálogo. Las preferencias se guardan solo en este navegador. */
(function(){
  var CLAVE = "aprendemas-a11y";
  var DEF = {tam:0, tema:"sistema", contraste:false, fuente:false, espaciado:false, enlaces:false, movimiento:false, cursor:false, regla:false, leerSel:false, vel:1};
  var CLASES = ["contraste","fuente","espaciado","enlaces","movimiento","cursor"];
  var raiz = document.documentElement;
  var esCatalogo = !!window.tailwind;
  // Dentro del visor del sitio, el tamaño ya lo aplica la página principal: aquí no se vuelve a agrandar
  var dentroDelSitio = false;
  try{ dentroDelSitio = window.parent !== window && !!window.parent.A11Y; }catch(e){}
  var A = leer();

  function leer(){
    try{ return Object.assign({}, DEF, JSON.parse(localStorage.getItem(CLAVE) || "{}")); }
    catch(e){ return Object.assign({}, DEF); }
  }
  function guardar(){ try{ localStorage.setItem(CLAVE, JSON.stringify(A)); }catch(e){} }

  function aplicar(nuevo, porCambio){
    if(nuevo) A = Object.assign({}, DEF, nuevo);
    CLASES.forEach(function(k){ raiz.classList.toggle("a11y-"+k, !!A[k]); });
    if(A.tam && !dentroDelSitio) raiz.setAttribute("data-a11y-tam", A.tam); else raiz.removeAttribute("data-a11y-tam");
    if(A.contraste || A.tema==="oscuro") raiz.setAttribute("data-theme","dark");
    else if(A.tema==="claro") raiz.setAttribute("data-theme","light");
    else raiz.removeAttribute("data-theme");
    if(esCatalogo){
      if(A.contraste || A.tema==="oscuro") raiz.classList.add("dark");
      else if(A.tema==="claro") raiz.classList.remove("dark");
      else if(porCambio) raiz.classList.toggle("dark", !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches));
    }
    if(A.fuente && !document.getElementById("a11y-fuente")){
      var l = document.createElement("link");
      l.id = "a11y-fuente"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap";
      document.head.appendChild(l);
    }
    regla(A.regla);
    // Las páginas del mismo sitio abiertas dentro del visor reciben el cambio al momento
    Array.prototype.forEach.call(document.querySelectorAll("iframe"), function(f){
      try{ if(f.contentWindow && f.contentWindow.A11Y) f.contentWindow.A11Y.aplicar(A, true); }catch(e){}
    });
    if(typeof window.alCambiarA11y === "function") window.alCambiarA11y(A);
  }
  function fijar(k, v){ A[k] = v; guardar(); aplicar(null, true); }
  function restablecer(){ A = Object.assign({}, DEF); guardar(); aplicar(null, true); parar(); }

  // Guía de lectura
  var franjas = null, altoFranja = 64;
  function mover(y){
    if(!franjas) return;
    franjas[0].style.height = Math.max(0, y - altoFranja/2) + "px";
    franjas[1].style.height = Math.max(0, innerHeight - y - altoFranja/2) + "px";
  }
  function alMover(e){ var p = e.touches ? e.touches[0] : e; mover(p.clientY); }
  function regla(on){
    if(!document.body){ document.addEventListener("DOMContentLoaded", function(){ regla(A.regla); }, {once:true}); return; }
    if(on && !franjas){
      franjas = ["arriba","abajo"].map(function(c){ var d = document.createElement("div"); d.className = "a11y-regla "+c; d.setAttribute("aria-hidden","true"); document.body.appendChild(d); return d; });
      mover(innerHeight/3);
      addEventListener("mousemove", alMover, {passive:true}); addEventListener("touchmove", alMover, {passive:true});
    } else if(!on && franjas){
      franjas.forEach(function(d){ d.remove(); }); franjas = null;
      removeEventListener("mousemove", alMover); removeEventListener("touchmove", alMover);
    }
  }

  // Lectura en voz alta (síntesis de voz del navegador)
  var hayVoz = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  var cola = [], marcado = null, estado = "parado", alEstado = null;
  function voz(){
    var vs = speechSynthesis.getVoices();
    // Preferencia: español de México, luego de Latinoamérica o EE. UU., luego cualquier español
    var pref = [/^es[-_]MX/i, /^es[-_](419|US)/i, /^es/i];
    for(var i = 0; i < pref.length; i++){ var v = vs.filter(function(x){ return pref[i].test(x.lang); })[0]; if(v) return v; }
    return null;
  }
  function trozos(t){
    t = t.replace(/\s+/g," ").trim();
    var partes = t.match(/[^.!?¿¡;:]+[.!?;:]*\s*/g) || [t], out = [], act = "";
    partes.forEach(function(p){ if((act+p).length > 220 && act){ out.push(act); act = p; } else act += p; });
    if(act.trim()) out.push(act);
    return out;
  }
  function cambiarEstado(s){ estado = s; if(alEstado) alEstado(s); }
  function marcar(el){
    if(marcado) marcado.classList.remove("a11y-leyendo");
    marcado = el || null;
    if(marcado){ marcado.classList.add("a11y-leyendo"); try{ marcado.scrollIntoView({block:"center", behavior:A.movimiento ? "auto" : "smooth"}); }catch(e){} }
  }
  function siguiente(){
    if(!cola.length){ marcar(null); cambiarEstado("parado"); return; }
    var it = cola.shift();
    if(it.el !== marcado) marcar(it.el);
    var u = new SpeechSynthesisUtterance(it.t), g = turno;
    u.lang = "es-MX"; var v = voz(); if(v) u.voice = v; u.rate = A.vel || 1;
    u.onend = u.onerror = function(){ if(g === turno && estado === "leyendo") siguiente(); };
    speechSynthesis.speak(u);
  }
  var turno = 0;
  function hablar(bloques){
    if(!hayVoz) return;
    turno++; speechSynthesis.cancel(); cola = [];
    bloques.forEach(function(b){ trozos(b.t).forEach(function(t){ cola.push({t:t, el:b.el}); }); });
    cambiarEstado("leyendo"); siguiente();
  }
  function visible(el){
    if(el.closest("[hidden],[aria-hidden='true'],.a11y-oculto,script,style,noscript")) return false;
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
  var SEL = "h1,h2,h3,h4,h5,p,li,dt,dd,summary,figcaption,blockquote,td,th,label,.leer";
  function bloquesDe(r){
    var lista = [];
    Array.prototype.forEach.call(r.querySelectorAll(SEL), function(el){
      if(!visible(el)) return;
      if(el.parentElement && el.parentElement.closest(SEL)) return; // evita leer dos veces lo anidado
      var t = (el.innerText || el.textContent || "").trim();
      if(t.length > 1) lista.push({t:t, el:el});
    });
    return lista;
  }
  function leerPagina(r){ hablar(bloquesDe(r || document.querySelector("main") || document.body)); }
  function leerTexto(t){ hablar([{t:t, el:null}]); }
  function pausar(){ if(estado === "leyendo"){ speechSynthesis.pause(); cambiarEstado("pausa"); } else if(estado === "pausa"){ speechSynthesis.resume(); cambiarEstado("leyendo"); } }
  function parar(){ if(!hayVoz) return; turno++; cola = []; cambiarEstado("parado"); speechSynthesis.cancel(); marcar(null); }

  // Leer lo que la persona selecciona
  var ultima = "";
  function alSeleccionar(){
    if(!A.leerSel || !hayVoz) return;
    setTimeout(function(){
      var t = String(window.getSelection ? getSelection() : "").trim();
      if(t.length > 1 && t !== ultima){ ultima = t; leerTexto(t); }
    }, 10);
  }
  document.addEventListener("mouseup", alSeleccionar);
  document.addEventListener("touchend", alSeleccionar);
  document.addEventListener("keyup", function(e){ if(e.shiftKey) alSeleccionar(); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && estado !== "parado") parar(); });

  addEventListener("storage", function(e){ if(e.key === CLAVE){ A = leer(); aplicar(null, true); } });
  if(hayVoz && speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = function(){};

  window.A11Y = {
    get:function(){ return Object.assign({}, A); }, fijar:fijar, aplicar:aplicar, restablecer:restablecer,
    hayVoz:hayVoz, leerPagina:leerPagina, leerTexto:leerTexto, pausar:pausar, parar:parar,
    estado:function(){ return estado; }, alEstado:function(fn){ alEstado = fn; }
  };
  aplicar();
})();
