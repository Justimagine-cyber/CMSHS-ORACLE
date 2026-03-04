/* 🏛️ CMSHS ORACLE: tactical ENGINE V18.7 
    - One-Time Cinematic Boot (Session Persistence)
    - Lead Locator Merge Logic (Responder 1 + Responder 2)
    - Simplified tactical Reports (Confirm Only / No Cancel)
    - Re-Engineered True Merge & Fingerprinting
*/

console.log("ORACLE SYSTEM: V18.7 ONLINE");

// --- INITIAL STATE ---
let currentType = 0;
let counts = [0, 0, 0, 0];
let currentSelectedAgentId = null; // Tracks which dot is being modified

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
    const fullText = "INITIALIZING CMSHS GRID...\nACCESSING CMSHS ORACLE...\nSUCCESSFUL INITIALIZATION!";
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
    const newCounts = [0, 0, 0, 0]; 

    try {
        document.querySelectorAll('.triage-dot').forEach(d => {
            // Ignore the UI Overlay if it's currently inside the map
            if (d.id === 'intel-overlay') return; 

            const typeValue = d.dataset.type;
            if (typeValue === undefined) return; 

            const type = parseInt(typeValue);
            
            dots.push({
                x: d.style.left,
                y: d.style.top,
                type: type,
                agent: d.dataset.agent || "UNKNOWN",
                time: d.dataset.timestamp || "",
                uuid: d.dataset.uuid || ""
            });

            if (!isNaN(type) && newCounts[type] !== undefined) {
                newCounts[type]++;
            }
        });

        counts = newCounts; 
        updateHUD(); 
        
        // Use the same keys your "Load" function expects
        localStorage.setItem('ORACLE_GRID_DATA', JSON.stringify(dots));
        localStorage.setItem('ORACLE_STATS', JSON.stringify(counts));
        
        console.log("SDRRM PERMANENCE: State Secured."); 
    } catch (err) {
        console.error("CRITICAL: saveState Protocol Failed", err);
    }
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

// --- CORE PLOTTING PERSISTENCE ---
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
    
    // ✅ High-Precision UUID Generation
    dotContainer.dataset.uuid = existingUUID || `AGENT-${Date.now()}-${Math.floor(Math.random() * 100000).toString(16)}`;

    const dotInner = document.createElement('div');
    // Using global 'colors' array to prevent reference errors
    dotInner.style.cssText = `width:16px; height:16px; border-radius:50%; background-color:${colors[typeInt]}; box-shadow: 0 0 15px ${colors[typeInt]}; cursor:pointer;`;
    
    const triageStatus = ["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"][typeInt];
    dotInner.onclick = (e) => { 
        e.stopPropagation(); 
        showIntel(dotContainer.dataset.uuid, dotContainer.dataset.agent, triageStatus, dotContainer.dataset.timestamp); 
    };

    dotContainer.appendChild(dotInner);
    const label = document.createElement('div');
    label.className = 'triage-label';
    label.innerText = (agentData || "UNKNOWN").split(' - ')[0]; 
    dotContainer.appendChild(label);

    mapEl.appendChild(dotContainer);

    // Run these for EVERY dot creation
    counts[typeInt]++; 
    updateHUD();
    saveState(); 

    // Only handle animation/silence here
    if (isSilent) {
        dotContainer.style.animation = "none";
    }
    
    console.log(`[SYSTEM] Identity ${dotContainer.dataset.uuid} secured in sector.`);
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
    
    // Use 'let' so we can modify the value
    let agentData = await tacticalPrompt("AGENT IDENTIFICATION", "ENTER NAME & SECTOR", true, "e.g. JUAN - GYM");
    
    // 1. Handle Cancel
    if (agentData === null) return;
    
    // 2. Handle Empty Input (The "Unnamed" Protocol) - Added Semicolon
    if (agentData.trim() === "") { agentData = "Unnamed Agent"; }

    // 3. Coordinate Calculation
    const mouseX = (e.clientX - rect.left - mapPos.x) / zoom;
    const mouseY = (e.clientY - rect.top - mapPos.y) / zoom;
    
    const tacticalTimestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 4. Create the Dot (Subtracting 8 to center the 16px dot)
    createDot(`${mouseX - 8}px`, `${mouseY - 8}px`, currentType, agentData, tacticalTimestamp);
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

