// Map ArUco IDs to specific rooms on CMSHS-SDRRM-PLAN.jpg
// x: horizontal %, y: vertical %
const CMSHS_COORDINATES = {
    // --- SHS BUILDING (Bottom) ---
    1:  { name: "SHS Lab 1", pos: [59, 77] },
    2:  { name: "SHS Lab 2", pos: [41, 77] },
    3:  { name: "Room 7", pos: [63, 85] },
    4:  { name: "Room 10", pos: [36, 85] },
    5:  { name: "SHS Faculty", pos: [63, 69] },

    // --- JHS BUILDING (Top) ---
    6:  { name: "Principal's Office", pos: [60, 30] },
    7:  { name: "Registrar's Office", pos: [35, 30] },
    8:  { name: "Biology Lab", pos: [4, 12] },
    9:  { name: "Clinic", pos: [90, 30] },

    // --- FACILITIES ---
    10: { name: "GYM Central", pos: [45, 50] },
    11: { name: "CMSHS Stage", pos: [76, 50] },
    12: { name: "AVR", pos: [98, 55] }
};

// 🛠️ FUNCTION TO RENDER THE PIN
function dropMarkerOnPng(id, label) {
    const viewport = document.getElementById('viewport');
    const asset = CMSHS_COORDINATES[id];

    if (!asset) {
        console.warn(`ARUCO ID ${id} is not registered in CMSHS Registry.`);
        return;
    }

    // Create unique ID for the marker to prevent duplicates
    const markerId = `marker-${id}`;
    let marker = document.getElementById(markerId);

    if (!marker) {
        marker = document.createElement('div');
        marker.id = markerId;
        marker.className = 'map-marker';
        viewport.appendChild(marker);
    }

    // Update style based on Triage/Hazard status
    marker.className = `map-marker ${getMarkerClass(label)}`;
    marker.style.left = `${asset.pos[0]}%`;
    marker.style.top = `${asset.pos[1]}%`;

    // Visual Label
    marker.innerHTML = `
        <div class="marker-label">
            <span class="room-name">${asset.name}</span><br>
            <span class="status-tag">${label.toUpperCase()}</span>
        </div>
    `;
    
    // Auto-remove or "fade" after some time if needed, 
    // or keep it persistent for the demo.
}
