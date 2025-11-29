// main.js - Enhanced interactive birthday site with smooth 3-2-1 + mic blow detection

/* ========== Editable settings ========== */
const birthdayYear = (new Date()).getFullYear();
const birthdayMonth = 12;
const birthdayDay = 13;

const NOTES = [
  "You light up every place you enter ✨",
  "Remember our coffee day? ☕️ It was the best!",
  "Wishing you bold dreams & cozy mornings 🌅",
  "Keep being the amazing human you are 💖",
  "Save a slice for me! 🍰"
];

const GALLERY_IMAGES = [
  "assets/images/photo1.jpg",
  "assets/images/photo2.jpg",
  "assets/images/photo3.jpg"
];

const FINAL_MESSAGE_OVERRIDE = "";

/* Microphone sensitivity */
const MIC_SETTINGS = {
  threshold: 0.06,
  minBlowMs: 180,
  maxListenMs: 8000
};
/* ====== End editable settings ======= */

function getTargetDate(){
  const iso = `${birthdayYear}-${String(birthdayMonth).padStart(2,'0')}-${String(birthdayDay).padStart(2,'0')}T00:00:00+05:30`;
  return new Date(iso);
}

/* DOM elements */
const startBtn = document.getElementById('startBtn');
const pageCountdown = document.getElementById('page-countdown');
const pageCake = document.getElementById('page-cake');
const pageNotes = document.getElementById('page-notes');
const pageFlashback = document.getElementById('page-flashback');
const pageCard = document.getElementById('page-card');

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minsEl = document.getElementById('mins');
const secsEl = document.getElementById('secs');
const onDateEl = document.getElementById('onDate');
const bigCount = document.getElementById('bigCount');
const toCakeBtn = document.getElementById('toCakeBtn');

const cakeSvg = document.getElementById('cakeSvg');
const candlesGroup = document.getElementById('candles');
const afterBlowBtn = document.getElementById('afterBlowBtn');

const notesArea = document.getElementById('notesArea');
const galleryEl = document.getElementById('gallery');

const toFlashbackBtn = document.getElementById('toFlashbackBtn');
const toCardBtn = document.getElementById('toCardBtn');
const restartBtn = document.getElementById('restartBtn');

const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');

const bdayAudio = document.getElementById('bdayAudio');
const playTuneBtn = document.getElementById('playTune');
const micBlowBtn = document.getElementById('micBlowBtn');
const micHint = document.getElementById('micHint');

/* page switch */
function showPage(el){
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  el.classList.remove('hidden');
}

/* Start button */
startBtn.addEventListener('click', ()=>{
  showPage(pageCountdown);
  startCountdown();
});

/* Countdown logic */
let countdownTimer = null;
function startCountdown(){
  const target = getTargetDate();
  function tick(){
    const now = new Date();
    const diff = target - now;

    if(diff <= 0){
      clearInterval(countdownTimer);
      showOnDateCountdown();
      return;
    }

    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff/(1000*60*60))%24);
    const m = Math.floor((diff/(1000*60))%60);
    const s = Math.floor((diff/1000)%60);

    daysEl.textContent = String(d).padStart(2,'0');
    hoursEl.textContent = String(h).padStart(2,'0');
    minsEl.textContent = String(m).padStart(2,'0');
    secsEl.textContent = String(s).padStart(2,'0');

    if(diff < 60*1000) toCakeBtn.classList.remove('hidden');
    else toCakeBtn.classList.add('hidden');
  }
  tick();
  countdownTimer = setInterval(tick, 1000);
}

/* ============================================================
   SUPER-SMOOTH 3-2-1 COUNTDOWN
   ============================================================ */
