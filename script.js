// Sputnik 1 launched on October 4, 1957
const EARTH_EPOCH = 1957;
const STAR_TREK_EPOCH = 2323;

function starYear(year, epoch) {
    return 1000 * (year - epoch);
}

function starDay(year, month, day) {
    return (1000 / daysInYear(year)) * dayOfYear(year, month, day);
}

function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

function dayOfYear(year, month, day) {
    // month is 0-indexed for Date, but we use 1-based for birthday logic
    var dayOfYear = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][month - 1] + day - 1;
    if (month >= 3 && isLeapYear(year)) { // month >= 3 because month is 1-based
        dayOfYear++;
    }
    return dayOfYear;
}

function isLeapYear(year) {
    return new Date(year, 1, 29).getMonth() === 1;
}

function round(number) {
    return Math.round(number * 100) / 100;
}

function calculateStardate(year, month, day, epoch) {
    // month is 1-based for this function
    return round(starYear(year, epoch) + starDay(year, month, day));
}

// Helper: Convert stardate back to date (approximate)
function stardateToDate(stardate, epoch) {
    // Inverse of: stardate = 1000 * (year - epoch) + (1000 / daysInYear(year)) * dayOfYear(year, month, day)
    // We'll solve for year first, then day of year, then month/day
    // 1. Estimate year
    let year = Math.floor(stardate / 1000 + epoch);
    // 2. Calculate the stardate at the start of that year
    let base = 1000 * (year - epoch);
    // 3. Find dayOfYear
    let dayFrac = stardate - base;
    let daysInYr = daysInYear(year);
    let dayOfYr = Math.round(dayFrac * daysInYr / 1000);
    // Clamp dayOfYr
    if (dayOfYr < 0) dayOfYr = 0;
    if (dayOfYr >= daysInYr) {
        year++;
        dayOfYr = 0;
    }
    // 4. Convert dayOfYr to month/day
    let date = new Date(year, 0, 1);
    date.setDate(date.getDate() + dayOfYr);
    return date;
}

// DOM logic
function formatDate(date) {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// Birthday easter egg logic
function getBirthdays() {
    // window.BIRTHDAYS should be injected by the host as an array of {name, month (1-based), day}
    return Array.isArray(window.BIRTHDAYS) ? window.BIRTHDAYS : [];
}

function checkBirthday(month, day) {
    // month and day are 1-based
    const birthdays = getBirthdays();
    return birthdays.find(b => b.month === month && b.day === day);
}

function showBirthdayModal(name) {
    const modal = document.getElementById('birthday-modal');
    const message = document.getElementById('birthday-message');
    message.textContent = `That is ${name}'s Birthday! 🎉🎉`;
    modal.style.display = 'flex';
}

function hideBirthdayModal() {
    document.getElementById('birthday-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1; // 1-based
    const todayDay = today.getDate();

    // Display today's date
    document.getElementById('today-date').textContent = formatDate(today);

    // Display today's stardates
    const stStardate = calculateStardate(todayYear, todayMonth, todayDay, STAR_TREK_EPOCH);
    const earthStardate = calculateStardate(todayYear, todayMonth, todayDay, EARTH_EPOCH);
    document.getElementById('today-st-stardate').textContent = stStardate;
    document.getElementById('today-earth-stardate').textContent = earthStardate;

    // Set default date input to today
    const dateInput = document.getElementById('date');
    dateInput.valueAsDate = today;

    // Birthday check for today
    const todayBirthday = checkBirthday(todayMonth, todayDay);
    if (todayBirthday) {
        showBirthdayModal(todayBirthday.name);
    }

    // --- Live Stardate Calculation ---
    function updateStardateResult() {
        const dateValue = dateInput.value;
        const epochValue = parseInt(document.getElementById('epoch').value, 10);
        if (!dateValue) {
            document.getElementById('result').textContent = '';
            return;
        }
        const [year, month, day] = dateValue.split('-').map(Number); // month and day are 1-based
        const stardate = calculateStardate(year, month, day, epochValue);
        document.getElementById('result').textContent = `Stardate: ${stardate}`;

        // Birthday check for selected date
        const birthday = checkBirthday(month, day);
        if (birthday) {
            showBirthdayModal(birthday.name);
        }
    }
    dateInput.addEventListener('input', updateStardateResult);
    document.getElementById('epoch').addEventListener('change', updateStardateResult);
    // Initial calculation
    updateStardateResult();

    // --- Stardate to Date Inline Converter ---
    const inlineStardateInput = document.getElementById('inline-stardate-input');
    const inlineEpochSelect = document.getElementById('inline-epoch-select');
    const inlineStardateResult = document.getElementById('inline-stardate-result');

    function updateInlineStardateResult() {
        const stardateVal = parseFloat(inlineStardateInput.value);
        const epochVal = parseInt(inlineEpochSelect.value, 10);
        if (isNaN(stardateVal)) {
            inlineStardateResult.textContent = '';
            return;
        }
        try {
            const date = stardateToDate(stardateVal, epochVal);
            // Only show if valid
            if (date instanceof Date && !isNaN(date)) {
                inlineStardateResult.textContent = `Date: ${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
            } else {
                inlineStardateResult.textContent = 'Invalid stardate.';
            }
        } catch (e) {
            inlineStardateResult.textContent = 'Invalid stardate.';
        }
    }
    inlineStardateInput.addEventListener('input', updateInlineStardateResult);
    inlineEpochSelect.addEventListener('change', updateInlineStardateResult);

    // Modal close logic
    document.getElementById('close-modal').onclick = hideBirthdayModal;
    document.getElementById('birthday-modal').onclick = function(e) {
        if (e.target === this) hideBirthdayModal();
    };
});