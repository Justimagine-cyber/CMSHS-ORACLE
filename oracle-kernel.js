/**
 * CMSHS ORACLE | SYSTEM KERNEL (JS PORT)
 * Ported from oracle_engine.cpp for high-reliability mobile deployment.
 */
class OracleKernel {
    constructor() {
        this.TRIAGE_MODE = 0;
        this.HAZARD_MODE = 1;
        this.mode = this.TRIAGE_MODE;
        console.log("🏛️ ORACLE KERNEL: ONLINE (JS-NATIVE)");
    }

    setMode(m) {
        this.mode = m;
        console.log(`KERNEL: MODE_SWITCH -> ${m === 0 ? 'TRIAGE' : 'HAZARD'}`);
    }

    processDetection(id) {
        const sid = parseInt(id);
        if (this.mode === this.TRIAGE_MODE) {
            const triageMap = {
                1: "Minor",
                2: "Delayed",
                3: "Immediate",
                4: "Deceased"
            };
            return triageMap[sid] || "UNKNOWN_TRIAGE";
        } else {
            const hazardMap = {
                1: "Fire",
                2: "Blocked Exit",
                3: "Injured Person",
                4: "Structural Damage"
            };
            return hazardMap[sid] || "UNKNOWN_HAZARD";
        }
    }
}

// Initialize globally so other files can see it
const oracleKernel = new OracleKernel();

/* 📶 OFFLINE AUTO-SAFEGUARD */
window.addEventListener('offline', () => {
    // If the vision link is open when we go offline, kill it.
    // We don't want a frozen camera feed stalling the CMSHS ORACLE.
    const visionPopup = document.getElementById('aruco-vision-popup');
    
    if (visionPopup && visionPopup.style.display !== 'none') {
        console.warn("OFFLINE DETECTED: Terminating Vision Link to preserve memory.");
        terminateVisionLink();
        
        // Show a tactical alert so the user knows WHY it closed
        tacticalPrompt("SIGNAL LOST", "Vision Link requires 5G/WiFi. Reverting to Offline Grid Mode.", false, "", true);
    }
});
