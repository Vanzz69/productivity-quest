// Initialize game state
let player = {
    name: "",
    level: 1,
    xp: 0,
    dailyXP: 0,
    days: [],
    currentDay: {
        date: new Date().toISOString().split("T")[0],
        tasks: [],
        goals: { main: "", secondary: "", tertiary: "" },
        completedGoals: { main: false, secondary: false, tertiary: false },
        review: { achievements: "", wentWell: "", toImprove: "" }
    }
};

// Load saved data from LocalStorage
function loadGame() {
    const savedData = localStorage.getItem("productivityQuest");
    if (savedData) {
        player = JSON.parse(savedData);
        const today = new Date().toISOString().split("T")[0];
        if (player.currentDay.date !== today) {
            endDay(true);
        }
    }
    updateUI();
}

// Save game state to LocalStorage
function saveGame() {
    localStorage.setItem("productivityQuest", JSON.stringify(player));
}

// Reset all progress (XP, level, days, and current day)
function resetProgress() {
    if (confirm("Are you sure you want to reset all progress? This will clear your XP, level, and all previous data.")) {
        player = {
            name: player.name, // Preserve the name
            level: 1,
            xp: 0,
            dailyXP: 0,
            days: [],
            currentDay: {
                date: new Date().toISOString().split("T")[0],
                tasks: [],
                goals: { main: "", secondary: "", tertiary: "" },
                completedGoals: { main: false, secondary: false, tertiary: false },
                review: { achievements: "", wentWell: "", toImprove: "" }
            }
        };
        saveGame();
        updateUI();
    }
}

// Populate the hourly schedule (5 AM to 4 AM)
function populateSchedule() {
    const tbody = document.getElementById("schedule-body");
    tbody.innerHTML = "";
    const times = Array.from({ length: 24 }, (_, i) => {
        const hour = (i + 5) % 24; // Start from 5 AM
        const period = hour < 12 ? "AM" : "PM";
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}${period}`;
    });

    times.forEach((time, index) => {
        const task = player.currentDay.tasks[index] || { activity: "", completed: false };
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${time}</td>
            <td><input type="text" value="${task.activity}" onchange="updateTask(${index}, this.value)"></td>
            <td><button onclick="completeTask(${index})" ${task.completed ? "disabled" : ""}>${task.completed ? "Done" : "Complete"}</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Update task
function updateTask(index, activity) {
    player.currentDay.tasks[index] = player.currentDay.tasks[index] || { completed: false };
    player.currentDay.tasks[index].activity = activity;
    saveGame();
}

// Complete task and award XP
function completeTask(index) {
    player.currentDay.tasks[index].completed = true;
    player.xp += 10;
    player.dailyXP += 10;
    checkLevelUp();
    saveGame();
    updateUI();
}

// Complete a goal and award XP
function completeGoal(type) {
    if (player.currentDay.completedGoals[type]) return;
    const xpAwards = { main: 50, secondary: 30, tertiary: 30 };
    player.currentDay.completedGoals[type] = true;
    player.xp += xpAwards[type];
    player.dailyXP += xpAwards[type];
    checkLevelUp();
    saveGame();
    updateUI();
}

// Check if the player levels up
function checkLevelUp() {
    const requiredXP = player.level * 100;
    if (player.xp >= requiredXP) {
        player.level++;
        alert(`Congratulations! You've reached Level ${player.level}!`);
    }
}

// End the day and save the data
function endDay(auto = false) {
    if (!auto) {
        player.currentDay.goals.main = document.getElementById("main-goal").value;
        player.currentDay.goals.secondary = document.getElementById("secondary-goal").value;
        player.currentDay.goals.tertiary = document.getElementById("tertiary-goal").value;
        player.currentDay.review.achievements = document.getElementById("achievements").value;
        player.currentDay.review.wentWell = document.getElementById("went-well").value;
        player.currentDay.review.toImprove = document.getElementById("to-improve").value;
    }

    player.days.push({ ...player.currentDay, totalXP: player.dailyXP });
    player.currentDay = {
        date: new Date().toISOString().split("T")[0],
        tasks: [],
        goals: { main: "", secondary: "", tertiary: "" },
        completedGoals: { main: false, secondary: false, tertiary: false },
        review: { achievements: "", wentWell: "", toImprove: "" }
    };
    player.dailyXP = 0;

    saveGame();
    updateUI();
}

// Update the UI
function updateUI() {
    document.getElementById("player-name").value = player.name;
    document.getElementById("player-level").textContent = player.level;
    document.getElementById("player-xp").textContent = player.xp;
    document.getElementById("current-date").textContent = player.currentDay.date;
    document.getElementById("daily-xp").textContent = player.dailyXP;

    // Update XP progress bar
    const requiredXP = player.level * 100;
    const xpPercentage = (player.xp % 100) / 100 * 100;
    document.getElementById("xp-bar").style.setProperty('--xp-width', `${xpPercentage}%`);

    document.getElementById("main-goal").value = player.currentDay.goals.main;
    document.getElementById("secondary-goal").value = player.currentDay.goals.secondary;
    document.getElementById("tertiary-goal").value = player.currentDay.goals.tertiary;
    document.getElementById("achievements").value = player.currentDay.review.achievements;
    document.getElementById("went-well").value = player.currentDay.review.wentWell;
    document.getElementById("to-improve").value = player.currentDay.review.toImprove;

    populateSchedule();

    const previousDays = document.getElementById("previous-days-content");
    previousDays.innerHTML = "";
    player.days.forEach(day => {
        const dayDiv = document.createElement("div");
        dayDiv.innerHTML = `
            <h3>${day.date} (Total XP: ${day.totalXP})</h3>
            <p><strong>Main Goal:</strong> ${day.goals.main} (${day.completedGoals.main ? "Completed" : "Not Completed"})</p>
            <p><strong>Secondary Goal:</strong> ${day.goals.secondary} (${day.completedGoals.secondary ? "Completed" : "Not Completed"})</p>
            <p><strong>Tertiary Goal:</strong> ${day.goals.tertiary} (${day.completedGoals.tertiary ? "Completed" : "Not Completed"})</p>
            <p><strong>Achievements:</strong> ${day.review.achievements}</p>
            <p><strong>What Went Well:</strong> ${day.review.wentWell}</p>
            <p><strong>What to Improve:</strong> ${day.review.toImprove}</p>
        `;
        previousDays.appendChild(dayDiv);
    });
}

// Event listeners
document.getElementById("player-name").addEventListener("change", (e) => {
    player.name = e.target.value;
    saveGame();
});

loadGame();