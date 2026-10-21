/* Diseño Instruccional · Sable, asistente del Centro de Recursos (sin IA).
   Busca en todo lo que ya está en el sitio: las tarjetas de tutoriales, materiales y recursos (ESPACIOS),
   las preguntas frecuentes (FAQ) y las secciones fijas. Responde con botones que abren cada material.
   No inventa respuestas ni envía nada fuera del navegador.
   Además arma en el inicio el saludo de Sable, «¿Qué necesitas hoy?» y la ruta del primer ciclo, y agrega
   microanimaciones que respetan «reducir movimiento» (sistema o panel de Accesibilidad). */
(function(){
  "use strict";
  var RAIZ = (document.currentScript && document.currentScript.src || "").replace(/sable-asistente\.js.*$/, "");
  var IMG = { hola: RAIZ + "img/sable-asis-hola.png", piensa: RAIZ + "img/sable-asis-piensa.png", celebra: RAIZ + "img/sable-asis-celebra.png" };
  var e$ = function(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  var norm = function(s){ return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
  var sinEtiquetas = function(h){ var d = document.createElement("div"); d.innerHTML = h; return d.textContent || ""; };
  var reduce = function(){ return (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || document.documentElement.classList.contains("a11y-movimiento"); };
  var guarda = function(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  var lee = function(k, d){ try{ var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } };

  /* ---------- índice de búsqueda: todo sale de los datos que ya pinta la página ---------- */
  var INDICE = [];
  function agrega(o){ o.nt = norm(o.t); o.nb = norm([o.d, o.para, o.extra, o.grupo].join(" ")); INDICE.push(o); }
  function recorre(lista, plat, sec){
    (lista || []).forEach(function(gr){
      if(gr.destacada){ var x = gr.destacada; agrega({ t:x.t, d:x.d, extra:(x.niveles || []).join(" "), para:x.para, acc:x.acc, plat:plat, sec:sec, grupo:"Guía recomendada" }); return; }
      (gr.it || []).forEach(function(x){ if(x.e === "pend") return; agrega({ t:x.t, d:x.d, para:x.para, acc:x.acc, plat:plat, sec:sec, grupo:gr.g }); });
    });
  }
  try{
    var E = ESPACIOS.docentes;
    recorre(E.tutoriales.edx, "edx", "Tutoriales"); recorre(E.tutoriales.nueva, "nueva", "Tutoriales");
    recorre(E.materiales, null, "Materiales"); recorre(E.recursos, null, "Recursos recomendados");
  }catch(e){}
  try{
    FAQ.docentes.temas.forEach(function(tm, i){ tm.q.forEach(function(q){
      var plat = /tag edx/.test(q[0]) ? "edx" : /tag nueva/.test(q[0]) ? "nueva" : null;
      agrega({ tipo:"faq", t:sinEtiquetas(q[0]).replace(/^\s*(ol|online)\.uvp\.mx\s*/i, "").trim(), d:sinEtiquetas(q[1]), html:q[1], plat:plat, sec:"Preguntas frecuentes", grupo:tm.g, ancla:"#faq-docentes-" + i });
    }); });
  }catch(e){}
  [
    { t:"Asesorías en vivo por Google Meet", d:"Resuelve una duda en vivo, sin cita: lunes a viernes de 10:00 a 11:00, 12:00 a 13:00 y 16:00 a 17:00, y sábado de 11:00 a 12:00.", extra:"ayuda soporte meet duda asesoria en vivo horario", ir:"#asesorias" },
    { t:"Asesorías personalizadas con cita", d:"Elige fecha y hora para revisar tu aula virtual o estructurar una asignatura con alguien del equipo.", extra:"agendar cita asesoria personalizada revisar aula", ir:"#asesorias" },
    { t:"Equipo de Diseño Instruccional", d:"Las personas que dan soporte a las plataformas y acompañan a los docentes, con su correo.", extra:"contacto correo equipo escribir diseno instruccional", ir:"#asesorias" },
    { t:"Asistencia en el campus Tehuacán", d:"Si trabajas en el campus Tehuacán, también puedes pedir apoyo a Lic. Josué Humberto Cruz Arellano: atpvespertino.teh@uvp.mx. Diseño Instruccional también te atiende.", extra:"tehuacan campus asistencia apoyo contacto", ir:"#asesorias", foco:"#tehuacan" },
    { t:"Reportes para coordinaciones", d:"Cada coordinación consulta el estado de las aulas virtuales de su licenciatura, por plantel.", extra:"coordinacion coordinador reporte licenciatura plantel puebla tehuacan tlaxcala", ir:"#coordinaciones" },
    { t:"¿Cuál es tu UVP Online?", d:"Compara la dirección y la pantalla de entrada de ol.uvp.mx y online.uvp.mx para saber en cuál está tu materia.", extra:"plataforma cual dos edx nueva direccion", ir:"#inicio", foco:".plats" },
    { t:"Ejercicios de bienestar digital", d:"Respiración guiada, la regla 20·20·20, estiramientos y bloques de enfoque para trabajar frente a la pantalla.", extra:"estres cansancio pausa descanso respirar vista estiramiento", ir:"#bienestar" },
    { t:"Música para concentrarte", d:"Un pentagrama que compone música ambiental y un reproductor lo-fi generativo con tocadiscos, retro y arcade.", extra:"musica lofi relajarse concentrar radio", ir:"#bienestar-musica" },
    { t:"Accesibilidad del sitio", d:"Agranda la letra, cambia el contraste, reduce el movimiento o escucha la página en voz alta.", extra:"letra grande contraste voz alta leer movimiento accesibilidad", a11y:true }
  ].forEach(function(o){ o.sec = "Centro de Recursos"; agrega(o); });

  var SINONIMOS = [
    ["prorroga","prorrogas","extension","extensiones","tiempo","ampliar","atrasado","tarde"],
    ["calificar","calificacion","calificaciones","nota","notas","evaluar","puntaje","libro","parcial"],
    ["fecha","fechas","plazo","vencimiento","limite","cierre","calendario","liberacion"],
    ["pdf","archivo","archivos","documento","lectura","lecturas","subir","cargar"],
    ["video","videos","youtube"],
    ["entrar","acceso","ingresar","login","sesion","contrasena","cuenta","bloqueado","credenciales"],
    ["amoxtli","firma","firmar","formativo","enterado","enterados"],
    ["foro","foros","discusion","discusiones","participaciones"],
    ["cuestionario","examen","quiz","opcion","multiple"],
    ["guion","guiones","planeacion","planear","formato","formatos","plantilla"],
    ["error","falla","problema","funciona","403","500","congela","congelo"],
    ["alumno","alumnos","estudiante","estudiantes","inscrito","inscripcion","listado","aparece"],
    ["estres","cansado","cansada","pausa","descanso","respirar","respiracion","bienestar","relajar"],
    ["musica","lofi","cancion","canciones","radio"],
    ["asesoria","asesorias","ayuda","duda","dudas","cita","agendar","meet","soporte"],
    ["genially","canva","presentacion","interactiva","aplicacion","aplicaciones","herramienta","herramientas","prompts"],
    ["comprimir","pesado","peso","reducir","ilovepdf","smallpdf"],
    ["publicar","publicado","borrador","guardar","editar","cambios"],
    ["coordinacion","coordinador","coordinadora","reporte","reportes","licenciatura"],
    ["induccion","curso","formacion","capacitacion","eva"],
    ["proyecto","proyectos","ideas","banco","tlamatini"]
  ];
  var VACIAS = " de la el los las un una unos unas y o u en para por con sin mi mis me como que cual cuales donde cuando se a al lo le les es son hay hago hacer hace puedo puede quiero necesito tengo debo del su sus tu tus ya no si este esta esto eso esa ese mas muy otra otro algo como quien ";
  // la dirección de la plataforma no cuenta como palabra buscada: solo sirve para elegir ol.uvp.mx u online.uvp.mx
  var PLATAF = " ol uvp mx online edx nueva plataforma studio ";
  function palabras(q){ return norm(q).replace(/[^a-z0-9ñ\s]/g, " ").split(/\s+/).filter(function(w){ return w.length > 1 && VACIAS.indexOf(" " + w + " ") < 0 && PLATAF.indexOf(" " + w + " ") < 0; }); }
  function buscar(q){
    var ws = palabras(q), extra = [];
    if(!ws.length) return [];
    ws.forEach(function(w){ SINONIMOS.forEach(function(g){ if(g.some(function(s){ return s === w || (w.length > 4 && s.length > 4 && (s.indexOf(w) === 0 || w.indexOf(s) === 0)); })) g.forEach(function(s){ if(ws.indexOf(s) < 0 && extra.indexOf(s) < 0) extra.push(s); }); }); });
    var nq = norm(q), pide = /\bol\b|edx|studio|ol\.uvp/.test(nq) ? "edx" : /online\.uvp|nueva|online/.test(nq) ? "nueva" : null, pref = pide || lee("plat", null);
    var r = INDICE.map(function(o){
      var s = 0, enTitulo = 0, sx = 0;
      ws.forEach(function(w){ var raiz = w.length > 5 ? w.slice(0, w.length - 1) : w; if(o.nt.indexOf(raiz) >= 0){ s += 3; enTitulo++; } else if(o.nb.indexOf(raiz) >= 0) s += 1; });
      if(ws.length > 1 && enTitulo === ws.length) s += 2;          // todas las palabras están en el título
      extra.forEach(function(w){ if(o.nt.indexOf(w) >= 0) sx += 1.2; else if(o.nb.indexOf(w) >= 0) sx += .5; });
      s += Math.min(sx, 2);                                         // los sinónimos ayudan, pero no mandan
      if(s && o.plat){ if(pide && o.plat !== pide) s *= .3; else if(pref && o.plat === pref) s += .6; }
      return { o:o, s:s };
    }).filter(function(x){ return x.s >= 1.5; }).sort(function(a, b){ return b.s - a.s; });
    if(!r.length) return [];
    var tope = r[0].s; return r.filter(function(x){ return x.s >= tope * .45; }).slice(0, 3).map(function(x){ return x.o; });
  }

  /* ---------- panel de Sable ---------- */
  var DEST = [];
  var PLAT = { edx:'<span class="sb-tag edx">ol.uvp.mx</span>', nueva:'<span class="sb-tag nueva">online.uvp.mx</span>' };
  function botones(o){
    var h = "";
    (o.acc || []).slice(0, 3).forEach(function(a){
      var d = a[1]; if(!d) return;
      if(d.externo) h += '<a class="sb-ac" href="' + e$(d.externo) + '" target="_blank" rel="noopener">' + e$(a[0]) + ' ↗<span class="a11y-oculto"> (se abre en una pestaña nueva)</span></a>';
      else h += '<button type="button" class="sb-ac" data-sb-abrir="' + (DEST.push(d) - 1) + '">' + e$(a[0]) + '</button>';
    });
    if(o.ir) h += '<a class="sb-ac" href="' + o.ir + '" data-sb-ir="' + e$(o.foco || "") + '">Ir a la sección</a>';
    if(o.a11y) h += '<button type="button" class="sb-ac" data-sb-a11y>Abrir accesibilidad</button>';
    if(o.tipo === "faq") h += '<a class="sb-ac sec" href="' + o.ancla + '" data-sb-ir="">Ver en Preguntas frecuentes</a>';
    return h ? '<div class="sb-acs">' + h + '</div>' : "";
  }
  function tarjetaR(o){
    var cuerpo = o.tipo === "faq" ? '<div class="sb-r-txt">' + o.html + '</div>' : (o.d ? '<p class="sb-r-txt">' + e$(o.d) + '</p>' : "");
    return '<article class="sb-r"><div class="sb-r-meta">' + (o.plat ? PLAT[o.plat] : "") + '<span>' + e$(o.sec) + (o.grupo && o.tipo !== "faq" ? " · " + e$(o.grupo) : "") + '</span></div><h4>' + e$(o.t) + '</h4>' + cuerpo + botones(o) + '</article>';
  }
  var SUGERENCIAS = ["Dar una prórroga", "Calificar una entrega", "Llenar el Amoxtli", "Subir un PDF", "Me sale error 403", "Agendar una asesoría"];
  var fab, panel, conv, caja, abierto = false;
  function burbuja(html, quien, img){
    var d = document.createElement("div"); d.className = "sb-msg sb-" + quien;
    d.innerHTML = (quien === "sable" ? '<img class="sb-mini" src="' + (img || IMG.hola) + '" alt="">' : "") + '<div class="sb-bur">' + html + '</div>';
    conv.appendChild(d); conv.scrollTop = conv.scrollHeight; return d;
  }
  function responder(q){
    q = String(q || "").trim(); if(!q) return;
    burbuja("<p>" + e$(q) + "</p>", "yo");
    // comando del equipo de DI para que su navegador no cuente en el contador de visitas
    var nq = norm(q).replace(/[^a-z\s]/g, "").trim();
    if(nq === "no contar mis visitas" || nq === "contar mis visitas"){
      var fuera = nq === "no contar mis visitas";
      try{ document.dispatchEvent(new CustomEvent("contador:excluir", { detail:{ excluir: fuera } })); }catch(e){}
      burbuja("<p>" + (fuera ? "Listo: las visitas de este navegador ya no se cuentan. Si quieres volver a contarlas, escríbeme «contar mis visitas»." : "Listo: las visitas de este navegador vuelven a contarse desde la próxima vez que abras el sitio.") + "</p>", "sable");
      return;
    }
    var r = buscar(q);
    try{ document.dispatchEvent(new CustomEvent("sable:pregunta", { detail:{ encontrado: r.length > 0 } })); }catch(e){}   // para el contador de visitas (sin el texto)
    var pensando = burbuja('<p class="sb-pensando"><span></span><span></span><span></span><span class="a11y-oculto">Buscando…</span></p>', "sable", IMG.piensa);
    setTimeout(function(){
      pensando.remove();
      if(r.length){
        burbuja("<p>" + (r.length > 1 ? "Esto es lo que encontré:" : "Encontré esto:") + "</p>" + r.map(tarjetaR).join(""), "sable");
      } else {
        burbuja("<p>No encontré nada sobre «" + e$(q) + "». Prueba con otras palabras, como «prórroga», «calificar» o «Amoxtli».</p>" +
          "<p>O pregúntale a una persona del equipo:</p><div class=\"sb-acs\"><a class=\"sb-ac\" href=\"#asesorias\" data-sb-ir=\"\">Asesorías en vivo</a><a class=\"sb-ac sec\" href=\"#faq-docentes\" data-sb-ir=\"\">Preguntas frecuentes</a></div>", "sable", IMG.piensa);
      }
    }, reduce() ? 0 : 450);
  }
  function construye(){
    fab = document.createElement("button");
    fab.type = "button"; fab.className = "sb-fab"; fab.id = "sb-fab";
    fab.setAttribute("aria-expanded", "false"); fab.setAttribute("aria-controls", "sb-panel");
    fab.innerHTML = '<img src="' + IMG.hola + '" alt=""><span class="sb-fab-t">Pregúntale a Sable</span>';
    fab.setAttribute("aria-label", "Pregúntale a Sable, el asistente del Centro de Recursos");
    panel = document.createElement("section");
    panel.className = "sb-panel"; panel.id = "sb-panel"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-labelledby", "sb-tit");
    panel.innerHTML = '<header class="sb-cab"><img src="' + IMG.hola + '" alt=""><div><h2 id="sb-tit">Sable</h2><p>Tu asistente del Centro de Recursos</p></div><button type="button" class="sb-x" aria-label="Cerrar a Sable">×</button></header>' +
      '<div class="sb-conv" id="sb-conv" aria-live="polite"></div>' +
      '<form class="sb-form"><label class="a11y-oculto" for="sb-q">Escribe tu pregunta</label><input id="sb-q" type="text" autocomplete="off" placeholder="Ej.: ¿cómo doy una prórroga?" maxlength="160"><button type="submit">Buscar</button></form>' +
      '<p class="sb-nota">Busco solo en el Centro de Recursos. Para algo urgente, entra a las asesorías en vivo.</p>';
    document.body.appendChild(panel); document.body.appendChild(fab);
    conv = panel.querySelector(".sb-conv"); caja = panel.querySelector("#sb-q");
    burbuja("<p>¡Hola! Soy <b>Sable</b>. Escríbeme qué necesitas y lo busco en todo el Centro de Recursos: tutoriales, videos, fichas, guías y preguntas frecuentes.</p>" +
      '<div class="sb-sug">' + SUGERENCIAS.map(function(s){ return '<button type="button" data-sb-q="' + e$(s) + '">' + e$(s) + '</button>'; }).join("") + '</div>', "sable");
    fab.addEventListener("click", function(){ abierto ? cerrar() : abrir(); });
    panel.querySelector(".sb-x").addEventListener("click", function(){ cerrar(true); });
    panel.querySelector("form").addEventListener("submit", function(ev){ ev.preventDefault(); var q = caja.value; caja.value = ""; responder(q); });
    panel.addEventListener("keydown", function(ev){ if(ev.key === "Escape"){ ev.stopPropagation(); cerrar(true); } });
    panel.addEventListener("click", function(ev){
      var s = ev.target.closest("[data-sb-q]"); if(s){ responder(s.dataset.sbQ); return; }
      var b = ev.target.closest("[data-sb-abrir]"); if(b){ try{ abrirVisor(DEST[+b.dataset.sbAbrir]); }catch(x){} return; }
      if(ev.target.closest("[data-sb-a11y]")){ try{ abrirA11y(); }catch(x){} return; }
      var a = ev.target.closest("[data-sb-ir], .sb-r-txt a[href^='#']");
      if(a){ var f = a.dataset.sbIr || ""; if(innerWidth < 700) cerrar(); if(f) setTimeout(function(){ var el = document.querySelector(f); if(el) el.scrollIntoView({ block:"center", behavior: reduce() ? "auto" : "smooth" }); }, 120); }
    });
  }
  function abrir(q){
    panel.hidden = false; abierto = true; fab.setAttribute("aria-expanded", "true"); fab.classList.add("sb-on");
    var g = document.querySelector(".sb-globo"); if(g) g.remove();
    if(q) responder(q);
    setTimeout(function(){ caja.focus(); }, 30);
  }
  function cerrar(foco){ panel.hidden = true; abierto = false; fab.setAttribute("aria-expanded", "false"); fab.classList.remove("sb-on"); if(foco) fab.focus(); }
  construye();
  window.Sable = { abrir:abrir, preguntar:function(q){ abrir(q); }, buscar:buscar };
  // Un saludo breve la primera vez de cada sesión
  try{ if(!sessionStorage.getItem("sb-saludo")){ sessionStorage.setItem("sb-saludo", "1"); setTimeout(function(){ if(abierto) return; var g = document.createElement("div"); g.className = "sb-globo"; g.innerHTML = '¿Buscas algo? Pregúntame <button type="button" aria-label="Cerrar aviso">×</button>'; g.querySelector("button").onclick = function(){ g.remove(); }; document.body.appendChild(g); setTimeout(function(){ g.remove(); }, 9000); }, 5000); } }catch(e){}

  /* ---------- inicio: saludo, «¿Qué necesitas hoy?» y ruta del primer ciclo ---------- */
  var ini = document.getElementById("v-inicio"), hero = ini && ini.querySelector(".hero");
  var CONSEJOS = [
    "Mira la dirección en tu navegador: ol.uvp.mx y online.uvp.mx tienen tutoriales distintos.",
    "¿Te sale «Acceso bloqueado»? Entra con tu cuenta @uvp.edu.mx, no con la @uvp.mx.",
    "Sube tus lecturas en PDF: se leen bien desde cualquier dispositivo.",
    "En ol.uvp.mx, lo que cambias en Studio llega a tus alumnos solo cuando lo publicas.",
    "Si un solo alumno necesita más tiempo, dale una prórroga en lugar de mover la fecha a todo el grupo.",
    "Las asesorías en vivo por Meet son de lunes a sábado y no necesitas cita.",
    "En online.uvp.mx llenas y firmas tu Amoxtli en «Solo docentes: Hoja digital del Amoxtli».",
    "Cada 20 minutos, mira algo a 6 metros durante 20 segundos: tus ojos lo agradecen. Está en Bienestar.",
    "Si ves un error 500, no insistas con muchos clics: toma una captura y avisa a Diseño Instruccional.",
    "El Catálogo de aplicaciones trae 27 herramientas con prompts de IA listos para usar.",
    "El panel de Accesibilidad agranda la letra y lee la página en voz alta.",
    "¿Necesitas ideas para tu proyecto formativo integrador? Revisa el Banco de proyectos formativos en Materiales."
  ];
  function saludoHora(){ var h = new Date().getHours(); return h < 12 ? "¡Buenos días!" : h < 19 ? "¡Buenas tardes!" : "¡Buenas noches!"; }
  var nConsejo = Math.floor(Math.random() * CONSEJOS.length);
  var NECESITO = [
    ["🚀", "Empezar mi ciclo", { ruta:1 }],
    ["✅", "Calificar", { q:"Calificar una entrega" }],
    ["📤", "Subir contenido", { q:"Subir un PDF o un video" }],
    ["📅", "Fechas y prórrogas", { q:"Cambiar una fecha o dar una prórroga" }],
    ["📝", "Llenar mi Amoxtli", { q:"Amoxtli" }],
    ["🛠️", "Algo no funciona", { q:"Error o falla en la plataforma" }],
    ["🌿", "Tomar un respiro", { ir:"#bienestar" }]
  ];
  function destinoAmoxtli(){ var o = INDICE.find(function(x){ return /amoxtli digital/i.test(x.t); }); return o && o.acc ? (o.acc.find(function(a){ return /ficha/i.test(a[0]); }) || o.acc[0])[1] : null; }
  var RUTA = [
    { t:"Identifica tu plataforma", d:"Mira la dirección: ol.uvp.mx u online.uvp.mx.", b:[["Comparar plataformas", { foco:".plats" }]] },
    { t:"Entra con tu cuenta @uvp.edu.mx", d:"La cuenta @uvp.mx es administrativa y no abre tus aulas.", b:[["¿Cómo entro?", { q:"Cómo ingreso a mis aulas virtuales" }]] },
    { t:"Descarga tu guion instruccional", d:"La plantilla oficial de tu modalidad para planear la asignatura.", b:[["Ver guiones", { ir:"#docentes-tutoriales" }]] },
    { t:"Recorre la guía de tu plataforma", d:"Paso a paso, con búsqueda y práctica.", b:[["ol.uvp.mx", { ver:"guia" }], ["online.uvp.mx", { guiaNueva:1 }]] },
    { t:"Llena y firma tu Amoxtli", d:"Solo en online.uvp.mx: proyecto, avances y, al final, tu firma.", b:[["Ver cómo", { amoxtli:1 }]] },
    { t:"Revisa las fechas de tus semanas", d:"Que cada semana abra y cierre cuando debe.", b:[["¿Cómo cambio una fecha?", { q:"Cambiar una fecha de entrega" }]] },
    { t:"Ubica tus asesorías", d:"En vivo sin cita o personalizadas con cita.", b:[["Ver asesorías", { ir:"#asesorias" }]] }
  ];
  function accion(a){
    if(a.q) return abrir(a.q);
    if(a.ir){ location.hash = a.ir; return; }
    if(a.ruta){ var r = document.getElementById("sb-ruta"); if(r){ r.scrollIntoView({ block:"start", behavior: reduce() ? "auto" : "smooth" }); var c = r.querySelector("input"); if(c) setTimeout(function(){ c.focus({ preventScroll:true }); }, 400); } return; }
    if(a.foco){ var el = document.querySelector(a.foco); if(el) el.scrollIntoView({ block:"center", behavior: reduce() ? "auto" : "smooth" }); return; }
    try{
      if(a.ver) return abrirVisor(VER[a.ver]);
      if(a.guiaNueva) return abrirVisor(nuevaDoc[0].destacada.acc[0][1]);
      if(a.amoxtli){ var d = destinoAmoxtli(); if(d) abrirVisor(d); }
    }catch(e){}
  }
  if(hero){
    var bloque = document.createElement("div"); bloque.className = "sb-inicio";
    bloque.innerHTML =
      '<div class="sb-hola"><img src="' + IMG.hola + '" alt="" width="120" height="120"><div><p class="sb-hola-t"><b>' + saludoHora() + '</b> Soy Sable, tu asistente del Centro de Recursos.</p>' +
        '<p class="sb-consejo" aria-live="polite"><span>Consejo:</span> <span id="sb-consejo-t">' + e$(CONSEJOS[nConsejo]) + '</span></p>' +
        '<div class="sb-hola-b"><button type="button" class="accion" data-sb-preg>Pregúntame algo</button><button type="button" class="accion sec" data-sb-otro>Otro consejo</button></div></div></div>' +
      '<div class="sb-hoy"><h2>¿Qué necesitas hoy?</h2><div class="sb-chips">' + NECESITO.map(function(n, i){ return '<button type="button" data-sb-hoy="' + i + '"><span aria-hidden="true">' + n[0] + '</span>' + e$(n[1]) + '</button>'; }).join("") + '</div></div>';
    hero.insertAdjacentElement("afterend", bloque);
    bloque.addEventListener("click", function(ev){
      if(ev.target.closest("[data-sb-preg]")) return abrir();
      if(ev.target.closest("[data-sb-otro]")){ nConsejo = (nConsejo + 1) % CONSEJOS.length; var t = document.getElementById("sb-consejo-t"); t.classList.remove("sb-entra"); void t.offsetWidth; t.textContent = CONSEJOS[nConsejo]; t.classList.add("sb-entra"); return; }
      var h = ev.target.closest("[data-sb-hoy]"); if(h) accion(NECESITO[+h.dataset.sbHoy][2]);
    });
    // ruta del primer ciclo, antes de «Lo más consultado»
    var hecho = lee("di-ruta-v1", []);
    var ruta = document.createElement("div"); ruta.className = "bloque sb-ruta"; ruta.id = "sb-ruta";
    ruta.innerHTML = '<header><h2>Ruta del primer ciclo</h2><p>Siete pasos para arrancar sin contratiempos. Palomea cada uno al terminarlo: tu avance se guarda en este navegador.</p></header>' +
      '<div class="sb-avance"><div class="sb-barra" role="progressbar" aria-label="Avance de la ruta" aria-valuemin="0" aria-valuemax="' + RUTA.length + '"><i></i></div><span id="sb-avance-t"></span></div>' +
      '<ol class="sb-pasos">' + RUTA.map(function(p, i){ return '<li><label><input type="checkbox" data-sb-paso="' + i + '"' + (hecho.indexOf(i) >= 0 ? " checked" : "") + '><span><b>' + e$(p.t) + '</b><small>' + e$(p.d) + '</small></span></label><span class="sb-paso-b">' + p.b.map(function(b, k){ return '<button type="button" class="sb-mini-b" data-sb-rb="' + i + '-' + k + '">' + e$(b[0]) + '</button>'; }).join("") + '</span></li>'; }).join("") + '</ol>' +
      '<div class="sb-fiesta" id="sb-fiesta" hidden><img src="' + IMG.celebra + '" alt="" width="110" height="110"><div><p><b>¡Listo para tu primer ciclo!</b> Completaste la ruta. Si algo surge en el camino, aquí sigo.</p><button type="button" class="accion sec" data-sb-reinicia>Reiniciar la ruta</button></div><div class="sb-confeti" aria-hidden="true"></div></div>';
    var consultado = [].slice.call(ini.querySelectorAll(".bloque")).filter(function(b){ return /Lo más consultado/.test(b.textContent); })[0];
    if(consultado) consultado.insertAdjacentElement("beforebegin", ruta); else ini.appendChild(ruta);
    function pintaAvance(celebrar){
      var n = hecho.length, b = ruta.querySelector(".sb-barra");
      b.setAttribute("aria-valuenow", n); b.querySelector("i").style.width = (100 * n / RUTA.length) + "%";
      document.getElementById("sb-avance-t").textContent = n + " de " + RUTA.length + " pasos";
      var f = document.getElementById("sb-fiesta"), listo = n === RUTA.length; f.hidden = !listo;
      if(listo && celebrar && !reduce()){ var c = f.querySelector(".sb-confeti"); c.innerHTML = ""; for(var i = 0; i < 28; i++){ var s = document.createElement("i"); s.style.setProperty("--x", (Math.random() * 100) + "%"); s.style.setProperty("--d", (Math.random() * .6) + "s"); s.style.setProperty("--c", ["#7B3FB8","#C4246B","#F0961E","#1A6B43","#F4C430"][i % 5]); c.appendChild(s); } }
    }
    ruta.addEventListener("change", function(ev){
      var c = ev.target.closest("[data-sb-paso]"); if(!c) return;
      var i = +c.dataset.sbPaso; hecho = hecho.filter(function(x){ return x !== i; }); if(c.checked) hecho.push(i);
      guarda("di-ruta-v1", hecho); pintaAvance(c.checked);
      if(c.checked && hecho.length === RUTA.length){ try{ anunciar("¡Completaste la ruta del primer ciclo!"); }catch(x){} }
    });
    ruta.addEventListener("click", function(ev){
      var b = ev.target.closest("[data-sb-rb]"); if(b){ var p = b.dataset.sbRb.split("-"); accion(RUTA[+p[0]].b[+p[1]][1]); return; }
      if(ev.target.closest("[data-sb-reinicia]")){ hecho = []; guarda("di-ruta-v1", hecho); ruta.querySelectorAll("[data-sb-paso]").forEach(function(c){ c.checked = false; }); pintaAvance(false); ruta.querySelector("input").focus(); }
    });
    pintaAvance(false);
  }
  // En Preguntas frecuentes: si no está tu duda, pregúntale a Sable
  var faq = document.querySelector("#v-faq-docentes .cab-esp");
  if(faq){ var p = document.createElement("p"); p.className = "sb-faq"; p.innerHTML = '<img src="' + IMG.piensa + '" alt="" width="40" height="40"> ¿No encuentras tu duda? <button type="button" class="sb-mini-b">Pregúntale a Sable</button>'; p.querySelector("button").onclick = function(){ abrir(); }; faq.appendChild(p); }

  /* ---------- microanimaciones: las piezas aparecen suavemente al bajar ---------- */
  if("IntersectionObserver" in window && !reduce()){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("sb-vis"); io.unobserve(en.target); } }); }, { rootMargin:"0px 0px -6% 0px" });
    document.querySelectorAll(".puerta, .plat, .rapido, .tj, .sec-t, .bloque > header, .sb-hola, .sb-hoy, .sb-pasos li").forEach(function(el, i){ el.classList.add("sb-rev"); el.style.setProperty("--sb-i", i % 6); io.observe(el); });
    setTimeout(function(){ document.querySelectorAll(".sb-rev:not(.sb-vis)").forEach(function(el){ var r = el.getBoundingClientRect(); if(r.top < innerHeight && r.bottom > 0) el.classList.add("sb-vis"); }); }, 1200);
  }
})();
