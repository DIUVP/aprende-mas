/* Diseño Instruccional · Reproductor lo-fi generativo (Bienestar › Música).
   Todo el sonido se genera en el navegador: acordes de jazz con piano eléctrico, bajo, batería suave con swing,
   ruido de vinilo y un ligero vaivén de cinta. Cada pista se arma al momento y nunca se repite igual.
   Dos máscaras para elegir: Tocadiscos y Retro (inspirada en los reproductores de música de los 90). */
(function(){
  var cont = document.getElementById("bienestar-lofi"); if(!cont || !window.DIAudio) return;
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  var reduce = DIAudio.reduce;

  /* ---------- discos: cada uno con su tempo, progresiones y escala para la melodía ---------- */
  var DISCOS = [
    {k:"cafe", n:"Café", d:"Tarde tranquila con una taza en la mano.", bpm:80, swing:.17, color:"#E9A178", color2:"#F6D3B8",
     prog:[[[53,57,60,64],41],[[52,55,59,62],40],[[50,53,57,60],38],[[48,52,55,59],36]],
     prog2:[[[50,53,57,60],38],[[55,59,62,65],43],[[48,52,55,59],36],[[57,60,64,67],45]],
     esc:[65,67,69,72,74,77,79], lluvia:false},
    {k:"lluvia", n:"Lluvia en la ventana", d:"Gotas suaves de fondo y acordes que flotan.", bpm:72, swing:.15, color:"#7FB0D9", color2:"#CFE3F3",
     prog:[[[57,60,64,67,71],45],[[53,57,60,64],41],[[48,52,55,59],36],[[55,59,62,64],43]],
     prog2:[[[53,57,60,64],41],[[52,55,59,62],40],[[57,60,64,67],45],[[55,59,62,65],43]],
     esc:[69,72,74,76,79,81,84], lluvia:true},
    {k:"noche", n:"Noche de estudio", d:"Jazz bajito para concentrarte.", bpm:76, swing:.19, color:"#8E7BD8", color2:"#D9D0F5",
     prog:[[[50,53,57,60,64],38],[[53,59,64],43],[[52,55,59,62],36],[[55,61,64,70],45]],
     prog2:[[[53,57,60,64],41],[[52,56,59,62],40],[[50,53,57,60],38],[[53,59,64],43]],
     esc:[64,67,69,72,74,76,79], lluvia:false},
    {k:"domingo", n:"Domingo", d:"Luz de mañana y nada de prisa.", bpm:84, swing:.16, color:"#E58FB4", color2:"#F7D4E3",
     prog:[[[51,55,58,62],39],[[48,51,55,58],36],[[53,56,60,63],41],[[50,56,58,62],34]],
     prog2:[[[53,56,60,63],41],[[50,56,58,62],34],[[51,55,58,62],39],[[48,51,55,58],36]],
     esc:[63,65,67,70,72,75,77], lluvia:false}
  ];
  var L = {on:false, d:0, paso:0, compas:0, tSig:0, pista:1, inicio:0, transcurrido:0, vol:.7, reloj:null, var2:false, sinBateria:false};
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
        if(L.compas % 8 === 0){ L.var2 = !L.var2; L.pista++; pinta(); }
        L.sinBateria = L.compas % 16 === 15 && Math.random() < .7;
      }
    }
  }
  function nombre(){ return DISCOS[L.d].n; }
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
  function siguiente(){ if(L.on){ L.var2 = !L.var2; L.compas = 0; L.pista++; pinta(); } else eligeDisco(L.d + 1); }

  /* ---------- máscaras ---------- */
  var mascara = "tocadiscos";
  try{ var m = localStorage.getItem("di-lofi-mascara"); if(m === "retro" || m === "tocadiscos") mascara = m; }catch(e){}
  function tiempo(){ var s = L.on && ctx ? ctx.currentTime - L.inicio : L.transcurrido; s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  var I = {play:"▶", pausa:"❚❚", sig:"⏭", ant:"⏮", stop:"■"};
  function tocadiscosHTML(D){
    return '<div class="td" style="--td1:' + D.color + ';--td2:' + D.color2 + '">' +
      '<div class="td-base"><div class="td-plato"><div class="td-disco' + (L.on ? " gira" : "") + '"><div class="td-etq"><b>DI</b><span>lo-fi</span></div></div></div>' +
      '<svg class="td-brazo' + (L.on ? " sobre" : "") + '" viewBox="0 0 100 220" aria-hidden="true"><circle cx="70" cy="22" r="16" fill="#cfc8da" stroke="#9a90ab" stroke-width="3"/><circle cx="70" cy="22" r="6" fill="#7d7390"/><path d="M70 22 L70 150 L46 196" fill="none" stroke="#b8afc6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><rect x="34" y="188" width="22" height="16" rx="3" transform="rotate(-30 45 196)" fill="#6f6680"/></svg>' +
      '<div class="td-perillas" aria-hidden="true"><i></i><i></i></div></div>' +
      '<div class="td-info"><span class="td-k">' + (L.on ? "Sonando" : "Disco listo") + '</span><b>' + esc(D.n) + '</b><span>Pista ' + L.pista + ' · ' + D.bpm + ' BPM · <span data-lofi="tiempo">' + tiempo() + '</span></span></div>' +
      '<div class="td-ctl"><button type="button" class="accion" data-lofi="play">' + (L.on ? I.pausa + " Pausa" : I.play + " Reproducir") + '</button>' +
      '<button type="button" class="accion sec" data-lofi="sig">' + I.sig + ' Otra pista</button>' +
      '<label class="td-vol">Volumen <input type="range" min="0" max="100" value="' + Math.round(L.vol * 100) + '" data-lofi="vol"></label></div>' +
      '<div class="td-discos" role="group" aria-label="Elige un disco">' + DISCOS.map(function(x, i){ return '<button type="button" class="td-funda" data-lofi="disco" data-i="' + i + '" aria-pressed="' + (i === L.d) + '" style="--f1:' + x.color + ';--f2:' + x.color2 + '"><i aria-hidden="true"></i><b>' + esc(x.n) + '</b><span>' + esc(x.d) + '</span></button>'; }).join("") + '</div></div>';
  }
  function retroHTML(D){
    return '<div class="rt" role="group" aria-label="Reproductor retro">' +
      '<div class="rt-barra"><span>DISEÑO INSTRUCCIONAL · LO-FI</span><span aria-hidden="true"><i></i><i></i><i></i></span></div>' +
      '<div class="rt-cuerpo"><div class="rt-lcd"><div class="rt-fila"><span class="rt-estado">' + (L.on ? "▶" : "❚❚") + '</span><span class="rt-tiempo" data-lofi="tiempo">' + tiempo() + '</span></div>' +
        '<div class="rt-marquesina"><span' + (L.on && !reduce() ? ' class="corre"' : '') + '>' + esc((L.d + 1) + ". " + D.n + " · pista " + L.pista + " · lo-fi generativo de Diseño Instruccional · ") + '</span></div>' +
        '<div class="rt-datos"><span>' + D.bpm + ' BPM</span><span>LO-FI</span><span>GENERATIVO</span></div>' +
        '<canvas class="rt-espectro" data-lofi="espectro" aria-hidden="true"></canvas></div>' +
      '<div class="rt-botones"><button type="button" data-lofi="ant" aria-label="Disco anterior">' + I.ant + '</button><button type="button" data-lofi="play" aria-label="' + (L.on ? "Pausa" : "Reproducir") + '">' + (L.on ? I.pausa : I.play) + '</button><button type="button" data-lofi="stop" aria-label="Detener">' + I.stop + '</button><button type="button" data-lofi="sig" aria-label="Otra pista">' + I.sig + '</button>' +
        '<label class="rt-vol"><span>VOL</span><input type="range" min="0" max="100" value="' + Math.round(L.vol * 100) + '" data-lofi="vol" aria-label="Volumen"></label></div></div>' +
      '<div class="rt-lista" role="group" aria-label="Lista de discos">' + DISCOS.map(function(x, i){ return '<button type="button" data-lofi="disco" data-i="' + i + '" aria-pressed="' + (i === L.d) + '"><span>' + (i + 1) + '. ' + esc(x.n) + '</span><span>' + x.bpm + ' BPM</span></button>'; }).join("") + '</div></div>';
  }
  function pinta(){
    var D = DISCOS[L.d], zona = cont.querySelector(".lofi-zona"); if(!zona) return;
    zona.innerHTML = mascara === "retro" ? retroHTML(D) : tocadiscosHTML(D);
    cont.querySelectorAll("[data-masc]").forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.masc === mascara); });
    var c = zona.querySelector("[data-lofi=espectro]"); if(c){ var r = c.getBoundingClientRect(), dpr = devicePixelRatio || 1; c.width = r.width * dpr; c.height = r.height * dpr; }
    if(L.on) animar(); else dibujaEspectro(true);
  }
  var raf = null;
  function dibujaEspectro(vacio){
    var c = cont.querySelector("[data-lofi=espectro]"); if(!c) return; var g = c.getContext("2d"), W = c.width, H = c.height; g.clearRect(0, 0, W, H);
    var n = 24, datos = new Uint8Array(analizador ? analizador.frequencyBinCount : 64); if(analizador && !vacio) analizador.getByteFrequencyData(datos);
    var w = W / n;
    for(var i = 0; i < n; i++){ var v = vacio ? 0 : datos[Math.min(datos.length - 1, Math.floor(Math.pow(i / n, 1.6) * datos.length))] / 255, h = Math.max(H * .04, v * H);
      for(var y = 0; y < h; y += H / 14){ var f = y / H; g.fillStyle = f > .75 ? "#E8E36A" : f > .5 ? "#B6E36A" : "#5BE38A"; g.fillRect(i * w + 1, H - y - H / 14 + 1, w - 2, H / 14 - 2); } }
  }
  function animar(){
    if(raf) return;
    (function paso(){ raf = null; if(!L.on) return; cont.querySelectorAll("[data-lofi=tiempo]").forEach(function(e){ e.textContent = tiempo(); }); dibujaEspectro(false); if(cont.offsetParent !== null) raf = requestAnimationFrame(paso); else raf = setTimeout(function(){ raf = null; animar(); }, 1000); })();
  }

  /* ---------- armado ---------- */
  cont.innerHTML = '<div class="sec-t"><div><h2>Reproductor lo-fi</h2><p>Música chill para trabajar: acordes de jazz, una batería suave y el crujido de un disco de vinilo. Cada pista se crea al momento en tu navegador y nunca se repite igual.</p></div>' +
    '<div><span class="k-m">Máscara</span><div class="opc" role="group" aria-label="Máscara del reproductor"><button type="button" data-masc="tocadiscos" aria-pressed="true">Tocadiscos</button><button type="button" data-masc="retro" aria-pressed="false">Retro</button></div></div></div>' +
    '<div class="lofi-zona"></div>';
  cont.addEventListener("click", function(e){
    var b = e.target.closest("[data-masc]"); if(b){ mascara = b.dataset.masc; try{ localStorage.setItem("di-lofi-mascara", mascara); }catch(x){} pinta(); return; }
    var a = e.target.closest("[data-lofi]"); if(!a) return;
    var k = a.dataset.lofi;
    if(k === "play") L.on ? pausa() : reproduce();
    else if(k === "stop") detener();
    else if(k === "sig") siguiente();
    else if(k === "ant") eligeDisco(L.d - 1);
    else if(k === "disco") eligeDisco(+a.dataset.i);
  });
  cont.addEventListener("input", function(e){ if(e.target.dataset.lofi === "vol"){ L.vol = e.target.value / 100; if(ctx && L.on){ salida.gain.cancelScheduledValues(ctx.currentTime); salida.gain.setValueAtTime(L.vol, ctx.currentTime); } } });
  pinta();
  window.DILofi = {on:function(){ return L.on; }, nombre:nombre, parar:function(silencioso){ pausa(silencioso); }, disco:function(){ return L.d; }, pista:function(){ return L.pista; }};
})();
