/* =============================
      CONFIGURATION
============================= */
const birthdayYear = new Date().getFullYear();
const birthdayMonth = 11;  // December
const birthdayDay = 13;

const NOTES = [
  "Lucky to have you as my best friend ✨",
  "Missing our daily talks and roj ni bakchodi so much!!",
  "Wishing you the happiest birthday, My Dhakkan 🌅💖",
  "Thank you for always being there for me and understanding me so well 💖",
  "Hoping this next year becomes the best one of your life 💎✨",
  "Always ther for you whenever you need me Beta💖💖"
];

const GALLERY_IMAGES = [
  "assets/images/photo1.jpeg",
  "assets/images/photo2.jpeg",
  "assets/images/photo3.jpeg",
  "assets/images/photo4.jpeg",
  "assets/images/photo5.jpeg",
  "assets/images/photo6.jpeg",
  "assets/images/photo7.jpeg",
  "assets/images/photo8.jpeg"
];

const MIC_SETTINGS = {
  threshold: 0.065,
  minBlowMs: 180,
  maxListenMs: 12000
};


/* =============================
      DOM REFERENCES
============================= */
const startBtn       = document.getElementById("startBtn");
const pageCountdown  = document.getElementById("page-countdown");
const pageCake       = document.getElementById("page-cake");
const pageNotes      = document.getElementById("page-notes");
const pageFlashback  = document.getElementById("page-flashback");
const pageCard       = document.getElementById("page-card");

const daysEl  = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minsEl  = document.getElementById("mins");
const secsEl  = document.getElementById("secs");

const onDateEl = document.getElementById("onDate");
const bigCount = document.getElementById("bigCount");

const cakeSvg = document.getElementById("cakeSvg");
const candlesGroup = document.getElementById("candles");
const afterBlowBtn = document.getElementById("afterBlowBtn");

const notesArea = document.getElementById("notesArea");
const toFlashbackBtn = document.getElementById("toFlashbackBtn");
const toCardBtn = document.getElementById("toCardBtn");
const restartBtn = document.getElementById("restartBtn");

const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");

const bdayAudio = document.getElementById("bdayAudio");


/* =============================
     PAGE SWITCHING (FIXED)
============================= */
function originalShowPage(el){
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  el.classList.remove("hidden");
}

const showPage = function(el){
  originalShowPage(el);

  // premium fade animation
  el.classList.add("fade-in-page");
  setTimeout(() => el.classList.remove("fade-in-page"), 700);

  if (el === pageCake){
    setTimeout(() => {
      try {
        bdayAudio.loop = true;
        bdayAudio.volume = 0.85;
        bdayAudio.play().catch(()=>{});
      } catch(e){}

      setTimeout(() => startAutoListeningOnCake(), 350);
    }, 400);
  }
};


/* =============================
        START BUTTON
============================= */
startBtn.addEventListener("click", () => {
  requestMicPermissionIfNeeded();
  showPage(pageCountdown);
  startCountdown();
});


/* =============================
      COUNTDOWN TIMER
============================= */
let countdownTimer = null;

function getTargetDate(){
  return new Date(`${birthdayYear}-${String(birthdayMonth).padStart(2,"0")}-${String(birthdayDay).padStart(2,"0")}T00:00:00+05:30`);
}

function startCountdown(){
  const target = getTargetDate();

  function tick(){
    const now  = new Date();
    const diff = target - now;

    if (diff <= 0){
      clearInterval(countdownTimer);
      show3to1();
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000)  % 60);
    const s = Math.floor((diff / 1000)   % 60);

    daysEl.textContent  = String(d).padStart(2,"0");
    hoursEl.textContent = String(h).padStart(2,"0");
    minsEl.textContent  = String(m).padStart(2,"0");
    secsEl.textContent  = String(s).padStart(2,"0");
  }

  tick();
  countdownTimer = setInterval(tick, 1000);
}


/* =============================
        3 → 2 → 1 ANIMATION
============================= */
function show3to1(){
  document.getElementById("countdown").classList.add("hidden");
  onDateEl.classList.remove("hidden");

  let numbers = [3,2,1];
  let idx = 0;

  function animate(){
    bigCount.textContent = numbers[idx];
    bigCount.style.opacity = "1";
    bigCount.style.transform = "scale(1)";

    setTimeout(()=>{
      bigCount.style.opacity = "0";
      bigCount.style.transform = "scale(0.6)";

      setTimeout(()=>{
        idx++;
        if(idx < numbers.length){
          animate();
        } else {
          bigCount.textContent = "🎉";
          bigCount.style.opacity = "1";
          bigCount.style.transform = "scale(1.2)";
          setTimeout(()=> showPage(pageCake), 800);
        }
      },380);
    },650);
  }
  animate();
}


/* =============================
         CAKE INTERACTION
============================= */
let blown = false;

cakeSvg.addEventListener("click", () => {
  if(blown) return;
  blown = true;

  extinguishCandles();

  setTimeout(()=>{
    startConfetti();
    afterBlowBtn.classList.remove("hidden");
  }, 900);
});

