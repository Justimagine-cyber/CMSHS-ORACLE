/* 🏛️ CMSHS ORACLE: TACTICAL ENGINE V18.7 
    - One-Time Cinematic Boot (Session Persistence)
    - Lead Locator Merge Logic (Responder 1 + Responder 2)
    - Simplified Tactical Reports (Confirm Only / No Cancel)
    - Re-Engineered True Merge & Fingerprinting
*/

console.log("ORACLE SYSTEM: V18.7 ONLINE");

// --- INITIAL STATE ---
let currentType = 0;
let counts = [0, 0, 0, 0];
const colors = ['#00ff66', '#ffff00', '#ff3333', '#888888']; 

const map = document.getElementById('map-img');
const viewport = document.getElementById('viewport');

let mapPos = { x: -400, y: -300 };
let zoom = 1;
const ZOOM_SPEED = 0.08;
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let initialPinchDist = -1; // Mobile Zoom tracking

// --- 🛡️ BULLETPROOF BOOT SEQUENCE ---
function initializeSystem() {
    const bootOverlay = document.getElementById('boot-overlay');
    const isSessionActive = sessionStorage.getItem('INITIAL_BOOT_COMPLETE');

    // IF SESSION IS ALREADY ACTIVE: Kill the boot screen instantly
    if (isSessionActive) {
        if (bootOverlay) {
            bootOverlay.style.display = 'none';
        }
        loadState(); 
        updateMapTransform();
        return; // EXIT EARLY
    }

    // NORMAL STARTUP (First time opening the tab)
    console.log("STARTING MASTER BOOT PROTOCOL...");
    const bootText = document.getElementById('boot-text');
    const fullText = "INITIALIZING TACTICAL GRID...\nACCESSING CMSHS ORACLE...\nSTATUS: ONLINE";
    let i = 0;

    function typeWriter() {
        if (bootText && i < fullText.length) {
            bootText.innerHTML += fullText.charAt(i);
            i++;
            setTimeout(typeWriter, 30);
        }
    }

    if (bootText) {
        bootText.innerHTML = "";
        typeWriter();
    }

    setTimeout(() => {
        if (bootOverlay) {
            bootOverlay.style.opacity = '0';
            bootOverlay.style.pointerEvents = 'none'; 
            setTimeout(() => {
                bootOverlay.style.display = 'none';
                // SET THE FLAG: No more boot screens until the tab is closed
                sessionStorage.setItem('INITIAL_BOOT_COMPLETE', 'true');
            }, 600);
        }
        loadState(); 
        updateMapTransform();
    }, 3500);
}

// --- PERSISTENCE & MERGE ENGINE ---
function saveState() {
    const dots = [];
    document.querySelectorAll('.triage-dot').forEach(d => {
        dots.push({
            x: d.style.left,
            y: d.style.top,
            type: d.dataset.type,
            agent: d.dataset.agent,
            time: d.dataset.timestamp,
            uuid: d.dataset.uuid
        });
    });
    localStorage.setItem('ORACLE_GRID_DATA', JSON.stringify(dots));
    localStorage.setItem('ORACLE_STATS', JSON.stringify(counts));
}

function loadState() {
    const savedDotsRaw = localStorage.getItem('ORACLE_GRID_DATA');
    const savedCountsRaw = localStorage.getItem('ORACLE_STATS');
    
    try {
        if (savedCountsRaw) {
            counts = JSON.parse(savedCountsRaw);
            updateHUD();
        }
        if (savedDotsRaw) {
            const savedDots = JSON.parse(savedDotsRaw);
            if (Array.isArray(savedDots)) {
                savedDots.forEach(d => {
                    createDot(d.x, d.y, d.type, d.agent, d.time, true, d.uuid);
                });
            }
        }
    } catch (err) { console.error("ORACLE: Cache Load Error", err); }
}

