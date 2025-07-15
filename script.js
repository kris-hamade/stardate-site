// ————————————————
// Stardate ↔ Earth‐date helpers
// ————————————————

function isLeapYear(y) {
    return new Date(y, 1, 29).getMonth() === 1;
}

function daysInYear(y) {
    return isLeapYear(y) ? 366 : 365;
}

function dayOfYear(y, m, d) {
    const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let doy = cum[m - 1] + (d - 1);
    if (m >= 3 && isLeapYear(y)) doy++;
    return doy;
}

function starYear(y, ep) { return 1000 * (y - ep); }
function starDay(y, m, d) { return (1000 / daysInYear(y)) * dayOfYear(y, m, d); }
function round2(n) { return Math.round(n * 100) / 100; }
function calculateStardate(y, m, d, ep) {
    return round2(starYear(y, ep) + starDay(y, m, d));
}

function stardateToDate(sd, ep) {
    let y = Math.floor(sd / 1000 + ep);
    let base = 1000 * (y - ep);
    let frac = sd - base;
    let dim = daysInYear(y);
    let doy = Math.round(frac * dim / 1000);
    if (doy >= dim) { y++; doy = 0; }
    let dt = new Date(y, 0, 1);
    dt.setDate(dt.getDate() + doy);
    return dt;
}

// ————————————————
// Modal helpers
// ————————————————

function showBirthdayModal(msg) {
    const modal = document.getElementById("birthday-modal");
    document.getElementById("birthday-message").textContent = msg;
    modal.style.display = "flex";
}

function hideBirthdayModal() {
    document.getElementById("birthday-modal").style.display = "none";
}

// ————————————————
// Main
// ————————————————

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("date");
    const epochSelect = document.getElementById("epoch");
    const resultSpan = document.getElementById("result");
    const closeBtn = document.getElementById("close-modal");
    const modalBg = document.getElementById("birthday-modal");
    const container = document.querySelector(".container.transporter-effect");
    const beam = document.getElementById("transporter-beam");

    // Combined handler: stardate + birthday
    function onDateChange() {
        // parse as local date (avoids timezone shift)
        const [y, m, d] = dateInput.value.split("-").map(Number);
        if (!y || !m || !d) return;

        // Stardate calc
        const ep = parseInt(epochSelect.value, 10);
        resultSpan.textContent = calculateStardate(y, m, d, ep);

        // Birthday check
        const birthdays = Array.isArray(window.BIRTHDAYS) ? window.BIRTHDAYS : [];
        const match = birthdays.find(b => b.month === m && b.day === d);
        if (match) {
            showBirthdayModal(`It's ${match.name}'s birthday! 🥳`);
        }
    }

    // Wire up listeners
    dateInput.addEventListener("change", onDateChange);
    epochSelect.addEventListener("change", onDateChange);

    resultSpan.addEventListener("blur", () => {
        const sd = parseFloat(resultSpan.textContent);
        if (isNaN(sd)) return;
        const ep = parseInt(epochSelect.value, 10);
        const dt = stardateToDate(sd, ep);
        // set with toISOString for consistency
        dateInput.value = dt.toISOString().slice(0, 10);
        onDateChange();
    });

    closeBtn.addEventListener("click", hideBirthdayModal);
    modalBg.addEventListener("click", e => {
        if (e.target === modalBg) hideBirthdayModal();
    });

    // Auto-set today & trigger calculation (includes birthday)
    const todayStr = new Date().toISOString().slice(0, 10);
    dateInput.value = todayStr;
    onDateChange();

    // Transporter beam effect
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
});
