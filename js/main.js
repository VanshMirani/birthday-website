// main.js - Enhanced interactive birthday site with mic blow detection
// -----------------------------------------------------------------
// Editable settings at top:
// - birthdayYear / birthdayMonth / birthdayDay
// - NOTES array
// - GALLERY_IMAGES
// - MIC_SETTINGS: sensitivity (threshold), min blow duration (ms), max listen time (ms)
// -----------------------------------------------------------------

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

/* Microphone settings (tweak if blows are not detected)
   - threshold: RMS value above which we consider "loud" (0-1). Lower = more sensitive.
   - minBlowMs: how long the RMS must stay >= threshold to count as a blow (ms).
   - maxListenMs: how long we'll listen before giving up (ms).
*/
const MIC_SETTINGS = {
  threshold: 0.06,
  minBlowMs: 180,   // 180 ms of sustained loudness to accept as blow
  maxListenMs: 8000 // stop listening after 8 seconds if nothing detected
};

/* ====== End editable settings ======= */

/* ---- Utility: build target date in IST (+05:30) ---- */
function getTargetDate(){
  const iso = `${birthdayYear}-${String(birthdayMonth).padStart(2,'0')}-${String(birthdayDay).padStart(2,'0')}T00:00:00+05:30`;
  return new Date(iso);
}

/* ---- DOM elements ---- */
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

const micBlowBtn = document.getElementById('micBlowBtn'); // newly added button
const micHint = document.getElementById('micHint');

/* ---- page navigation helper ---- */
function showPage(el){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  el.classList.remove('hidden');
}

/* ---- start button ---- */
startBtn.addEventListener('click', ()=>{
  showPage(pageCountdown);
  startCountdown();
});

/* ---- Countdown logic ---- */
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

/* ---- On date countdown (3-2-1) ---- */
function showOnDateCountdown(){
  document.getElementById('countdown').classList.add('hidden');
  onDateEl.classList.remove('hidden');
  let n = 3;
  bigCount.textContent = n;
  const iv = setInterval(()=>{
    n--;
    if(n === 0){
      bigCount.textContent = '🎉';
      clearInterval(iv);
      setTimeout(()=> showPage(pageCake), 700);
      return;
    }
    bigCount.textContent = n;
  }, 950);
}
toCakeBtn.addEventListener('click', ()=> showPage(pageCake));

/* ---- Cake interactions: click to blow ---- */
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

/* ---- extinguish animation ---- */
function extinguishCandles(){
  candlesGroup.classList.add('candle-extinguished');
  const flames = document.querySelectorAll('.flame-core');
  flames.forEach((f)=> f.animate([{opacity:1, transform:'translateY(0) scale(1)'},{opacity:0, transform:'translateY(-18px) scale(.2)'}], {duration:800, easing:'ease-out', fill:'forwards'}));
}

/* ---- party + confetti ---- */
function popParty(){
  startConfetti();
  if(bdayAudio){
    try { bdayAudio.play().catch(()=>{/* blocked until user interaction */}); } catch(e){}
  }
}

/* ---- Notes page ---- */
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

/* ---- gallery initialization ---- */
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

/* ---- navigation handlers ---- */
toFlashbackBtn && toFlashbackBtn.addEventListener('click', ()=> showPage(pageFlashback));
toCardBtn && toCardBtn.addEventListener('click', ()=> {
  if(FINAL_MESSAGE_OVERRIDE && FINAL_MESSAGE_OVERRIDE.trim().length) document.getElementById('finalMessage').textContent = FINAL_MESSAGE_OVERRIDE;
  showPage(pageCard);
});
restartBtn && restartBtn.addEventListener('click', ()=> location.reload());

/* ---- tune control ---- */
if(playTuneBtn){
  playTuneBtn.addEventListener('click', ()=>{
    if(bdayAudio){
      bdayAudio.play().catch(()=>{ alert('Tap the page once to allow audio on mobile.'); });
    } else {
      alert('Add a bday audio file at assets/audio/bday.mp3 to enable tune.');
    }
  });
}

/* ---- Confetti (simple canvas) ---- */
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
window.addEventListener('resize', ()=>{ confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; });

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
  confettiParticles = confettiParticles.filter(p=>p.y < confettiCanvas.height + 50);
  if(confettiParticles.length === 0){ cancelAnimationFrame(confettiAnim); confettiAnim = null; confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); return; }
  confettiAnim = requestAnimationFrame(updateConfetti);
}
function startConfetti(){ initConfetti(); if(!confettiAnim) updateConfetti(); }

