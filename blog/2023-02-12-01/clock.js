const BINARY_CURRENT_TIME = document.getElementById("binary_time");
const UNIX_SECONDS_LEFT = document.getElementById("seconds_left");
const TIME_LEFT_DIFF = document.getElementById("time_left");

const MAX_SAFE_SECONDS = 2147483647;

function swap_contents(node, content) {
    node.textContent = content;
}

function seconds_to_twos_complement_string(seconds) {
    // Credit to AJ Ferrin for the padStart and >>> 0 tricks
    return (seconds >>> 0).toString(2).padStart(32, '0');
}

function date_difference_to_string(deltaSeconds) {
    // Credit to AJ Ferrin
    const times = [
        { 'name': 'year', 'amount': 365 },
        { 'name': 'day', 'amount': 24 },
        { 'name': 'hour', 'amount': 60 },
        { 'name': 'minute', 'amount': 60 },
        { 'name': 'second', 'amount': 1 }
    ]
    
    const answer = {}
    
    let timeStep = times.map(u => u.amount).reduce((a, b) => a * b);
    for (unit of times) {
        answer[unit.name] = Math.floor(deltaSeconds / timeStep);
        deltaSeconds %= timeStep;
        timeStep /= unit.amount;
    }

    return `${answer.year} years, ${answer.day} days, ${answer.hour} hours, ${answer.minute} minutes, ${answer.second} seconds`;
}

function timerLoop() {
    setTimeout(timerLoop, 1000);

    let date = new Date();
    let seconds = Math.round(date.getTime() / 1000);
    let seconds_left = (MAX_SAFE_SECONDS - seconds);
    let seconds_left_str = seconds_left.toLocaleString("en-US");

    swap_contents(UNIX_SECONDS_LEFT, seconds_left_str);
    swap_contents(BINARY_CURRENT_TIME, seconds_to_twos_complement_string(seconds))
    swap_contents(TIME_LEFT_DIFF, date_difference_to_string(seconds_left))
}

timerLoop();
