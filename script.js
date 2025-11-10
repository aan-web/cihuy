document.addEventListener('click', function startMusic() {
  const music = document.getElementById('bgm');
  if (music && music.paused) {
    music.play();
  }
  document.removeEventListener('click', startMusic);
});

/* =========================
   Config: messages & counts
   ========================= */
const messages = [
  "Kamu tau nggak? Aku klik hati ini, tapi yang berdebar malah hatiku 😳💓",
  "Kalau tiap klik bisa bikin kamu senyum, aku bakal klik selamanya 😝💖",
  "Ini hati ke-3, tapi hatiku cuma buat kamu satu 😘",
  "Klik terus, tapi jangan klik hati orang lain ya 😤💘",
  "Duh... makin diklik makin jatuh cinta 💞",
  "Selamat ya sayang, udah 21 tahun Semoga semua hal indah di dunia jatuh cinta padamu, kayak aku yang jatuh cinta tiap hari.🥰"
];
const TOTAL_HEARTS = messages.length; // hearts to click to finish

/* ========================
   Utility & DOM references
   ======================== */
const playArea = document.getElementById('playArea');
const toast = document.getElementById('toast');
const counter = document.getElementById('counter');
const modal = document.getElementById('modal');
const finalCard = document.getElementById('finalCard');
const replayBtn = document.getElementById('replay');
const closeBtn = document.getElementById('close');
let clicked = 0;
let heartIdSeq = 0;

/* ========================
   Create decorative balloons
   ======================== */
function makeBalloon(leftPerc, size, hue, delay){
  const el = document.createElement('div');
  el.className = 'balloon';
  el.style.left = leftPerc + '%';
  el.style.width = size + 'px';
  el.style.height = Math.round(size*1.4) + 'px';
  el.style.background = `linear-gradient(180deg, hsl(${hue} 80% 70%), hsl(${hue} 90% 60%))`;
  el.style.animationDuration = (12 + Math.random()*12) + 's';
  el.style.animationDelay = delay + 's';
  el.style.opacity = 0.9 - Math.random()*0.25;
  playArea.appendChild(el);
}
for(let i=0;i<8;i++){
  makeBalloon(6 + i*12, 46 + Math.random()*40, 330 - i*10, Math.random()*6);
}

/* ========================
   Hearts spawning logic
   ======================== */
function spawnHeart(){
  // create heart element
  const h = document.createElement('button');
  const size = (window.innerWidth < 640) ? 48 : 64;
  h.className = 'heart';
  const id = 'heart-' + (++heartIdSeq);
  h.id = id;
  h.style.setProperty('--size', size + 'px');

  // random position inside playArea (avoid edges)
  const pad = 20;
  const rect = playArea.getBoundingClientRect();
  const x = Math.random()*(rect.width - size - pad*2) + pad;
  const y = Math.random()*(rect.height - size - pad*2) + pad;
  h.style.left = x + 'px';
  h.style.top = y + 'px';

  // random gentle float animation
  const floatDur = 6 + Math.random()*6;
  h.animate([
    { transform: 'translateY(0) rotate(0deg)' },
    { transform: `translateY(${ (Math.random()*24 - 12) }px) rotate(${ (Math.random()*20 - 10)}deg)` },
    { transform: 'translateY(0) rotate(0deg)' }
  ], { duration: floatDur*1000, iterations: Infinity, easing:'ease-in-out' });

  // inner heart shape (use svg to ensure consistent shape)
  h.innerHTML = `<svg viewBox="0 0 32 32" width="100%" height="100%" style="display:block">
    <path d="M16 28s-12-7.4-12-14a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 6.6-12 14-12 14z"
      fill="url(#g${id})" stroke="rgba(0,0,0,0.04)" stroke-width="0.5"/>
    <defs><linearGradient id="g${id}" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#ff9ab5"/><stop offset="1" stop-color="#ff2760"/>
    </linearGradient></defs>
  </svg>`;

  // click handler
  h.addEventListener('click', (e)=> {
    e.stopPropagation();
    handleHeartClick(h);
  });

  playArea.appendChild(h);

  // auto remove heart after some time (if not clicked)
  setTimeout(()=> {
    if (h && h.parentNode) {
      h.animate([{opacity:1},{opacity:0}], {duration:500}).onfinish = ()=> h.remove();
    }
  }, 12000 + Math.random()*9000);
}