/* ===========================
   Microphone blow detection
   ===========================
   Implementation notes:
   - Uses WebAudio getUserMedia -> AnalyserNode
   - Computes short-term RMS from audio samples
   - When RMS >= threshold for minBlowMs we accept as blow
   - Stops listening after detection or after maxListenMs
   - Button: #micBlowBtn starts the listening flow
*/
let audioStream = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let micListening = false;
let micTimeoutHandle = null;

function startMicListening(){
  // safety: avoid double-listening
  if(micListening) return;
  micListening = true;
  micHint.style.display = 'block';
  micBlowBtn.textContent = 'Listening... 🎧';

  // request microphone
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioStream = stream;
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.fftSize;
      dataArray = new Float32Array(bufferLength);
      source.connect(analyser);

      // begin analysis loop
      const startTime = performance.now();
      let loudStart = null;

      function analyze(){
        analyser.getFloatTimeDomainData(dataArray);
        // compute RMS
        let sum = 0;
        for(let i=0;i<dataArray.length;i++){
          const v = dataArray[i];
          sum += v*v;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        const now = performance.now();

        // If RMS above threshold, mark loudStart if not marked
        if(rms >= MIC_SETTINGS.threshold){
          if(loudStart === null) loudStart = now;
          const dur = now - loudStart;
          // if loudness sustained for required duration => accept as blow
          if(dur >= MIC_SETTINGS.minBlowMs){
            // success: extinguish
            stopMicListening();
            onMicBlowDetected(rms, dur);
            return;
          }
        } else {
          // reset loudStart if falls below
          loudStart = null;
        }

        // stop if listened too long
        if(now - startTime > MIC_SETTINGS.maxListenMs){
          stopMicListening();
          onMicBlowTimeout();
          return;
        }

        // request next frame
        micTimeoutHandle = requestAnimationFrame(analyze);
      }

      micTimeoutHandle = requestAnimationFrame(analyze);
    })
    .catch(err => {
      micListening = false;
      micBlowBtn.textContent = 'Blow into mic 🌬️';
      micHint.style.display = 'none';
      if(err && err.name === 'NotAllowedError'){
        alert('Microphone access was blocked. Please allow microphone to use blow-to-extinguish.');
      } else {
        alert('Microphone error: ' + (err && err.message ? err.message : err));
      }
    });
}

function stopMicListening(){
  // stop animation frame
  if(micTimeoutHandle){
    cancelAnimationFrame(micTimeoutHandle);
    micTimeoutHandle = null;
  }
  // stop audio tracks
  try {
    if(audioStream){
      audioStream.getTracks().forEach(t => t.stop());
      audioStream = null;
    }
  } catch(e){}
  try {
    if(audioContext && audioContext.state !== 'closed'){
      audioContext.close();
      audioContext = null;
    }
  } catch(e){}
  micListening = false;
  micBlowBtn.textContent = 'Blow into mic 🌬️';
  if(micHint) micHint.style.display = 'none';
}

function onMicBlowDetected(rms, duration){
  // successful blow detected
  // mark blown and execute same behavior as click blow if not already blown
  if(!blown){
    blown = true;
    // optional: show a little feedback to user
    micBlowBtn.textContent = 'Blow detected! 🎉';
    extinguishCandles();
    setTimeout(()=> {
      popParty();
      afterBlowBtn.classList.remove('hidden');
    }, 700);
  }
}

// if listening timed out without detection
function onMicBlowTimeout(){
  // show gentle feedback
  micBlowBtn.textContent = 'Try again? 🌬️';
  // optionally give tips
  setTimeout(()=> { micBlowBtn.textContent = 'Blow into mic 🌬️'; }, 1500);
}

/* hook mic button */
if(micBlowBtn){
  // hide mic hint initially
  if(micHint) micHint.style.display = 'none';

  micBlowBtn.addEventListener('click', ()=>{
    // if already blown, no need
    if(blown){
      micBlowBtn.textContent = 'Already blown ✓';
      return;
    }
    // check API availability
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      alert('Microphone not supported in this browser. Please use tap-to-blow or try another browser.');
      return;
    }
    // Start listening flow
    startMicListening();
  });
}

/* small safety: if users land directly on site, set right page */
// (left intentionally blank - use start button)
(function autoLanding(){ /* no-op */ })();
