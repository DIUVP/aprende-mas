/* Diseño Instruccional · Bienestar digital y Música.
   Llena la vista #v-bienestar del sitio (dos pestañas: Ejercicios de bienestar digital y Música). El contenido y las fuentes vienen de la
   Sala de calma del curso de inducción para docentes (investigación verificada el 25/09/2026). */
(function(){
  var RAIZ = (document.currentScript && document.currentScript.src || "").replace(/bienestar\.js.*$/, "");
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  var ayuda = function(t){ return typeof pqs === "function" ? pqs(t) : ""; };
  var reduce = function(){ return (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || document.documentElement.classList.contains("a11y-movimiento"); };
  var $ = function(s, r){ return (r || document).querySelector(s); };

  /* ---------- sonido compartido ---------- */
  var ctx = null, master = null;
  function audio(){
    if(!ctx){
      var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination);
    }
    if(ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  var avisoSonoro = true;
  function campana(){
    if(!avisoSonoro || !audio()) return;
    [660, 880].forEach(function(f, i){
      var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * .28;
      o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + 1.2);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 1.3);
    });
  }
  function toast(txt){
    var t = $(".toast-b"); if(t) t.remove();
    t = document.createElement("div"); t.className = "toast-b"; t.setAttribute("role", "status");
    t.innerHTML = '<span>' + esc(txt) + '</span><button type="button">Entendido</button>';
    document.body.appendChild(t); t.querySelector("button").onclick = function(){ t.remove(); };
    setTimeout(function(){ if(t.isConnected) t.remove(); }, 15000);
    campana();
  }
  function mmss(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  /* ---------- datos ---------- */
  var RESP = {
    calma: {n:"Calma 4·6", f:[["Inhala",4,"in"],["Exhala",6,"out"]], s:"La salida dura un poco más que la entrada."},
    pareja:{n:"Pareja 5·5", f:[["Inhala",5,"in"],["Exhala",5,"out"]], s:"Cuenta hasta cinco al inhalar y hasta cinco al exhalar."},
    cuadrada:{n:"Cuadrada 4·4·4·4", f:[["Inhala",4,"in"],["Sostén",4,"in"],["Exhala",4,"out"],["Sostén",4,"out"]], s:"Cuatro tiempos para cada fase, como los lados de un cuadrado."}
  };
  var ESTIRA = [
    ["Hombros", "Sube los hombros hacia las orejas hasta sentir una tensión ligera. Sostén… y suéltalos hacia abajo."],
    ["Cuello", "Siéntate derecho, hombros abajo, mirando al frente. Gira la cabeza despacio hacia un hombro, hasta donde sea cómodo. Sostén y vuelve al centro. Ahora al otro lado."],
    ["Abre el pecho", "Siéntate derecho, sin recargarte. Lleva los hombros atrás y abajo, abre los brazos a los lados y empuja suavemente el pecho hacia adelante y arriba."],
    ["Gira el tronco", "Pies en el piso. Cruza los brazos y toma tus hombros. Sin mover la cadera, gira la parte de arriba del cuerpo hacia un lado. Sostén y vuelve. Ahora al otro lado."],
    ["Muñecas", "Codos en la mesa y palmas juntas. Baja despacio las muñecas hacia la mesa, sin separar las palmas, hasta sentir el estiramiento."]
  ];
  var TEMAS = ["Vista", "Postura y movimiento", "Pausas y concentración", "Avisos y redes", "Sueño", "Respiración y oído"];
  var FICHAS = [
    ["Vista","La regla 20·20·20","Cuando lees en una pantalla, tus ojos pasan mucho tiempo enfocando de cerca y parpadeando poco. Las asociaciones de oftalmología y optometría recomiendan una regla sencilla: cada 20 minutos, mira algo que esté al menos a seis metros durante al menos 20 segundos.","Busca el punto más lejano que tengas a la vista —una ventana, el fondo del pasillo— y quédate ahí 20 segundos.","AAO, «Eye Strain and Sleepy Eyes» · AOA, «Computer vision syndrome»"],
    ["Vista","Parpadea a propósito","Normalmente parpadeamos unas 15 veces por minuto; frente a una pantalla, de 5 a 7. Por eso los ojos se sienten secos al final del día. Parpadear a propósito, de vez en cuando, los vuelve a humedecer.","Cierra los ojos con suavidad dos segundos y ábrelos. Repite cinco veces.","AAO, «Computers, Digital Devices, and Eye Strain»"],
    ["Vista","La vista cansada se recupera","Usar pantallas muchas horas no daña los ojos de forma permanente, pero sí puede causar vista cansada, ojos secos, visión borrosa o dolor de cabeza. Casi siempre pasa al descansar. Si la visión borrosa sigue aunque pares, lo indicado es un examen completo de la vista.","Si hoy llevas dos horas seguidas frente a la pantalla, date 15 minutos lejos de ella.","AAO · AOA"],
    ["Vista","¿Y la luz azul?","No hay evidencia de que la luz azul de las pantallas dañe tus ojos, y la Academia Americana de Oftalmología no recomienda lentes especiales para la computadora. Una revisión de 17 estudios concluyó que los lentes con filtro azul probablemente no cambian la vista cansada ni el sueño.","Antes de comprar lentes «anti luz azul», prueba unos días la regla 20·20·20.","AAO, «Should You Be Worried About Blue Light?» · Cochrane (Singh y colaboradores, 2023)"],
    ["Postura y movimiento","Tu pantalla, a la distancia de tu brazo","El borde de arriba de la pantalla va a la altura de tus ojos o un poco más abajo, para que mires ligeramente hacia abajo, y a unos 50–70 cm de distancia. Si subes la laptop con unos libros, el teclado sube con ella: si puedes, conecta un teclado aparte.","Estira el brazo hacia la pantalla; tus dedos deberían quedar cerca de ella.","OSHA, «Monitors» y «Additional Information» · AAO"],
    ["Postura y movimiento","La mejor postura es la siguiente","Ninguna forma de sentarse sigue siendo cómoda durante mucho tiempo. Más que buscar la postura perfecta, lo que recomiendan los especialistas es cambiar de posición con frecuencia y levantarte.","Cambia de postura ahora mismo: acércate, recárgate, apoya los dos pies.","CCOHS, «Working in a Sitting Position» · Slater y colaboradores, JOSPT, 2019"],
    ["Postura y movimiento","Muévete cada media hora","En un estudio con adultos que pasaban ocho horas sentados, caminar cinco minutos cada media hora bajó el azúcar y la presión arterial. Incluso un minuto cada media hora redujo el cansancio y mejoró el ánimo. Es un estudio pequeño, pero apunta a lo mismo que todo lo demás: moverte seguido.","Al terminar esta ficha, levántate y camina cinco minutos.","Columbia University Irving Medical Center, sobre Diaz y colaboradores, 2023"],
    ["Postura y movimiento","Cualquier actividad cuenta","La Organización Mundial de la Salud recomienda a los adultos entre 150 y 300 minutos de actividad moderada a la semana —caminar a paso rápido cuenta—, ejercicios de fuerza dos días y limitar el tiempo que pasas sentado. Cualquier cantidad de actividad es mejor que ninguna.","Elige hoy un trayecto que puedas hacer a pie o por las escaleras.","OMS, directrices de 2020 (Bull y colaboradores) · OMS, nota descriptiva «Actividad física»"],
    ["Pausas y concentración","Las pausas cortas sí sirven","Las pausas de diez minutos o menos te dejan menos cansado y con más energía; lo muestran 22 estudios juntos. No hacen milagros con el rendimiento, y después de una tarea muy pesada puede hacer falta una pausa más larga.","Decide ya a qué hora será tu próxima pausa, y respétala.","Albulescu y colaboradores, PLOS ONE, 2022"],
    ["Pausas y concentración","Trabajar por bloques","En los años ochenta, siendo estudiante universitario, el italiano Francesco Cirillo empezó a organizar su estudio con un temporizador de cocina: 25 minutos de trabajo y 5 de pausa. En un estudio con universitarios, quienes tomaron pausas programadas sintieron menos fatiga y más concentración que quienes descansaban «cuando se acordaban», e hicieron el mismo trabajo.","Pon un bloque de 25 minutos para lo siguiente que tengas pendiente.","Francesco Cirillo, sitio oficial de su técnica · Biwer y colaboradores, British Journal of Educational Psychology, 2023"],
    ["Pausas y concentración","Las interrupciones cuestan","Cuando nos interrumpen, solemos terminar más rápido, pero con más estrés, frustración y presión. Muchas de esas interrupciones nos las hacemos nosotros: una pestaña, un mensaje, «un momento».","Cierra las pestañas que no necesitas para lo que estás haciendo.","Sala de calma, curso de inducción para docentes"],
    ["Avisos y redes","Un aviso distrae aunque no lo abras","En un experimento, recibir una notificación en el celular empeoró la atención en una tarea, aunque nadie tocara el teléfono. En otro, una semana con los avisos encendidos dejó a la gente más distraída que una semana con el teléfono en silencio y lejos.","Activa «No molestar» durante tu próximo bloque de trabajo.","Stothart y colaboradores, 2015 · Kushlev y colaboradores, 2016"],
    ["Avisos y redes","Revisa tus mensajes a horas fijas","Recibir las notificaciones juntas, tres veces al día, hizo sentir a la gente más atenta, con mejor humor y menos estrés. Apagarlas todas, en cambio, aumentó la ansiedad y el miedo a perderse algo. Con el correo pasó igual: revisarlo tres veces al día redujo el estrés.","Elige tres horas del día para revisar mensajes y correo.","Fitz y colaboradores, 2019 · Kushlev y Dunn, 2015"],
    ["Avisos y redes","Redes: ¿para qué entras?","Las redes sirven para estar en contacto y también pueden quitarte tiempo y ánimo. En un estudio con universitarios, usarlas unos 30 minutos al día durante tres semanas redujo la soledad; en otro, una semana sin ellas mejoró el bienestar. Pregúntate para qué entras y cómo te sientes al salir.","Mira el tiempo de uso de tu celular de la última semana, sin juzgarte.","Hunt y colaboradores, 2018 · Lambert y colaboradores, 2022 · UNICEF"],
    ["Avisos y redes","Cuatro señales para estar atento","La mayoría de las personas usan internet sin problema. La OMS describe cuatro señales de que el uso se volvió problemático: no poder controlarlo, sentirte mal cuando no te conectas, dejar otras cosas por estar en línea y seguir aunque te traiga consecuencias. Si te reconoces en varias, vale la pena hablarlo con alguien.","Si alguna te suena, cuéntasela hoy a una persona de confianza.","OMS Europa, 2024 · OMS, «Gaming disorder»"],
    ["Avisos y redes","Reglas propias, no abstinencia","Las «desintoxicaciones digitales» han dado resultados distintos de un estudio a otro, y en un experimento apagar todos los avisos aumentó la ansiedad. Por eso, más que un voto de abstinencia, la salida práctica son las reglas propias: franjas sin avisos, horarios para revisar y el celular fuera del cuarto para dormir.","Elige hoy una franja sin avisos: puede ser tu próximo bloque de trabajo.","Radtke y colaboradores, 2022 · Fitz y colaboradores, 2019"],
    ["Sueño","Siete horas o más","Los adultos necesitan dormir siete horas o más. Dormir te ayuda a aprender y a recordar; cuando duermes poco, cuesta concentrarse y pensar con claridad. Un horario regular, incluso el fin de semana, ayuda a que el cuerpo sepa cuándo toca dormir.","Elige una hora para despertar y mantenla toda la semana.","CDC, «About Sleep» · Secretaría de Salud · NHLBI"],
    ["Sueño","La pantalla, lejos de la cama","La luz de las pantallas puede retrasar el sueño, y lo que ves o contestas te mantiene despierto. Las fuentes de salud recomiendan dejar la pantalla entre 30 minutos y dos horas antes de acostarte; el modo nocturno, solo, no mostró diferencias en un estudio con jóvenes. Si después de unos 20 minutos sigues despierto, levántate y haz algo tranquilo.","Esta noche deja el cargador del celular lejos de la cama.","CDC · NHS · Secretaría de Salud · Duraccio y colaboradores, 2021"],
    ["Respiración y oído","Respirar despacio, como costumbre","Al reunir 12 estudios, la respiración practicada se asoció con menos estrés, con un efecto de pequeño a moderado. En otro estudio, cinco minutos diarios durante un mes mejoraron el ánimo. Funciona mejor como costumbre que como remedio de un día.","Respira cinco minutos contando hasta cinco al inhalar y hasta cinco al exhalar.","Fincham y colaboradores, 2023 · Balban y colaboradores, 2023 · NHS"],
    ["Respiración y oído","Cuida tus oídos","Si usas audífonos, la OMS recomienda no pasar del 60 % del volumen máximo y darles descansos a tus oídos. Los sonidos de la sección Música están hechos para oírse bajito, detrás de lo que estés haciendo.","Revisa el volumen de tu dispositivo; si pasa del 60 %, bájalo.","OMS, «Escuchar sin riesgos»"]
  ];
  var CHEQUEO = [
    ["En una sesión de trabajo, paso más de una hora sin levantarme.", "Cada media hora frente a la pantalla, levántate y muévete unos minutos."],
    ["Al final del día siento los ojos cansados o secos, o veo borroso.", "Cada 20 minutos, mira algo lejano durante 20 segundos."],
    ["Uso el celular o la computadora en la cama, justo antes de dormir.", "Esta noche deja el cargador del celular lejos de la cama."],
    ["Entre semana duermo menos de siete horas.", "Elige una hora para despertar y mantenla toda la semana."],
    ["Cuando el celular suena o vibra, lo reviso aunque esté trabajando.", "Activa «No molestar» durante tu próximo bloque de trabajo."],
    ["Abro redes o videos «un momento» y se me va mucho más tiempo del que quería.", "Mira el tiempo de uso de tu celular de la última semana, sin juzgarte."],
    ["Me siento inquieto o de malas cuando no puedo conectarme.", "Si alguna de las cuatro señales de la OMS te suena, cuéntasela hoy a una persona de confianza."],
    ["He dejado de hacer cosas que disfrutaba, o he descuidado pendientes, por estar en línea.", "Si alguna de las cuatro señales de la OMS te suena, cuéntasela hoy a una persona de confianza."],
    ["Después de usar redes me siento peor que antes de entrar.", "Antes de abrir una red, pregúntate para qué entras; al salir, nota cómo te sientes."],
    ["Me cuesta desconectarme aunque quiera hacerlo.", "Elige tres horas del día para revisar mensajes y correo."]
  ];
  var ESTACIONES = [
    ["lluvia", "Lluvia", "Lluvia constante, con gotas que no se repiten."],
    ["mar", "Mar", "Ninguna ola llega igual que la anterior."],
    ["bosque", "Bosque", "Ramas, viento y pájaros que no se repiten."],
    ["suave", "Ruido suave", "Un soplido parejo, como una regadera lejana."],
    ["grave", "Ruido grave", "Un rumor grave y parejo, como el de un avión desde dentro."],
    ["acordes", "Acordes", "Acordes largos y graves que cambian despacio."]
  ];

  /* ---------- Sable con audífonos (ilustraciones de Diseño Instruccional: ojos abiertos y cerrados) ---------- */
  function sable(t, extra){
    return '<div class="sable' + (extra || "") + '" style="--t:' + t + 'px" role="img" aria-label="Sable, la pantera de la UVP, con audífonos">' +
      '<div class="cuerpo"><img class="ojos-a" src="' + RAIZ + 'img/sable-aud-b.png" alt=""><img class="ojos-c" src="' + RAIZ + 'img/sable-aud-a.png" alt=""></div>' +
      '<div class="notas" aria-hidden="true"><i>♪</i><i>♫</i><i>♪</i></div></div>';
  }

  /* ---------- vista Bienestar ---------- */
  function pintarBienestar(){
    var el = document.getElementById("v-bienestar"); if(!el) return;
    el.innerHTML =
      '<div class="cab-esp"><span class="eyebrow">Para cuidarte mientras trabajas en línea</span><h1>Bienestar</h1>' +
      '<p>Ejercicios de bienestar digital para tu vista, tu cuerpo y tu atención, y un rincón de música que se crea sola mientras trabajas. Elige lo que necesites ahora y deja el resto: aquí no hay puntos ni prisa.</p>' +
      ayuda("Para cuidar tu vista, tu cuerpo y tu atención mientras preparas clases o calificas frente a la pantalla, y para trabajar con música tranquila de fondo. Todo funciona aquí mismo y no guarda ningún dato tuyo.") +
      '<div class="switch" role="tablist" aria-label="Secciones de Bienestar" style="justify-self:start">' +
        '<button role="tab" id="tab-bien-ej" aria-controls="panel-bien-ej" aria-selected="true" tabindex="0" data-bien="ej">Ejercicios de bienestar digital</button>' +
        '<button role="tab" id="tab-bien-mus" aria-controls="panel-bien-mus" aria-selected="false" tabindex="-1" data-bien="mus">Música</button></div></div>' +
      '<div id="panel-bien-ej" role="tabpanel" aria-labelledby="tab-bien-ej" class="panel-bien">' +
      '<nav class="subnav" aria-label="Ejercicios"><a href="#bienestar-pausa">Haz una pausa</a><a href="#bienestar-evidencia">Lo que dice la evidencia</a><a href="#bienestar-chequeo">¿Cómo vas?</a></nav>' +

      '<div class="sec" id="bienestar-pausa"><div class="sec-t"><div><h2>Haz una pausa</h2><p>Úsala antes de empezar si llegas acelerado, a media sesión si llevas rato sin moverte o después de calificar, que es cuando más cuesta parar.</p></div>' +
      '<div class="opc"><button type="button" id="b-sonido" aria-pressed="true">Avisar con sonido</button></div></div>' +
      '<div class="pausas">' +
        '<div class="herr"><span class="k">Respira</span><h3>Una respiración que te lleva el paso</h3>' +
          '<p>Respirar despacio unos minutos, sobre todo si lo practicas seguido, se asocia con menos estrés. No hace falta hacerlo perfecto.</p>' +
          '<div class="opc" role="group" aria-label="Ritmo">' + Object.keys(RESP).map(function(k, i){ return '<button type="button" data-resp="' + k + '" aria-pressed="' + (i ? "false" : "true") + '">' + RESP[k].n + '</button>'; }).join("") + '</div>' +
          '<div class="resp"><div class="bola" id="b-bola"><div><b id="b-fase">Listo</b><span id="b-cuenta">Siéntate con la espalda apoyada</span></div></div></div>' +
          '<p class="chico" id="b-ritmo">' + RESP.calma.s + '</p>' +
          '<div class="acciones"><button type="button" class="accion" id="b-resp">▶ Empezar</button><button type="button" class="accion sec" id="b-resp-x" hidden>Detener</button></div>' +
          '<p class="chico" aria-live="polite" id="b-resp-min"></p>' +
          '<p class="chico">Si te mareas o te falta el aire, vuelve a respirar como siempre. No hace falta forzar nada.</p>' +
          '<p class="fuente">NHS, «Breathing exercises for stress» · Fincham y colaboradores, 2023</p></div>' +

        '<div class="herr"><span class="k">Descansa la vista</span><h3>20 segundos mirando lejos</h3>' +
          '<p>Cada 20 minutos frente a la pantalla, mira algo que esté al menos a seis metros durante 20 segundos.</p>' +
          '<div class="reloj" id="v-reloj" aria-live="polite">0:20<small>Busca lo más lejano que veas: una ventana, el fondo del cuarto.</small></div>' +
          '<div class="acciones"><button type="button" class="accion" id="v-ya">▶ Pausa de 20 segundos</button></div>' +
          '<div class="opc"><button type="button" id="v-cada" aria-pressed="false">Recordármelo cada 20 minutos</button></div>' +
          '<p class="chico" id="v-prox" aria-live="polite">El recordatorio funciona mientras tengas el sitio abierto.</p>' +
          '<p class="fuente">AAO, «Eye Strain and Sleepy Eyes» · AOA, «Computer vision syndrome». Tras dos horas seguidas, 15 minutos de descanso para la vista (AOA).</p></div>' +

        '<div class="herr"><span class="k">Estírate</span><h3>Cinco estiramientos en tu silla</h3>' +
          '<p>Unos 20 segundos cada uno. Muévete despacio y solo hasta donde sea cómodo.</p>' +
          '<ol class="estira" id="e-lista">' + ESTIRA.map(function(x){ return '<li><b>' + x[0] + '</b>' + x[1] + '</li>'; }).join("") + '</ol>' +
          '<div class="reloj" id="e-reloj" aria-live="polite" hidden></div>' +
          '<div class="acciones"><button type="button" class="accion" id="e-ya">▶ Guíame</button><button type="button" class="accion sec" id="e-x" hidden>Detener</button></div>' +
          '<p class="chico">Si algo duele, detente. Un dolor que no se va o que empeora amerita consulta médica.</p></div>' +

        '<div class="herr"><span class="k">Concéntrate</span><h3>Bloques de trabajo con pausa</h3>' +
          '<p>Trabaja un bloque sin interrupciones y descansa al terminar. Tras cuatro bloques, una pausa larga de 15 minutos.</p>' +
          '<div class="opc" role="group" aria-label="Duración del bloque"><button type="button" data-blq="25,5" aria-pressed="true">25 + 5 min</button><button type="button" data-blq="50,10" aria-pressed="false">50 + 10 min</button></div>' +
          '<div class="reloj" id="c-reloj" aria-live="off">25:00<small id="c-fase">Bloque de trabajo</small></div>' +
          '<div class="acciones"><button type="button" class="accion" id="c-ya">▶ Empezar bloque</button><button type="button" class="accion sec" id="c-x">Reiniciar</button></div>' +
          '<p class="chico" id="c-n">Bloques completados hoy: 0</p>' +
          '<p class="fuente">Francesco Cirillo · Biwer y colaboradores, 2023. De 5 a 10 minutos de pausa por cada hora frente a la pantalla (CCOHS).</p></div>' +
      '</div></div>' +

      '<div class="sec" id="bienestar-evidencia"><div class="sec-t"><div><h2>Lo que dice la evidencia</h2><p>Fichas breves, cada una con algo que puedes probar hoy y su fuente.</p></div></div>' +
      '<div class="temas-b opc" role="group" aria-label="Filtrar por tema"><button type="button" data-tema="" aria-pressed="true">Todos</button>' + TEMAS.map(function(t){ return '<button type="button" data-tema="' + t + '" aria-pressed="false">' + t + '</button>'; }).join("") + '</div>' +
      '<div class="fichas-b" id="b-fichas">' + FICHAS.map(function(f){ return '<article class="fb" data-t="' + f[0] + '"><span class="tipo">' + f[0] + '</span><h4>' + f[1] + '</h4><p>' + f[2] + '</p><div class="prueba"><b>Prueba esto</b>' + f[3] + '</div><p class="fuente">Fuente: ' + f[4] + '</p></article>'; }).join("") + '</div></div>' +

      '<div class="sec" id="bienestar-chequeo"><div class="sec-t"><div><h2>¿Cómo vas?</h2><p>Marca lo que te pasa con frecuencia. Te sugerimos un paso pequeño para cada cosa. No se guarda ni se envía nada.</p></div></div>' +
      '<div class="chequeo">' + CHEQUEO.map(function(c, i){ return '<label><input type="checkbox" data-ch="' + i + '"><span>' + c[0] + '</span></label>'; }).join("") + '</div>' +
      '<div class="plan" id="b-plan" hidden aria-live="polite"></div>' +
      '<div class="aviso"><span><b>Si llevas días con el ánimo bajo</b> o te reconoces en varias de las cuatro señales de la OMS, habla con alguien de confianza y busca apoyo profesional. Si algo de tu carga de trabajo te rebasa, platícalo con tu coordinación.</span></div></div></div>' +
      '<div id="panel-bien-mus" role="tabpanel" aria-labelledby="tab-bien-mus" class="panel-bien" hidden></div>';

    // respiración
    var rk = "calma", R = null, segRes = 0;
    el.querySelectorAll("[data-resp]").forEach(function(b){ b.onclick = function(){ rk = b.dataset.resp; el.querySelectorAll("[data-resp]").forEach(function(x){ x.setAttribute("aria-pressed", x === b); }); $("#b-ritmo").textContent = RESP[rk].s; if(R) iniciaResp(); }; });
    function faseResp(i){
      var p = RESP[rk].f, f = p[i % p.length], bola = $("#b-bola"), n = f[1];
      bola.style.setProperty("--d", n + "s"); bola.classList.toggle("in", f[2] === "in");
      $("#b-fase").textContent = f[0];
      var t0 = Date.now();
      (function cuenta(){ if(!R) return; var q = n - Math.floor((Date.now() - t0) / 1000); $("#b-cuenta").textContent = q > 0 ? q : ""; if(q > 0) R.c = setTimeout(cuenta, 250); })();
      R.t = setTimeout(function(){ segRes += n; $("#b-resp-min").textContent = "Llevas " + mmss(segRes) + " respirando."; faseResp(i + 1); }, n * 1000);
    }
    function iniciaResp(){ paraResp(); R = {}; $("#b-resp").hidden = true; $("#b-resp-x").hidden = false; faseResp(0); }
    function paraResp(){ if(R){ clearTimeout(R.t); clearTimeout(R.c); } R = null; var b = $("#b-bola"); b.classList.remove("in"); $("#b-fase").textContent = "Listo"; $("#b-cuenta").textContent = "Toca «Empezar» cuando quieras"; $("#b-resp").hidden = false; $("#b-resp-x").hidden = true; }
    $("#b-resp").onclick = iniciaResp; $("#b-resp-x").onclick = paraResp;

    // vista
    var V = null, cada = null;
    $("#v-ya").onclick = function(){
      clearInterval(V); var fin = Date.now() + 20000, r = $("#v-reloj");
      V = setInterval(function(){ var q = (fin - Date.now()) / 1000; r.firstChild.nodeValue = mmss(Math.ceil(q)); if(q <= 0){ clearInterval(V); r.firstChild.nodeValue = "0:20"; toast("Listo. Si puedes, parpadea despacio unas veces antes de volver."); } }, 250);
    };
    $("#v-cada").onclick = function(){
      var on = this.getAttribute("aria-pressed") !== "true"; this.setAttribute("aria-pressed", on); clearInterval(cada);
      if(on){ var prox = Date.now() + 20 * 60000; $("#v-prox").textContent = "Próximo recordatorio a las " + new Date(prox).toLocaleTimeString("es-MX", {hour:"2-digit", minute:"2-digit"}) + ".";
        cada = setInterval(function(){ toast("Han pasado 20 minutos: mira algo lejano durante 20 segundos."); $("#v-prox").textContent = "Próximo recordatorio a las " + new Date(Date.now() + 20 * 60000).toLocaleTimeString("es-MX", {hour:"2-digit", minute:"2-digit"}) + "."; }, 20 * 60000);
      } else $("#v-prox").textContent = "Recordatorio apagado.";
    };

    // estiramientos
    var E = null;
    function paraE(){ if(E) clearInterval(E.i); E = null; el.querySelectorAll("#e-lista li").forEach(function(li){ li.classList.remove("ahora"); }); $("#e-reloj").hidden = true; $("#e-ya").hidden = false; $("#e-x").hidden = true; }
    $("#e-ya").onclick = function(){
      paraE(); E = {k:0, fin:Date.now() + 20000}; $("#e-ya").hidden = true; $("#e-x").hidden = false; $("#e-reloj").hidden = false;
      var lis = el.querySelectorAll("#e-lista li"); lis[0].classList.add("ahora");
      E.i = setInterval(function(){
        var q = (E.fin - Date.now()) / 1000; $("#e-reloj").textContent = ESTIRA[E.k][0] + " · " + mmss(Math.ceil(q));
        if(q <= 0){ lis[E.k].classList.remove("ahora"); E.k++; if(E.k >= ESTIRA.length){ paraE(); toast("Listo. Si puedes, camina un par de minutos."); return; } lis[E.k].classList.add("ahora"); E.fin = Date.now() + 20000; campana(); }
      }, 250);
    };
    $("#e-x").onclick = paraE;

    // bloques
    var C = {tr:25, pa:5, fase:"tr", resta:25 * 60, corre:false, n:0};
    function pintaC(){ $("#c-reloj").firstChild.nodeValue = mmss(C.resta); $("#c-fase").textContent = C.fase === "tr" ? "Bloque de trabajo" : (C.n % 4 === 0 ? "Pausa larga" : "Pausa"); $("#c-ya").textContent = C.corre ? "Pausar" : (C.resta < (C.fase === "tr" ? C.tr : C.pa) * 60 ? "▶ Continuar" : (C.fase === "tr" ? "▶ Empezar bloque" : "▶ Empezar pausa")); $("#c-n").textContent = "Bloques completados hoy: " + C.n; }
    el.querySelectorAll("[data-blq]").forEach(function(b){ b.onclick = function(){ var v = b.dataset.blq.split(","); C.tr = +v[0]; C.pa = +v[1]; el.querySelectorAll("[data-blq]").forEach(function(x){ x.setAttribute("aria-pressed", x === b); }); reiniciaC(); }; });
    function tick(){ if(!C.corre) return; C.resta = Math.round((C.fin - Date.now()) / 1000); if(C.resta <= 0){ C.corre = false; if(C.fase === "tr"){ C.n++; C.fase = "pa"; C.resta = (C.n % 4 === 0 ? 15 : C.pa) * 60; toast(C.n % 4 === 0 ? "Cuatro bloques: date una pausa larga de 15 minutos." : "Terminó el bloque. Levántate y mira lejos un momento."); } else { C.fase = "tr"; C.resta = C.tr * 60; toast("Terminó la pausa. Cuando quieras, empieza el siguiente bloque."); } pintaC(); return; } pintaC(); C.to = setTimeout(tick, 500); }
    $("#c-ya").onclick = function(){ if(C.corre){ C.corre = false; clearTimeout(C.to); } else { C.corre = true; C.fin = Date.now() + C.resta * 1000; tick(); } pintaC(); };
    function reiniciaC(){ C.corre = false; clearTimeout(C.to); C.fase = "tr"; C.resta = C.tr * 60; pintaC(); }
    $("#c-x").onclick = reiniciaC; pintaC();

    $("#b-sonido").onclick = function(){ avisoSonoro = this.getAttribute("aria-pressed") !== "true"; this.setAttribute("aria-pressed", avisoSonoro); };

    // fichas por tema
    el.querySelectorAll("[data-tema]").forEach(function(b){ b.onclick = function(){ el.querySelectorAll("[data-tema]").forEach(function(x){ x.setAttribute("aria-pressed", x === b); }); el.querySelectorAll(".fb").forEach(function(f){ f.hidden = !!b.dataset.tema && f.dataset.t !== b.dataset.tema; }); }; });

    // chequeo
    el.querySelectorAll("[data-ch]").forEach(function(c){ c.onchange = function(){
      var acc = []; el.querySelectorAll("[data-ch]:checked").forEach(function(x){ var a = CHEQUEO[+x.dataset.ch][1]; if(acc.indexOf(a) < 0) acc.push(a); });
      var p = $("#b-plan"); p.hidden = !acc.length;
      p.innerHTML = acc.length ? '<b>Tu plan de pasos pequeños</b><ol>' + acc.map(function(a){ return "<li>" + a + "</li>"; }).join("") + '</ol><p class="chico">Empieza por uno. Cuando se vuelva costumbre, suma el siguiente.</p>' : "";
    }; });
  }

  /* ---------- paisajes de sonido (se generan en el navegador) ---------- */
  var SON = {k:null, nodos:[], timers:[], vol:.5};
  function ruido(tipo){
    var n = ctx.sampleRate * 4, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), last = 0, b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(var i = 0; i < n; i++){
      var w = Math.random() * 2 - 1;
      if(tipo === "rosa"){ b0=.99886*b0+w*.0555179; b1=.99332*b1+w*.0750759; b2=.969*b2+w*.153852; b3=.8665*b3+w*.3104856; b4=.55*b4+w*.5329522; b5=-.7616*b5-w*.016898; d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11; b6=w*.115926; }
      else if(tipo === "cafe"){ last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
      else d[i] = w;
    }
    var s = ctx.createBufferSource(); s.buffer = b; s.loop = true; return s;
  }
  function filtro(tipo, f, q){ var x = ctx.createBiquadFilter(); x.type = tipo; x.frequency.value = f; if(q) x.Q.value = q; return x; }
  function ganancia(v){ var g = ctx.createGain(); g.gain.value = v; return g; }
  function cadena(){ var a = arguments; for(var i = 0; i < a.length - 1; i++) a[i].connect(a[i + 1]); return a[a.length - 1]; }
  function cadaTanto(fn, min, max){ var t; (function sig(){ t = setTimeout(function(){ fn(); sig(); }, min + Math.random() * (max - min)); SON.timers.push({stop:function(){ clearTimeout(t); }}); })(); }
  var GEN = {
    lluvia: function(sal){
      var s = ruido("rosa"); s.start(); SON.nodos.push(s); cadena(s, filtro("highpass", 500), filtro("lowpass", 7000), ganancia(.55), sal);
      var w = ruido("blanco"); w.start(); SON.nodos.push(w); var bp = filtro("bandpass", 3000, 1.2), g = ganancia(0); cadena(w, bp, g, sal); SON.nodos.push(g);
      cadaTanto(function(){ var t = ctx.currentTime; bp.frequency.setValueAtTime(1800 + Math.random() * 3500, t); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.08 + Math.random() * .12, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + .05); }, 40, 180);
    },
    mar: function(sal){
      var s = ruido("cafe"); s.start(); SON.nodos.push(s); var lp = filtro("lowpass", 700), g = ganancia(.15); cadena(s, lp, g, sal);
      var w = ruido("rosa"); w.start(); SON.nodos.push(w); var hp = filtro("highpass", 1200), gw = ganancia(.0); cadena(w, hp, gw, sal);
      (function ola(){ var t = ctx.currentTime, sube = 2.5 + Math.random() * 2.5, baja = 3.5 + Math.random() * 4, alto = .55 + Math.random() * .45;
        g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(alto, t + sube); g.gain.linearRampToValueAtTime(.12, t + sube + baja);
        lp.frequency.setValueAtTime(lp.frequency.value, t); lp.frequency.linearRampToValueAtTime(900 + alto * 900, t + sube); lp.frequency.linearRampToValueAtTime(500, t + sube + baja);
        gw.gain.setValueAtTime(0, t); gw.gain.linearRampToValueAtTime(alto * .12, t + sube); gw.gain.linearRampToValueAtTime(0, t + sube + baja * .7);
        var to = setTimeout(ola, (sube + baja) * 1000 - 300); SON.timers.push({stop:function(){ clearTimeout(to); }}); })();
    },
    bosque: function(sal){
      var s = ruido("rosa"); s.start(); SON.nodos.push(s); var bp = filtro("bandpass", 500, .6), g = ganancia(.25); cadena(s, bp, g, sal);
      var lfo = ctx.createOscillator(), lg = ganancia(.12); lfo.frequency.value = .07; lfo.connect(lg); lg.connect(g.gain); lfo.start(); SON.nodos.push(lfo);
      cadaTanto(function(){ var veces = 2 + Math.floor(Math.random() * 4), base = 2200 + Math.random() * 1800, t0 = ctx.currentTime;
        for(var i = 0; i < veces; i++){ var o = ctx.createOscillator(), gg = ctx.createGain(), t = t0 + i * (.11 + Math.random() * .08);
          o.type = "sine"; o.frequency.setValueAtTime(base, t); o.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * .4), t + .07);
          gg.gain.setValueAtTime(.0001, t); gg.gain.linearRampToValueAtTime(.05, t + .01); gg.gain.exponentialRampToValueAtTime(.0001, t + .09);
          o.connect(gg); gg.connect(sal); o.start(t); o.stop(t + .12); } }, 1800, 6500);
    },
    suave: function(sal){ var s = ruido("rosa"); s.start(); SON.nodos.push(s); cadena(s, filtro("lowpass", 5000), ganancia(.5), sal); },
    grave: function(sal){ var s = ruido("cafe"); s.start(); SON.nodos.push(s); cadena(s, filtro("lowpass", 420), ganancia(.7), sal); },
    acordes: function(sal){
      var lp = filtro("lowpass", 1100), dl = ctx.createDelay(1), fb = ganancia(.35), out = ganancia(.35);
      lp.connect(out); lp.connect(dl); dl.delayTime.value = .45; dl.connect(fb); fb.connect(dl); fb.connect(out); out.connect(sal);
      var CH = [[130.8,164.8,196,246.9],[110,130.8,164.8,196],[87.3,110,130.8,174.6],[98,123.5,146.8,196]], k = 0;
      (function acorde(){ var t = ctx.currentTime, notas = CH[k++ % CH.length];
        notas.forEach(function(f, i){ var o = ctx.createOscillator(), g = ctx.createGain(); o.type = i % 2 ? "sine" : "triangle"; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 8;
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09, t + 3); g.gain.linearRampToValueAtTime(.09, t + 7); g.gain.linearRampToValueAtTime(0, t + 11);
          o.connect(g); g.connect(lp); o.start(t); o.stop(t + 11.2); });
        var to = setTimeout(acorde, 8000); SON.timers.push({stop:function(){ clearTimeout(to); }}); })();
    }
  };
  var salida = null;
  function sonar(k){
    if(!audio()) return;
    parar(true);
    salida = ganancia(0); salida.connect(master); salida.gain.linearRampToValueAtTime(SON.vol, ctx.currentTime + 1.5);
    SON.k = k; GEN[k](salida); estado();
  }
  function parar(sinEstado){
    SON.timers.forEach(function(t){ t.stop(); }); SON.timers = [];
    var viejos = SON.nodos, s = salida; SON.nodos = []; SON.k = null;
    if(s && ctx){ s.gain.cancelScheduledValues(ctx.currentTime); s.gain.setValueAtTime(s.gain.value, ctx.currentTime); s.gain.linearRampToValueAtTime(0, ctx.currentTime + .6);
      setTimeout(function(){ viejos.forEach(function(n){ try{ n.stop && n.stop(); }catch(e){} }); try{ s.disconnect(); }catch(e){} }, 700); }
    salida = null; if(!sinEstado) estado();
  }

  /* ---------- Música: pentagrama de colores con música generativa y Sable caminando sobre las notas ----------
     La música la compone el navegador al momento (un pequeño modelo de cadenas de Márkov sobre escalas pentatónicas,
     con acordes que cambian cada cuatro tiempos). No se descarga ni se envía nada. */
  var ANIMOS = {
    calma:   {n:"Calma",    bpm:64, raiz:261.63, esc:[0,2,4,7,9],  acordes:[[0,4,7],[9,12,16],[5,9,12],[7,11,14]], onda:"sine",     dens:.62},
    amanecer:{n:"Amanecer", bpm:76, raiz:293.66, esc:[0,2,4,7,9],  acordes:[[0,4,7],[5,9,12],[2,5,9],[7,11,14]],   onda:"triangle", dens:.7},
    noche:   {n:"Noche",    bpm:56, raiz:220.00, esc:[0,3,5,7,10], acordes:[[0,3,7],[5,8,12],[3,7,10],[7,10,14]],  onda:"sine",     dens:.5},
    foco:    {n:"Foco",     bpm:84, raiz:246.94, esc:[0,2,5,7,9],  acordes:[[0,4,7],[2,5,9],[5,9,12],[0,4,7]],     onda:"triangle", dens:.45}
  };
  var COLORES = ["#F49AC1", "#F7B98B", "#F3DD8C", "#9FDCB8", "#8CC8EE", "#B7A6F2", "#E3A6E8"];
  var GRADOS = 11;                       // dos octavas de la escala pentatónica (0 = la nota más grave)
  var VEL = 64;                          // píxeles por segundo que avanza el pentagrama
  var M = {on:false, animo:"calma", notas:[], beat:0, tSig:0, grado:4, total:0, tuyas:0, acorde:0, fondo:null, vol:.6, rafaga:[]};
  var musOut = null, reverb = null, eco = null;

  function preparaAudio(){
    if(!audio() || musOut) return;
    musOut = ganancia(M.vol); musOut.connect(master);
    // reverberación suave: impulso de ruido que se desvanece
    reverb = ctx.createConvolver(); var len = ctx.sampleRate * 3, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for(var c = 0; c < 2; c++){ var d = ir.getChannelData(c); for(var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    reverb.buffer = ir; var rg = ganancia(.35); reverb.connect(rg); rg.connect(musOut);
    eco = ctx.createDelay(1.5); var fb = ganancia(.28), eg = ganancia(.22); eco.connect(fb); fb.connect(eco); eco.connect(eg); eg.connect(musOut);
  }
  function frec(grado){ var A = ANIMOS[M.animo], o = Math.floor(grado / 5), g = ((grado % 5) + 5) % 5; return A.raiz * Math.pow(2, (A.esc[g] + 12 * o) / 12); }
  function tocaNota(n){
    var t = Math.max(n.t, ctx.currentTime + .01), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), A = ANIMOS[M.animo], f = frec(n.grado);
    o.type = A.onda; o.frequency.value = f; o2.type = "sine"; o2.frequency.value = f * 2; var g2 = ganancia(.12);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(n.tuya ? .2 : .15, t + .04); g.gain.exponentialRampToValueAtTime(.0008, t + n.dur + 1.6);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(musOut); g.connect(reverb); g.connect(eco);
    o.start(t); o2.start(t); o.stop(t + n.dur + 1.8); o2.stop(t + n.dur + 1.8);
  }
  function tocaAcorde(t, idx){
    var A = ANIMOS[M.animo], ac = A.acordes[idx % A.acordes.length], dur = 4 * 60 / A.bpm;
    ac.forEach(function(semi){
      var o = ctx.createOscillator(), g = ctx.createGain(), lp = filtro("lowpass", 900);
      o.type = "triangle"; o.frequency.value = A.raiz / 2 * Math.pow(2, semi / 12); o.detune.value = (Math.random() - .5) * 10;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.045, t + dur * .4); g.gain.linearRampToValueAtTime(0, t + dur + .8);
      o.connect(lp); lp.connect(g); g.connect(musOut); g.connect(reverb); o.start(t); o.stop(t + dur + 1);
    });
  }
  // compositor: una caminata por la escala con pasos cortos, silencios al final de cada frase y regreso al centro
  var PASOS = [[-3,.05],[-2,.13],[-1,.27],[0,.07],[1,.27],[2,.14],[3,.07]];
  function siguienteGrado(){
    var r = Math.random(), a = 0, paso = 0;
    for(var i = 0; i < PASOS.length; i++){ a += PASOS[i][1]; if(r <= a){ paso = PASOS[i][0]; break; } }
    if(M.grado > 8) paso = -Math.abs(paso); if(M.grado < 2) paso = Math.abs(paso);
    M.grado = Math.max(0, Math.min(GRADOS - 1, M.grado + paso)); return M.grado;
  }
  function compone(hasta){
    var A = ANIMOS[M.animo], b = 60 / A.bpm;
    while(M.tSig < hasta){
      var t = M.tSig, enFrase = M.beat % 16;
      if(M.beat % 4 === 0) M.notas.push({t:t, acorde:true, idx:M.acorde++, hecho:false});
      if(enFrase < 14 && Math.random() < A.dens){
        var dur = Math.random() < .25 ? b * 2 : b;
        M.notas.push({t:t, grado:siguienteGrado(), dur:dur, hecho:false, color:COLORES[Math.floor(Math.random() * COLORES.length)]});
        if(Math.random() < .18 && enFrase % 2 === 0) M.notas.push({t:t + b / 2, grado:siguienteGrado(), dur:b / 2, hecho:false, color:COLORES[Math.floor(Math.random() * COLORES.length)]});
      }
      M.beat++; M.tSig += b;
    }
  }
  var lienzo = null, c2 = null, W = 0, H = 0, sableX = 0, raf = null, reloj = null;
  var imgs = {};
  // cuadros de Sable caminando: cuando lleguen las imágenes de Sable bailando, basta con poner sus nombres aquí
  var CUADROS = ["img/sable-aud-a.png", "img/sable-aud-b.png"];   // a: ojos cerrados, b: ojos abiertos
  CUADROS.forEach(function(s){ var i = new Image(); i.src = RAIZ + s; imgs[s] = i; });
  // la ilustración termina en un corte recto a la altura del pecho: se desvanece hacia abajo para que «flote» sobre las notas
  var fundidos = {};
  function desvanecido(s){
    if(fundidos[s]) return fundidos[s]; var i = imgs[s]; if(!i || !i.complete || !i.naturalWidth) return null;
    var cv = document.createElement("canvas"); cv.width = i.naturalWidth; cv.height = i.naturalHeight; var g = cv.getContext("2d");
    g.drawImage(i, 0, 0); g.globalCompositeOperation = "destination-out";
    var gr = g.createLinearGradient(0, cv.height * .78, 0, cv.height); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,1)");
    g.fillStyle = gr; g.fillRect(0, 0, cv.width, cv.height); return (fundidos[s] = cv);
  }
  var sableY = 0, sableTam = 100, GLIFOS = ["♪", "♫", "♩", "♬"], TINTAS = ["#D2559A", "#E07B3A", "#C49A12", "#2F9E6B", "#3A8FD1", "#7C62D6"];
  function sueltaNota(n, cuando){
    if(reduce() || M.rafaga.length > 18) return;
    var lado = Math.random() < .5 ? -1 : 1;
    M.rafaga.push({t0:cuando, x:sableX + lado * sableTam * .38, y:sableY, dx:lado * 18, fase:Math.random() * 6, g:GLIFOS[Math.floor(Math.random() * GLIFOS.length)], color:TINTAS[Math.floor(Math.random() * TINTAS.length)]});
  }
  // las notas caen en líneas (grados impares) y espacios (pares) de un pentagrama de cinco líneas
  function yDe(grado){ var arriba = H * .32, abajo = H * .88; return abajo - (abajo - arriba) * grado / (GRADOS - 1); }
  function ahora(){ return ctx ? ctx.currentTime : 0; }
  function programa(){
    if(!M.on) return;
    var t = ahora(); compone(t + (W - sableX) / VEL + 1);
    M.notas.forEach(function(n){ if(!n.hecho && n.t < t + 1.5){ n.hecho = true; if(n.acorde) tocaAcorde(Math.max(n.t, t + .01), n.idx); else { tocaNota(n); M.total++; if(Math.random() < .8 || n.tuya) sueltaNota(n, n.t); } } });
    M.notas = M.notas.filter(function(n){ return n.t > t - 6; });
    var cont = $("#mus-cuenta"); if(cont) cont.textContent = "Notas creadas: " + M.total + (M.tuyas ? " · sembradas por ti: " + M.tuyas : "");
  }
  function dibuja(){
    raf = null; if(!lienzo || !lienzo.isConnected) return;
    var vis = lienzo.offsetParent !== null; if(!vis) return;
    var t = ahora(), osc = document.documentElement.getAttribute("data-theme") === "dark" || (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    var bg = c2.createLinearGradient(0, 0, W, H);
    if(osc){ bg.addColorStop(0, "#1E1830"); bg.addColorStop(1, "#2A1E36"); } else { bg.addColorStop(0, "#F6F1FC"); bg.addColorStop(1, "#FDF1EA"); }
    c2.fillStyle = bg; c2.fillRect(0, 0, W, H);
    // franjas suaves de cada acorde
    M.notas.forEach(function(n){ if(!n.acorde) return; var x = sableX + (n.t - t) * VEL, w = 4 * 60 / ANIMOS[M.animo].bpm * VEL; c2.fillStyle = COLORES[n.idx % COLORES.length] + (osc ? "14" : "22"); c2.fillRect(x, 0, w, H); });
    // pentagrama de colores
    for(var i = 0; i < 5; i++){ var y = yDe(1 + 2 * i); c2.strokeStyle = COLORES[i + 1] + (osc ? "99" : "cc"); c2.lineWidth = 2.5; c2.beginPath(); c2.moveTo(0, y); c2.lineTo(W, y); c2.stroke(); }
    // notas
    var mel = M.notas.filter(function(n){ return !n.acorde; }).sort(function(a, b){ return a.t - b.t; });
    mel.forEach(function(n){
      var x = sableX + (n.t - t) * VEL, y = yDe(n.grado), r = Math.max(7, H * .028);
      if(x < -40 || x > W + 40) return;
      var pasada = n.t <= t;
      if(pasada && !reduce()){ var e = (t - n.t); if(e < 1.6){ c2.strokeStyle = n.color; c2.globalAlpha = Math.max(0, 1 - e / 1.6); c2.lineWidth = 2; c2.beginPath(); c2.arc(x, y, r + e * 26, 0, 7); c2.stroke(); c2.globalAlpha = 1; } }
      var gl = c2.createRadialGradient(x, y, 1, x, y, r * 2.4); gl.addColorStop(0, n.color + "aa"); gl.addColorStop(1, n.color + "00");
      c2.fillStyle = gl; c2.beginPath(); c2.arc(x, y, r * 2.4, 0, 7); c2.fill();
      c2.fillStyle = n.color; c2.beginPath(); c2.arc(x, y, r, 0, 7); c2.fill();
      c2.strokeStyle = osc ? "#ffffff55" : "#ffffffcc"; c2.lineWidth = 2; c2.beginPath(); c2.arc(x, y, r, 0, 7); c2.stroke();
      if(n.tuya){ c2.fillStyle = "#fff"; c2.font = "bold " + Math.round(r * 1.3) + "px sans-serif"; c2.textAlign = "center"; c2.textBaseline = "middle"; c2.fillText("✦", x, y + 1); }
    });
    // Sable camina sobre las notas: salta de la última que pasó a la siguiente
    var prev = null, next = null;
    for(var k = 0; k < mel.length; k++){ if(mel[k].t <= t) prev = mel[k]; else { next = mel[k]; break; } }
    var yA = prev ? yDe(prev.grado) : H * .62, yB = next ? yDe(next.grado) : yA, tA = prev ? prev.t : t - 1, tB = next ? next.t : t + 1;
    var p = Math.min(1, Math.max(0, (t - tA) / Math.max(.2, tB - tA))), alto = reduce() ? 0 : Math.min(40, 14 + Math.abs(yB - yA) * .4);
    var yS = yA + (yB - yA) * p - Math.sin(p * Math.PI) * alto;
    // Sable baila: se mece al ritmo y abre los ojos de vez en cuando; las notas le salen de los audífonos
    var tam = Math.max(76, Math.min(140, H * .35)), pulso = t * ANIMOS[M.animo].bpm / 60;
    yS = Math.max(yS, tam * .96);
    var im = desvanecido(M.on ? (Math.floor(pulso) % 4 === 3 ? CUADROS[1] : CUADROS[0]) : CUADROS[1]);
    var mece = (M.on && !reduce()) ? Math.sin(pulso * Math.PI) * .07 : 0, rebote = (M.on && !reduce()) ? Math.abs(Math.sin(pulso * Math.PI)) * tam * .04 : 0;
    c2.imageSmoothingEnabled = true;
    c2.fillStyle = osc ? "#00000055" : "#3A2B4A22"; c2.beginPath(); c2.ellipse(sableX, yS + 2, tam * .26, tam * .05, 0, 0, 7); c2.fill();
    var halo = c2.createRadialGradient(sableX, yS - tam * .5, tam * .1, sableX, yS - tam * .5, tam * .7);
    halo.addColorStop(0, osc ? "rgba(214,190,255,.32)" : "rgba(255,255,255,.75)"); halo.addColorStop(1, "rgba(255,255,255,0)");
    c2.fillStyle = halo; c2.beginPath(); c2.arc(sableX, yS - tam * .5, tam * .7, 0, 7); c2.fill();
    if(im){ c2.save(); c2.translate(sableX, yS - rebote); c2.rotate(mece); c2.drawImage(im, -tam / 2, -tam, tam, tam); c2.restore(); }
    sableY = yS - tam * .62; sableTam = tam;
    // notas musicales flotando
    M.rafaga = M.rafaga.filter(function(q){ return t - q.t0 < 2.4; });
    M.rafaga.forEach(function(q){
      var e = (t - q.t0) / 2.4; if(e < 0) return;
      c2.globalAlpha = Math.max(0, e < .15 ? e / .15 : 1 - (e - .15) / .85);
      c2.fillStyle = q.color; c2.font = "700 " + Math.round(tam * .3 * (1 + e * .3)) + "px sans-serif"; c2.textAlign = "center"; c2.textBaseline = "middle"; c2.lineWidth = 3; c2.strokeStyle = osc ? "#1E1830" : "#ffffff"; c2.strokeText(q.g, q.x + Math.sin(e * 6 + q.fase) * 10 + q.dx * e, q.y - e * tam * .9);
      c2.fillText(q.g, q.x + Math.sin(e * 6 + q.fase) * 10 + q.dx * e, q.y - e * tam * .9);
    });
    c2.globalAlpha = 1;
    if(!M.on){ c2.fillStyle = osc ? "#EEEAF6" : "#221D3D"; c2.font = "600 " + Math.round(Math.max(15, H * .05)) + "px Lexend, sans-serif"; c2.textAlign = "center"; c2.textBaseline = "middle"; c2.fillText("Da clic en «Crear música» y Sable empezará a caminar", W / 2, H * .12); }
    if(M.on) raf = requestAnimationFrame(dibuja);
  }
  function ajusta(){
    if(!lienzo) return; var r = lienzo.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    W = r.width; H = r.height; if(!W) return; lienzo.width = W * dpr; lienzo.height = H * dpr; c2.setTransform(dpr, 0, 0, dpr, 0, 0); sableX = Math.max(70, W * .22);
    if(!raf) raf = requestAnimationFrame(dibuja);
  }
  function arranca(){
    preparaAudio(); if(!ctx) return;
    M.on = true; musOut.gain.cancelScheduledValues(ctx.currentTime); musOut.gain.setValueAtTime(0, ctx.currentTime); musOut.gain.linearRampToValueAtTime(M.vol, ctx.currentTime + 1.5);
    if(M.tSig < ctx.currentTime) M.tSig = ctx.currentTime + .3;
    clearInterval(reloj); reloj = setInterval(programa, 120); programa(); if(!raf) raf = requestAnimationFrame(dibuja); estado();
  }
  function detiene(){
    M.on = false; clearInterval(reloj);
    if(ctx && musOut){ musOut.gain.cancelScheduledValues(ctx.currentTime); musOut.gain.setValueAtTime(musOut.gain.value, ctx.currentTime); musOut.gain.linearRampToValueAtTime(0, ctx.currentTime + .8); }
    M.notas = M.notas.filter(function(n){ return n.hecho; }); M.tSig = 0; M.beat = 0; estado(); if(!raf) raf = requestAnimationFrame(dibuja);
  }
  function siembra(ev){
    if(!M.on) arranca(); if(!ctx) return;
    var r = lienzo.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, b = 60 / ANIMOS[M.animo].bpm;
    var g = Math.round((H * .88 - y) / (H * .56) * (GRADOS - 1)); g = Math.max(0, Math.min(GRADOS - 1, g));
    var t = ahora() + Math.max(.35, (x - sableX) / VEL); t = Math.max(ahora() + .3, Math.round(t / (b / 2)) * (b / 2));
    M.notas.push({t:t, grado:g, dur:b, hecho:false, tuya:true, color:COLORES[g % COLORES.length]}); M.tuyas++;
    var a = $("#mus-anuncio"); if(a) a.textContent = "Sembraste una nota.";
  }
  function siembraTecla(n){ if(!M.on) arranca(); if(!ctx) return; var b = 60 / ANIMOS[M.animo].bpm, t = Math.ceil((ahora() + 1) / (b / 2)) * (b / 2); M.notas.push({t:t, grado:Math.min(GRADOS - 1, n * 1.25 | 0), dur:b, hecho:false, tuya:true, color:COLORES[n % COLORES.length]}); M.tuyas++; }

  var FONDOS = [["", "Sin fondo"], ["lluvia", "Lluvia"], ["mar", "Mar"], ["bosque", "Bosque"]];
  function pintarMusica(){
    var el = document.getElementById("panel-bien-mus"); if(!el) return;
    el.innerHTML =
      '<div class="sec" id="bienestar-musica"><div class="sec-t"><div><h2>Música que se crea sola</h2><p>El pentagrama avanza y la música se compone nota por nota mientras lo escuchas: nunca suena igual dos veces. Sable camina sobre las notas. Toca el pentagrama para sembrar las tuyas.</p></div></div>' +
      '<div class="juego-m"><canvas id="mus-lienzo" class="mus-lienzo" role="img" aria-label="Pentagrama de colores: las notas avanzan de derecha a izquierda y Sable, con audífonos, camina sobre ellas. Toca el pentagrama para sembrar una nota."></canvas>' +
      '<p class="a11y-oculto" id="mus-anuncio" aria-live="polite"></p></div>' +
      '<div class="mus-ctl">' +
        '<div class="acciones"><button type="button" class="accion" id="mus-play">▶ Crear música</button></div>' +
        '<div><span class="k-m">Ambiente</span><div class="opc" role="group" aria-label="Ambiente de la música">' + Object.keys(ANIMOS).map(function(k, i){ return '<button type="button" data-animo="' + k + '" aria-pressed="' + (i ? "false" : "true") + '">' + ANIMOS[k].n + '</button>'; }).join("") + '</div></div>' +
        '<div><span class="k-m">Fondo</span><div class="opc" role="group" aria-label="Sonido de fondo">' + FONDOS.map(function(f, i){ return '<button type="button" data-fondo="' + f[0] + '" aria-pressed="' + (i ? "false" : "true") + '">' + f[1] + '</button>'; }).join("") + '</div></div>' +
        '<div class="vol"><label for="mus-vol">Volumen</label><input id="mus-vol" type="range" min="0" max="100" value="60"></div>' +
      '</div>' +
      '<p class="chico-m" id="mus-cuenta" aria-live="off">Notas creadas: 0</p>' +
      '<p class="chico-m">Con el teclado: <kbd>Espacio</kbd> crea o pausa la música y las teclas <kbd>1</kbd> a <kbd>8</kbd> siembran notas, de la más grave a la más aguda. Puedes cambiar de sección: la música sigue sonando y un pequeño reproductor con Sable te acompaña.</p>' +
      '<p class="chico-m">Con audífonos, mejor bajito: la OMS recomienda no pasar del 60 % del volumen máximo de tu dispositivo.</p></div>';
    lienzo = $("#mus-lienzo"); c2 = lienzo.getContext("2d");
    lienzo.addEventListener("pointerdown", siembra);
    $("#mus-play").onclick = function(){ M.on ? detiene() : arranca(); };
    el.querySelectorAll("[data-animo]").forEach(function(b){ b.onclick = function(){ M.animo = b.dataset.animo; el.querySelectorAll("[data-animo]").forEach(function(x){ x.setAttribute("aria-pressed", x === b); }); M.notas = M.notas.filter(function(n){ return n.hecho; }); if(ctx) M.tSig = ahora() + .3; M.beat = 0; }; });
    el.querySelectorAll("[data-fondo]").forEach(function(b){ b.onclick = function(){ el.querySelectorAll("[data-fondo]").forEach(function(x){ x.setAttribute("aria-pressed", x === b); }); if(b.dataset.fondo) sonar(b.dataset.fondo); else parar(); }; });
    $("#mus-vol").oninput = function(){ M.vol = this.value / 100; SON.vol = M.vol * .8; if(ctx){ if(musOut && M.on){ musOut.gain.cancelScheduledValues(ctx.currentTime); musOut.gain.setValueAtTime(M.vol, ctx.currentTime); } if(salida){ salida.gain.cancelScheduledValues(ctx.currentTime); salida.gain.setValueAtTime(SON.vol, ctx.currentTime); } } };
    el.addEventListener("keydown", function(e){
      if(e.target.closest("input,button")) { if(e.key !== " ") return; if(e.target.closest("button")) return; }
      if(e.key === " "){ e.preventDefault(); M.on ? detiene() : arranca(); }
      else if(/^[1-8]$/.test(e.key)) siembraTecla(+e.key);
    });
    lienzo.tabIndex = 0;
    if(window.ResizeObserver) new ResizeObserver(ajusta).observe(lienzo); else addEventListener("resize", ajusta);
    setTimeout(ajusta, 50);
  }

  /* ---------- estado, mini reproductor y pestañas ---------- */
  function vistaActual(){ var v = document.querySelector(".vista:not([hidden])"); return v ? v.dataset.vista : ""; }
  function enMusica(){ var p = document.getElementById("panel-bien-mus"); return vistaActual() === "bienestar" && p && !p.hidden; }
  function estado(){
    var suena = M.on || !!SON.k, b = $("#mus-play");
    if(b) b.textContent = M.on ? "❚❚ Pausar la música" : "▶ Crear música";
    document.querySelectorAll("[data-fondo]").forEach(function(x){ x.setAttribute("aria-pressed", (x.dataset.fondo || null) === SON.k); });
    var m = $(".mini-mus");
    if(!suena || enMusica()){ if(m) m.hidden = true; return; }
    if(!m){ m = document.createElement("div"); m.className = "mini-mus"; m.setAttribute("role", "region"); m.setAttribute("aria-label", "Música sonando"); document.body.appendChild(m); }
    var nom = (M.on ? "Música · " + ANIMOS[M.animo].n : "") + (M.on && SON.k ? " + " : "") + (SON.k ? FONDOS.filter(function(f){ return f[0] === SON.k; })[0][1] : "");
    m.hidden = false;
    m.innerHTML = sable(56, " suena") + '<div class="txt"><span>Sonando</span><b>' + esc(nom) + '</b></div>' +
      '<button type="button" data-mm="parar">Detener</button><a class="x-ir" href="#bienestar-musica">Volver</a>';
    m.querySelector('[data-mm="parar"]').onclick = function(){ detiene(); parar(); };
  }
  function muestraPanel(cual, enfocar){
    var v = document.getElementById("v-bienestar"); if(!v) return;
    v.querySelectorAll("[data-bien]").forEach(function(t){ var s = t.dataset.bien === cual; t.setAttribute("aria-selected", s); t.tabIndex = s ? 0 : -1; });
    document.getElementById("panel-bien-ej").hidden = cual !== "ej"; document.getElementById("panel-bien-mus").hidden = cual !== "mus";
    if(cual === "mus") setTimeout(ajusta, 30);
    estado();
  }

  /* ---------- arranque ---------- */
  pintarBienestar(); pintarMusica();
  document.querySelectorAll("#v-bienestar [data-bien]").forEach(function(t){ t.addEventListener("click", function(){ muestraPanel(t.dataset.bien); }); });
  function alCambiar(){
    var h = location.hash.slice(1);
    if(h === "musica" || h === "bienestar-musica"){ if(h === "musica") history.replaceState(null, "", "#bienestar-musica"); muestraPanel("mus"); setTimeout(function(){ var s = document.getElementById("bienestar-musica"); if(s) s.scrollIntoView({block:"start"}); }, 0); }
    else if(/^bienestar-(pausa|evidencia|chequeo)$/.test(h) || h === "bienestar") muestraPanel("ej");
    estado();
  }
  addEventListener("hashchange", alCambiar); alCambiar();
  window.DIMusica = {sonando:function(){ return M.on || !!SON.k; }, animo:function(){ return M.animo; }, notas:function(){ return M.total; }, fondo:function(){ return SON.k; }};
})();
