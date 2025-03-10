
// ✅ Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ✅ Your Firebase Configuration (Replace with actual values)
const firebaseConfig = {
  apiKey: "AIzaSyAGk1YEUQ1iB0cWCnrvHInwSdPUQJYtFBw",
  authDomain: "afl-ladder-game.firebaseapp.com",
  databaseURL: "https://afl-ladder-game-default-rtdb.firebaseio.com",
  projectId: "afl-ladder-game",
  storageBucket: "afl-ladder-game.firebasestorage.app",
  messagingSenderId: "779608521804",
  appId: "1:779608521804:web:8c92c138dd2e61fa5688e9"
};

// ✅ Initialize Firebase Realtime Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
console.log("✅ Firebase Realtime Database Connected");

// ✅ AFL Teams List (For Ranking)
const teams = [
    "Adelaide", "Brisbane", "Carlton", "Collingwood", "Essendon",
    "Fremantle", "Geelong", "Gold Coast", "GWS", "Hawthorn",
    "Melbourne", "North Melbourne", "Port Adelaide", "Richmond",
    "St Kilda", "Sydney", "West Coast", "Western Bulldogs"
];

// ✅ Populate Drag-and-Drop Ranking List
const teamRanking = document.getElementById("teamRanking");

function updateRankingList() {
    teamRanking.innerHTML = ""; // Clear the list before repopulating
    teams.forEach((team, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = team;
        listItem.draggable = true;
        listItem.classList.add("draggable");
        listItem.setAttribute("data-team", team);
        listItem.setAttribute("data-rank", index + 1); // Set dynamic position number

        listItem.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", event.target.dataset.team);
            event.target.classList.add("dragging");
        });

        listItem.addEventListener("dragend", (event) => {
            event.target.classList.remove("dragging");
            updateRankNumbers(); // Update numbers when order changes
        });

        teamRanking.appendChild(listItem);
    });
}

// ✅ Function to Update Position Numbers After Dragging
function updateRankNumbers() {
    document.querySelectorAll("#teamRanking li").forEach((li, index) => {
        li.setAttribute("data-rank", index + 1);
    });
}

// ✅ Initialize the Ranking List
updateRankingList();

// ✅ Submit Ladder Prediction to Realtime Database
async function submitLadder() {
    const playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    const prediction = [];
    document.querySelectorAll("#teamRanking li").forEach((li, index) => {
        prediction.push({ rank: index + 1, team: li.textContent });
    });

    try {
        const newPredictionRef = push(ref(db, "predictions"));
        await set(newPredictionRef, {
            name: playerName,
            prediction,
            timestamp: new Date().toISOString()
        });

        alert("✅ Prediction saved!");
        loadLeaderboard();
    } catch (error) {
        console.error("❌ Error submitting ladder:", error);
    }
}

// ✅ Load Leaderboard from Realtime Database
function loadLeaderboard() {
    const leaderboardRef = ref(db, "predictions");
    const tbody = document.getElementById('leaderboard');
    tbody.innerHTML = ''; // Clear old data

    onValue(leaderboardRef, (snapshot) => {
        tbody.innerHTML = ''; // Clear previous data before updating
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const row = document.createElement("tr");

            row.innerHTML = `<td>${data.name}</td><td>${JSON.stringify(data.prediction)}</td>`;
            tbody.appendChild(row);
        });

        console.log("✅ Leaderboard Loaded Successfully");
    });
}

// ✅ Attach functions to `window` so `game.html` can access them
window.submitLadder = submitLadder;
window.loadLeaderboard = loadLeaderboard;
// ✅ Squiggle API for Live AFL Ladder & Fixtures
const SQUIGGLE_API_LADDER = "https://api.squiggle.com.au/?q=ladder";
const SQUIGGLE_API_FIXTURES = "https://api.squiggle.com.au/?q=games;year=2025;round=NEXT";

// ✅ Function to Fetch & Update the Live AFL Ladder
async function loadLiveLadder() {
    try {
        const response = await fetch(SQUIGGLE_API_LADDER);
        const data = await response.json();
        const tbody = document.getElementById('liveLadder');
        tbody.innerHTML = ''; // Clear old ladder

        data.ladder.forEach(team => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${team.rank}</td>
                <td>${team.name}</td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                <td>${team.percentage ? team.percentage.toFixed(2) : "N/A"}%</td>
            `;
            tbody.appendChild(row);
        });

        console.log("✅ Live AFL Ladder Updated");
    } catch (error) {
        console.error("❌ Error fetching AFL Ladder:", error);
    }
}

// ✅ Function to Fetch & Update Next Round Fixtures
async function loadNextRoundFixtures() {
    try {
        const response = await fetch(SQUIGGLE_API_FIXTURES);
        const data = await response.json();
        const fixtureList = document.getElementById("fixture-list");
        fixtureList.innerHTML = '';

        data.games.forEach(game => {
            fixtureList.innerHTML += `<li>${game.hteam} vs ${game.ateam} - ${game.date}</li>`;
        });

        console.log("✅ Next Round Fixtures Updated");
    } catch (error) {
        console.error("❌ Error fetching fixtures:", error);
    }
}

// ✅ Load Live Ladder & Fixtures on Page Load
loadLiveLadder();
loadNextRoundFixtures();

// ✅ Refresh every 60 seconds (1 minute)
setInterval(loadLiveLadder, 60000);
setInterval(loadNextRoundFixtures, 60000);
