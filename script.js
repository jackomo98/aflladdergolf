// ✅ Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ✅ Your Firebase Configuration
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

// 🏆 Fetch Live AFL Ladder
async function fetchAFLStandings() {
    try {
        console.log("📡 Fetching Live AFL Ladder...");
        const response = await fetch("https://api.squiggle.com.au/?q=ladder");
        const data = await response.json();

        console.log("✅ AFL Ladder API Response:", data);

        if (data && data.ladder) {
            displayLadder(data.ladder);
        } else {
            console.error("⚠️ Invalid ladder data received:", data);
        }
    } catch (error) {
        console.error("❌ Error fetching AFL ladder:", error);
    }
}

// 🎯 Display Live Ladder (Only Team Name + Rank)
function displayLadder(ladderData) {
    // Sort by position (ascending)
    ladderData.sort((a, b) => a.rank - b.rank);

    const ladderContainer = document.getElementById("liveLadder");
    ladderContainer.innerHTML = ""; // Clear previous content

    ladderData.forEach(team => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${team.rank}</td>
            <td>${team.team}</td>
        `;
        ladderContainer.appendChild(row);
    });

    console.log("✅ Live AFL Ladder Updated");
}

// 🔥 Load Leaderboard from Firebase
function loadLeaderboard() {
    console.log("📡 Fetching Player Leaderboard...");

    const leaderboardRef = ref(db, "leaderboard");

    onValue(leaderboardRef, (snapshot) => {
        const leaderboard = snapshot.val();
        const leaderboardContainer = document.getElementById("leaderboard");

        if (!leaderboard) {
            console.warn("⚠️ No leaderboard data found!");
            return;
        }

        leaderboardContainer.innerHTML = ""; // Clear previous data

        Object.entries(leaderboard).forEach(([player, score]) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${player}</td><td>${score}</td>`;
            leaderboardContainer.appendChild(row);
        });

        console.log("✅ Leaderboard Updated");
    });
}

// 📌 Update Leaderboard UI
function updateLeaderboard(data) {
    const leaderboardContainer = document.getElementById("leaderboard");
    if (!leaderboardContainer) {
        console.error("⚠️ Leaderboard container not found!");
        return;
    }

    leaderboardContainer.innerHTML = "";

    // 🔄 Convert Object to Array & Sort by Score (Lowest = Best)
    const sortedPlayers = Object.entries(data).map(([key, value]) => ({
        name: value.name,
        points: value.points || 0,
    })).sort((a, b) => a.points - b.points);

    sortedPlayers.forEach((player, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.points}</td>
        `;
        leaderboardContainer.appendChild(row);
    });
}

// 🏆 Handle Player Submissions
document.getElementById("submitPrediction").addEventListener("click", function () {
    const playerName = document.getElementById("playerName").value;
    if (!playerName) {
        alert("⚠️ Please enter your name!");
        return;
    }

    // 📝 Save player prediction (Placeholder for now)
    const playerRef = ref(db, "leaderboard/" + playerName);
    set(playerRef, {
        name: playerName,
        points: Math.floor(Math.random() * 100) // Placeholder for score logic
    });

    alert("✅ Prediction submitted!");
    loadLeaderboard();
});

// 🔄 Run functions on page load
window.addEventListener("DOMContentLoaded", () => {
    fetchAFLStandings();  // Load AFL ladder
    loadLeaderboard();    // Load leaderboard from Firebase
});
