// ✅ Google Apps Script API URL (Replace with your live script URL)
const GOOGLE_SHEET_API_URL = "YOUR_GOOGLE_SHEET_SCRIPT_URL_HERE";

// ✅ Squiggle API for Live Ladder & Fixtures
const SQUIGGLE_API_LADDER = "https://api.squiggle.com.au/?q=ladder";
const SQUIGGLE_API_FIXTURES = "https://api.squiggle.com.au/?q=games;year=2025;round=NEXT";

// ✅ AFL Teams List
const teams = [
    "Adelaide", "Brisbane", "Carlton", "Collingwood", "Essendon",
    "Fremantle", "Geelong", "Gold Coast", "GWS", "Hawthorn",
    "Melbourne", "North Melbourne", "Port Adelaide", "Richmond",
    "St Kilda", "Sydney", "West Coast", "Western Bulldogs"
];

// ✅ Populate Ladder Submission Table
const ladderBody = document.getElementById("ladderBody");
teams.forEach((team, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${index + 1}</td><td>${team}</td>`;
    ladderBody.appendChild(row);
});

// ✅ Submit Ladder Prediction
async function submitLadder() {
    const playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    const prediction = [];
    document.querySelectorAll("#ladderBody tr").forEach(row => {
        prediction.push(row.cells[1].textContent);
    });

    try {
        const response = await fetch(GOOGLE_SHEET_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: playerName, prediction })
        });

        const result = await response.json();
        alert(result.message);
        loadLeaderboard(); // Refresh leaderboard
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

// ✅ Load AFL Ladder & Next Round Matches
async function loadLiveData() {
    try {
        const ladderResponse = await fetch(SQUIGGLE_API_LADDER);
        const ladderData = await ladderResponse.json();
        const tbody = document.getElementById('liveLadder');
        tbody.innerHTML = '';

        ladderData.ladder.forEach(team => {
            tbody.innerHTML += `<tr>
                <td>${team.rank}</td><td>${team.name}</td><td>${team.wins}</td>
                <td>${team.losses}</td><td>${team.percentage.toFixed(2)}%</td>
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
