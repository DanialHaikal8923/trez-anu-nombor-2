
let topValue = 80;
let rightValue = 23;
let leftValue = topValue - rightValue;
let currentScenario = "";
let deferredPrompt = null;

const scenarioTemplates = [
  (top, result) => `Faris mempunyai ${top} keping pelekat. Dia memberikan beberapa keping pelekat kepada rakannya dan tinggal ${result} keping pelekat. Berapakah bilangan pelekat yang diberikannya?`,
  (top, result) => `Sara mempunyai ${top} batang pensel warna. Dia menggunakan beberapa batang pensel warna dan baki pensel warnanya ialah ${result}. Berapakah batang pensel warna yang telah digunakan?`,
  (top, result) => `Di dalam balang, terdapat ${top} biji gula-gula. Beberapa biji telah dimakan dan tinggal ${result} biji gula-gula. Berapakah bilangan gula-gula yang dimakan?`,
  (top, result) => `Aiman mempunyai ${top} keping setem. Dia memberikan beberapa keping setem kepada adiknya dan tinggal ${result} keping setem. Berapakah bilangan setem yang diberikannya?`,
  (top, result) => `Cikgu membawa ${top} buah buku latihan. Selepas beberapa buah diagihkan kepada murid, baki buku latihan ialah ${result}. Berapakah bilangan buku latihan yang telah diagihkan?`,
  (top, result) => `Dalam bakul ada ${top} biji rambutan. Selepas beberapa biji diambil, tinggal ${result} biji rambutan. Berapakah bilangan rambutan yang diambil?`,
  (top, result) => `Rina mempunyai ${top} keping kad. Selepas beberapa keping kad hilang, dia tinggal ${result} keping kad. Berapakah bilangan kad yang hilang?`,
  (top, result) => `Di dalam kotak terdapat ${top} batang aiskrim. Beberapa batang telah digunakan untuk aktiviti kelas dan tinggal ${result} batang. Berapakah batang aiskrim yang telah digunakan?`
];

function formatNumber(num) { return String(Number(num)); }
function parseInput(value) { return Number(String(value).replace(/,/g, '').trim()); }
function isValidTwoDigits(num) { return num >= 10 && num <= 99; }

function setScenarioText() {
  const randomTemplate = scenarioTemplates[Math.floor(Math.random() * scenarioTemplates.length)];
  currentScenario = randomTemplate(topValue, rightValue);
  document.getElementById('scenarioText').textContent = currentScenario;
}

function updateDisplay() {
  document.getElementById('topNumber').textContent = formatNumber(topValue);
  document.getElementById('rightNumber').textContent = formatNumber(rightValue);
  document.getElementById('studentAnswer').value = "";
  document.getElementById('message').textContent = "";
  document.getElementById('workingBox').style.display = "none";
  document.getElementById('workingBox').innerHTML = "";
  document.getElementById('equationMessage').textContent = "";
  resetEquationBuilder();
}

function getEquationNumbers() { return [formatNumber(topValue), formatNumber(rightValue)]; }

function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function createTokenElement(text) {
  const token = document.createElement("div");
  token.className = "token";
  token.textContent = text;
  token.draggable = true;
  token.dataset.value = text;
  token.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", text));
  return token;
}

function clearSlot(slot) { delete slot.dataset.value; slot.textContent = "?"; slot.classList.remove("filled"); }

function removeTokenFromBank(value) {
  const tokens = document.querySelectorAll("#tokenBank .token");
  for (const token of tokens) { if (token.dataset.value === value) { token.remove(); break; } }
}

function returnToBank(value) { document.getElementById("tokenBank").appendChild(createTokenElement(value)); }

function setupDropSlots() {
  const slots = document.querySelectorAll("#trez-anu-nombor .drop-slot");
  slots.forEach(slot => {
    slot.addEventListener("dragover", (e) => { e.preventDefault(); slot.classList.add("over"); });
    slot.addEventListener("dragleave", () => slot.classList.remove("over"));
    slot.addEventListener("drop", (e) => {
      e.preventDefault(); slot.classList.remove("over");
      const value = e.dataTransfer.getData("text/plain");
      if (!value) return;
      if (slot.dataset.value) returnToBank(slot.dataset.value);
      removeTokenFromBank(value);
      slot.dataset.value = value; slot.textContent = value; slot.classList.add("filled");
    });
    slot.addEventListener("click", () => { if (slot.dataset.value) { returnToBank(slot.dataset.value); clearSlot(slot); } });
  });
}

function resetEquationBuilder() {
  const bank = document.getElementById("tokenBank");
  bank.innerHTML = "";
  shuffleArray(getEquationNumbers()).forEach(tokenText => bank.appendChild(createTokenElement(tokenText)));
  document.querySelectorAll("#trez-anu-nombor .drop-slot").forEach(clearSlot);
  document.getElementById("equationMessage").textContent = "";
}

function checkEquation() {
  const topSlot = document.querySelector('.drop-slot[data-slot="top"]');
  const resultSlot = document.querySelector('.drop-slot[data-slot="result"]');
  const msg = document.getElementById("equationMessage");
  if (!topSlot.dataset.value || !resultSlot.dataset.value) {
    msg.style.color = "#c62828";
    msg.textContent = "Lengkapkan kedua-dua kotak nombor dahulu.";
    return;
  }
  const ok = topSlot.dataset.value === formatNumber(topValue) && resultSlot.dataset.value === formatNumber(rightValue);
  msg.style.color = ok ? "#2e7d32" : "#c62828";
  msg.textContent = ok ? "Bagus! Ayat matematik yang dibina adalah betul." : "Susunan nombor belum tepat. Cuba semula.";
}

function playSuccessSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99];
    let start = audioCtx.currentTime;
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.25, start + i * 0.18 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + i * 0.18 + 0.16);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(start + i * 0.18); osc.stop(start + i * 0.18 + 0.16);
    });
  } catch (e) {}
}

function splitToTwoDigits(num) { return String(num).padStart(2, '0').split(''); }
function renderDigitCells(digits) { return digits.map(d => `<div class="digit-cell">${d}</div>`).join(''); }

function renderWorkingColumnLayout(topNum, knownNum, answerNum) {
  const topDigits = splitToTwoDigits(topNum);
  const knownDigits = splitToTwoDigits(knownNum);
  const answerDigits = splitToTwoDigits(answerNum);
  return `
    <div class="working-title">Jalan Kira</div>
    <div class="working-subtitle">Gunakan operasi tolak untuk menentukan nilai anu.</div>
    <div class="working-panel">
      <div class="working-step">Langkah 1: Tolak nombor di atas dengan nombor yang tinggal</div>
      <div class="column-layout">
        <div class="place-header">
          <div class="blank-cell"></div><div class="place-cell">Puluh</div><div class="place-cell">Sa</div>
        </div>
        <div class="number-grid"><div class="sign-cell"></div>${renderDigitCells(topDigits)}</div>
        <div class="number-grid"><div class="sign-cell">−</div>${renderDigitCells(knownDigits)}</div>
        <div class="answer-line"></div>
        <div class="number-grid"><div class="sign-cell"></div>${renderDigitCells(answerDigits)}</div>
      </div>
    </div>`;
}

function checkAnswer() {
  const studentValue = parseInput(document.getElementById('studentAnswer').value);
  const msg = document.getElementById('message');
  const working = document.getElementById('workingBox');
  if (isNaN(studentValue)) {
    msg.style.color = "#c62828";
    msg.textContent = "Sila masukkan jawapan dahulu.";
    working.style.display = "none";
    return;
  }
  if (studentValue === leftValue) {
    msg.style.color = "#2e7d32";
    msg.textContent = "Tahniah! Jawapan anda betul.";
    working.style.display = "block";
    working.innerHTML = `<strong>Ayat matematik:</strong><br>${formatNumber(topValue)} − ${formatNumber(studentValue)} = ${formatNumber(rightValue)}<br><br>${renderWorkingColumnLayout(topValue, rightValue, studentValue)}`;
    playSuccessSound();
  } else {
    msg.style.color = "#c62828";
    msg.textContent = "Belum tepat. Cuba lagi.";
    working.style.display = "block";
    working.innerHTML = `<strong>Petunjuk:</strong><br>Ayat matematik yang perlu dibina ialah ${formatNumber(topValue)} − ____ = ${formatNumber(rightValue)}.<br>Cari nilai anu dengan menolak ${formatNumber(topValue)} dengan ${formatNumber(rightValue)}.`;
  }
}

function showAnswer() {
  const msg = document.getElementById('message');
  const working = document.getElementById('workingBox');
  document.getElementById('studentAnswer').value = formatNumber(leftValue);
  msg.style.color = "#ef6c00";
  msg.textContent = "Jawapan telah didedahkan.";
  working.style.display = "block";
  working.innerHTML = `<strong>Soalan penyelesaian masalah:</strong><br>${currentScenario}<br><br><strong>Ayat matematik yang betul:</strong><br>${formatNumber(topValue)} − ${formatNumber(leftValue)} = ${formatNumber(rightValue)}<br><br>${renderWorkingColumnLayout(topValue, rightValue, leftValue)}`;
}

function generateValidQuestion() {
  let valid = false;
  while (!valid) {
    const top = Math.floor(Math.random() * 90) + 10;
    const result = Math.floor(Math.random() * (top - 9)) + 10;
    const unknown = top - result;
    if (isValidTwoDigits(top) && isValidTwoDigits(result) && isValidTwoDigits(unknown)) {
      topValue = top; rightValue = result; leftValue = unknown; valid = true;
    }
  }
}

function generateNewQuestion() { generateValidQuestion(); setScenarioText(); updateDisplay(); }

function toggleTeacherPanel() {
  const panel = document.getElementById('teacherPanel');
  panel.style.display = panel.style.display === "flex" ? "none" : "flex";
}

function applyTeacherValues() {
  const newTop = parseInput(document.getElementById('teacherTop').value);
  const newRight = parseInput(document.getElementById('teacherRight').value);
  const msg = document.getElementById('message');
  if (isNaN(newTop) || isNaN(newRight)) { msg.style.color = "#c62828"; msg.textContent = "Sila masukkan nombor yang sah."; return; }
  if (!isValidTwoDigits(newTop) || !isValidTwoDigits(newRight)) { msg.style.color = "#c62828"; msg.textContent = "Gunakan nombor dua digit sahaja."; return; }
  if (newRight >= newTop) { msg.style.color = "#c62828"; msg.textContent = "Nombor bawah kanan mesti lebih kecil daripada nombor di atas."; return; }
  const newLeft = newTop - newRight;
  if (!isValidTwoDigits(newLeft)) { msg.style.color = "#c62828"; msg.textContent = "Nilai anu yang terhasil mesti dua digit juga."; return; }
  topValue = newTop; rightValue = newRight; leftValue = newLeft;
  setScenarioText(); updateDisplay();
  msg.style.color = "#1565c0"; msg.textContent = "Nilai baharu telah digunakan.";
}

function setupInstallButton() {
  const installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e; installBtn.style.display = 'inline-block';
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
  window.addEventListener('appinstalled', () => { installBtn.style.display = 'none'; deferredPrompt = null; });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

setupDropSlots();
setupInstallButton();
setScenarioText();
updateDisplay();
