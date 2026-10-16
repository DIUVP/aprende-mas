/* Diseño Instruccional · Reproductor lo-fi generativo (Bienestar › Música).
   Todo el sonido se genera en el navegador: acordes de jazz con piano eléctrico, bajo, batería suave con swing,
   ruido de vinilo y un ligero vaivén de cinta. Cada pista se arma al momento y nunca se repite igual.
   Tres máscaras para elegir: Tocadiscos (con Sable en la etiqueta de cada disco), Retro (inspirada en los reproductores
   de los 90) y Arcade (máquina de videojuegos con moneda de «juego libre»). */
(function(){
  var RAIZ = (document.currentScript && document.currentScript.src || "").replace(/lofi.js.*$/, "");
  var cont = document.getElementById("bienestar-lofi"); if(!cont || !window.DIAudio) return;
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  var reduce = DIAudio.reduce;

  /* ---------- discos: cada uno con su tempo, progresiones y escala para la melodía ---------- */
  var DISCOS = [
    {k:"cafe", n:"Café entre clases", d:"Diez minutos de calma antes del siguiente grupo.", pistas:["Pizarrón en blanco","Receso de diez minutos","Tiza y café","La pregunta de la última fila","Lista de asistencia","Hora libre"], bpm:80, swing:.17, color:"#E9A178", color2:"#F6D3B8",
     prog:[[[53,57,60,64],41],[[52,55,59,62],40],[[50,53,57,60],38],[[48,52,55,59],36]],
     prog2:[[[50,53,57,60],38],[[55,59,62,65],43],[[48,52,55,59],36],[[57,60,64,67],45]],
     esc:[65,67,69,72,74,77,79], lluvia:false},
    {k:"lluvia", n:"Lluvia sobre la biblioteca", d:"Gotas en la ventana de la sala de lectura.", pistas:["Silencio en la sala de lectura","Fichas bibliográficas","Página doblada","Notas al margen","Estante de consulta","Préstamo a domicilio"], bpm:72, swing:.15, color:"#7FB0D9", color2:"#CFE3F3",
     prog:[[[57,60,64,67,71],45],[[53,57,60,64],41],[[48,52,55,59],36],[[55,59,62,64],43]],
     prog2:[[[53,57,60,64],41],[[52,55,59,62],40],[[57,60,64,67],45],[[55,59,62,65],43]],
     esc:[69,72,74,76,79,81,84], lluvia:true},
    {k:"noche", n:"Apuntes a medianoche", d:"Jazz bajito para concentrarte y repasar.", pistas:["Subrayado amarillo","Mapa conceptual","Una taza más","Resumen de la unidad","Repaso final","La idea de las dos de la mañana"], bpm:76, swing:.19, color:"#8E7BD8", color2:"#D9D0F5",
     prog:[[[50,53,57,60,64],38],[[53,59,64],43],[[52,55,59,62],36],[[55,61,64,70],45]],
     prog2:[[[53,57,60,64],41],[[52,56,59,62],40],[[50,53,57,60],38],[[53,59,64],43]],
     esc:[64,67,69,72,74,76,79], lluvia:false},
    {k:"domingo", n:"Planeando el lunes", d:"Luz de domingo para preparar la semana sin prisa.", pistas:["Planeación didáctica","Objetivo de aprendizaje","Secuencia didáctica","Rúbrica en borrador","Retroalimentación","Primer día de clases"], bpm:84, swing:.16, color:"#E58FB4", color2:"#F7D4E3",
     prog:[[[51,55,58,62],39],[[48,51,55,58],36],[[53,56,60,63],41],[[50,56,58,62],34]],
     prog2:[[[53,56,60,63],41],[[50,56,58,62],34],[[51,55,58,62],39],[[48,51,55,58],36]],
     esc:[63,65,67,70,72,75,77], lluvia:false}
  ];
  var L = {on:false, d:0, paso:0, compas:0, tSig:0, pista:1, inicio:0, transcurrido:0, vol:.7, reloj:null, var2:false, sinBateria:false, creditos:0, tMoneda:-9};
  var ctx = null, bus = null, epBus = null, bajoBus = null, batBus = null, wow = null, salida = null, analizador = null, vinilo = [], timers = [];
  var mtof = function(m){ return 440 * Math.pow(2, (m - 69) / 12); };

  function prepara(){
    if(salida) return true;
    ctx = DIAudio.ctx(); if(!ctx) return false;
    var master = DIAudio.master();
    salida = ctx.createGain(); salida.gain.value = 0;
    var calido = ctx.createBiquadFilter(); calido.type = "lowpass"; calido.frequency.value = 5200;
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = .01; comp.release.value = .25;
    analizador = ctx.createAnalyser(); analizador.fftSize = 128; analizador.smoothingTimeConstant = .8;
    bus = ctx.createGain(); bus.connect(calido); calido.connect(comp); comp.connect(salida); salida.connect(analizador); analizador.connect(master);
    epBus = ctx.createGain(); epBus.gain.value = .55; var epf = ctx.createBiquadFilter(); epf.type = "lowpass"; epf.frequency.value = 2600; epBus.connect(epf); epf.connect(bus);
    // trémolo suave del piano eléctrico
    var trem = ctx.createOscillator(), tg = ctx.createGain(); trem.frequency.value = 4.2; tg.gain.value = .12; trem.connect(tg); tg.connect(epBus.gain); trem.start();
    bajoBus = ctx.createGain(); bajoBus.gain.value = .5; var bf = ctx.createBiquadFilter(); bf.type = "lowpass"; bf.frequency.value = 380; bajoBus.connect(bf); bf.connect(bus);
    batBus = ctx.createGain(); batBus.gain.value = .55; var dbf = ctx.createBiquadFilter(); dbf.type = "lowpass"; dbf.frequency.value = 6500; batBus.connect(dbf); dbf.connect(bus);
    // vaivén de cinta: una oscilación lenta de afinación que comparten piano y bajo
    wow = ctx.createGain(); wow.gain.value = 7; var wl = ctx.createOscillator(); wl.frequency.value = .45; wl.connect(wow); wl.start();
    return true;
  }
  var ruidoBuf = null;
  function ruido(){ if(ruidoBuf) return ruidoBuf; var n = ctx.sampleRate * 2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return (ruidoBuf = b); }

  /* ---------- instrumentos ---------- */
  function epiano(midi, t, dur, vel){
    var f = mtof(midi), c = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    c.type = "sine"; c.frequency.value = f; m.type = "sine"; m.frequency.value = f;
    mg.gain.setValueAtTime(f * 1.4, t); mg.gain.exponentialRampToValueAtTime(f * .08, t + .5);
    m.connect(mg); mg.connect(c.frequency); wow.connect(c.detune);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16 * vel, t + .006); g.gain.exponentialRampToValueAtTime(.07 * vel, t + .6);
    g.gain.setValueAtTime(.07 * vel, t + dur); g.gain.exponentialRampToValueAtTime(.0005, t + dur + 1.1);
    c.connect(g); g.connect(epBus); c.start(t); m.start(t); c.stop(t + dur + 1.2); m.stop(t + dur + 1.2);
  }
  function bajo(midi, t, dur){
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
    o.type = "sine"; o.frequency.value = mtof(midi); o2.type = "triangle"; o2.frequency.value = mtof(midi); g2.gain.value = .35; wow.connect(o.detune);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5, t + .015); g.gain.exponentialRampToValueAtTime(.25, t + .25); g.gain.setValueAtTime(.25, t + dur * .9); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bajoBus); o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
  }
  function bombo(t, v){ var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(46, t + .12); g.gain.setValueAtTime(.85 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .38); o.connect(g); g.connect(batBus); o.start(t); o.stop(t + .4); }
  function tarola(t, v){
    var s = ctx.createBufferSource(); s.buffer = ruido(); var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1700; bp.Q.value = .7; var g = ctx.createGain();
    g.gain.setValueAtTime(.32 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .2); s.connect(bp); bp.connect(g); g.connect(batBus); s.start(t, Math.random()); s.stop(t + .22);
    var o = ctx.createOscillator(), go = ctx.createGain(); o.type = "triangle"; o.frequency.value = 185; go.gain.setValueAtTime(.18 * v, t); go.gain.exponentialRampToValueAtTime(.001, t + .1); o.connect(go); go.connect(batBus); o.start(t); o.stop(t + .12);
  }
  function platillo(t, v, abierto){
    var s = ctx.createBufferSource(); s.buffer = ruido(); var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7200; var g = ctx.createGain(), d = abierto ? .22 : .04;
    g.gain.setValueAtTime(.09 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(hp); hp.connect(g); g.connect(batBus); s.start(t, Math.random()); s.stop(t + d + .02);
  }
  function arrancaVinilo(lluvia){
    var s = ctx.createBufferSource(); s.buffer = ruido(); s.loop = true; var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900; var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200; var g = ctx.createGain(); g.gain.value = .018;
    s.connect(hp); hp.connect(lp); lp.connect(g); g.connect(bus); s.start(); vinilo.push(s);
    if(lluvia){ var r = ctx.createBufferSource(); r.buffer = ruido(); r.loop = true; var rh = ctx.createBiquadFilter(); rh.type = "highpass"; rh.frequency.value = 1200; var rl = ctx.createBiquadFilter(); rl.type = "lowpass"; rl.frequency.value = 6000; var rg = ctx.createGain(); rg.gain.value = .05; r.connect(rh); rh.connect(rl); rl.connect(rg); rg.connect(bus); r.start(); vinilo.push(r); }
    (function cruje(){ var t = ctx.currentTime + .05, c = ctx.createBufferSource(); c.buffer = ruido(); var hp2 = ctx.createBiquadFilter(); hp2.type = "highpass"; hp2.frequency.value = 2500; var g2 = ctx.createGain();
      g2.gain.setValueAtTime(.04 + Math.random() * .1, t); g2.gain.exponentialRampToValueAtTime(.0005, t + .006); c.connect(hp2); hp2.connect(g2); g2.connect(bus); c.start(t, Math.random()); c.stop(t + .01);
      var to = setTimeout(cruje, 60 + Math.random() * 380); timers.push(to); })();
  }
  function paraVinilo(){ vinilo.forEach(function(s){ try{ s.stop(); }catch(e){} }); vinilo = []; timers.forEach(clearTimeout); timers = []; }

  /* ---------- compositor: cuatro compases por vuelta, variación cada ocho, a veces un corte de batería ---------- */
  function programa(){
    if(!L.on) return;
    var D = DISCOS[L.d], s16 = 60 / D.bpm / 4, hasta = ctx.currentTime + 1.5;
    while(L.tSig < hasta){
      var p = L.paso % 16, t = L.tSig + ((p % 4 === 2) ? s16 * D.swing * 2 : 0), prog = L.var2 ? D.prog2 : D.prog, ac = prog[L.compas % prog.length], hum = function(){ return (Math.random() - .5) * .012; };
      if(p === 0){
        ac[0].forEach(function(n, i){ epiano(n, t + i * .018 + hum(), s16 * 12, .75 + Math.random() * .2); });
        bajo(ac[1], t, s16 * 6);
      }
      if(p === 6 && Math.random() < .45) ac[0].slice(1).forEach(function(n, i){ epiano(n, t + i * .015, s16 * 4, .45); });
      if(p === 10 && Math.random() < .6) bajo(ac[1] + (Math.random() < .5 ? 7 : 12), t, s16 * 4);
      if(p === 14 && Math.random() < .35) bajo(ac[1] - 1, t, s16 * 2);
      if(!L.sinBateria){
        if(p === 0 || p === 10 || (p === 7 && Math.random() < .35)) bombo(t + hum(), p === 0 ? 1 : .8);
        if(p === 4 || p === 12) tarola(t + hum(), .9);
        if(p === 15 && Math.random() < .25) tarola(t, .3);
        if(p % 2 === 0) platillo(t + hum(), (p % 4 === 0 ? .9 : .6) * (.8 + Math.random() * .3), p === 14 && Math.random() < .2);
      }
      if(p % 2 === 0 && Math.random() < .14){ var nota = D.esc[Math.floor(Math.random() * D.esc.length)]; epiano(nota, t + hum(), s16 * (2 + Math.floor(Math.random() * 4)), .5); }
      L.paso++; L.tSig += s16;
      if(L.paso % 16 === 0){
        L.compas++;
        if(L.compas % 8 === 0){ L.var2 = !L.var2; L.pista++; pinta(); DIAudio.estado(); }
        L.sinBateria = L.compas % 16 === 15 && Math.random() < .7;
      }
    }
  }
  function tituloPista(){ var D = DISCOS[L.d]; return D.pistas[(L.pista - 1) % D.pistas.length]; }
  function nombre(){ return tituloPista(); }
  function reproduce(){
    if(!prepara()) return;
    DIAudio.pausarJuego();
    L.on = true; L.inicio = ctx.currentTime - L.transcurrido;
    salida.gain.cancelScheduledValues(ctx.currentTime); salida.gain.setValueAtTime(salida.gain.value, ctx.currentTime); salida.gain.linearRampToValueAtTime(L.vol, ctx.currentTime + 1.2);
    L.tSig = ctx.currentTime + .15; L.paso = 0; arrancaVinilo(DISCOS[L.d].lluvia);
    clearInterval(L.reloj); L.reloj = setInterval(programa, 100); programa(); pinta(); animar(); DIAudio.estado();
  }
  function pausa(sinEstado){
    if(!L.on) return; L.on = false; clearInterval(L.reloj); paraVinilo();
    if(ctx){ L.transcurrido = ctx.currentTime - L.inicio; salida.gain.cancelScheduledValues(ctx.currentTime); salida.gain.setValueAtTime(salida.gain.value, ctx.currentTime); salida.gain.linearRampToValueAtTime(0, ctx.currentTime + .5); }
    pinta(); if(!sinEstado) DIAudio.estado();
  }
  function detener(sinEstado){ pausa(true); L.transcurrido = 0; L.pista = 1; L.compas = 0; pinta(); if(!sinEstado) DIAudio.estado(); }
  function eligeDisco(i){ var seguia = L.on; if(seguia) pausa(true); L.d = (i + DISCOS.length) % DISCOS.length; L.transcurrido = 0; L.pista = 1; L.compas = 0; L.var2 = false; if(seguia) reproduce(); else pinta(); }
  function siguiente(){ L.var2 = !L.var2; L.compas = 0; L.pista++; pinta(); DIAudio.estado(); }
  function eligePista(i){ L.pista = i + 1; L.var2 = i % 2 === 1; L.compas = 0; if(!L.on) reproduce(); else { pinta(); DIAudio.estado(); } }

  /* ---------- máscaras ---------- */
  var MASCARAS = [["tocadiscos", "Tocadiscos"], ["retro", "Retro"], ["arcade", "Arcade"]];
  var mascara = "tocadiscos";
  try{ var m = localStorage.getItem("di-lofi-mascara"); if(MASCARAS.some(function(x){ return x[0] === m; })) mascara = m; }catch(e){}
  function tiempo(){ var s = L.on && ctx ? ctx.currentTime - L.inicio : L.transcurrido; s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  var I = {play:"▶", pausa:"❚❚", sig:"⏭", ant:"⏮", stop:"■"};
  function listaPistas(D, clase){
    return '<ol class="' + clase + '" aria-label="Pistas de ' + esc(D.n) + '">' + D.pistas.map(function(p, i){ var act = i === (L.pista - 1) % D.pistas.length;
      return '<li><button type="button" data-lofi="pista" data-i="' + i + '"' + (act ? ' aria-current="true"' : '') + '><span>' + String(i + 1).padStart(2, "0") + '</span>' + esc(p) + (act && L.on ? '<i aria-hidden="true">♪</i>' : '') + '</button></li>'; }).join("") + '</ol>';
  }
  function tocadiscosHTML(D){
    return '<div class="td" style="--td1:' + D.color + ';--td2:' + D.color2 + '">' +
      '<div class="td-base"><div class="td-plato"><div class="td-disco' + (L.on ? " gira" : "") + '"><div class="td-etq"><img src="' + RAIZ + 'img/sable-disco-' + (L.d + 1) + '.png" alt="" width="280" height="280"></div></div></div>' +
      '<svg class="td-brazo' + (L.on ? " sobre" : "") + '" viewBox="0 0 100 220" aria-hidden="true"><circle cx="70" cy="22" r="16" fill="#cfc8da" stroke="#9a90ab" stroke-width="3"/><circle cx="70" cy="22" r="6" fill="#7d7390"/><path d="M70 22 L70 150 L46 196" fill="none" stroke="#b8afc6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><rect x="34" y="188" width="22" height="16" rx="3" transform="rotate(-30 45 196)" fill="#6f6680"/></svg>' +
      '<div class="td-perillas" aria-hidden="true"><i></i><i></i></div></div>' +
      '<div class="td-info"><span class="td-k">' + (L.on ? "Sonando" : "Disco listo") + ' · ' + esc(D.n) + '</span><b>' + esc(tituloPista()) + '</b><span>Pista ' + L.pista + ' · ' + D.bpm + ' BPM · <span data-lofi="tiempo">' + tiempo() + '</span></span></div>' +
      '<div class="td-ctl"><button type="button" class="accion" data-lofi="play">' + (L.on ? I.pausa + " Pausa" : I.play + " Reproducir") + '</button>' +
      '<button type="button" class="accion sec" data-lofi="sig">' + I.sig + ' Otra pista</button>' +
      '<label class="td-vol">Volumen <input type="range" min="0" max="100" value="' + Math.round(L.vol * 100) + '" data-lofi="vol"></label></div>' +
      '<div class="td-pistas"><span class="td-k">Lado A · ' + esc(D.n) + '</span>' + listaPistas(D, "td-lista") + '</div>' +
      '<div class="td-discos" role="group" aria-label="Elige un disco">' + DISCOS.map(function(x, i){ return '<button type="button" class="td-funda" data-lofi="disco" data-i="' + i + '" aria-pressed="' + (i === L.d) + '" style="--f1:' + x.color + ';--f2:' + x.color2 + '"><i aria-hidden="true"><img src="' + RAIZ + 'img/sable-disco-' + (i + 1) + '.png" alt="" loading="lazy"></i><b>' + esc(x.n) + '</b><span>' + esc(x.d) + '</span></button>'; }).join("") + '</div></div>';
  }
  function retroHTML(D){
    return '<div class="rt" role="group" aria-label="Reproductor retro">' +
      '<div class="rt-barra"><span>DISEÑO INSTRUCCIONAL · LO-FI</span><span aria-hidden="true"><i></i><i></i><i></i></span></div>' +
      '<div class="rt-main"><div class="rt-cuerpo"><div class="rt-lcd"><div class="rt-fila"><span class="rt-estado">' + (L.on ? "▶" : "❚❚") + '</span><span class="rt-tiempo" data-lofi="tiempo">' + tiempo() + '</span></div>' +
        '<div class="rt-marquesina"><span' + (L.on && !reduce() ? ' class="corre"' : '') + '>' + esc(String(L.pista).padStart(2, "0") + ". " + tituloPista() + " · " + D.n + " · lo-fi generativo de Diseño Instruccional · ") + '</span></div>' +
        '<div class="rt-datos"><span>' + D.bpm + ' BPM</span><span>LO-FI</span><span>GENERATIVO</span></div>' +
        '<canvas class="rt-espectro" data-lofi="espectro" aria-hidden="true"></canvas></div>' +
      '<div class="rt-botones"><button type="button" data-lofi="ant" aria-label="Disco anterior">' + I.ant + '</button><button type="button" data-lofi="play" aria-label="' + (L.on ? "Pausa" : "Reproducir") + '">' + (L.on ? I.pausa : I.play) + '</button><button type="button" data-lofi="stop" aria-label="Detener">' + I.stop + '</button><button type="button" data-lofi="sig" aria-label="Otra pista">' + I.sig + '</button>' +
        '<label class="rt-vol"><span>VOL</span><input type="range" min="0" max="100" value="' + Math.round(L.vol * 100) + '" data-lofi="vol" aria-label="Volumen"></label></div></div>' +
      '<div class="rt-lista"><p class="rt-tit">DISCOS</p><div role="group" aria-label="Lista de discos">' + DISCOS.map(function(x, i){ return '<button type="button" data-lofi="disco" data-i="' + i + '" aria-pressed="' + (i === L.d) + '"><span>' + (i + 1) + '. ' + esc(x.n) + '</span><span>' + x.bpm + ' BPM</span></button>'; }).join("") + '</div>' +
        '<p class="rt-tit">PISTAS</p>' + listaPistas(D, "rt-pistas") + '</div></div></div>';
  }
  function arcadeHTML(D){
    return '<div class="ar" style="--ar1:' + D.color + '">' +
      '<div class="ar-marq"><b>DI ARCADE</b><span>LO-FI GENERATIVO</span></div>' +
      '<div class="ar-bisel"><canvas class="ar-pant" data-lofi="arcade" role="img" aria-label="Pantalla de la máquina: ' + esc(tituloPista()) + ', ' + (L.on ? "sonando" : "en pausa") + '"></canvas></div>' +
      '<div class="ar-panel">' +
        '<div class="ar-joy" role="group" aria-label="Palanca: cambia de nivel"><button type="button" data-lofi="ant" aria-label="Nivel anterior">◀</button><span class="ar-palanca" aria-hidden="true"><i></i></span><button type="button" data-lofi="dsig" aria-label="Nivel siguiente">▶</button></div>' +
        '<div class="ar-bots"><span class="ar-bot"><button type="button" class="ar-b ar-a" data-lofi="play" aria-label="' + (L.on ? "Pausa" : "Jugar") + '">A</button><small>' + (L.on ? "PAUSA" : "JUGAR") + '</small></span>' +
          '<span class="ar-bot"><button type="button" class="ar-b ar-bb" data-lofi="sig" aria-label="Otra pista">B</button><small>OTRA PISTA</small></span>' +
          '<span class="ar-bot"><button type="button" class="ar-b ar-c" data-lofi="stop" aria-label="Detener">C</button><small>SALIR</small></span></div>' +
        '<label class="ar-vol"><span>VOL</span><input type="range" min="0" max="100" value="' + Math.round(L.vol * 100) + '" data-lofi="vol" aria-label="Volumen"></label>' +
        '<button type="button" class="ar-moneda" data-lofi="moneda" aria-label="Insertar moneda (juego libre). Créditos: ' + L.creditos + '"><span class="ar-ranura" aria-hidden="true"><i></i></span><span aria-hidden="true">JUEGO LIBRE</span></button></div>' +
      '<div class="ar-niveles" role="group" aria-label="Elige un nivel">' + DISCOS.map(function(x, i){ return '<button type="button" data-lofi="disco" data-i="' + i + '" aria-pressed="' + (i === L.d) + '" style="--n1:' + x.color + '"><span>NIVEL ' + (i + 1) + '</span><b>' + esc(x.n) + '</b></button>'; }).join("") + '</div>' +
      '<div class="ar-pistas"><span>PISTAS DEL NIVEL ' + (L.d + 1) + '</span>' + listaPistas(D, "ar-lista") + '</div></div>';
  }
  var fuenteArcade = false;
  function pinta(){
    var D = DISCOS[L.d], zona = cont.querySelector(".lofi-zona"); if(!zona) return;
    if(mascara === "arcade" && !fuenteArcade){ fuenteArcade = true; var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"; document.head.appendChild(l); }
    zona.innerHTML = mascara === "retro" ? retroHTML(D) : mascara === "arcade" ? arcadeHTML(D) : tocadiscosHTML(D);
    cont.querySelectorAll("[data-masc]").forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.masc === mascara); });
    if(L.on) animar(); else { dibujaEspectro(true); dibujaArcade(true); }
  }
  /* mide el lienzo justo antes de dibujar: si la pestaña está oculta (ancho 0) no dibuja, así nunca se queda
     con un tamaño de 1 px que el navegador estira (la «pantalla rosa» al volver de otra pestaña) */
  function mide(c){
    var w = c.clientWidth, h = c.clientHeight; if(!w || !h) return false;
    var dpr = devicePixelRatio || 1, W = Math.round(w * dpr), H = Math.round(h * dpr);
    if(c.width !== W || c.height !== H){ c.width = W; c.height = H; }
    return true;
  }
  var raf = null, espera = null;
  function niveles(n){
    var datos = new Uint8Array(analizador ? analizador.frequencyBinCount : 64), out = []; if(analizador && L.on) analizador.getByteFrequencyData(datos);
    for(var i = 0; i < n; i++) out.push(L.on ? datos[Math.min(datos.length - 1, Math.floor(Math.pow(i / n, 1.6) * datos.length))] / 255 : 0);
    return out;
  }
  function dibujaEspectro(vacio){
    var c = cont.querySelector("[data-lofi=espectro]"); if(!c || !mide(c)) return; var g = c.getContext("2d"), W = c.width, H = c.height; g.clearRect(0, 0, W, H);
    var n = 32, v = niveles(n), w = W / n;
    for(var i = 0; i < n; i++){ var h = Math.max(H * .04, (vacio ? 0 : v[i]) * H);
      for(var y = 0; y < h; y += H / 14){ var f = y / H; g.fillStyle = f > .75 ? "#E8E36A" : f > .5 ? "#B6E36A" : "#5BE38A"; g.fillRect(i * w + 1, H - y - H / 14 + 1, w - 2, H / 14 - 2); } }
  }
  /* pantalla de la máquina: estrellas, cuadrícula retro, ecualizador de bloques y Sable en pixel art */
  var estrellas = [], spr = {}, pix = {};
  ["a", "b"].forEach(function(k){ var i = new Image(); i.src = RAIZ + "img/sable-aud-" + k + ".png"; spr[k] = i; });
  function pixelado(k){
    if(pix[k]) return pix[k]; var i = spr[k]; if(!i || !i.complete || !i.naturalWidth) return null;
    var cv = document.createElement("canvas"); cv.width = cv.height = 56; var g = cv.getContext("2d"); g.imageSmoothingEnabled = true; g.drawImage(i, 0, 0, 56, 56); return (pix[k] = cv);
  }
  function dibujaArcade(quieto){
    var c = cont.querySelector("[data-lofi=arcade]"); if(!c || !mide(c)) return; var g = c.getContext("2d"), W = c.width, H = c.height, t = performance.now() / 1000, D = DISCOS[L.d], beat = t * D.bpm / 60;
    var px = Math.max(2, Math.round(W / 320));
    g.imageSmoothingEnabled = false; g.fillStyle = "#0B0820"; g.fillRect(0, 0, W, H);
    if(!estrellas.length) for(var s = 0; s < 70; s++) estrellas.push({x:Math.random(), y:Math.random() * .62, v:.02 + Math.random() * .08, c:["#F6E27A", "#9FD8FF", "#F49AC1", "#B7A6F2"][s % 4]});
    estrellas.forEach(function(e){ if(L.on && !reduce() && !quieto) e.x -= e.v / 60; if(e.x < 0) e.x += 1; g.fillStyle = e.c; g.fillRect(Math.round(e.x * W / px) * px, Math.round(e.y * H / px) * px, px, px); });
    // sol de atardecer y cuadrícula en perspectiva
    var hz = H * .62; var sol = g.createLinearGradient(0, hz - H * .3, 0, hz); sol.addColorStop(0, "#F6E27A"); sol.addColorStop(1, "#F07AA8");
    g.fillStyle = sol; for(var r = 0; r < H * .26; r += px * 3){ var w2 = Math.sqrt(Math.max(0, (H * .26) * (H * .26) - (H * .26 - r) * (H * .26 - r))); if((r / px) % 9 < 6) g.fillRect(W * .72 - w2, hz - r - px * 2, w2 * 2, px * 2); }
    g.fillStyle = "#1B0F3A"; g.fillRect(0, hz, W, H - hz);
    g.strokeStyle = "#E85FB0"; g.lineWidth = px;
    var avance = (L.on && !reduce() && !quieto) ? (beat % 1) : 0;
    for(var k = 0; k < 9; k++){ var f = (k + avance) / 9, y = hz + (H - hz) * f * f; g.beginPath(); g.moveTo(0, Math.round(y)); g.lineTo(W, Math.round(y)); g.stroke(); }
    for(var j = -8; j <= 8; j++){ g.beginPath(); g.moveTo(W / 2 + j * W * .02, hz); g.lineTo(W / 2 + j * W * .16, H); g.stroke(); }
    // ecualizador de bloques
    var n = 16, v = niveles(n), bw = Math.floor(W * .5 / n / px) * px, bx = W * .44;
    for(var i = 0; i < n; i++){ var alto = Math.round((quieto ? .05 : Math.max(.05, v[i])) * 10); for(var b = 0; b < alto; b++){ g.fillStyle = b > 7 ? "#F6E27A" : b > 4 ? "#F49AC1" : "#8AD1F5"; g.fillRect(bx + i * bw, hz - px * 3 - b * px * 3, bw - px, px * 2); } }
    // Sable bailando en pixel art
    var cuadro = pixelado(L.on && Math.floor(beat) % 4 !== 3 ? "a" : "b"), tam = Math.round(H * .5 / px) * px, sx = W * .06, sy = H - tam - (L.on && !reduce() ? Math.abs(Math.sin(beat * Math.PI)) * px * 4 : 0);
    if(cuadro) g.drawImage(cuadro, Math.round(sx), Math.round(sy), tam, tam);
    // textos
    var fz = Math.max(8, Math.round(W / 46)); g.font = fz + 'px "Press Start 2P", monospace'; g.textBaseline = "top";
    g.fillStyle = "#F6E27A"; g.textAlign = "left"; g.fillText("NIVEL " + (L.d + 1) + "-" + L.pista, px * 6, px * 6);
    g.textAlign = "right"; g.fillStyle = "#9FD8FF"; g.fillText("TIEMPO " + tiempo(), W - px * 6, px * 6);
    g.textAlign = "center"; g.fillStyle = "#FFFFFF"; g.fillText(tituloPista().normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase(), W / 2, px * 6 + fz * 2);
    var tm = t - L.tMoneda;
    if(tm < 1.6){ g.fillStyle = Math.floor(tm * 8) % 2 ? "#FFFFFF" : "#F6E27A"; g.fillText("+1 CREDITO", W / 2, H * .32); }
    else if(!L.on && Math.floor(t * 2) % 2 === 0){ g.fillStyle = "#F49AC1"; g.fillText("PRESIONA A PARA JUGAR", W / 2, H * .32); }
    if(L.creditos){ g.textAlign = "right"; g.fillStyle = "#F6E27A"; g.fillText("CREDITOS " + Math.min(L.creditos, 99), W - px * 6, H - px * 6 - fz); }
    if(L.on && !reduce() && !quieto){ g.fillStyle = "#F6E27A"; g.fillText("♪", sx + tam * .95, sy + tam * .1 - (beat % 1) * px * 8); }
  }
  function animar(){
    if(raf || espera) return;
    (function paso(){
      raf = null;
      cont.querySelectorAll("[data-lofi=tiempo]").forEach(function(e){ e.textContent = tiempo(); });
      dibujaEspectro(!L.on); dibujaArcade(!L.on);
      var visible = cont.offsetParent !== null;
      if(L.on || mascara === "arcade"){ if(visible) raf = requestAnimationFrame(paso); else espera = setTimeout(function(){ espera = null; animar(); }, 1000); }
    })();
  }

  /* moneda de «juego libre»: aparece sobre la ranura, gira y se mete; suena el clásico «ding-ding» */
  function moneda(boton){
    L.creditos++; L.tMoneda = performance.now() / 1000;
    boton.setAttribute("aria-label", "Insertar moneda (juego libre). Créditos: " + L.creditos);
    var ranura = boton.querySelector(".ar-ranura");
    if(!reduce()){ var m = document.createElement("b"); m.className = "ar-coin"; m.setAttribute("aria-hidden", "true"); m.textContent = "DI"; ranura.appendChild(m);
      m.addEventListener("animationend", function(){ m.remove(); }); setTimeout(function(){ m.remove(); }, 1500); }
    ranura.classList.remove("traga"); void ranura.offsetWidth; ranura.classList.add("traga");
    if(prepara()){ var t = ctx.currentTime + (reduce() ? 0 : .5), dest = DIAudio.master();
      [[988, 0, .07], [1319, .07, .38]].forEach(function(n){ var o = ctx.createOscillator(), g = ctx.createGain(); o.type = "square"; o.frequency.value = n[0];
        g.gain.setValueAtTime(0, t + n[1]); g.gain.linearRampToValueAtTime(.09 * L.vol, t + n[1] + .005); g.gain.setValueAtTime(.09 * L.vol, t + n[1] + n[2] * .4); g.gain.exponentialRampToValueAtTime(.001, t + n[1] + n[2]);
        o.connect(g); g.connect(dest); o.start(t + n[1]); o.stop(t + n[1] + n[2] + .02); }); }
    animar();
  }
  function redibuja(){ dibujaEspectro(!L.on); dibujaArcade(!L.on); }

  /* ---------- armado ---------- */
  cont.innerHTML = '<div class="sec-t"><div><h2>Reproductor lo-fi</h2><p>Música chill para trabajar: acordes de jazz, una batería suave y el crujido de un disco de vinilo. Cada pista se crea al momento en tu navegador y nunca se repite igual.</p></div>' +
    '<div><span class="k-m">Máscara</span><div class="opc" role="group" aria-label="Máscara del reproductor">' + MASCARAS.map(function(x){ return '<button type="button" data-masc="' + x[0] + '" aria-pressed="' + (x[0] === mascara) + '">' + x[1] + '</button>'; }).join("") + '</div></div></div>' +
    '<div class="lofi-zona"></div>';
  cont.addEventListener("click", function(e){
    var b = e.target.closest("[data-masc]"); if(b){ mascara = b.dataset.masc; try{ localStorage.setItem("di-lofi-mascara", mascara); }catch(x){} pinta(); animar(); return; }
    var a = e.target.closest("[data-lofi]"); if(!a) return;
    var k = a.dataset.lofi;
    if(k === "play") L.on ? pausa() : reproduce();
    else if(k === "stop") detener();
    else if(k === "sig") siguiente();
    else if(k === "ant") eligeDisco(L.d - 1);
    else if(k === "dsig") eligeDisco(L.d + 1);
    else if(k === "disco") eligeDisco(+a.dataset.i);
    else if(k === "pista") eligePista(+a.dataset.i);
    else if(k === "moneda") moneda(a);
  });
  cont.addEventListener("input", function(e){ if(e.target.dataset.lofi === "vol"){ L.vol = e.target.value / 100; if(ctx && L.on){ salida.gain.cancelScheduledValues(ctx.currentTime); salida.gain.setValueAtTime(L.vol, ctx.currentTime); } } });
  // al volver a la pestaña Música (o cambiar el ancho de la ventana) el reproductor cambia de tamaño: se vuelve a dibujar
  if(window.ResizeObserver) new ResizeObserver(function(){ redibuja(); if(mascara === "arcade") animar(); }).observe(cont);
  else addEventListener("resize", redibuja);
  function alMostrar(){ setTimeout(function(){ redibuja(); if(espera){ clearTimeout(espera); espera = null; } animar(); }, 0); }
  addEventListener("hashchange", alMostrar);
  document.addEventListener("visibilitychange", alMostrar);
  document.addEventListener("click", function(e){ if(e.target.closest && e.target.closest("[data-bien]")) alMostrar(); });
  pinta(); if(mascara === "arcade") animar();
  window.DILofi = {on:function(){ return L.on; }, nombre:nombre, parar:function(silencioso){ pausa(silencioso); }, disco:function(){ return L.d; }, pista:function(){ return L.pista; }};
})();
