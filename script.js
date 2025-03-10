
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

// Ensure Firebase is initialized (if using Firebase)
console.log("🔥 Firebase Realtime Database Connecting...");

// ✅ Load Live AFL Ladder from Squiggle API
async function fetchAFLStandings() {
    try {
        console.log("⏳ Fetching Live AFL Ladder...");

        const response = await fetch('https://api.squiggle.com.au/?q=ladder');
        const data = await response.json();

        console.log("✅ AFL Ladder API Response:", data);

        if (data && data.ladder) {
            displayLadder(data.ladder);
        } else {
            console.error("❌ Invalid ladder data received:", data);
        }
    } catch (error) {
        console.error("❌ Error fetching AFL ladder:", error);
    }
}

function displayLadder(ladderData) {
    const ladderContainer = document.getElementById("liveLadder");
    if (!ladderContainer) {
        console.error("Ladder container not found!");
        return;
    }

    // 🏆 Sort teams by rank (lowest to highest)
    ladderData.sort((a, b) => a.rank - b.rank);

    // 📝 Clear previous content
    ladderContainer.innerHTML = "";

    // 🎯 Loop through the sorted data and add it to the table
    ladderData.forEach((team) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${team.rank}</td>
            <td>${team.team}</td>
            <td>${team.wins}</td>
            <td>${team.losses}</td>
            <td>${team.percentage.toFixed(2)}%</td>
        `;
        ladderContainer.appendChild(row);
    });

    console.log("✅ Live AFL Ladder Updated");
}

    // Clear existing data
    ladderContainer.innerHTML = '';

    // ✅ Loop through the top 18 teams only
    ladderData.slice(0, 18).forEach(team => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${team.rank}</td>
            <td>${team.team || "Unknown"}</td>
            <td>${team.wins || 0}</td>
            <td>${team.losses || 0}</td>
            <td>${team.percentage ? parseFloat(team.percentage).toFixed(2) + "%" : "N/A"}</td>
        `;

        ladderContainer.appendChild(row);
    });

    console.log("✅ Live AFL Ladder Updated");
}

// ✅ Load Player Leaderboard from Firebase
function loadLeaderboard() {
    console.log("📡 Fetching Player Leaderboard...");

    const leaderboardRef = ref(db, "leaderboard");

    onValue(leaderboardRef, (snapshot) => {
        console.log("🔍 Snapshot Data:", snapshot.val()); // Debugging line
        
        if (snapshot.exists()) {
            const leaderboardData = snapshot.val();
            updateLeaderboard(leaderboardData);
            console.log("✅ Leaderboard Updated", leaderboardData);
        } else {
            console.warn("⚠️ No leaderboard data found");
        }
    });
}

// ✅ Display Player Leaderboard on the page
function displayLeaderboard(leaderboardData) {
    const leaderboardContainer = document.getElementById('leaderboard');

    if (!leaderboardContainer) {
        console.error("❌ Leaderboard container not found!");
        return;
    }

    // Clear existing data
    leaderboardContainer.innerHTML = '';

    // ✅ Sort by lowest score (best rank)
    const sortedPlayers = Object.entries(leaderboardData)
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => a.score - b.score);

    sortedPlayers.forEach((player, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.score}</td>
        `;

        leaderboardContainer.appendChild(row);
    });

    console.log("✅ Leaderboard Updated");
}

// ✅ Run functions when the page loads
window.addEventListener("DOMContentLoaded", () => {
    fetchAFLStandings();   // Load AFL ladder
    loadLeaderboard();      // Load player leaderboard from Firebase
});
