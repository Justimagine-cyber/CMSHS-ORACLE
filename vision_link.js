// This listens for the C++ Detection Signal
function onArUcoDetected(id, x, y) {
    const result = oracleEngine.processDetection(id); // Calling the C++ logic
    
    // Map the ArUco location to your PNG coordinates
    const mapX = convertToMapX(x); 
    const mapY = convertToMapY(y);

    if (result.type === "TRIAGE") {
        dropTriageMarker(result.label, mapX, mapY);
        updateCasualtyCount(result.label);
    } else {
        dropHazardIcon(result.label, mapX, mapY);
    }
    
    console.log(`[ORACLE] ${result.type} Detected: ${result.label} at ID ${id}`);
}