/* Manage clicks and messages */
function handleHeartClick(elem){
  // remove the clicked heart with little pop animation
  elem.style.transition = 'transform .18s ease, opacity .24s ease';
  elem.style.transform = 'scale(1.2) rotate(-10deg)';
  elem.style.opacity = '0';
  setTimeout(()=> elem.remove(), 200);

  // show next message
  const msg = messages[Math.min(clicked, messages.length-1)];
  showToast(msg);

  // small sound (web audio beep)
  playClickTone();

  clicked++;
  counter.textContent = clicked + ' ❤️';

  if (clicked >= TOTAL_HEARTS) {
    setTimeout(showFinalModal, 700);
  }
}

/* Toast UI */
let toastTimer = null;
function showToast(text){
  if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
  toast.textContent = text;
  toast.style.display = 'block';
  toast.style.opacity = '0';
  toast.animate([{opacity:0, transform:'translateY(8px)'},{opacity:1, transform:'translateY(0)'}], {duration:220, easing:'cubic-bezier(.2,.9,.2,1)'});
  toast.style.opacity = '1';
  toastTimer = setTimeout(()=> {
    toast.animate([{opacity:1, transform:'translateY(0)'},{opacity:0, transform:'translateY(8px)'}], {duration:200}).onfinish = ()=> {
      toast.style.display = 'none';
    };
  }, 2400);
}

/* Final modal & confetti */
function showFinalModal(){
  modal.style.display = 'flex';
  requestAnimationFrame(()=> finalCard.classList.add('show'));
  launchConfetti();
  // gentle chime
  playMelody();
}

/* Replay action */
replayBtn.addEventListener('click', ()=> {
  // reset
  clicked = 0;
  counter.textContent = '0 ❤️';
  finalCard.classList.remove('show');
  setTimeout(()=> modal.style.display='none', 340);
  // spawn fresh hearts
  spawnMultipleHearts(8);
});

/* Close */
closeBtn.addEventListener('click', ()=> {
  finalCard.classList.remove('show');
  setTimeout(()=> modal.style.display='none', 340);
});

/* spawn some hearts at intervals */
function spawnMultipleHearts(n){
  for(let i=0;i<n;i++){
    setTimeout(spawnHeart, i*400 + Math.random()*800);
  }
}
// start initial hearts
spawnMultipleHearts(6);
// keep spawning randomly while not finished
const spawnInterval = setInterval(()=> {
  if (clicked >= TOTAL_HEARTS) { clearInterval(spawnInterval); return; }
  if (Math.random() < 0.65) spawnHeart();
}, 1200);

/* ======================
   Confetti (simple)
   ====================== */
function launchConfetti(){
  const canvas = document.createElement('canvas');
  canvas.style.position='absolute'; canvas.style.left='0'; canvas.style.top='0';
  canvas.width = playArea.clientWidth; canvas.height = playArea.clientHeight;
  playArea.appendChild(canvas);
  canvas.style.pointerEvents='none';
  const ctx = canvas.getContext('2d');
  const pieces = [];
  const colors = ['#ff6b96','#ff2d6f','#ffd1e6','#ff8fb3','#ffe07a'];
  for(let i=0;i<120;i++){
    pieces.push({
      x: Math.random()*canvas.width,
      y: -Math.random()*canvas.height,
      vx: (Math.random()-0.5)*4,
      vy: 2 + Math.random()*4,
      size: 6 + Math.random()*8,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*360,
      vr: (Math.random()-0.5)*6
    });
  }
  let t0 = performance.now();
  function frame(t){
    const dt = (t - t0)/1000; t0 = t;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const p of pieces){
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    }
    // stop after some time
    if (performance.now() - tStart < 4500) requestAnimationFrame(frame);
    else { canvas.remove(); }
  }
  const tStart = performance.now();
  requestAnimationFrame(frame);
}

/* ======================
   Tiny sounds via WebAudio
   ====================== */
function playClickTone(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 880 + Math.random()*240;
    g.gain.value = 0.0001;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.stop(ctx.currentTime + 0.3);
  }catch(e){ /* ignore audio errors (autoplay policies) */ }
}

function playMelody(){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const now = ctx.currentTime;
    const notes = [523.25,659.25,783.99]; // C5,E5,G5 arpeggio
    let t = now;
    for(let i=0;i<notes.length;i++){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type='sine'; o.frequency.value = notes[i];
      g.gain.value = 0.0001;
      o.connect(g); g.connect(ctx.destination);
      o.start(t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.stop(t + 0.25);
      t += 0.12;
    }
  }catch(e){}
}

/* click on empty area also spawns a heart for fun */
playArea.addEventListener('click', (e)=>{
  // ignore clicks on other controls
  if (e.target.closest('.btn') || e.target.closest('.heart')) return;
  spawnHeart();
});
