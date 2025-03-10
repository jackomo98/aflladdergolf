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

// ✅ Submit Ladder Prediction to Firebase
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
        await addDoc(collection(db, "predictions"), {
            name: playerName,
            prediction,
            timestamp: new Date()
        });

        alert("✅ Prediction saved!");
        loadLeaderboard();
    } catch (error) {
        console.error("❌ Error submitting ladder:", error);
    }
}

// ✅ Load Leaderboard from Firebase
async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboard');
    tbody.innerHTML = ''; // Clear old data

    try {
        const querySnapshot = await getDocs(collection(db, "predictions"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");

            row.innerHTML = `<td>${data.name}</td><td>${JSON.stringify(data.prediction)}</td>`;
            tbody.appendChild(row);
        });

        console.log("✅ Leaderboard Loaded Successfully");
    } catch (error) {
        console.error("❌ Error loading leaderboard:", error);
    }
}

// ✅ Load leaderboard when the page loads
loadLeaderboard();

// 🏆 Fetch Live AFL Ladder from API-Sports
async function fetchAFLStandings() {
    const apiKey = "7f72c290ca65fc47aa2ad2ceeca07f23"; // Your API key
    const leagueId = "1"; // AFL league ID (Check API-Sports Docs)
    const season = "2025"; // Current season

    console.log("📡 Fetching Live AFL Ladder...");

    try {
        const response = await fetch(`https://v1.api-sports.io/afl/standings?league=${leagueId}&season=${season}`, {
            method: "GET",
            headers: {
                "x-apisports-key": apiKey, // API Key for Authentication
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ AFL Ladder API Response:", data);

        // Check if we got standings data
        if (data.response && data.response.length > 0) {
            displayLadder(data.response[0].standings);
        } else {
            console.error("⚠ No ladder data found in response");
        }

    } catch (error) {
        console.error("❌ Error fetching AFL ladder:", error);
    }
}

// 📊 Display the Ladder on the Page
function displayLadder(standings) {
    const ladderContainer = document.getElementById("liveLadder");

    if (!ladderContainer) {
        console.error("⚠ Ladder container not found!");
        return;
    }

    // Clear previous data
    ladderContainer.innerHTML = "";

    standings.forEach((team, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${team.rank}</td>
            <td>${team.team.name}</td>
        `;
        ladderContainer.appendChild(row);
    });

    console.log("✅ Live AFL Ladder Updated");
    
}

// 🚀 Run functions on page load
window.addEventListener("DOMContentLoaded", () => {
    fetchAFLStandings();
    loadLeaderboard();  // Ensure leaderboard loads properly as well
});
