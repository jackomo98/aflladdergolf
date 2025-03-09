const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxgEfupvm347ztiMCQtQwOLZoC6QALGZfeJnuLJejdC2_gjz5qhyQ0GCgC7Nlwky4SL/exec";

const SQUIGGLE_API_LADDER = "https://api.squiggle.com.au/?q=ladder";
const SQUIGGLE_API_FIXTURES = "https://api.squiggle.com.au/?q=games;year=2025;round=NEXT";

const teams = [
    "Adelaide", "Brisbane", "Carlton", "Collingwood", "Essendon",
    "Fremantle", "Geelong", "Gold Coast", "GWS", "Hawthorn",
    "Melbourne", "North Melbourne", "Port Adelaide", "Richmond",
    "St Kilda", "Sydney", "West Coast", "Western Bulldogs"
];

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

async function submitLadder() {
    const playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    const prediction = [];
    document.querySelectorAll("#teamRanking li").forEach(li => {
        prediction.push(li.textContent);
    });

    try {
        const response = await fetch(GOOGLE_SHEET_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: playerName, prediction })
        });

        const result = await response.json();
        alert(result.message);
        loadLeaderboard();
    } catch (error) {
        console.error("Error submitting ladder:", error);
    }
}

async function loadLeaderboard() {
    try {
        const response = await fetch(GOOGLE_SHEET_API_URL);
        const data = await response.json();

        const tbody = document.getElementById('leaderboard');
        tbody.innerHTML = '';

        data.forEach((entry, index) => {
            tbody.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
            </tr>`;
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}

async function loadLiveData() {
    try {
        const ladderResponse = await fetch(SQUIGGLE_API_LADDER);
        const ladderData = await ladderResponse.json();
        const tbody = document.getElementById('liveLadder');
        tbody.innerHTML = '';

        ladderData.ladder.forEach(team => {
            tbody.innerHTML += `<tr>
                <td>${team.rank}</td><td>${team.name}</td><td>${team.wins}</td>
                <td>${team.losses}</td><td>${team.percentage ? team.percentage.toFixed(2) : "N/A"}%</td>
            </tr>`;
        });

        const fixturesResponse = await fetch(SQUIGGLE_API_FIXTURES);
        const fixturesData = await fixturesResponse.json();
        const fixtureList = document.getElementById("fixture-list");
        fixtureList.innerHTML = '';

        fixturesData.games.forEach(game => {
            fixtureList.innerHTML += `<li>${game.hteam} vs ${game.ateam} - ${game.date}</li>`;
        });
    } catch (error) {
        console.error("Error fetching live data:", error);
    }
}

loadLeaderboard();
loadLiveData();
setInterval(loadLiveData, 60000);
