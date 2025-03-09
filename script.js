// ✅ Firebase Imports (Ensure only one initialization)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ✅ Prevent re-initialization of Firebase
if (!window.firebaseApp) {
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "your-messaging-id",
        appId: "your-app-id"
    };

    window.firebaseApp = initializeApp(firebaseConfig);
    window.db = getFirestore(window.firebaseApp);
    console.log("✅ Firebase Initialized Successfully");
}

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
        await addDoc(collection(window.db, "predictions"), {
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
        const querySnapshot = await getDocs(collection(window.db, "predictions"));
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

// ✅ Attach functions to `window` so they can be used in HTML
window.submitLadder = submitLadder;
window.loadLeaderboard = loadLeaderboard;