function showOnDateCountdown(){
  document.getElementById('countdown').classList.add('hidden');
  onDateEl.classList.remove('hidden');

  let numbers = [3, 2, 1];
  let index = 0;

  const animateNumber = () => {
    bigCount.textContent = numbers[index];

    bigCount.style.opacity = "1";
    bigCount.style.transform = "scale(1)";

    setTimeout(() => {
      bigCount.style.opacity = "0";
      bigCount.style.transform = "scale(0.6)";

      setTimeout(() => {
        index++;
        if (index < numbers.length) {
          animateNumber();
        } else {
          bigCount.textContent = "🎉";
          bigCount.style.opacity = "1";
          bigCount.style.transform = "scale(1.2)";
          setTimeout(() => showPage(pageCake), 700);
        }
      }, 350);
    }, 650);
  };

  animateNumber();
}

toCakeBtn.addEventListener('click', ()=> showPage(pageCake));

/* Cake interactions */
let blown = false;
cakeSvg.addEventListener('click', () => {
  if(blown) return;
  blown = true;
  extinguishCandles();
  setTimeout(()=> {
    popParty();
    afterBlowBtn.classList.remove('hidden');
  }, 900);
});

afterBlowBtn.addEventListener('click', showNotesPage);

/* Extinguish */
function extinguishCandles(){
  candlesGroup.classList.add('candle-extinguished');
  const flames = document.querySelectorAll('.flame-core');
  flames.forEach((f)=> f.animate(
    [
      {opacity:1, transform:'translateY(0) scale(1)'},
      {opacity:0, transform:'translateY(-18px) scale(.2)'}
    ],
    {duration:800, easing:'ease-out', fill:'forwards'}
  ));
}