// --- CORE PLOTTING ---
function createDot(x, y, type, agentData, timestamp, isSilent = false, existingUUID = null) {
    const mapEl = document.getElementById('map-img');
    if (!mapEl) return;

    const typeInt = parseInt(type) || 0;
    const dotContainer = document.createElement('div');
    dotContainer.className = 'triage-dot'; 
    const classMap = ['green', 'yellow', 'red', 'black'];
    dotContainer.classList.add(classMap[typeInt]);
    dotContainer.style.position = 'absolute';
    dotContainer.style.left = x;
    dotContainer.style.top = y;

    dotContainer.dataset.type = typeInt;
    dotContainer.dataset.agent = agentData || "UNKNOWN AGENT";
    dotContainer.dataset.timestamp = timestamp || new Date().toLocaleTimeString();
    
    // Generate UUID if it doesn't exist
    dotContainer.dataset.uuid = existingUUID || btoa(timestamp + agentData + Math.random()).substring(0, 16);

    const dotInner = document.createElement('div');
    dotInner.style.cssText = `width:16px; height:16px; border-radius:50%; background-color:${colors[typeInt]}; box-shadow: 0 0 15px ${colors[typeInt]}; cursor:pointer;`;
    
    const triageStatus = ["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"][typeInt];
    dotInner.onclick = (e) => { 
        e.stopPropagation(); 
        showIntel(dotContainer.dataset.agent, triageStatus, dotContainer.dataset.timestamp); 
    };

    dotContainer.appendChild(dotInner);
    const label = document.createElement('div');
    label.className = 'triage-label';
    label.innerText = (agentData || "UNKNOWN").split(' - ')[0]; 
    dotContainer.appendChild(label);

    mapEl.appendChild(dotContainer);

    if (!isSilent) {
        counts[typeInt]++;
        updateHUD();
        saveState();
    }
}

// --- 📱 MOBILE PINCH-TO-ZOOM ---
viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
        initialPinchDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
    }
}, { passive: false });

viewport.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        if (initialPinchDist > 0) {
            const diff = dist - initialPinchDist;
            zoom = Math.min(Math.max(0.4, zoom + (diff * 0.005)), 4);
            updateMapTransform();
            initialPinchDist = dist;
        }
    }
}, { passive: false });

viewport.addEventListener('touchend', () => { initialPinchDist = -1; });

