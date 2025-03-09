// ✅ Google Apps Script API URL (Replace with your live script URL)
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxgEfupvm347ztiMCQtQwOLZoC6QALGZfeJnuLJejdC2_gjz5qhyQ0GCgC7Nlwky4SL/exec";

// ✅ Squiggle API for Live Ladder & Fixtures
const SQUIGGLE_API_LADDER = "https://api.squiggle.com.au/?q=ladder";
const SQUIGGLE_API_FIXTURES = "https://api.squiggle.com.au/?q=games;year=2025;round=NEXT";

// ✅ AFL Teams List (For Ranking)
const teams = [
    "Adelaide", "Brisbane", "Carlton", "Collingwood", "Essendon",
    "Fremantle", "Geelong", "Gold Coast", "GWS", "Hawthorn",
    "Melbourne", "North Melbourne", "Port Adelaide", "Richmond",
    "St Kilda", "Sydney", "West Coast", "Western Bulldogs"
];

// ✅ Populate Draggable Ranking List
const teamRanking = document.getElementById("teamRanking");
teams.forEach(team => {
    const listItem = document.createElement("li");
    listItem.textContent = team;
    listItem.draggable = true;
    listItem.ondragstart = (event) => {
        event.dataTransfer.setData("text/plain", event.target.textContent);
    };
    teamRanking.appendChild(listItem);
});

teamRanking.ondragover = (event) => event.preventDefault();
teamRanking.ondrop = (event) => {
    event.preventDefault();
    const draggedTeam = event.dataTransfer.getData("text/plain");
    const newPosition = event.target;
    if (newPosition.tagName === "LI") {
        teamRanking.insertBefore(
            document.querySelector(`li:contains('${draggedTeam}')`),
            newPosition
        );
    }
};

// ✅ Submit Ladder Prediction
async function submitLadder() {
    const playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    const prediction = [];
    document.querySelectorAll("#teamRanking li").forEach(li => {
        prediction.push(li.textContent);
    });

    try {
        const response = await fetch(GOOGLE_SHEET_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: playerName, prediction })
        });

        const result = await response.json();
        alert(result.message);
        loadLeaderboard();
    } catch (error) {
        console.error("Error submitting ladder:", error);
    }
}

// ✅ Load Leaderboard from Google Sheets
async function loadLeaderboard() {
    try {
        const response = await fetch(GOOGLE_SHEET_API_URL);
        const data = await response.json();

        const tbody = document.getElementById('leaderboard');
        tbody.innerHTML = '';

        data.forEach((entry, index) => {
            tbody.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
            </tr>`;
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}

// ✅ Load Live AFL Ladder & Fixtures
async function loadLiveData() {
    try {
        const ladderResponse = await fetch(SQUIGGLE_API_LADDER);
        const ladderData = await ladderResponse.json();
        const tbody = document.getElementById('liveLadder');
        tbody.innerHTML = '';

        ladderData.ladder.forEach(team => {
            tbody.innerHTML += `<tr>
                <td>${team.rank}</td><td>${team.name}</td><td>${team.wins}</td>
                <td>${team.losses}</td><td>${team.percentage ? team.percentage.toFixed(2) : "N/A"}%</td>
            </tr>`;
        });

        const fixturesResponse = await fetch(SQUIGGLE_API_FIXTURES);
        const fixturesData = await fixturesResponse.json();
        const fixtureList = document.getElementById("fixture-list");
        fixtureList.innerHTML = '';

        fixturesData.games.forEach(game => {
            fixtureList.innerHTML += `<li>${game.hteam} vs ${game.ateam} - ${game.date}</li>`;
        });
    } catch (error) {
        console.error("Error fetching live data:", error);
    }
}

loadLeaderboard();
loadLiveData();
setInterval(loadLiveData, 60000);