/* Confetti */
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
window.addEventListener('resize', ()=> {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

let confettiParticles = [];

function rand(min,max){return Math.random()*(max-min)+min}

function initConfetti(){
  confettiParticles = [];
  const count = 140;
  for(let i=0;i<count;i++){
    confettiParticles.push({
      x: rand(0, confettiCanvas.width),
      y: rand(-confettiCanvas.height, 0),
      size: rand(6,12),
      speedY: rand(2,8),
      speedX: rand(-2,2),
      rotation: rand(0,360),
      rotSpeed: rand(-6,6),
      color: `hsl(${Math.floor(rand(0,360))},70%,60%)`
    });
  }
}

let confettiAnim = null;

function updateConfetti(){
  confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p)=>{
    p.x += p.speedX;
    p.y += p.speedY;
    p.rotation += p.rotSpeed;

    confettiCtx.save();
    confettiCtx.translate(p.x,p.y);
    confettiCtx.rotate(p.rotation * Math.PI / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
    confettiCtx.restore();
  });

  confettiParticles = confettiParticles.filter(p => p.y < confettiCanvas.height + 40);

  if(confettiParticles.length === 0){
    cancelAnimationFrame(confettiAnim);
    confettiAnim = null;
    return;
  }

  confettiAnim = requestAnimationFrame(updateConfetti);
}

function startConfetti(){
  initConfetti();
  if(!confettiAnim) updateConfetti();
}

function popParty(){
  startConfetti();
  if(bdayAudio){
    try { bdayAudio.play().catch(()=>{}); } catch(e){}
  }
}

/* Notes page */
function showNotesPage(){
  showPage(pageNotes);
  notesArea.innerHTML = '';
  NOTES.forEach((n,i)=>{
    const div = document.createElement('div');
    div.className = 'note';
    div.style.transform = `rotate(${(Math.random()-0.5)*8}deg) translateY(${(Math.random()*6)}px)`;
    const emoji = ["💖","🌟","🍰","📸","🎈"][i % 5];
    div.innerHTML = `<h4>For you ${emoji}</h4><p>${n}</p>`;
    notesArea.appendChild(div);
  });
}

/* Gallery */
function initGallery(){
  if(!galleryEl) return;
  galleryEl.innerHTML = '';

  GALLERY_IMAGES.forEach(src=>{
    const img = document.createElement('img');
    img.src = src;
    galleryEl.appendChild(img);
  });

  let idx = 0;
  setInterval(()=>{
    idx = (idx+1) % Math.max(1, GALLERY_IMAGES.length);
    const imgs = galleryEl.querySelectorAll('img');
    if(imgs[idx]) imgs[idx].scrollIntoView({behavior:'smooth', inline:'center'});
  }, 2600);
}
initGallery();

/* Navigation */
toFlashbackBtn && toFlashbackBtn.addEventListener('click', ()=> showPage(pageFlashback));
toCardBtn && toCardBtn.addEventListener('click', ()=> {
  if(FINAL_MESSAGE_OVERRIDE.trim()) {
    document.getElementById('finalMessage').textContent = FINAL_MESSAGE_OVERRIDE;
  }
  showPage(pageCard);
});
restartBtn && restartBtn.addEventListener('click', ()=> location.reload());

/* Tune */
if(playTuneBtn){
  playTuneBtn.addEventListener('click', ()=>{
    if(bdayAudio){
      bdayAudio.play().catch(()=>{ alert('Tap once to allow audio.'); });
    }
  });
}

/* =======================
   MIC BLOW DETECTION
   ======================= */
let audioStream = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let micListening = false;
let micTimeoutHandle = null;

function startMicListening(){
  if(micListening) return;

  micListening = true;
  micHint.style.display = 'block';
  micBlowBtn.textContent = 'Listening... 🎧';

  navigator.mediaDevices.getUserMedia({ audio:true })
    .then(stream => {
      audioStream = stream;
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      dataArray = new Float32Array(analyser.fftSize);
      source.connect(analyser);

      const startTime = performance.now();
      let loudStart = null;

      function analyze(){
        analyser.getFloatTimeDomainData(dataArray);

        let sum = 0;
        for(let i=0;i<dataArray.length;i++){
          sum += dataArray[i]*dataArray[i];
        }
        const rms = Math.sqrt(sum/dataArray.length);
        const now = performance.now();

        if(rms >= MIC_SETTINGS.threshold){
          if(loudStart === null) loudStart = now;
          if(now - loudStart >= MIC_SETTINGS.minBlowMs){
            stopMicListening();
            onMicBlowDetected();
            return;
          }
        } else {
          loudStart = null;
        }

        if(now - startTime > MIC_SETTINGS.maxListenMs){
          stopMicListening();
          onMicBlowTimeout();
          return;
        }

        micTimeoutHandle = requestAnimationFrame(analyze);
      }

      micTimeoutHandle = requestAnimationFrame(analyze);
    })
    .catch(err => {
      micListening = false;
      micBlowBtn.textContent = 'Blow into mic 🌬️';
      micHint.style.display = 'none';

      if(err && err.name === "NotAllowedError"){
        alert("Microphone permission denied.");
      } else {
        alert("Microphone error: " + err.message);
      }
    });
}

function stopMicListening(){
  if(micTimeoutHandle){
    cancelAnimationFrame(micTimeoutHandle);
    micTimeoutHandle = null;
  }
  if(audioStream){
    audioStream.getTracks().forEach(t=>t.stop());
    audioStream = null;
  }
  if(audioContext){
    try { audioContext.close(); } catch(e){}
    audioContext = null;
  }

  micListening = false;
  micBlowBtn.textContent = 'Blow into mic 🌬️';
  micHint.style.display = 'none';
}

function onMicBlowDetected(){
  if(!blown){
    blown = true;
    micBlowBtn.textContent = 'Blow detected! 🎉';
    extinguishCandles();
    setTimeout(()=>{
      popParty();
      afterBlowBtn.classList.remove('hidden');
    },800);
  }
}

function onMicBlowTimeout(){
  micBlowBtn.textContent = 'Try again 🌬️';
  setTimeout(()=>{ micBlowBtn.textContent = 'Blow into mic 🌬️'; },1500);
}

if(micBlowBtn){
  micHint.style.display = 'none';
  micBlowBtn.addEventListener('click', ()=>{
    if(blown){
      micBlowBtn.textContent = 'Already blown ✓';
      return;
    }
    if(!navigator.mediaDevices){
      alert("Microphone not supported.");
      return;
    }
    startMicListening();
  });
}
