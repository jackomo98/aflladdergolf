document.addEventListener("DOMContentLoaded", fetchGoalData);

async function fetchGoalData() {
    console.log("Fetching AFL goal data...");

    try {
        const response = await fetch("https://api.squiggle.com.au/?q=players");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("AFL Goal Data:", data);

        // Extract player goal data
        const players = data.players;
        const selectedPlayers = ["Harry McKay", "Joel Amartey"];
        const filteredPlayers = players.filter(player => selectedPlayers.includes(player.name));

        displayGoalData(filteredPlayers);
    } catch (error) {
        console.error("Error fetching goal data:", error);
    }
}

function displayGoalData(players) {
    const goalTable = document.getElementById("goalData");

    if (!goalTable) {
        console.error("Goal table not found!");
        return;
    }

    // Clear existing data
    goalTable.innerHTML = "";

    players.forEach(player => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${player.name}</td>
            <td>${player.team}</td>
            <td>${player.goals}</td>
        `;
        goalTable.appendChild(row);
    });

    console.log("Live goal tracker updated!");
}

// Refresh data every 60 seconds
setInterval(fetchGoalData, 60000);