afterBlowBtn.addEventListener("click", showNotesPage);


function extinguishCandles(){
  candlesGroup.classList.add("candle-extinguished");

  document.querySelectorAll(".flame-core").forEach(f=>{
    f.animate(
      [
        { opacity:1, transform:"translateY(0) scale(1)" },
        { opacity:0, transform:"translateY(-22px) scale(0.1)" }
      ],
      { duration:800, easing:"ease-out", fill:"forwards" }
    );
  });
}


/* =============================
          CONFETTI
============================= */
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

window.addEventListener("resize", ()=>{
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

let confetti = [];
function rand(min,max){ return Math.random()*(max-min)+min; }

function startConfetti(){
  confetti = [];
  for(let i=0;i<140;i++){
    confetti.push({
      x: rand(0, confettiCanvas.width),
      y: rand(-confettiCanvas.height, 0),
      size: rand(6,12),
      speedY: rand(2,7),
      speedX: rand(-2,2),
      color: `hsl(${Math.floor(rand(0,360))},80%,60%)`
    });
  }
  requestAnimationFrame(updateConfetti);
}

function updateConfetti(){
  confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);

  confetti.forEach(p=>{
    p.x += p.speedX;
    p.y += p.speedY;

    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(p.x,p.y,p.size,p.size*0.6);
  });

  confetti = confetti.filter(p=> p.y < confettiCanvas.height + 40);

  if(confetti.length > 0) requestAnimationFrame(updateConfetti);
}


/* =============================
        NOTES PAGE
============================= */
function showNotesPage(){
  showPage(pageNotes);
  notesArea.innerHTML = "";

  NOTES.forEach((note,i)=>{
    const div = document.createElement("div");
    div.className = "note";

    const emoji = ["💖","🌟","🍰","🎀","🎈"][i % 5];

    div.innerHTML = `<h4>For you ${emoji}</h4><p>${note}</p>`;
    notesArea.appendChild(div);
  });
}


/* =============================
        FLASHBACK PAGE
============================= */
toFlashbackBtn.addEventListener("click", () => showPage(pageFlashback));

toCardBtn.addEventListener("click", () => showPage(pageCard));

restartBtn.addEventListener("click", () => location.reload());


/* =============================
     MICROPHONE PERMISSION
============================= */
let audioStream = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let micReady = false;
let micListening = false;
let micAnim = null;

function requestMicPermissionIfNeeded(){
  if(micReady) return;

  if(!navigator.mediaDevices) return;

  navigator.mediaDevices.getUserMedia({ audio:true })
    .then(stream=>{
      audioStream = stream;
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const src = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      dataArray = new Float32Array(analyser.fftSize);
      src.connect(analyser);
      micReady = true;
    })
    .catch(()=>{});
}


function startAutoListeningOnCake(){
  if(blown || !micReady || micListening) return;

  micListening = true;
  let firstLoud = null;
  const startT = performance.now();

  function analyze(){
    if(!analyser || blown) return;

    analyser.getFloatTimeDomainData(dataArray);

    let sum = 0;
    for(let i=0;i<dataArray.length;i++){
      sum += dataArray[i]*dataArray[i];
    }

    const rms = Math.sqrt(sum / dataArray.length);
    const now = performance.now();

    if(rms >= MIC_SETTINGS.threshold){
      if(firstLoud === null) firstLoud = now;

      if(now - firstLoud >= MIC_SETTINGS.minBlowMs){
        blown = true;
        stopMic();
        extinguishCandles();
        setTimeout(()=>{ startConfetti(); afterBlowBtn.classList.remove("hidden"); }, 800);
        return;
      }
    } else {
      firstLoud = null;
    }

    if(now - startT >= MIC_SETTINGS.maxListenMs){
      stopMic();
      return;
    }

    micAnim = requestAnimationFrame(analyze);
  }

  micAnim = requestAnimationFrame(analyze);
}

function stopMic(){
  micListening = false;
  if(micAnim) cancelAnimationFrame(micAnim);
  if(audioStream){
    audioStream.getTracks().forEach(t=>t.stop());
    audioStream = null;
  }
  if(audioContext){
    audioContext.close();
    audioContext = null;
  }
}


/* =============================
        DRAGGABLE MEMORIES
============================= */
function enableDrag(){
  const wrap = document.querySelector(".mem-wrap");
  if(!wrap) return;

  const imgs = [...document.querySelectorAll(".mem-img")];
  const originals = new Map();

  imgs.forEach(img=>{
    originals.set(img,{
      left: img.style.left,
      top: img.style.top
    });

    img.addEventListener("pointerdown", startDrag);
  });

  function startDrag(e){
    const img = e.target;
    img.setPointerCapture(e.pointerId);

    let startX = e.clientX;
    let startY = e.clientY;

    let rect = img.getBoundingClientRect();
    let parent = wrap.getBoundingClientRect();

    let leftPct = ((rect.left - parent.left + rect.width/2) / parent.width)*100;
    let topPct  = ((rect.top  - parent.top  + rect.height/2) / parent.height)*100;

    function move(ev){
      let dx = ev.clientX - startX;
      let dy = ev.clientY - startY;

      let newLeft = leftPct + (dx / parent.width)*100;
      let newTop  = topPct + (dy / parent.height)*100;

      img.style.left = `${newLeft}%`;
      img.style.top  = `${newTop}%`;
    }
    function stop(ev){
      img.releasePointerCapture(ev.pointerId);
      img.removeEventListener("pointermove", move);
      img.removeEventListener("pointerup", stop);
    }

    img.addEventListener("pointermove", move);
    img.addEventListener("pointerup", stop);
  }
}

enableDrag();

/* =========================
   Twemoji: replace emojis in final card with images
   ========================= */

function parseCardEmojis() {
  if (typeof window.twemoji === "undefined") return;
  const el = document.getElementById("cardMsg");
  if (!el) return;

  try {
    twemoji.parse(el, {
      folder: "svg",
      ext: ".svg",
      className: "twemoji-img",
      base: "https://twemoji.maxcdn.com/v/latest/"
    });
  } catch (e) {
    console.warn("Twemoji parse failed:", e);
  }
}

// Run on initial load
document.addEventListener("DOMContentLoaded", () => {
  parseCardEmojis();
});

// Hook into your page change logic
(function wrapShowPageForEmojis(){
  if (typeof window.showPage !== "function") return;

  const originalShowPage = window.showPage;
  window.showPage = function(el){
    originalShowPage(el);
    if (el && el.id === "page-card") {
      setTimeout(parseCardEmojis, 180);
    }
  };
})();

/* ------------- Page-turn & floaters (fixed) ------------- */
(function(){
  // Page-turn toggle (center-based flip)
  const greetingCard = document.getElementById('greetingCard');
  if(greetingCard){
    greetingCard.addEventListener('click', toggleTurn);
    greetingCard.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTurn(); } });

    function toggleTurn(){
      const turned = greetingCard.classList.toggle('turned');

      // temporarily raise z-index strongly while turned to avoid overlap with envelope
      if(turned){
        greetingCard.style.zIndex = 9999;
      } else {
        // small delay to allow animation finish before lowering z-index
        setTimeout(()=> greetingCard.style.zIndex = 1500, 520);
      }

      // set ARIA hidden appropriately: front is index 0, back index 1
      const faces = greetingCard.querySelectorAll('.card-face');
      if(faces.length >= 2){
        faces[0].setAttribute('aria-hidden', turned ? 'true' : 'false');
        faces[1].setAttribute('aria-hidden', turned ? 'false' : 'true');
      }
    }
  }

  // Floaters spawner (unchanged general idea, slightly safer)
  const floatersRoot = document.querySelector('.floaters');
  if(!floatersRoot) return;

  const floaterTypes = [
    { type: 'heart', char: '💖' },
    { type: 'heart', char: '💗' },
    { type: 'heart', char: '❤️' },
    { type: 'balloon', color: '#ffd1e8' },
    { type: 'balloon', color: '#ffd87a' },
    { type: 'balloon', color: '#7ee7c4' }
  ];

  function spawnFloater(){
    const pick = floaterTypes[Math.floor(Math.random()*floaterTypes.length)];
    const el = document.createElement('div');
    el.className = 'floater ' + pick.type;
    // set horizontal position within parent
    const startLeft = (8 + Math.random()*84);
    el.style.left = startLeft + '%';

    const dur = 7 + Math.random()*6; // 7-13s
    el.style.animation = `floatUp ${dur}s linear forwards`;

    if(pick.type === 'heart'){
      el.textContent = pick.char;
      el.style.fontSize = (16 + Math.random()*18) + 'px';
      el.style.lineHeight = '36px';
    } else {
      el.classList.add('sway');
      const base = pick.color || '#ffd1e8';
      el.style.background = `linear-gradient(180deg, ${base}, ${shadeColor(base, -20)})`;
    }

    floatersRoot.appendChild(el);
    // cleanup
    setTimeout(()=> { try{ el.remove(); }catch(e){} }, (dur*1000)+1200);
  }

  // initial few floaters for immediate feel
  spawnFloater();
  setTimeout(spawnFloater, 400);
  const FLOATER_INTERVAL = 1200;
  const floaterTimer = setInterval(spawnFloater, FLOATER_INTERVAL);

  // helper to darken color
  function shadeColor(hex, change) {
    const c = hex.replace('#','');
    const num = parseInt(c,16);
    const r = Math.max(0, Math.min(255, (num >> 16) + change));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + change));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + change));
    return '#' + ( (1<<24) + (r<<16) + (g<<8) + b ).toString(16).slice(1);
  }

  // cleanup on page unload
  window.addEventListener('beforeunload', ()=> {
    clearInterval(floaterTimer);
  });
})();

/* CLEANUP */
window.addEventListener("beforeunload", stopMic);

