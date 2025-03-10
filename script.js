// ✅ Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ✅ Your Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGk1YEUQ1iB0cWCnrvHInwSdPUQJYtFBw",
    authDomain: "afl-ladder-game.firebaseapp.com",
    databaseURL: "https://afl-ladder-game-default-rtdb.firebaseio.com",
    projectId: "afl-ladder-game",
    storageBucket: "afl-ladder-game.appspot.com",
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

        // ✅ Make sure we're fetching the **2025** season ladder from Squiggle API
        const response = await fetch("https://api.squiggle.com.au/?q=ladder&year=2025");
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

// 📊 Display AFL Ladder
function displayLadder(ladderData) {
    const ladderContainer = document.getElementById("liveLadder");
    if (!ladderContainer) {
        console.error("⚠️ Ladder container not found!");
        return;
    }

    // ✅ Sort teams by `rank`
    const sortedLadder = ladderData.sort((a, b) => a.rank - b.rank);

    // ✅ Ensure only 18 unique teams are displayed
    const uniqueTeams = [];
    const filteredLadder = sortedLadder.filter(team => {
        if (!uniqueTeams.includes(team.team)) {
            uniqueTeams.push(team.team);
            return true;
        }
        return false;
    });

    // ✅ Update the table
    ladderContainer.innerHTML = filteredLadder.map(team => `
        <tr>
            <td>${team.rank}</td>
            <td>${team.team}</td>
        </tr>
    `).join('');

    console.log("✅ Live AFL Ladder Updated");
}

// 📩 Handle Player Submissions
document.getElementById("submitPrediction").addEventListener("click", function () {
    const playerName = document.getElementById("playerName").value;
    if (!playerName) {
        alert("⚠️ Please enter your name!");
        return;
    }

    // Placeholder logic: Save player prediction
    const playerRef = ref(db, "leaderboard/" + playerName);
    set(playerRef, {
        name: playerName,
        points: Math.floor(Math.random() * 100) // Placeholder for score logic
    });

    alert("✅ Prediction submitted!");
    loadLeaderboard();
});

// 🏆 Load Leaderboard
function loadLeaderboard() {
    console.log("📡 Fetching Player Leaderboard...");
    const leaderboardRef = ref(db, "leaderboard");

    onValue(leaderboardRef, (snapshot) => {
        const leaderboardContainer = document.getElementById("leaderboard");
        if (!leaderboardContainer) {
            console.error("❌ Leaderboard container not found!");
            return;
        }

        leaderboardContainer.innerHTML = ""; // Clear existing content

        const players = snapshot.val();
        if (players) {
            const sortedPlayers = Object.values(players).sort((a, b) => a.points - b.points);
            sortedPlayers.forEach((player, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${index + 1}</td><td>${player.name}</td><td>${player.points}</td>`;
                leaderboardContainer.appendChild(row);
            });
        }

        console.log("✅ Leaderboard Updated");
    });
}

// 🚀 Run functions on page load
window.addEventListener("DOMContentLoaded", () => {
    fetchAFLStandings();  // Load AFL ladder
    loadLeaderboard();    // Load leaderboard from Firebase
});
