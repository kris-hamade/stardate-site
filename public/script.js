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
    // month is 0-indexed
    var dayOfYear = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][month] + day - 1;
    if (month >= 2 && isLeapYear(year)) {
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
    return round(starYear(year, epoch) + starDay(year, month, day));
}

// DOM logic
function formatDate(date) {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth(); // 0-indexed
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

    // Handle form submission
    document.getElementById('stardate-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const dateValue = dateInput.value;
        const epochValue = parseInt(document.getElementById('epoch').value, 10);
        if (!dateValue) {
            document.getElementById('result').textContent = 'Please select a date.';
            return;
        }
        const [year, month, day] = dateValue.split('-').map(Number);
        // month is 0-indexed in JS Date, but user input is 1-indexed
        const stardate = calculateStardate(year, month - 1, day, epochValue);
        document.getElementById('result').textContent = `Stardate: ${stardate}`;
    });
});