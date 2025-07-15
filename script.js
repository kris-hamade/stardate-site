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

    // Handle form submission
    document.getElementById('stardate-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const dateValue = dateInput.value;
        const epochValue = parseInt(document.getElementById('epoch').value, 10);
        if (!dateValue) {
            document.getElementById('result').textContent = 'Please select a date.';
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
    });

    // Modal close logic
    document.getElementById('close-modal').onclick = hideBirthdayModal;
    document.getElementById('birthday-modal').onclick = function(e) {
        if (e.target === this) hideBirthdayModal();
    };
});