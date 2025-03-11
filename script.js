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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
console.log("✅ Firebase Connected");

// ✅ Official team names (matching API data)
const teams = [
    "Adelaide", "Brisbane Lions", "Carlton", "Collingwood", "Essendon",
    "Fremantle", "Geelong", "Gold Coast", "Greater Western Sydney", "Hawthorn",
    "Melbourne", "North Melbourne", "Port Adelaide", "Richmond",
    "St Kilda", "Sydney", "West Coast", "Western Bulldogs"
];

// ✅ Populate Drag-and-Drop Team Ranking List
const teamRanking = document.getElementById("teamRanking");
teams.forEach(team => {
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

// ✅ Store the original order of teams
const originalOrder = [
    "Adelaide", "Brisbane Lions", "Carlton", "Collingwood", "Essendon",
    "Fremantle", "Geelong", "Gold Coast", "Greater Western Sydney", "Hawthorn",
    "Melbourne", "North Melbourne", "Port Adelaide", "Richmond",
    "St Kilda", "Sydney", "West Coast", "Western Bulldogs"
];

// 🏁 Function to reset the ranking list
function resetRanking() {
    const teamRanking = document.getElementById("teamRanking");
    teamRanking.innerHTML = ""; // Clear current list

    originalOrder.forEach((team) => {
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
}

// 🔥 Updated submitPrediction() with reset after submission
async function submitPrediction() {
    const playerName = document.getElementById("playerName").value;

    if (!playerName) {
        alert("⚠ Please enter your name!");
        return;
    }

    // ✅ Get player's ranked teams
    const rankedTeams = Array.from(document.querySelectorAll("#teamRanking li"))
        .map((li, index) => ({
            name: li.textContent.trim(),
            predictedRank: index + 1 
        }));

    console.log("⭐ Player Prediction:", rankedTeams);

    try {
        // ✅ Fetch the latest AFL ladder from Squiggle API
        const response = await fetch("https://api.squiggle.com.au/?q=standings");
        const data = await response.json();

        if (!data.standings) {
            console.error("⚠ No ladder data found!");
            return;
        }

        // ✅ Convert live ladder data into a comparable format
        const liveLadder = data.standings.map(team => ({
            name: team.name,
            actualRank: team.rank
        }));

        console.log("🏆 Live AFL Ladder:", liveLadder);

        // ✅ Calculate score based on position differences
        let totalScore = 0;
        rankedTeams.forEach(predictedTeam => {
            const actualTeam = liveLadder.find(team => team.name === predictedTeam.name);
            if (actualTeam) {
                totalScore += Math.abs(predictedTeam.predictedRank - actualTeam.actualRank);
            }
        });

        console.log("🎯 Player Score:", totalScore);

        // ✅ Save to Firebase
        const playerRef = ref(db, "leaderboard/" + playerName);
        set(playerRef, {
            name: playerName,
            points: totalScore
        });

        alert("✅ Prediction submitted!");

        // 🔄 Reset the ranking list after submission
        resetRanking();

        loadLeaderboard();
    } catch (error) {
        console.error("❌ Error fetching live ladder:", error);
    }
}
// ✅ Attach the function to the submit button
document.getElementById("submitPrediction").addEventListener("click", submitPrediction);

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

                // ✅ Sort by lowest points (best rank)
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

// ✅ Load leaderboard when page loads
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
        if (!data.standings || data.standings.length === 0) {
            console.error("⚠ No ladder data found!");
            return;
        }

        const liveLadder = data.standings.map(team => ({
            name: team.name,
            actualRank: team.rank
        }));

        console.log("✅ Live AFL Ladder:", liveLadder);

        // ✅ Display Live Ladder
        displayLadder(liveLadder);
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
            <td>${team.actualRank}</td>
            <td>${team.name}</td>
        `;
        ladderContainer.appendChild(row);
    });

    console.log("✅ Live AFL Ladder Updated");
}

// ✅ Load AFL ladder when page loads
window.addEventListener("DOMContentLoaded", fetchAFLStandings);
