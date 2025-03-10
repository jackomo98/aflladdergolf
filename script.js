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