// --- DATA LINK & TRUE MERGE ENGINE ---
function generateTacticalQR() {
    const data = localStorage.getItem('ORACLE_GRID_DATA');
    const hasData = data && data !== "[]";
    const b64Data = hasData ? btoa(data) : "";

    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#0f6;">DATA LINK</h3>
        ${hasData ? `
            <div style="background:white; padding:10px; display:inline-block; margin-bottom:10px;">
                <div id="qr-target"></div>
            </div>
            <button onclick="copyToClipboard('${b64Data}')" class="sync-copy-btn">COPY DATA STRING</button>
        ` : `<p style="font-size:0.8em; color:#888;">[ NO LOCAL DATA TO SHARE ]</p>`}
        
        <button onclick="document.getElementById('intel-overlay').style.display='none'; importTacticalGrid();" 
        class="close-intel" 
        style="border-color:#ffa500; color:#ffa500; width:100%; margin-bottom:10px;">
        IMPORT SECTOR DATA</button>
        <button onclick="document.getElementById('intel-overlay').style.display='none'" class="close-intel" style="width:100%;">DISMISS</button>
    `;
    overlay.style.display = 'block';

    if (hasData) {
        const qr = qrcode(0, 'L');
        qr.addData(b64Data);
        qr.make();
        document.getElementById('qr-target').innerHTML = qr.createImgTag(4);
    }
}

async function importTacticalGrid() {
    const code = await tacticalPrompt(
        "IMPORT NEW DATA", 
        "PASTE DATA STRING:",
        true,
        "PASTE STRING HERE..." 
    );
    
    if (!code || code.trim() === "") return;

    try {
        const incomingData = JSON.parse(atob(code.trim()));
        const masterDataRaw = localStorage.getItem('ORACLE_GRID_DATA');
        let masterData = masterDataRaw ? JSON.parse(masterDataRaw) : [];
        const masterUUIDs = new Set(masterData.map(dot => dot.uuid));
        
        let integratedPlots = 0;
        incomingData.forEach(responderDot => {
            if (!masterUUIDs.has(responderDot.uuid)) {
                masterData.push(responderDot);
                integratedPlots++;
            }
        });

        if (integratedPlots === 0) {
            // Confirm Only report
            await tacticalPrompt("DATA INTEGRATION REPORT", "NO NEW UNIQUE PLOTS DETECTED. CMSHS GRID IS CURRENT.", false, "", true);
        } else {
            localStorage.setItem('ORACLE_GRID_DATA', JSON.stringify(masterData));
            const masterCounts = [0, 0, 0, 0];
            masterData.forEach(d => {
                const t = parseInt(d.type);
                if (!isNaN(t)) masterCounts[t]++;
            });
            localStorage.setItem('ORACLE_STATS', JSON.stringify(masterCounts));
            
            // Confirm Only report
            await tacticalPrompt("CMSHS GRID UPDATED", `${integratedPlots} NEW PLOTS INTEGRATED INTO CMSHS GRID.`, false, "", true);
            
            sessionStorage.setItem('FAST_BOOT', 'true');
            location.reload(); 
        }
    } catch (e) { 
        console.error("LEAD UPLINK ERROR:", e);
        await tacticalPrompt("CRITICAL ERROR", "DATA STRING CORRUPT OR INCOMPATIBLE.", false, "", true); 
    }
}

// --- SYSTEM OVERLAYS ---
function showAbout() {
    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#00ff66; border-bottom:1px solid #00ff66; padding-bottom:10px; margin-bottom:15px; letter-spacing:2px;">SYSTEM OVERVIEW</h3>
        
        <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.6; color:#0f6; max-height:60vh; overflow-y:auto; padding-right:5px;">
            <p style="margin-bottom:15px;"><strong>CMSHS ORACLE</strong> is a specialized <strong>Progressive Web App (PWA)</strong> developed for emergencies in CMSHS. It provides a high-visibility, tactical interface for real-time triage tracking and personnel location within the school campus.</p>
            
            <p style="color:#ffff00; font-weight:900; letter-spacing:1px; margin-top:20px;">CORE CAPABILITIES</p>
            <ul style="list-style:none; padding-left:0; margin-bottom:15px;">
                <li><strong>OFFLINE-FIRST:</strong> Engineered for "Air-Gapped" environments where data is unavailable.</li>
                <li><strong>AGENT PLOTTING:</strong> Precision coordinate placement with color-coded triage status.</li>
                <li><strong>AGENT DOSSIERS:</strong> Interactive labels and tap-to-view intelligence popups.</li>
                <li><strong>GEOSPATIAL SYNC:</strong> Zoom-calibrated scaling for accurate sector analysis.</li>
            </ul>

            <p style="color:#00aaff; font-weight:900; letter-spacing:1px; margin-top:20px;">DEPLOYMENT</p>
            <ol style="padding-left:15px; margin-bottom:15px;">
                <li><strong>Scan QR Code</strong> provided by the administrator.</li>
                <li><strong>Boot System:</strong> Wait for the ORACLE initialization sequence.</li>
                <li><strong>Install:</strong> "Add to Home Screen" to run natively on any device.</li>
            </ol>

            <p style="color:#ffa500; font-weight:900; letter-spacing:1px; margin-top:20px;">PHILOSOPHY</p>
            <p style="font-style:italic; border-left: 2px solid #ffa500; padding-left: 10px; margin-bottom:10px; color:#ccc;">
                "Objective judgment, now at this very moment. Unselfish action, now at this very moment. Willing acceptance—now at this very moment—of all external events. That’s all you need." — Marcus Aurelius
            </p>
            <p style="font-size:0.8em; opacity:0.8;">ORACLE was built to provide clarity in chaos—a tool for the disciplined, designed for effective action when it matters most.</p>
            
            <hr style="border:0; border-top:1px solid #333; margin:20px 0;">
            
            <div style="font-size:0.75em; text-transform:uppercase; letter-spacing:1px; color:#888;">
                <p><strong>DEVELOPED BY:</strong> Mark Justin L. Castillo, 12 - Planck</p>
                <p><strong>INSTITUTION:</strong> City of Mandaluyong Science High School</p>
                <p><strong>SCHOOL YEAR:</strong> 2025–2026</p>
            </div>
        </div>
        
        <div class="close-intel" onclick="this.parentElement.style.display='none'">DISMISS</div>
    `;
    overlay.style.display = 'block';
}

