// ✅ Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ✅ Your Firebase Configuration (Replace with your real details)
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

// ✅ Populate Drag-and-Drop Ranking List (with Dynamic Position Numbers)
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
