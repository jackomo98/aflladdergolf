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

// ✅ Function to Load Leaderboard & Calculate Scores
async function loadLeaderboard() {
    const leaderboardRef = ref(db, "predictions");
    const tbody = document.getElementById('leaderboard');
    tbody.innerHTML = ''; // Clear old data

    // Fetch latest AFL ladder
    let actualLadder = [];
    try {
        const response = await fetch("https://api.squiggle.com.au/?q=ladder");
        const data = await response.json();
        actualLadder = data.ladder.map(team => team.name);
    } catch (error) {
        console.error("❌ Error fetching AFL Ladder:", error);
        return;
    }

    // Get player predictions
    onValue(leaderboardRef, (snapshot) => {
        let scores = [];

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const name = data.name;
            const prediction = data.prediction.map(item => item.team);

            // Calculate score (1 point per position difference)
            let score = 0;
            prediction.forEach((team, index) => {
                const actualPosition = actualLadder.indexOf(team);
                if (actualPosition !== -1) {
                    score += Math.abs(actualPosition - index);
                }
            });

            scores.push({ name, score });
        });

        // Sort by lowest score (best prediction first)
        scores.sort((a, b) => a.score - b.score);

        // Render leaderboard
        tbody.innerHTML = "";
        scores.forEach((player, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${index + 1}</td><td>${player.name}</td><td>${player.score}</td>`;
            tbody.appendChild(row);
        });

        console.log("✅ Leaderboard Updated");
    });
}

// ✅ Function to Fetch & Update the Live AFL Ladder
async function loadLiveLadder() {
    try {
        console.log("Fetching live AFL ladder...");
        const response = await fetch("https://api.squiggle.com.au/?q=ladder");

        if (!response.ok) {
            throw new Error("Failed to fetch AFL Ladder");
        }

        const data = await response.json();
        console.log("📊 AFL Ladder API Response:", data); // Debugging line

        // Ensure the ladder data exists and is an array
        if (!data.ladder || !Array.isArray(data.ladder)) {
            throw new Error("Invalid ladder data received");
        }

        const tbody = document.getElementById('liveLadder');
        tbody.innerHTML = ''; // Clear old ladder

        data.ladder.forEach((team) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${team.rank}</td>
                <td>${team.name}</td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                <td>${!isNaN(Number(team.percentage)) ? Number(team.percentage).toFixed(2) : "N/A"}%</td>
            `;
            tbody.appendChild(row);
        });

        console.log("✅ Live AFL Ladder Updated");
    } catch (error) {
        console.error("❌ Error fetching AFL Ladder:", error);
    }
}

// ✅ Load Live Ladder on Page Load
loadLiveLadder();

// ✅ Refresh Ladder Every 60 Seconds
setInterval(loadLiveLadder, 60000);

// ✅ Ensure Function is Accessible in `game.html`
window.loadLiveLadder = loadLiveLadder;

// ✅ Attach functions to `window` so `game.html` can access them
window.submitLadder = submitLadder;
window.loadLeaderboard = loadLeaderboard;
window.loadLiveLadder = loadLiveLadder;

async function fetchAFLStandings() {
    try {
        const response = await fetch('https://api.squiggle.com.au/?q=ladder');
        const data = await response.json();

        if (data && data.ladder) {
            displayLadder(data.ladder);
        } else {
            console.error("Invalid ladder data received:", data);
        }
    } catch (error) {
        console.error("Error fetching AFL ladder:", error);
    }
}

function displayLadder(ladderData) {
    const ladderContainer = document.getElementById("liveLadder");

    if (!ladderContainer) {
        console.error("Ladder container not found!");
        return;
    }

    // Clear previous data
    ladderContainer.innerHTML = "";

    // Ensure only 18 teams are shown
    const teams = ladderData.slice(0, 18);

    // Populate the ladder table
    ladderContainer.innerHTML = teams
        .map(team => `
            <tr>
                <td>${team.rank}</td>
                <td>${team.team || "Unknown Team"}</td>
                <td>${team.wins || 0}</td>
                <td>${team.losses || 0}</td>
                <td>${parseFloat(team.percentage) ? parseFloat(team.percentage).toFixed(2) + "%" : "N/A"}</td>
            </tr>
        `)
        .join("");
}

// Run function when the page loads
window.addEventListener("DOMContentLoaded", () => {
    fetchAFLStandings();  // Load AFL ladder
    loadLeaderboard();  // Load player leaderboard from Firebase
});
