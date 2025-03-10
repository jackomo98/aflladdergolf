// ✅ Treat this file as a module
export { submitLadder, loadLeaderboard };

// ✅ Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("✅ Firebase Loaded Successfully");

// ✅ AFL Teams List (For Ranking)
const teams = [
    "Adelaide", "Brisbane", "Carlton", "Collingwood", "Essendon",
    "Fremantle", "Geelong", "Gold Coast", "GWS", "Hawthorn",
    "Melbourne", "North Melbourne", "Port Adelaide", "Richmond",
    "St Kilda", "Sydney", "West Coast", "Western Bulldogs"
];

// ✅ Populate Drag-and-Drop Ranking List
const teamRanking = document.getElementById("teamRanking");
teams.forEach((team, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = team;
    listItem.draggable = true;
    listItem.classList.add("draggable");
    listItem.setAttribute("data-team", team);
    
    listItem.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", event.target.dataset.team);
        event.target.classList.add("dragging");
    });

    listItem.addEventListener("dragend", (event) => {
        event.target.classList.remove("dragging");
    });

    teamRanking.appendChild(listItem);
});

// ✅ Drag-and-Drop Functionality
teamRanking.addEventListener("dragover", (event) => {
    event.preventDefault();
    const draggingItem = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(teamRanking, event.clientY);
    
    if (afterElement == null) {
        teamRanking.appendChild(draggingItem);
    } else {
        teamRanking.insertBefore(draggingItem, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".draggable:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 🏅 Handle Player Submissions
document.getElementById("submitPrediction").addEventListener("click", function () {
    const playerName = document.getElementById("playerName").value;

    if (!playerName) {
        alert("⚠ Please enter your name!");
        return;
    }

    // Save player prediction (Placeholder logic)
    const playerRef = ref(db, "leaderboard/" + playerName);
    set(playerRef, {
        name: playerName,
        points: Math.floor(Math.random() * 100) // Temporary score logic
    });

    alert("✅ Prediction submitted!");
    loadLeaderboard();
});

// 🏆 Load Leaderboard from Firebase
async function loadLeaderboard() {
    console.log("📡 Fetching Player Leaderboard...");

    try {
        const leaderboardRef = ref(db, "leaderboard");
        onValue(leaderboardRef, (snapshot) => {
            const leaderboardContainer = document.getElementById("leaderboard");
            leaderboardContainer.innerHTML = "";

            if (snapshot.exists()) {
                let leaderboardData = [];
                snapshot.forEach((childSnapshot) => {
                    leaderboardData.push(childSnapshot.val());
                });

                // Sort by lowest points (best rank)
                leaderboardData.sort((a, b) => a.points - b.points);

                leaderboardData.forEach((player, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${index + 1}</td><td>${player.name}</td><td>${player.points}</td>`;
                    leaderboardContainer.appendChild(row);
                });

                console.log("✅ Leaderboard Updated");
            } else {
                console.warn("⚠ No leaderboard data found!");
            }
        });
    } catch (error) {
        console.error("❌ Error loading leaderboard:", error);
    }
}

// Load leaderboard when page loads
window.addEventListener("DOMContentLoaded", loadLeaderboard);

// 🏆 Fetch Live AFL Ladder from Squiggle API
async function fetchAFLStandings() {
    console.log("📡 Fetching Live AFL Ladder...");

    try {
        const response = await fetch("https://api.squiggle.com.au/?q=standings");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ AFL Ladder API Response:", data);

        if (data.standings && data.standings.length > 0) {
            displayLadder(data.standings);
        } else {
            console.error("⚠ No ladder data found in response");
        }

    } catch (error) {
        console.error("❌ Error fetching AFL ladder:", error);
    }
}

// 📊 Display Ladder on Page
function displayLadder(standings) {
    const ladderContainer = document.getElementById("liveLadder");

    if (!ladderContainer) {
        console.error("⚠ Ladder container not found!");
        return;
    }

    // Clear existing table
    ladderContainer.innerHTML = "";

    standings.forEach((team) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${team.rank}</td>
            <td>${team.name}</td>
        `;
        ladderContainer.appendChild(row);
    });

    console.log("✅ Live AFL Ladder Updated");
}

// 🏁 Run functions on page load
window.addEventListener("DOMContentLoaded", () => {
    fetchAFLStandings(); // Load AFL Ladder
});