// --- DYNAMIC AGENT MANAGEMENT ---
function showIntel(id, name, status, time) {
    currentSelectedAgentId = id; 
    const overlay = document.getElementById('intel-overlay');
    const targetDot = document.querySelector(`[data-uuid="${id}"]`);

    if (!targetDot) return;

    // 1. CLEAR AND APPLY CLASS
    overlay.className = 'speech-bubble'; 
    
    // 2. ATTACH TO MAP (Ensures it moves when panned/zoomed)
    document.getElementById('map-img').appendChild(overlay);

    // 3. POSITIONING - Set it to the exact dot coordinates
    overlay.style.left = targetDot.style.left;
    overlay.style.top = targetDot.style.top;
    overlay.style.display = 'block';
    
    // 4. CONTENT (Your Montserrat Bold Grid)
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#0f6; margin-bottom:10px; letter-spacing:2px; font-size:1rem; text-align:center;">AGENT PROFILE</h3>
        
        <div style="text-align:left; margin-bottom:12px;">
            <label style="font-size:0.6rem; color:#888; display:block; margin-bottom:5px;">IDENTIFICATION</label>
            <input type="text" id="edit-agent-name" value="${name}" placeholder="e.g. JUAN - GYM"
                style="width:100%; background:rgba(0,0,0,0.5); border:1px solid #333; color:#0f6; padding:8px; font-family:'Montserrat', sans-serif; font-size:0.8rem; outline:none;">
        </div>

        <p style="text-align:left; font-size:0.75em; line-height:1.4; margin-bottom:10px;">
            <span style="color:#888;">STATUS:</span> <span id="status-display" style="color:#0f6; font-weight:bold;">${status}</span><br>
            <span style="color:#888;">LAST SEEN:</span> ${time}
        </p>

        <h6 style="font-family:'Montserrat', sans-serif; color:#0f6; letter-spacing:1px; margin-bottom:10px; font-size:0.7rem; text-align:center;">RECLASSIFY AGENT</h6>

        <div class="tactical-status-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:15px;">
            <div class="status-block green" onclick="updateTriage(0)" style="border:1px solid #0f6; color:#0f6; padding:8px; cursor:pointer; font-size:0.6rem; text-align:center; font-weight:bold;">MINOR</div>
            <div class="status-block yellow" onclick="updateTriage(1)" style="border:1px solid #ff0; color:#ff0; padding:8px; cursor:pointer; font-size:0.6rem; text-align:center; font-weight:bold;">DELAYED</div>
            <div class="status-block red" onclick="updateTriage(2)" style="border:1px solid #f33; color:#f33; padding:8px; cursor:pointer; font-size:0.6rem; text-align:center; font-weight:bold;">IMMEDIATE</div>
            <div class="status-block black" onclick="updateTriage(3)" style="border:1px solid #888; color:#888; padding:8px; cursor:pointer; font-size:0.6rem; text-align:center; font-weight:bold;">DECEASED</div>
        </div>

        <button onclick="updateAgentIdentity()" class="btn-save" 
            style="font-family: 'Montserrat', sans-serif; border:1px solid #0f6; color:#0f6; background:rgba(0,255,102,0.1); width:100%; padding:10px; margin-bottom:6px; font-weight:bold; cursor:pointer; font-size:0.6rem; text-transform:uppercase;">
            SAVE IDENTITY
        </button>
        
        <button onclick="deleteAgent()" class="btn-delete"
            style="font-family: 'Montserrat', sans-serif; border:1px solid #f33; color:#f33; background:rgba(255,51,51,0.1); width:100%; padding:10px; font-weight:bold; cursor:pointer; font-size:0.6rem; text-transform:uppercase;">
            DELETE AGENT
        </button>
    `;
}

function updateTriage(newType) {
    if (!currentSelectedAgentId) return;

    // Use ONE consistent variable name
    const dotContainer = document.querySelector(`[data-uuid="${currentSelectedAgentId}"]`);
    
    // Safety check: if the dot doesn't exist, kill the function
    if (!dotContainer) {
        console.error("[CRITICAL] Agent UUID not found in DOM.");
        return;
    }

    // 1. Swap the Class for the container
    const classMap = ['green', 'yellow', 'red', 'black'];
    dotContainer.classList.remove('green', 'yellow', 'red', 'black');
    dotContainer.classList.add(classMap[newType]);

    // 2. Update the metadata for saveState()
    dotContainer.dataset.type = newType;

    // 3. Update the visual appearance of the inner dot
    const dotInner = dotContainer.querySelector('div');
    const colors = ['#0f6', '#ff0', '#f33', '#888']; // Standard ORACLE palette
    const newColor = colors[newType];
    
    if (dotInner) {
        dotInner.style.backgroundColor = newColor;
        dotInner.style.boxShadow = `0 0 15px ${newColor}`;
    }

    // 4. Update the Speech Bubble Display
    const triageStatus = ["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"][newType];
    const statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
        statusDisplay.innerText = triageStatus;
        statusDisplay.style.color = newColor; // Visual sync
    }
    
    // 5. Commit to LocalStorage
    saveState(); 
    setTimeout(() => {
        document.getElementById('intel-overlay').style.display = 'none'; 
    }, 500);

    console.log(`[SYSTEM] Agent ${currentSelectedAgentId} reclassified to ${triageStatus}.`);
}

function updateAgentIdentity() {
    if (!currentSelectedAgentId) return;

    const newName = document.getElementById('edit-agent-name').value;
    const dotContainer = document.querySelector(`[data-uuid="${currentSelectedAgentId}"]`);
    
    // Safety check for the container before looking for the label
    if (dotContainer && newName.trim() !== "") {
        const label = dotContainer.querySelector('.triage-label');
        const displayedName = newName.split(' - ')[0].trim() || "AGENT";

        // Update Dataset for persistence
        dotContainer.dataset.agent = newName;

        // Update visual label
        if (label) {
            label.innerText = displayedName;
        }

        saveState(); // Commit changes to LocalStorage

        // Identity Feedback
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.innerText = "IDENTITY SECURED";
            saveBtn.style.background = "#0f6";
            saveBtn.style.color = "#000";
        }

        setTimeout(() => {
            document.getElementById('intel-overlay').style.display = 'none';
        }, 600);
    }
}

async function deleteAgent() {
    // We use your tacticalPrompt instead of the browser's confirm()
    const confirmed = await tacticalPrompt(
        "DELETE AGENT", 
        "ARE YOU SURE YOU WANT TO DELETE THIS AGENT FROM THE GRID?", 
        false // This tells the prompt NOT to show a text input
    );

    if (confirmed) {
        // Find the dot using the UUID we locked in showIntel
        const dotContainer = document.querySelector(`[data-uuid="${currentSelectedAgentId}"]`);
        
        if (dotContainer) {
            // Visual feedback: shrink before disappearing
            const dotInner = dotContainer.querySelector('div');
            dotInner.style.transform = "scale(0)";
            dotInner.style.transition = "transform 0.3s ease";

            setTimeout(() => {
                dotContainer.remove();
                saveState(); // This recalculates HUD counts automatically
                document.getElementById('intel-overlay').style.display = 'none';
                console.log(`[SYSTEM] Agent ${currentSelectedAgentId} deleted successfully.`);
            }, 300);
        }
    }
}

// --- 🏛️ SYSTEM OVERLAYS (STATIC CENTER) ---
function generatetacticalQR() {
    showSystemData('DATALINK');
}

function showHelp() {
    showSystemData('HELP');
}

function showIntelligenceReport() {
    showSystemData('UPDATES');
}

function showAbout() {
    showSystemData('ABOUT');
}

function showSystemData(type) {
    let staticBox = document.getElementById('static-system-overlay');
    if (!staticBox) {
        staticBox = document.createElement('div');
        staticBox.id = 'static-system-overlay';
        staticBox.className = 'static-overlay';
        document.body.appendChild(staticBox);
    }
    
    staticBox.style.zIndex = "99999";
    staticBox.style.display = 'block';
    let content = "";
    let b64 = ""; 

    if (type === 'DATALINK') {
        const data = localStorage.getItem('ORACLE_GRID_DATA');
        const hasData = data && data !== "[]";
        b64 = hasData ? btoa(data) : "";
        
        // Merged logic: Using your specific text and styling
        content = `
            <h3 style="font-family:'Cinzel', serif; color:#0f6; text-align:center;">DATA LINK</h3>
            ${hasData ? `
                <div style="background:white; padding:10px; display:block; margin: 0 auto 10px auto; width: fit-content;">
                    <div id="qr-static"></div>
                </div>
                <button onclick="copyToClipboard('${b64}')" class="sync-copy-btn" style="width:100%;">COPY DATA STRING</button>
            ` : `<p style="font-size:0.8em; color:#888; text-align:center; margin: 20px 0;">[ NO LOCAL DATA TO SHARE ]</p>`}
            
            <div style="margin-top:20px; border-top:1px solid #333; padding-top:15px;">
                <button onclick="document.getElementById('static-system-overlay').style.display='none'; importTacticalGrid();" 
                class="close-intel" 
                style="border-color:#ffa500; color:#ffa500; width:100%; margin-bottom:10px; cursor:pointer; background:transparent;">
                IMPORT SECTOR DATA</button>
            </div>
        `;
    }
    else if (type === 'ABOUT') {
        content = `
            <h3 style="color:#0f6; font-family:'Cinzel'; text-align:center; border-bottom:1px solid #0f6; padding-bottom:5px;">SYSTEM OVERVIEW</h3>
            <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.4; max-height:380px; overflow-y:auto; padding-right:5px; color:#ccc;">
                <p style="font-size:0.8rem; margin-bottom:15px;">CMSHS ORACLE is a simple yet specialized <b>Progressive Web App (PWA)</b> developed for emergencies in CMSHS. It provides a high-visibility, tactical interface for real-time triage tracking and personnel location.</p>
                <p style="color:#0f6; font-weight:bold; font-size:0.75rem;">CORE CAPABILITIES</p>
                <ul style="padding-left:15px; margin-bottom:15px; font-size:0.8rem;">
                    <li><b>OFFLINE-FIRST:</b> Operates in "Air-Gapped" environments without data/Wi-Fi.</li>
                    <li><b>AGENT PLOTTING:</b> Precision coordinate placement with triage color-coding.</li>
                    <li><b>AGENT DOSSIERS:</b> Interactive tap-to-view intelligence popups.</li>
                    <li><b>GEOSPATIAL SYNC:</b> Zoom-calibrated scaling for sector analysis.</li>
                </ul>
                <p style="color:#0f6; font-weight:bold; font-size:0.75rem;">DEPLOYMENT</p>
                <ol style="padding-left:15px; margin-bottom:15px; font-size:0.8rem;">
                    <li>Scan Admin QR Code.</li>
                    <li>Wait for ORACLE Initialization Sequence.</li>
                    <li>Select "Add to Home Screen" for native installation.</li>
                </ol>
                <p style="color:#ffa500; font-weight:bold; font-size:0.75rem;">PHILOSOPHY</p>
                <p style="font-style:italic; font-size:0.8rem; border-left: 2px solid #ffa500; padding-left:10px; margin-bottom:10px;">
                    "Objective judgment, now at this very moment. Unselfish action, now at this very moment. Willing acceptance—now at this very moment—of all external events. That’s all you need." — Marcus Aurelius
                </p>
                <p style="font-size:0.75rem; margin-bottom:15px; opacity:0.8;">ORACLE was built to provide clarity in chaos. A tool for the disciplined, designed for calm, effective action.</p>
                <hr style="border:0; border-top:1px solid #333; margin:10px 0;">
                <p style="font-size:0.7rem; margin:0;"><b>DEVELOPED BY:</b> Mark Justin L. Castillo, 12 - Planck</p>
                <p style="font-size:0.7rem; margin:0;"><b>INSTITUTION:</b> CMSHS</p>
                <p style="font-size:0.7rem; margin:0;"><b>S.Y.</b> 2025–2026</p>
            </div>
        `;
    }
    else if (type === 'HELP') {
        content = `
            <h3 style="font-family:'Cinzel', serif; color:#ffa500; text-align:center; border-bottom:1px solid #ffa500; padding-bottom:5px;">ORACLE MANUAL</h3>
            <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.4; max-height:350px; overflow-y:auto; padding-right:5px; color:#ccc;">
                <p style="color:#0f6; font-weight:bold; margin-top:10px;">USAGE</p>
                <ul style="padding-left:15px; margin-bottom:10px;">
                    <li><b>Plot Incident:</b> Double-tap map.</li>
                    <li><b>Change Triage:</b> Use footer HUD before plotting.</li>
                    <li><b>Move Map:</b> Drag with one finger/mouse.</li>
                    <li><b>Zoom:</b> Pinch-to-zoom / Scroll wheel.</li>
                </ul>
                <p style="color:#0f6; font-weight:bold;">SYNCING</p>
                <ul style="padding-left:15px; margin-bottom:10px;">
                    <li><b>Exporting:</b> SHARE REPORT -> QR/String.</li>
                    <li><b>Importing:</b> IMPORT SECTOR DATA -> Paste String.</li>
                </ul>
                <p style="color:#ff3333; font-weight:bold;">TROUBLESHOOTING</p>
                <ul style="padding-left:15px;">
                    <li><b>Lost on Map:</b> Refresh page to reset.</li>
                    <li><b>Dots Missing:</b> Disable Incognito mode.</li>
                    <li><b>Merge Conflict:</b> Ensure string is copied, perform RESET OPERATIONAL DATA and re-paste.</li>
                    <li><b>System Lag:</b> Perform RESET OPERATIONAL DATA.</li>
                </ul>
            </div>
        `;
    }
    else if (type === 'UPDATES') {
        content = `
            <h3 style="font-family:'Cinzel'; color:#0f6; text-align:center; border-bottom:1px solid #0f6; padding-bottom:5px;">SYSTEM LOG</h3>
            <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.6; color:#ccc; margin-top:10px;">
                <p><b style="color:#0f6;">[v18.8]</b> <span style="color:#fff;">UI ARCHITECTURE:</span> Separated Geospatial and Global overlays. System data now screen-locked.</p>
                <p><b style="color:#0f6;">[v18.8]</b> <span style="color:#fff;">CRUD PROTOCOL:</span> Dynamic Agent modification and UUID-locked syncing active.</p>
                <p><b style="color:#0f6;">[v18.7]</b> <span style="color:#fff;">REPORT ENGINE:</span> Confirm-only tactical modals deployed.</p>
                <p><b style="color:#0f6;">[v18.6]</b> <span style="color:#fff;">BOOT SEQUENCE:</span> One-time cinematic session persistence active.</p>
                <hr style="border:0; border-top:1px solid #333; margin:10px 0;">
                <p style="font-size:0.7em; opacity:0.6; text-align:center;">ORACLE STATUS: OPTIMIZED</p>
            </div>
        `;
    }

    const dismissBtn = `<div class="close-intel" 
        onclick="document.getElementById('static-system-overlay').style.display='none'" 
        style="margin-top:15px; text-align:center; display:block; cursor:pointer; padding:15px; background:rgba(255,255,255,0.1); border-radius:5px; font-weight:bold;">
        DISMISS
    </div>`;

    staticBox.innerHTML = content + dismissBtn;

    // Unified Render
    staticBox.innerHTML = content + `<div class="close-intel" onclick="this.parentElement.style.display='none'" style="margin-top:10px; text-align:center; display:block; cursor:pointer;">DISMISS</div>`;

    // --- 🧬 ROBUST QR GENERATOR ENGINE ---
    if (type === 'DATALINK' && b64) {
        setTimeout(() => {
            const qrBox = document.getElementById('qr-static');
            if (qrBox) {
                try {
                    // Level 'L' (Low) is the most compact and allows the most data.
                    // We use version 0 (auto), but the library needs a little help for base64.
                    let qr = qrcode(0, 'L'); 
                    qr.addData(b64);
                    qr.make();
                    
                    // cellSize 3 keeps the image from getting too massive visually
                    qrBox.innerHTML = qr.createImgTag(3, 4); 
                } catch (qrErr) {
                    console.error("QR Sync Limit Reached:", qrErr);
                    // Fallback: If data is TOO big for a QR, show a warning
                    qrBox.innerHTML = `
                        <div style="color:#ff3333; font-size:0.7rem; border:1px dashed #ff3333; padding:10px;">
                            CRITICAL: DATA DENSITY EXCEEDS QR CAPACITY.<br>
                            USE "COPY DATA STRING" INSTEAD.
                        </div>`;
                }
                
                // Style the resulting image
                const qrImg = qrBox.querySelector('img');
                if (qrImg) {
                    qrImg.style.maxWidth = "100%";
                    qrImg.style.height = "auto";
                    qrImg.style.display = "block";
                    qrImg.style.margin = "0 auto";
                }
            }
        }, 50);
    }
}

// --- DATA LINK & TRUE MERGE ENGINE ---

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
            await tacticalPrompt("DATA INTEGRATION REPORT", "NO NEW UNIQUE PLOTS DETECTED. CMSHS GRID IS CURRENT.", false, "", true);
        } else {
            localStorage.setItem('ORACLE_GRID_DATA', JSON.stringify(masterData));
            const masterCounts = [0, 0, 0, 0];
            masterData.forEach(d => {
                const t = parseInt(d.type);
                if (!isNaN(t)) masterCounts[t]++;
            });
            localStorage.setItem('ORACLE_STATS', JSON.stringify(masterCounts));
            
            await tacticalPrompt("CMSHS GRID UPDATED", `${integratedPlots} NEW PLOT(S) INTEGRATED INTO CMSHS GRID.`, false, "", true);
            
            sessionStorage.setItem('FAST_BOOT', 'true');
            location.reload(); 
        }
    } catch (e) { 
        console.error("LEAD UPLINK ERROR:", e);
        await tacticalPrompt("CRITICAL ERROR", "DATA STRING CORRUPT OR INCOMPATIBLE.", false, "", true); 
    }
}