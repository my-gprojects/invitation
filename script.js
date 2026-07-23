const openBtn = document.getElementById('openBtn');
const openOverlay = document.getElementById('openOverlay');

initGuestName();

openBtn.addEventListener('click', () => {
  openOverlay.classList.add('hidden');
  document.body.classList.add('opened');
  startParticles();
});

// ─── Golden & red particle system ───
function startParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.size = Math.random() * 3.5 + 0.5;
      this.speedY = -(Math.random() * 0.8 + 0.2);
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.7 + 0.2;
      this.fade = Math.random() * 0.004 + 0.002;
      const roll = Math.random();
      this.color = roll > 0.6 ? '#ffe87a' : roll > 0.3 ? '#e02030' : '#ffffff';
      this.glow = roll > 0.6 ? '#e8b830' : roll > 0.3 ? '#b01020' : '#ffffff';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.opacity -= this.fade;
      if (this.opacity <= 0 || this.y < -10) this.reset(false);
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.glow;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      if (this.size > 2) {
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 0.5;
        const s = this.size * 2;
        ctx.beginPath();
        ctx.moveTo(this.x - s, this.y);
        ctx.lineTo(this.x + s, this.y);
        ctx.moveTo(this.x, this.y - s);
        ctx.lineTo(this.x, this.y + s);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  const count = Math.min(100, Math.floor(window.innerWidth / 8));
  particles = Array.from({ length: count }, () => new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  }

  animate();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else animate();
  });
}

// ─── Guest name + QR from URL ?t=name ───
function initGuestName() {
  const name = window.GuestUtils.getGuestNameFromUrl();
  const guestBlock = document.getElementById('guestBlock');
  const guestName = document.getElementById('guestName');
  const openGuest = document.getElementById('openGuest');
  const guestQrWrap = document.getElementById('guestQrWrap');
  const guestQrKey = document.getElementById('guestQrKey');
  const guestQr = document.getElementById('guestQr');

  if (!name) return;

  const uniqueKey = window.GuestUtils.makeUniqueKey(name);
  const payload = window.GuestUtils.encodePayload(uniqueKey, name);

  guestName.textContent = name;
  guestBlock.hidden = false;

  openGuest.textContent = `To: ${name}`;
  openGuest.hidden = false;

  document.title = `${name} — Galang & Putri`;

  if (typeof QRCode !== 'undefined' && guestQr) {
    guestQr.innerHTML = '';
    new QRCode(guestQr, {
      text: payload,
      width: 88,
      height: 88,
      colorDark: '#1a0508',
      colorLight: '#fff8e8',
      correctLevel: QRCode.CorrectLevel.M,
    });
    guestQrKey.textContent = uniqueKey;
    guestQrWrap.hidden = false;
  }
}
