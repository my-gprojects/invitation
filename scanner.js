const scanPanel = document.getElementById('scanPanel');
const checkinPanel = document.getElementById('checkinPanel');
const scannedName = document.getElementById('scannedName');
const scannedKey = document.getElementById('scannedKey');
const jumlahOrang = document.getElementById('jumlahOrang');
const checkinForm = document.getElementById('checkinForm');
const statusMsg = document.getElementById('statusMsg');
const configWarn = document.getElementById('configWarn');
const submitBtn = document.getElementById('submitBtn');
const rescanBtn = document.getElementById('rescanBtn');
const stopScanBtn = document.getElementById('stopScanBtn');
const scanHint = document.getElementById('scanHint');

let html5QrCode = null;
let currentGuest = null;
let scanning = false;

if (!window.WEDDING_CONFIG?.appsScriptUrl) {
  configWarn.hidden = false;
}

async function startScanner() {
  if (scanning) return;

  statusMsg.hidden = true;
  checkinPanel.hidden = true;
  scanPanel.hidden = false;
  scanHint.textContent = 'Arahkan kamera ke QR code undangan';

  html5QrCode = new Html5Qrcode('reader');
  scanning = true;
  stopScanBtn.hidden = false;

  try {
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      onScanSuccess,
      () => {}
    );
  } catch (err) {
    scanHint.textContent = 'Kamera gagal: ' + (err?.message || err);
    scanning = false;
    stopScanBtn.hidden = true;
  }
}

async function stopScanner() {
  if (!html5QrCode || !scanning) return;
  try {
    await html5QrCode.stop();
    await html5QrCode.clear();
  } catch (_) {
    // ignore
  }
  scanning = false;
  stopScanBtn.hidden = true;
}

async function onScanSuccess(decodedText) {
  const guest = window.GuestUtils.decodePayload(decodedText);
  if (!guest) {
    scanHint.textContent = 'QR tidak valid. Coba scan ulang.';
    return;
  }

  await stopScanner();
  currentGuest = guest;
  scannedName.textContent = guest.nama;
  scannedKey.textContent = guest.unique_key;
  jumlahOrang.value = '1';
  scanPanel.hidden = true;
  checkinPanel.hidden = false;
  statusMsg.hidden = true;
  jumlahOrang.focus();
}

checkinForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentGuest) return;

  if (!window.WEDDING_CONFIG?.appsScriptUrl) {
    showStatus('Isi appsScriptUrl di config.js dulu.', false);
    return;
  }

  submitBtn.disabled = true;
  showStatus('Menyimpan ke Google Sheet…', true);

  try {
    const result = await window.GuestUtils.checkIn({
      unique_key: currentGuest.unique_key,
      nama: currentGuest.nama,
      jumlah_orang: jumlahOrang.value,
    });

    showStatus(
      `Tersimpan: ${result.nama} — ${result.jumlah_orang} orang (hadir)`,
      true
    );
  } catch (err) {
    showStatus(err.message || String(err), false);
  } finally {
    submitBtn.disabled = false;
  }
});

rescanBtn.addEventListener('click', async () => {
  currentGuest = null;
  await startScanner();
});

stopScanBtn.addEventListener('click', stopScanner);

function showStatus(text, ok) {
  statusMsg.hidden = false;
  statusMsg.textContent = text;
  statusMsg.classList.toggle('ok', !!ok);
  statusMsg.classList.toggle('err', !ok);
}

startScanner();
