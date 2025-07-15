// Sputnik 1 launched on October 4, 1957
const EARTH_EPOCH     = 1957;
const STAR_TREK_EPOCH = 2323;

// — Stardate ↔ Earth-date helpers —

function isLeapYear(y) {
  return new Date(y, 1, 29).getMonth() === 1;
}
function daysInYear(y) {
  return isLeapYear(y) ? 366 : 365;
}
function dayOfYear(y, m, d) {
  const cum = [0,31,59,90,120,151,181,212,243,273,304,334];
  let doy = cum[m-1] + (d-1);
  if (m >= 3 && isLeapYear(y)) doy++;
  return doy;
}
function starYear(y, ep) { return 1000 * (y - ep); }
function starDay(y, m, d) { return (1000 / daysInYear(y)) * dayOfYear(y,m,d); }
function round2(n) { return Math.round(n * 100) / 100; }
function calculateStardate(y,m,d,ep) { return round2(starYear(y,ep) + starDay(y,m,d)); }
function stardateToDate(sd, ep) {
  let y = Math.floor(sd/1000 + ep);
  let base = 1000*(y-ep);
  let frac = sd - base;
  let dim = daysInYear(y);
  let doy = Math.round(frac * dim / 1000);
  if (doy >= dim) { y++; doy = 0; }
  let dt = new Date(y,0,1);
  dt.setDate(dt.getDate() + doy);
  return dt;
}

// — Modal helpers —

function showBirthdayModal(msg) {
  const modal = document.getElementById("birthday-modal");
  document.getElementById("birthday-message").textContent = msg;
  modal.style.display = "flex";
}
function hideBirthdayModal() {
  document.getElementById("birthday-modal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const dateInput   = document.getElementById("date");
  const epochSelect = document.getElementById("epoch");
  const resultSpan  = document.getElementById("result");
  const closeBtn    = document.getElementById("close-modal");
  const modalBg     = document.getElementById("birthday-modal");
  const container   = document.querySelector(".container.transporter-effect");
  const beam        = document.getElementById("transporter-beam");

  // 1) Handler for date changes
  function onDateChange() {
    const d = new Date(dateInput.value);
    if (isNaN(d)) return;

    // birthday modal?
    const m = d.getMonth()+1, day = d.getDate();
    const match = (window.BIRTHDAYS||[]).find(b => b.month===m && b.day===day);
    if (match) showBirthdayModal(`It's ${match.name}'s birthday! 🥳`);

    // stardate
    const sd = calculateStardate(d.getFullYear(), m, day, parseInt(epochSelect.value,10));
    resultSpan.textContent = sd;
  }

  // 2) Wire up listeners
  dateInput.addEventListener("change", onDateChange);
  epochSelect.addEventListener("change", () => dateInput.dispatchEvent(new Event("change")));
  resultSpan.addEventListener("blur", () => {
    const sd = parseFloat(resultSpan.textContent);
    if (isNaN(sd)) return;
    const dt = stardateToDate(sd, parseInt(epochSelect.value,10));
    dateInput.value = dt.toISOString().slice(0,10);
    dateInput.dispatchEvent(new Event("change"));
  });

  closeBtn.addEventListener("click", hideBirthdayModal);
  modalBg.addEventListener("click", e => { if (e.target===modalBg) hideBirthdayModal(); });

  // 3) Auto-set today's date & trigger calculation
  const todayStr = new Date().toISOString().slice(0,10);
  dateInput.value = todayStr;
  dateInput.dispatchEvent(new Event("change"));

  // 4) Transporter beam effect
  beam.style.display = "block";
  setTimeout(() => {
    container.classList.add("beamed-in");
    beam.style.opacity = "1";
    beam.style.animation = "beam-shimmer 1.2s linear infinite";
    setTimeout(() => {
      beam.style.transition = "opacity 0.5s";
      beam.style.opacity = "0";
      setTimeout(() => beam.style.display = "none", 500);
    }, 900);
  }, 100);

  // 5) Page-load birthday (today)
  const now = new Date(), mm = now.getMonth()+1, dd = now.getDate();
  const todayMatch = (window.BIRTHDAYS||[]).find(b => b.month===mm && b.day===dd);
  if (todayMatch) showBirthdayModal(`Happy Birthday, ${todayMatch.name}! 🎉`);
});
