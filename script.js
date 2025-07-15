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
    // Set default date input to today
    const dateInput = document.getElementById('date');
    dateInput.valueAsDate = today;
    // Set default date input to today if empty
    if (!dateInput.value) {
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    // Birthday check for today
    const todayBirthday = checkBirthday(today.getMonth() + 1, today.getDate());
    if (todayBirthday) {
        showBirthdayModal(todayBirthday.name);
    }

    // --- Two-way binding for editable stardate ---
    const stardateResult = document.getElementById('result');
    let lastChanged = null; // 'date' or 'stardate'

    function updateStardateResult() {
        if (lastChanged === 'stardate') return; // Prevent loop
        lastChanged = 'date';
        const dateValue = dateInput.value;
        const epochValue = parseInt(document.getElementById('epoch').value, 10);
        if (!dateValue) {
            stardateResult.textContent = '';
            lastChanged = null;
            return;
        }
        const [year, month, day] = dateValue.split('-').map(Number); // month and day are 1-based
        const stardate = calculateStardate(year, month, day, epochValue);
        stardateResult.textContent = stardate;
        // Birthday check for selected date
        const birthday = checkBirthday(month, day);
        if (birthday) {
            showBirthdayModal(birthday.name);
        }
        lastChanged = null;
    }

    function updateDateFromStardate() {
        if (lastChanged === 'date') return; // Prevent loop
        lastChanged = 'stardate';
        const stardateVal = parseFloat(stardateResult.textContent);
        const epochVal = parseInt(document.getElementById('epoch').value, 10);
        if (isNaN(stardateVal)) {
            lastChanged = null;
            return;
        }
        const date = stardateToDate(stardateVal, epochVal);
        if (date instanceof Date && !isNaN(date)) {
            // Format as yyyy-mm-dd for input
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;
        }
        lastChanged = null;
    }

    dateInput.addEventListener('input', updateStardateResult);
    document.getElementById('epoch').addEventListener('change', function() {
        updateStardateResult();
        // Also update date if stardate was last changed
        if (lastChanged === 'stardate') updateDateFromStardate();
    });
    stardateResult.addEventListener('input', updateDateFromStardate);
    // Initial calculation
    updateStardateResult();

    // Modal close logic
    document.getElementById('close-modal').onclick = hideBirthdayModal;
    document.getElementById('birthday-modal').onclick = function(e) {
        if (e.target === this) hideBirthdayModal();
    };
});