function showIntelligenceReport() {
    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#0f6;">SYSTEM UPDATES</h3>
        <div style="text-align:left; font-size:0.8em; font-family:'Montserrat', sans-serif;">
            <p><b>[v18.7]</b> Report Protocol: "Confirm Only" modals active.</p>
            <p><b>[v18.7]</b> Persistence: One-time cinematic boot per session.</p>
            <p><b>[v18.6]</b> True Merge Logic: Combine data without wiping.</p>
        </div>
        <div class="close-intel" onclick="this.parentElement.style.display='none'">DISMISS</div>
    `;
    overlay.style.display = 'block';
}

// --- UTILITIES ---
function setStatus(s) { currentType = s; }
function updateHUD() {
    const ids = ['g-c', 'y-c', 'r-c', 'b-c'];
    ids.forEach((id, i) => { if(document.getElementById(id)) document.getElementById(id).innerText = counts[i]; });
}
function updateMapTransform() {
    if (map) {
        map.style.transform = `translate(${mapPos.x}px, ${mapPos.y}px) scale(${zoom})`;
        viewport.style.setProperty('--zoom-level', zoom); 
    }
}
function copyToClipboard(str) {
    if (!str) return;
    navigator.clipboard.writeText(str).then(async () => {
        await tacticalPrompt("DATA SECURED", "DATA STRING ENCRYPTED & COPIED TO CLIPBOARD", false, "", true);
    }).catch(err => { console.error("Link Failure", err); });
}

// UPDATED: Added hideCancel parameter
function tacticalPrompt(title, desc, showsInput = true, customPlaceholder = "Enter data...", hideCancel = false) {
    const intelOverlay = document.getElementById('intel-overlay');
    if (intelOverlay) intelOverlay.style.display = 'none';
    
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const input = document.getElementById('modal-input');
        const cancelBtn = document.getElementById('modal-cancel');
        
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-desc').innerText = desc;
        input.placeholder = customPlaceholder; 
        input.style.display = showsInput ? 'block' : 'none';
        
        // Modal Button Logic
        cancelBtn.style.display = hideCancel ? 'none' : 'block';
        
        input.value = ""; 
        modal.style.display = 'flex';
        
        if(showsInput) setTimeout(() => input.focus(), 100);

        document.getElementById('modal-confirm').onclick = () => {
            modal.style.display = 'none';
            resolve(showsInput ? input.value : true);
        };

        cancelBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(null);
        };
    });
}

async function clearMap() {
    const confirmed = await tacticalPrompt("DATA WIPE WARNING", "ERASE ALL PLOTTED INCIDENTS?", false);
    if(confirmed) {
        localStorage.clear();
        counts = [0, 0, 0, 0];
        document.querySelectorAll('.triage-dot').forEach(dot => dot.remove());
        updateHUD();
        location.reload();
    }
}

// --- INPUT HANDLERS ---
viewport.addEventListener('dblclick', async (e) => {
    const rect = viewport.getBoundingClientRect();
    const agentData = await tacticalPrompt("AGENT IDENTIFICATION", "ENTER NAME & SECTOR", true, "e.g. JUAN - GYM");

    if (!agentData) return;

    const mouseX = (e.clientX - rect.left - mapPos.x) / zoom;
    const mouseY = (e.clientY - rect.top - mapPos.y) / zoom;
    const tacticalTimestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    createDot((mouseX - 8) + 'px', (mouseY - 8) + 'px', currentType, agentData, tacticalTimestamp);
});

viewport.addEventListener('wheel', e => {
    e.preventDefault();
    zoom = Math.min(Math.max(0.4, zoom + (e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED)), 4);
    updateMapTransform();
}, { passive: false });

viewport.addEventListener('pointerdown', e => {
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
});

viewport.addEventListener('pointermove', e => {
    if (!isDragging) return;
    mapPos.x += e.clientX - lastMouse.x;
    mapPos.y += e.clientY - lastMouse.y;
    updateMapTransform();
    lastMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('pointerup', () => { isDragging = false; });
window.addEventListener('load', initializeSystem); 

function showIntel(name, status, time) {
    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#0f6;">AGENT PROFILE</h3>
        <p style="text-align:left; font-size:0.9em;">
            <strong>ID:</strong> ${name}<br>
            <strong>STATUS:</strong> ${status}<br>
            <strong>LAST SEEN:</strong> ${time} </p>
        <div class="close-intel" onclick="document.getElementById('intel-overlay').style.display='none'">DISMISS</div>
    `;
    overlay.style.display = 'block';

}

