/* Diseño Instruccional · Contador de visitas anónimo del Centro de Recursos.
   Registra secciones visitadas, materiales abiertos en el visor, enlaces externos y preguntas a Sable
   (solo si encontró respuesta, nunca el texto). No guarda nombre, correo ni nada que identifique a la persona:
   cada navegador lleva un número al azar para contar visitantes únicos.
   Los eventos se juntan y se envían en grupo al Apps Script de la hoja «Contador de visitas DI».
   Solo cuenta en el sitio publicado (diuvp.github.io); en pruebas locales no envía nada. */
(function(){
  "use strict";
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbyndPDby3_ePvKGoYxqlfmxX-uM94LgE0Ti4h96bWZYY4R8kcA8YYcvLGjVwuoq2q18/exec";   // Apps Script «Contador de visitas DI». Vacía = no se envía nada.
  /* El equipo de DI puede excluir su navegador escribiéndole a Sable «no contar mis visitas» («contar mis visitas» lo revierte) */
  document.addEventListener("contador:excluir", function(e){ try{ if(e.detail && e.detail.excluir) localStorage.setItem("di-no-contar", "1"); else localStorage.removeItem("di-no-contar"); }catch(x){} });
  var excluido = false; try{ excluido = localStorage.getItem("di-no-contar") === "1"; }catch(e){}
  if(!ENDPOINT || location.hostname !== "diuvp.github.io" || excluido) return;

  var azar = function(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); };
  var visitante = null, nuevo = false, sesion = null;
  try{ visitante = localStorage.getItem("di-visitante"); if(!visitante){ visitante = azar(); nuevo = true; localStorage.setItem("di-visitante", visitante); } }catch(e){ visitante = azar(); }
  try{ sesion = sessionStorage.getItem("di-sesion"); if(!sesion){ sesion = azar(); sessionStorage.setItem("di-sesion", sesion); } else nuevo = false; }catch(e){ sesion = azar(); }
  var ua = navigator.userAgent || "";
  var disp = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? "Tableta" : /Mobi|iPhone|Android/i.test(ua) ? "Celular" : "Computadora";
  var nav = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Otro";
  var enSitio = false; try{ enSitio = window.top !== window.self; }catch(e){ enSitio = true; }
  var origen = enSitio ? "Google Site" : "Directo";

  var cola = [], reloj = null;
  function envia(){
    clearTimeout(reloj); reloj = null;
    if(!cola.length) return;
    var cuerpo = JSON.stringify({ tipo:"visitas", v:visitante, ses:sesion, nuevo:nuevo, disp:disp, nav:nav, origen:origen, eventos:cola.splice(0, 40) });
    nuevo = false;
    var ok = false;
    try{ if(navigator.sendBeacon) ok = navigator.sendBeacon(ENDPOINT, new Blob([cuerpo], { type:"text/plain;charset=utf-8" })); }catch(e){}
    if(!ok){ try{ fetch(ENDPOINT, { method:"POST", mode:"no-cors", keepalive:true, headers:{ "Content-Type":"text/plain;charset=utf-8" }, body:cuerpo }); }catch(e){} }
  }
  function registra(t, s, d){
    cola.push({ t:t, s:s || "", d:String(d || "").slice(0, 150), ts:Date.now(), id:azar() });
    if(cola.length >= 20) envia(); else if(!reloj) reloj = setTimeout(envia, 8000);
  }
  addEventListener("pagehide", envia);
  document.addEventListener("visibilitychange", function(){ if(document.visibilityState === "hidden") envia(); });

  /* secciones: una visita por cambio de sección (no por cada subapartado) */
  var NOM = { "inicio":"Inicio", "docentes":"Docentes", "coordinaciones":"Coordinaciones", "asesorias":"Asesorías", "bienestar":"Bienestar", "faq-docentes":"Preguntas frecuentes", "accesibilidad":"Accesibilidad" };
  function seccion(){
    var h = location.hash.slice(1) || "inicio"; if(h === "faq") h = "faq-docentes"; if(h === "musica") h = "bienestar";
    for(var k in NOM){ if(h === k || h.indexOf(k + "-") === 0) return NOM[k]; }
    return "Inicio";
  }
  /* Una sección se cuenta una vez por sesión cada 30 min: las recargas (o el editor de Google Sites, que recarga
     la página varias veces) no inflan el conteo. */
  var ultima = null, VENTANA = 30 * 60 * 1000;
  function yaContada(s){
    try{ var m = JSON.parse(sessionStorage.getItem("di-vistas") || "{}"), ahora = Date.now();
      if(m[s] && ahora - m[s] < VENTANA) return true; m[s] = ahora; sessionStorage.setItem("di-vistas", JSON.stringify(m)); }catch(e){}
    return false;
  }
  function vista(){ var s = seccion(); if(s !== ultima){ ultima = s; if(!yaContada(s)) registra("vista", s, location.hash.slice(1)); } }
  addEventListener("hashchange", vista); vista();

  /* materiales que se abren en el visor del sitio (videos, fichas, guías, documentos) */
  if(typeof window.abrirVisor === "function"){
    var abrir = window.abrirVisor;
    window.abrirVisor = function(d){ try{ if(d && d.titulo) registra("material", seccion(), d.titulo); }catch(e){} return abrir.apply(this, arguments); };
  }
  /* enlaces que salen del sitio (Meet, ol.uvp.mx, online.uvp.mx…) */
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest('a[target="_blank"]');
    if(a) registra("enlace", seccion(), (a.textContent || a.href).replace(/\(se abre en una pestaña nueva\)/, "").replace(/\s+/g, " ").trim());
  }, true);
  /* preguntas a Sable: solo si encontró respuesta */
  document.addEventListener("sable:pregunta", function(e){ registra("sable", seccion(), e.detail && e.detail.encontrado ? "Con respuesta" : "Sin respuesta"); });
})();
