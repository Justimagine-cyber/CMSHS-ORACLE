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