// --- FIELD MANUAL (HELP & TROUBLESHOOTING) ---
function showHelp() {
    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#ffa500; border-bottom:1px solid #ffa500; padding-bottom:5px;">ORACLE MANUAL</h3>
        <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.4; max-height:300px; overflow-y:auto; padding-right:5px;">
            <p style="color:#0f6; font-weight:bold;">[ USAGE ]</p>
            <ul style="padding-left:15px;">
                <li><b>Plot Incident:</b> Double-click/tap on the map.</li>
                <li><b>Change Triage:</b> Use the bottom HUD (Minor, Delayed, Immediate, Deceased) before plotting.</li>
                <li><b>Move Map:</b> Drag with one finger/mouse.</li>
                <li><b>Zoom:</b> Pinch-to-zoom (mobile) or Scroll wheel (desktop).</li>
            </ul>

            <p style="color:#0f6; font-weight:bold;">[ SYNCING ]</p>
            <ul style="padding-left:15px;">
                <li><b>Exporting:</b> Click SHARE REPORT to get your unique string or QR.</li>
                <li><b>Importing:</b> Click IMPORT SECTOR DATA and paste the string from another responder. The system will only add <i>new</i> plots.</li>
            </ul>

            <p style="color:#ff3333; font-weight:bold;">[ TROUBLESHOOTING ]</p>
            <ul style="padding-left:15px;">
                <li><b>Lost on Map:</b> If you can't find the building, refresh the page. The position resets to the default grid.</li>
                <li><b>Merge Failed:</b> Ensure you copied the entire string. If it looks "cut off", the merge engine will reject it.</li>
                <li><b>Dots Not Showing:</b> Check if your browser is in "Incognito." ORACLE needs LocalStorage to save your work.</li>
                <li><b>Merge Conflict:</b> If plots won't merge, perform RESET OPERATIONAL DATA, re-paste, and Confirm.</li>
                <li><b>System Lag:</b> Perform RESET OPERATIONAL DATA if you have multiple old incidents slowing down your device.</li>
            </ul>
        </div>
        <div class="close-intel" onclick="this.parentElement.style.display='none'" style="margin-top:10px;">DISMISS</div>
    `;
    overlay.style.display = 'block';
}

