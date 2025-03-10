// scripts/fetchLadder.js

async function fetchAFLStandings() {
    try {
        const response = await fetch('https://api.squiggle.com.au/?q=ladder');
        const data = await response.json();
        
        // Extract the ladder standings
        if (data && data.ladder) {
            return data.ladder;
        } else {
            console.error("Invalid ladder data received:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching AFL ladder:", error);
        return [];
    }
}

// Export function so it can be used in other files
export { fetchAFLStandings };
