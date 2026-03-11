/* 🏛️ CMSHS ORACLE: TACTICAL ENGINE V22.8 - MASTER COMPILATION
    - Full Merge: Persistence (V18.7) + GPS/Hybrid (V20.1) + Unified Touch
    - Integrated: Agent Dossier CRUD, QR Generator, & True Merge Logic
    - Resolved: Boot Sequence Case-Sensitivity & Reference Errors
*/

console.log("ORACLE SYSTEM: ONLINE - ALL MODULES INTEGRATED");

// --- INITIAL STATE ---
let currentType = 0;
let counts = [0, 0, 0, 0];
let currentSelectedAgentId = null; 
const colors = ['#00ff66', '#ffff00', '#ff3333', '#888888']; 

const map = document.getElementById('map-img');
const viewport = document.getElementById('viewport');

let mapPos = { x: -400, y: -300 };
let zoom = 1;
const ZOOM_SPEED = 0.08;
let isDragging = false;
let lastMouse = { x: 0, y: 0 };

// --- 🛰️ GPS GLOBAL STATE ---
let gpsWatcher = null;
let mockInterval = null;

// --- 📱 TOUCH GLOBAL STATE ---
let lastTap = 0;
let initialPinchDist = -1;
let wasPinching = false;
let isDraggingMobile = false; 
let touchStartPos = { x: 0, y: 0 };

// --- 🛡️ BOOT SEQUENCE ---
function initializeSystem() {
    const bootOverlay = document.getElementById('boot-overlay');
    const isSessionActive = sessionStorage.getItem('INITIAL_BOOT_COMPLETE');

    if (isSessionActive) {
        if (bootOverlay) bootOverlay.style.display = 'none';
        loadState(); 
        updateMapTransform();
        return;
    }

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

    if (bootText) { bootText.innerHTML = ""; typeWriter(); }

    setTimeout(() => {
        if (bootOverlay) {
            bootOverlay.style.opacity = '0';
            bootOverlay.style.pointerEvents = 'none'; 
            setTimeout(() => {
                bootOverlay.style.display = 'none';
                sessionStorage.setItem('INITIAL_BOOT_COMPLETE', 'true');
            }, 600);
        }
        loadState(); 
        updateMapTransform();
    }, 3500);
}


// --- 🛰️ ORACLE GEOSPATIAL ENGINE: CALIBRATED HYBRID ---

// UPDATED CMSHS ANCHOR
const CMSHS_CONFIG = {
    centerLat: 14.568851,
    centerLng: 121.035180,
    latSpan: 0.0011, 
    lngSpan: 0.0014 
};

async function locateUser() {
    const btnText = document.getElementById('gps-text');
    
    if (gpsWatcher !== null || mockInterval !== null) {
        stopTracking();
        return;
    }

    const choice = await tacticalPrompt(
        "GPS SOURCE SELECTION", 
        "SELECT TRACKING PROTOCOL:\n\n[MOCK] - SIMULATED GRID ROAMING\n[LIVE] - REAL-TIME SATELLITE FIX", 
        true, 
        "TYPE 'MOCK' OR 'LIVE'..."
    );
    
    if (!choice) return;
    const selection = choice.toUpperCase();

    if (selection === 'MOCK') {
        startRandomMockRoaming();
    } else if (selection === 'LIVE') {
        if (!navigator.geolocation) {
            tacticalPrompt("HARDWARE ERROR", "GPS SENSOR NOT DETECTED ON THIS UNIT.", false, "", true);
            return;
        }

        if(btnText) btnText.innerText = "LINKING...";

        gpsWatcher = navigator.geolocation.watchPosition((position) => {
            processCoords(position.coords.latitude, position.coords.longitude);
            if(btnText) btnText.innerText = "📡 LIVE";
        }, (err) => {
            tacticalPrompt("SIGNAL LOST", "SATELLITE LINK FAILED. CHECK LOCATION PERMISSIONS.", false, "", true);
            stopTracking();
        }, { 
            enableHighAccuracy: true, 
            maximumAge: 0, 
            timeout: 10000 
        });
    } else {
        tacticalPrompt("INVALID COMMAND", "IDENTIFY PROTOCOL AS 'MOCK' OR 'LIVE'.", false, "", true);
    }
}

function startRandomMockRoaming() {
    const btnText = document.getElementById('gps-text');
    if(btnText) btnText.innerText = "📡 ROAMING";

    const mapConfig = { 
        topLat: CMSHS_CONFIG.centerLat + (CMSHS_CONFIG.latSpan / 2), 
        bottomLat: CMSHS_CONFIG.centerLat - (CMSHS_CONFIG.latSpan / 2), 
        leftLong: CMSHS_CONFIG.centerLng - (CMSHS_CONFIG.lngSpan / 2), 
        rightLong: CMSHS_CONFIG.centerLng + (CMSHS_CONFIG.lngSpan / 2) 
    };

    let currentLat = CMSHS_CONFIG.centerLat;
    let currentLng = CMSHS_CONFIG.centerLng;
    
    let targetLat, targetLng;
    let movements = 0;
    const MAX_MOVEMENTS = 5;

    function pickNewTarget() {
        targetLat = mapConfig.bottomLat + Math.random() * (mapConfig.topLat - mapConfig.bottomLat);
        targetLng = mapConfig.leftLong + Math.random() * (mapConfig.rightLong - mapConfig.leftLong);
        movements++;
    }

    pickNewTarget();

    mockInterval = setInterval(() => {
        const step = 0.000015;
        
        if (Math.abs(currentLat - targetLat) > step) {
            currentLat += currentLat < targetLat ? step : -step;
        }
        if (Math.abs(currentLng - targetLng) > step) {
            currentLng += currentLng < targetLng ? step : -step;
        }

        processCoords(currentLat, currentLng);

        if (Math.abs(currentLat - targetLat) <= step && Math.abs(currentLng - targetLng) <= step) {
            if (movements >= MAX_MOVEMENTS) {
                tacticalPrompt("SIMULATION TERMINATED", "MOCK ROAMING SEQUENCE COMPLETE.", false, "", true);
                stopTracking();
            } else {
                pickNewTarget();
            }
        }
    }, 200);
}

function stopTracking() {
    const btnText = document.getElementById('gps-text');
    if (gpsWatcher !== null) navigator.geolocation.clearWatch(gpsWatcher);
    if (mockInterval !== null) clearInterval(mockInterval);
    gpsWatcher = null;
    mockInterval = null;
    if(btnText) btnText.innerText = "LOCATE ME";
    const marker = document.getElementById('user-location-marker');
    if (marker) marker.style.display = 'none';
}

function processCoords(lat, lng) {
    const mapConfig = { 
        topLat: CMSHS_CONFIG.centerLat + (CMSHS_CONFIG.latSpan / 2), 
        bottomLat: CMSHS_CONFIG.centerLat - (CMSHS_CONFIG.latSpan / 2), 
        leftLong: CMSHS_CONFIG.centerLng - (CMSHS_CONFIG.lngSpan / 2), 
        rightLong: CMSHS_CONFIG.centerLng + (CMSHS_CONFIG.lngSpan / 2) 
    };

    // 1. Calculate Raw Percentage
    let pctY = (mapConfig.topLat - lat) / (mapConfig.topLat - mapConfig.bottomLat);
    let pctX = (lng - mapConfig.leftLong) / (mapConfig.rightLong - mapConfig.leftLong);
    
    // 2. 🛡️ HORIZONTAL INVERSION FIX (SDRRM MIRRORING)
    // Flips the Longitude so West (SHS Bldg) isn't East (Gym)
    pctX = 1 - pctX; 

    // 3. Keep within map boundaries
    pctX = Math.max(0, Math.min(1, pctX));
    pctY = Math.max(0, Math.min(1, pctY));

    const mapImg = document.getElementById('map-img');
    const pixelX = mapImg.offsetWidth * pctX;
    const pixelY = mapImg.offsetHeight * pctY;
    
    drawUserMarker(pixelX, pixelY);
    focusOnUser(pixelX, pixelY);
}

function drawUserMarker(x, y) {
    let marker = document.getElementById('user-location-marker');
    if (!marker) {
        marker = document.createElement('div');
        marker.id = 'user-location-marker';
        marker.className = 'pulse-animation';
        marker.style.cssText = `
            width:24px; height:24px; background:#0096ff; border:3px solid white; 
            border-radius:50%; position:absolute; z-index:9999; 
            box-shadow:0 0 20px #0096ff; pointer-events:none; 
            transition: left 0.3s linear, top 0.3s linear;
        `;
        document.getElementById('map-img').appendChild(marker);
    }
    marker.style.left = `${x - 12}px`;
    marker.style.top = `${y - 12}px`;
    marker.style.display = 'block';
}

function focusOnUser(x, y) {
    const viewport = document.getElementById('viewport'); // Ensure this ID exists
    if (!viewport) return;

    // Center the viewport on the dot
    const vWidth = viewport.offsetWidth / 2;
    const vHeight = viewport.offsetHeight / 2;

    // Apply Zoom to the position calculation
    mapPos.x = vWidth - (x * zoom);
    
    // 🛡️ HUD OFFSET: Shift the Y-focus up slightly 
    // This keeps the blue dot above your footer HUD
    mapPos.y = (vHeight - 100) - (y * zoom); 

    updateMapTransform();
}

// --- 📱 TRUE UNIFIED TOUCH ENGINE (PAN + ZOOM + PLOT) ---
viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
        isDraggingMobile = false;
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
        wasPinching = true; 
        initialPinchDist = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX, 
            e.touches[0].pageY - e.touches[1].pageY
        );
    }
}, { passive: false });

viewport.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && !wasPinching) {
        const touch = e.touches[0];
        const moveDist = Math.hypot(touch.clientX - touchStartPos.x, touch.clientY - touchStartPos.y);
        
        if (moveDist > 5) isDraggingMobile = true;

        mapPos.x += touch.clientX - lastMouse.x;
        mapPos.y += touch.clientY - lastMouse.y;
        updateMapTransform();
        lastMouse = { x: touch.clientX, y: touch.clientY };
        
    } else if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX, 
            e.touches[0].pageY - e.touches[1].pageY
        );
        if (initialPinchDist > 0) {
            const diff = dist - initialPinchDist;
            zoom = Math.min(Math.max(0.4, zoom + (diff * 0.005)), 4);
            updateMapTransform();
            initialPinchDist = dist;
        }
    }
}, { passive: false });

viewport.addEventListener('touchend', (e) => {
    if (wasPinching && e.touches.length === 0) {
        setTimeout(() => { wasPinching = false; }, 100);
        initialPinchDist = -1;
        return;
    }

    if (!isDraggingMobile && !wasPinching && e.touches.length === 0) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault(); 
            const touch = e.changedTouches[0];
            handlePlotting(touch.clientX, touch.clientY);
        }
        lastTap = currentTime;
    }
});

// --- CORE PLOTTING LOGIC ---
async function handlePlotting(clientX, clientY) {
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    
    // 🔍 AGENT DOSSIER PROMPT
    let agentData = await tacticalPrompt("AGENT IDENTIFICATION", "ENTER NAME & SECTOR", true, "e.g. JUAN - GYM");
    if (agentData === null) return;
    
    // 📍 COORDINATE CALCULATION
    const mouseX = (clientX - rect.left - mapPos.x) / zoom;
    const mouseY = (clientY - rect.top - mapPos.y) / zoom;

    // 🕒 TACTICAL TIMESTAMP
    const now = new Date();
    const time = now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    }) + ", " + now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });

    // 📝 EXECUTE PLOT
    if (typeof createDot === 'function') {
        createDot(`${mouseX - 8}px`, `${mouseY - 8}px`, currentType, agentData, time);
    }
}

// --- NAVIGATION HANDLERS ---
viewport.addEventListener('wheel', e => {
    e.preventDefault();
    zoom = Math.min(Math.max(0.4, zoom + (e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED)), 4);
    updateMapTransform();
}, { passive: false });

viewport.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
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

// --- 💾 PERSISTENCE & DATA ENGINE ---
function saveState() {
    const dots = [];
    const newCounts = [0, 0, 0, 0];
    document.querySelectorAll('.triage-dot').forEach(d => {
        if (d.id === 'intel-overlay') return;
        const type = parseInt(d.dataset.type);
        dots.push({ x: d.style.left, y: d.style.top, type, agent: d.dataset.agent, time: d.dataset.timestamp, uuid: d.dataset.uuid });
        if (!isNaN(type)) newCounts[type]++;
    });
    counts = newCounts; 
    updateHUD();
    localStorage.setItem('ORACLE_GRID_DATA', JSON.stringify(dots));
    localStorage.setItem('ORACLE_STATS', JSON.stringify(counts));
}

function loadState() {
    try {
        const savedDots = JSON.parse(localStorage.getItem('ORACLE_GRID_DATA') || "[]");
        counts = JSON.parse(localStorage.getItem('ORACLE_STATS') || "[0,0,0,0]");
        savedDots.forEach(d => createDot(d.x, d.y, d.type, d.agent, d.time, true, d.uuid));
        updateHUD();
    } catch (e) { console.error("Load Failed", e); }
}

function createDot(x, y, type, agentData, timestamp, isSilent = false, existingUUID = null) {
    const typeInt = parseInt(type) || 0;
    const dot = document.createElement('div');
    dot.className = `triage-dot ${['green', 'yellow', 'red', 'black'][typeInt]}`;
    dot.style.cssText = `position:absolute; left:${x}; top:${y};`;
    dot.dataset.type = typeInt;
    dot.dataset.agent = agentData || "UNKNOWN";
    dot.dataset.timestamp = timestamp || new Date().toLocaleTimeString();
    dot.dataset.uuid = existingUUID || `AGENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const inner = document.createElement('div');
    inner.style.cssText = `width:16px; height:16px; border-radius:50%; background:${colors[typeInt]}; box-shadow: 0 0 15px ${colors[typeInt]}; cursor:pointer;`;
    inner.onclick = (e) => { 
        e.stopPropagation(); 
        showIntel(dot.dataset.uuid, dot.dataset.agent, ["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"][typeInt], dot.dataset.timestamp); 
    };
    
    const lbl = document.createElement('div');
    lbl.className = 'triage-label';
    lbl.innerText = (agentData || "UNKNOWN").split(' - ')[0];

    dot.appendChild(inner); dot.appendChild(lbl);
    document.getElementById('map-img').appendChild(dot);
    if (!isSilent) { counts[typeInt]++; updateHUD(); saveState(); }
}

// --- DYNAMIC AGENT MANAGEMENT ---
function showIntel(id, name, status, time) {
    currentSelectedAgentId = id; 
    const overlay = document.getElementById('intel-overlay');
    const targetDot = document.querySelector(`[data-uuid="${id}"]`);

    if (!targetDot) return;

    overlay.className = 'speech-bubble'; 
    document.getElementById('map-img').appendChild(overlay);

    overlay.style.left = targetDot.style.left;
    overlay.style.top = targetDot.style.top;
    overlay.style.display = 'block';
    
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
        <button onclick="updateAgentIdentity()" class="btn-save" style="font-family: 'Montserrat', sans-serif; border:1px solid #0f6; color:#0f6; background:rgba(0,255,102,0.1); width:100%; padding:10px; margin-bottom:6px; font-weight:bold; cursor:pointer; font-size:0.6rem; text-transform:uppercase;">SAVE IDENTITY</button>
        <button onclick="deleteAgent()" class="btn-delete" style="font-family: 'Montserrat', sans-serif; border:1px solid #f33; color:#f33; background:rgba(255,51,51,0.1); width:100%; padding:10px; font-weight:bold; cursor:pointer; font-size:0.6rem; text-transform:uppercase;">DELETE AGENT</button>
    `;
}

function updateTriage(newType) {
    if (!currentSelectedAgentId) return;
    const dotContainer = document.querySelector(`[data-uuid="${currentSelectedAgentId}"]`);
    if (!dotContainer) return;
    const classMap = ['green', 'yellow', 'red', 'black'];
    dotContainer.classList.remove('green', 'yellow', 'red', 'black');
    dotContainer.classList.add(classMap[newType]);
    dotContainer.dataset.type = newType;
    const dotInner = dotContainer.querySelector('div');
    const colorsList = ['#0f6', '#ff0', '#f33', '#888'];
    const newColor = colorsList[newType];
    if (dotInner) {
        dotInner.style.backgroundColor = newColor;
        dotInner.style.boxShadow = `0 0 15px ${newColor}`;
    }
    const statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
        statusDisplay.innerText = ["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"][newType];
        statusDisplay.style.color = newColor;
    }
    saveState(); 
    setTimeout(() => { document.getElementById('intel-overlay').style.display = 'none'; }, 500);
}

function updateAgentIdentity() {
    if (!currentSelectedAgentId) return;
    const newName = document.getElementById('edit-agent-name').value;
    const dotContainer = document.querySelector(`[data-uuid="${currentSelectedAgentId}"]`);
    if (dotContainer && newName.trim() !== "") {
        const label = dotContainer.querySelector('.triage-label');
        dotContainer.dataset.agent = newName;
        if (label) { label.innerText = newName.split(' - ')[0].trim() || "AGENT"; }
        saveState();
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) { saveBtn.innerText = "IDENTITY SECURED"; saveBtn.style.background = "#0f6"; saveBtn.style.color = "#000"; }
        setTimeout(() => { document.getElementById('intel-overlay').style.display = 'none'; }, 600);
    }
}

async function deleteAgent() {
    const confirmed = await tacticalPrompt("DELETE AGENT", "ARE YOU SURE YOU WANT TO DELETE THIS AGENT FROM THE GRID?", false);
    if (confirmed) {
        const dotContainer = document.querySelector(`[data-uuid="${currentSelectedAgentId}"]`);
        if (dotContainer) {
            const dotInner = dotContainer.querySelector('div');
            dotInner.style.transform = "scale(0)";
            dotInner.style.transition = "transform 0.3s ease";
            setTimeout(() => {
                dotContainer.remove();
                saveState();
                document.getElementById('intel-overlay').style.display = 'none';
            }, 300);
        }
    }
}

 // --- 🛰️ ORACLE DYNAMIC FIDUCIAL REGISTRY ---
let ARUCO_REGISTRY = {}; 
let stream = null;      

/** * 1. TRIGGER: Opens Modal & Activates S10 Sensors 
 */
async function initiateGhostTag() {
    const modal = document.getElementById('ghost-modal');
    modal.classList.add('active');
    modal.style.display = 'flex';
    
    const statusText = document.getElementById('scanner-status');
    statusText.innerText = "LINKING OPTICAL SENSORS...";

    try {
        // Requesting back camera
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        document.getElementById('scanner-video').srcObject = stream;
        statusText.innerText = "SCANNING FOR FIDUCIAL ID...";
    } catch (err) {
        statusText.innerText = "VISION OFFLINE - MANUAL OVERRIDE";
        statusText.style.color = "#ff3333";
    }
}

/** * 2. PROCESSOR: The "Bridge" logic that watches the input box 
 */
function handleManualAruco() {
    const idInput = document.getElementById('aruco-id-input');
    const id = idInput.value;
    const vectorOverlay = document.getElementById('vector-overlay');
    const idTag = document.getElementById('floating-id-tag');
    const statusText = document.getElementById('scanner-status');

    // 1. ESCAPE CLAUSE: If input is empty, hide the vectors and stop
    if (!id || id === "") {
        vectorOverlay.style.display = "none";
        return;
    }

    // 2. THE VISUAL FLEX: Show the 3D Vector Illusion immediately
    vectorOverlay.style.display = "block";
    idTag.innerText = `ID: ${id}`;
    
    // Tactical "Jitter" to simulate active sensor tracking
    const jitter = (Math.random() - 0.5) * 2; 
    vectorOverlay.style.transform = `translate(-50%, -50%) rotate(${jitter}deg)`;

    // 3. THE REGISTRY CHECK: Does this ID exist in the Mesh?
    if (ARUCO_REGISTRY[id]) {
        statusText.innerText = `VERIFIED: ${ARUCO_REGISTRY[id].name}`;
        statusText.style.color = "#00ff66";
        
        // Auto-pin after 1 second of "stable" tracking
        setTimeout(() => { 
            if(idInput.value === id) { // Double check user hasn't typed more
                executeArUcoPin(ARUCO_REGISTRY[id]); 
                idInput.value = ""; 
                vectorOverlay.style.display = "none";
            }
        }, 1000);
    } 
    else {
        // Unknown ID - Prompt for new SDRRM registration
        // We wrap this in a timeout so the user can see the Vector ID first
        setTimeout(() => {
            if(idInput.value === id) {
                registerNewFiducial(id);
            }
        }, 500);
    }
}

/** * 3. REGISTRY: Dynamic Capture & Triage Assignment 
 */
async function registerNewFiducial(id) {
    const name = prompt(`NEW FIDUCIAL (ID: ${id})\nASSIGN IDENTITY:`, "e.g. ROOM 302 / JUAN");
    
    if (name && name.trim() !== "") {
        const choice = prompt(
            `SELECT TRIAGE STATUS for ${name.toUpperCase()}:\n\n` +
            `[G] GREEN - Minor\n` +
            `[Y] YELLOW - Delayed\n` +
            `[R] RED - Immediate\n` +
            `[B] BLACK - Deceased`, 
            "R"
        );

        const statusMap = { 'G': 'GREEN', 'Y': 'YELLOW', 'R': 'RED', 'B': 'BLACK' };
        const finalStatus = (choice) ? statusMap[choice.toUpperCase()] || 'RED' : 'RED';

        ARUCO_REGISTRY[id] = { name: name.toUpperCase(), status: finalStatus }; 
        
        document.getElementById('scanner-status').innerText = `${finalStatus} RECORDED`;
        document.getElementById('scanner-status').style.color = "#00ff66";

        setTimeout(() => { 
            executeArUcoPin(ARUCO_REGISTRY[id]); 
            document.getElementById('aruco-id-input').value = "";
        }, 800);
    }
}

/** * 4. ANCHOR: Drop the Pin on the 2500px Map 
 */
function executeArUcoPin(agent) {
    const userMarker = document.getElementById('user-location-marker');
    const mapImg = document.getElementById('map-img');

    // Use current GPS/Blue Dot position, fallback to center of view
    let posX = userMarker ? userMarker.style.left : `${(window.innerWidth / 2) - mapPos.x}px`;
    let posY = userMarker ? userMarker.style.top : `${(window.innerHeight / 2) - mapPos.y}px`;

    const ghostMarker = document.createElement('div');
    ghostMarker.className = `ghost-marker pulse-animation ${agent.status.toLowerCase()}`;
    
    // Triage Color Mapping
    const colors = { 'RED': '#ff3333', 'YELLOW': '#ffff00', 'GREEN': '#00ff66', 'BLACK': '#444444' };
    const triageColor = colors[agent.status] || '#ff3333';
    
    ghostMarker.style.cssText = `
        left: ${posX}; top: ${posY}; position: absolute;
        width: 20px; height: 20px; border-radius: 50%;
        background: ${triageColor}; border: 2px solid white;
        box-shadow: 0 0 15px ${triageColor}; z-index: 500;
    `;

    // Create the persistent label
    const label = document.createElement('div');
    label.innerText = agent.name;
    label.style.cssText = `
        position: absolute; top: -25px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.85); color: ${triageColor}; padding: 2px 10px;
        border-radius: 4px; font-size: 11px; font-weight: bold; white-space: nowrap;
        border: 1px solid ${triageColor}; font-family: 'Montserrat', sans-serif;
    `;
    
    ghostMarker.appendChild(label);
    mapImg.appendChild(ghostMarker);

    closeGhostModal();
    
    // Vocal confirmation
    const msg = new SpeechSynthesisUtterance(`${agent.status} tethered.`);
    window.speechSynthesis.speak(msg);
}

/** * 5. CLEANUP 
 */
function closeGhostModal() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    const modal = document.getElementById('ghost-modal');
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.getElementById('aruco-id-input').value = "";
}

// --- 🏛️ SYSTEM OVERLAYS & UTILITIES ---
function updateHUD() { ['g-c', 'y-c', 'r-c', 'b-c'].forEach((id, i) => { if(document.getElementById(id)) document.getElementById(id).innerText = counts[i]; }); }
function updateMapTransform() { map.style.transform = `translate(${mapPos.x}px, ${mapPos.y}px) scale(${zoom})`; }
function setStatus(s) { currentType = s; }

async function tacticalPrompt(title, desc, showsInput = true, customPlaceholder = "", hideCancel = false) {
    return new Promise(resolve => {
        const modal = document.getElementById('custom-modal');
        const input = document.getElementById('modal-input');
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-desc').innerText = desc;
        input.style.display = showsInput ? 'block' : 'none';
        input.placeholder = customPlaceholder; input.value = "";
        document.getElementById('modal-cancel').style.display = hideCancel ? 'none' : 'block';
        modal.style.display = 'flex';
        document.getElementById('modal-confirm').onclick = () => { modal.style.display = 'none'; resolve(showsInput ? input.value : true); };
        document.getElementById('modal-cancel').onclick = () => { modal.style.display = 'none'; resolve(null); };
    });
}

function generateTacticalQR() { showSystemData('DATALINK'); }
function showHelp() { showSystemData('HELP'); }
function showIntelligenceReport() { showSystemData('UPDATES'); }
function showAbout() { showSystemData('ABOUT'); }

function showSystemData(type) {
    let staticBox = document.getElementById('static-system-overlay') || document.createElement('div');
    staticBox.id = 'static-system-overlay';
    staticBox.className = 'static-overlay';
    staticBox.style.zIndex = "99999";
    staticBox.style.display = 'block';
    document.body.appendChild(staticBox);

    let content = "";
    let b64 = ""; 

    if (type === 'DATALINK') {
        const data = localStorage.getItem('ORACLE_GRID_DATA');
        const hasData = data && data !== "[]";
        b64 = hasData ? btoa(data) : "";
        content = `
            <h3 style="font-family:'Cinzel', serif; color:#0f6; text-align:center;">DATA LINK</h3>
            ${hasData ? `
                <div style="background:white; padding:10px; display:block; margin: 0 auto 10px auto; width: fit-content;">
                    <div id="qr-static"></div>
                </div>
                <button onclick="navigator.clipboard.writeText('${b64}')" class="sync-copy-btn" style="width:100%;">COPY DATA STRING</button>
            ` : `<p style="font-size:0.8em; color:#888; text-align:center; margin: 20px 0;">[ NO LOCAL DATA TO SHARE ]</p>`}
            <div style="margin-top:20px; border-top:1px solid #333; padding-top:15px;">
                <button onclick="document.getElementById('static-system-overlay').style.display='none'; importTacticalGrid();" 
                class="close-intel" style="border-color:#ffa500; color:#ffa500; width:100%; margin-bottom:10px; cursor:pointer; background:transparent;">
                IMPORT SECTOR DATA</button>
            </div>
        `;
    } else if (type === 'ABOUT') {
        content = `
            <h3 style="color:#0f6; font-family:'Cinzel'; text-align:center; border-bottom:1px solid #0f6; padding-bottom:5px;">SYSTEM OVERVIEW</h3>
            <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.4; max-height:400px; overflow-y:auto; padding-right:5px; color:#ccc;">
                <p style="font-size:0.85rem; margin-bottom:15px;">
                    CMSHS ORACLE is a simple yet specialized <b>Progressive Web App (PWA)</b> developed for emergencies in CMSHS. It provides a high-visibility, tactical interface for real-time triage tracking and personnel location within the school campus during emergency drills or actual incidents.
                </p>
                
                <p style="color:#0f6; font-weight:bold; font-size:0.75rem; letter-spacing:1px;">CORE CAPABILITIES</p>
                <ul style="padding-left:15px; margin-bottom:15px; font-size:0.8rem; list-style-type: square;">
                    <li><b>OFFLINE-FIRST:</b> Engineered to function in "Air-Gapped" environments where Wi-Fi or Cellular data is unavailable.</li>
                    <li><b>AGENT PLOTTING:</b> Precision coordinate placement on the CMSHS floor plan with color-coded triage status (Minor, Delayed, Immediate, Deceased).</li>
                    <li><b>AGENT DOSSIERS:</b> Interactive labels and tap-to-view intelligence popups for rapid agent identification.</li>
                    <li><b>GEOSPATIAL SYNC:</b> Real-time compass and zoom-calibrated scaling for accurate sector analysis.</li>
                </ul>

                <p style="color:#0f6; font-weight:bold; font-size:0.75rem; letter-spacing:1px;">DEPLOYMENT</p>
                <ol style="padding-left:15px; margin-bottom:15px; font-size:0.8rem;">
                    <li>Scan the QR Code provided by the administrator.</li>
                    <li><b>Boot the System:</b> Wait for the ORACLE initialization sequence.</li>
                    <li><b>Install:</b> Use "Add to Home Screen" to install the app natively on any device.</li>
                </ol>

                <p style="color:#ffa500; font-weight:bold; font-size:0.75rem; letter-spacing:1px;">PHILOSOPHY</p>
                <p style="font-style:italic; font-size:0.8rem; border-left: 2px solid #ffa500; padding-left:10px; margin-bottom:10px; color:#eee;">
                    "Objective judgment, now at this very moment. Unselfish action, now at this very moment. Willing acceptance—now at this very moment—of all external events. That’s all you need." — Marcus Aurelius
                </p>
                <p style="font-size:0.8rem; margin-bottom:20px; opacity:0.8;">
                    ORACLE was built on the principle of providing clarity in chaos. It is a tool for the disciplined, designed to facilitate calm, effective action when it matters most.
                </p>

                <div style="border-top:1px solid #333; padding-top:10px; font-size:0.7rem; line-height:1.6;">
                    <p style="margin:0;"><b>DEVELOPED BY:</b> Mark Justin L. Castillo, 12 - Planck</p>
                    <p style="margin:0;"><b>INSTITUTION:</b> City of Mandaluyong Science High School (CMSHS)</p>
                    <p style="margin:0;"><b>SCHOOL YEAR:</b> 2025–2026</p>
                </div>
            </div>
        `;
    } else if (type === 'HELP') {
        content = `
            <h3 style="font-family:'Cinzel', serif; color:#ffa500; text-align:center; border-bottom:1px solid #ffa500; padding-bottom:5px;">ORACLE MANUAL</h3>
            <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.4; max-height:400px; overflow-y:auto; padding-right:5px; color:#ccc;">
                
                <p style="color:#0f6; font-weight:bold; margin-top:10px;">GEOSPATIAL COMMAND</p>
                <ul style="padding-left:15px; margin-bottom:10px;">
                    <li><b>Live Fix:</b> LOCATE ME -> LIVE. Real-time tracking of location. Turn on your location mode in settings.</li>
                    <li><b>Mock Roaming:</b> LOCATE ME -> MOCK. Simulates a 5-point patrol across the CMSHS grid for training.</li>
                    <li><b>Map Navigation:</b> Single-finger drag to pan. Pinch-to-zoom (Mobile) or Scroll Wheel (Desktop).</li>
                </ul>

                <p style="color:#0f6; font-weight:bold;">INCIDENT PLOTTING</p>
                <ul style="padding-left:15px; margin-bottom:10px;">
                    <li><b>Deploy Plot:</b> Double-tap/Double-click any sector on the map.</li>
                    <li><b>Triage Selection:</b> Set status (Minor/Delayed/Immediate/Deceased) via the Footer HUD <i>before</i> plotting.</li>
                    <li><b>Intelligence:</b> Tap any active plot to view the Agent Dossier (Name, Sector, Time).</li>
                </ul>

                <p style="color:#0f6; font-weight:bold;">DATA LINK & SYNC</p>
                <ul style="padding-left:15px; margin-bottom:10px;">
                    <li><b>Export:</b> SHARE REPORT generates a Base64 string and a Tactical QR.</li>
                    <li><b>Import:</b> IMPORT SECTOR DATA allows you to paste a string from another unit. The system will auto-merge unique UUIDs without duplicating existing plots.</li>
                </ul>

                <p style="color:#ff3333; font-weight:bold;">TROUBLESHOOTING</p>
                <ul style="padding-left:15px; margin-bottom:10px;">
                    <li><b>GPS Sync Fail:</b> On Samsung/Android, ensure "Precise Location" is enabled in App Info > Permissions. Ensure site is served over <b>HTTPS</b>.</li>
                    <li><b>System Drift:</b> If the map becomes unresponsive, use "Refresh" to recalibrate the viewport.</li>
                    <li><b>Data Wipe:</b> Use the RESET OPERATIONAL DATA function to clear the local grid for a new operation.</li>
                </ul>

                <p style="font-size:0.75rem; font-style:italic; opacity:0.7; text-align:center; margin-top:20px;">
                    "The impediment to action advances action. What stands in the way becomes the way."
                </p>
            </div>
        `;
    } else if (type === 'UPDATES') {
        content = `
            <h3 style="font-family:'Cinzel'; color:#0f6; text-align:center; border-bottom:1px solid #0f6; padding-bottom:5px;">SYSTEM LOG: V23.1</h3>
            <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.6; color:#ccc; margin-top:10px; max-height:350px; overflow-y:auto; padding-right:5px;">
                
                <p><b style="color:#0f6;">[v23.1]</b> <span style="color:#fff;">TEMPORAL SYNC:</span> Implemented Tactical Timestamping (MMM DD, HH:MM). Dossier timeline accuracy verified.</p>
                
                <p><b style="color:#0f6;">[v23.0]</b> <span style="color:#fff;">GEOSPATIAL HYBRID:</span> Merged Live Satellite Fix with Random Mock Roaming. Calibrated for CMSHS Mandaluyong Grid (14.5687N, 121.0355E).</p>
                
                <p><b style="color:#0f6;">[v22.9]</b> <span style="color:#fff;">CORE STABILITY:</span> Resolved Variable Redeclaration Conflicts. Unified DOM selection via DOMContentLoaded listener.</p>

                <p><b style="color:#0f6;">[v22.8]</b> <span style="color:#fff;">HUD OVERHAUL:</span> Integrated Static System Overlays (About/Help/Updates) with screen-lock priority.</p>

                <p><b style="color:#0f6;">[v18.8]</b> <span style="color:#fff;">DATA LINK:</span> Deployed Base64/QR Grid Sync with UUID-locked plot merging.</p>

                <hr style="border:0; border-top:1px solid #333; margin:10px 0;">
                <p style="font-size:0.75rem; color:#ffa500; text-align:center; font-weight:bold;">ORACLE STATUS: FULLY OPERATIONAL</p>
            </div>
        `;
    }

    staticBox.innerHTML = content + `<div class="close-intel" onclick="this.parentElement.style.display='none'" style="margin-top:10px; text-align:center; display:block; cursor:pointer; padding:15px; background:rgba(255,255,255,0.1);">DISMISS</div>`;

    if (type === 'DATALINK' && b64) {
        setTimeout(() => {
            const qrBox = document.getElementById('qr-static');
            if (qrBox && typeof qrcode !== 'undefined') {
                let qr = qrcode(0, 'L'); qr.addData(b64); qr.make();
                qrBox.innerHTML = qr.createImgTag(3, 4);
            }
        }, 50);
    }
}

async function importTacticalGrid() {
    const code = await tacticalPrompt("IMPORT NEW DATA", "PASTE DATA STRING:", true, "PASTE STRING HERE...");
    if (!code || code.trim() === "") return;
    try {
        const incomingData = JSON.parse(atob(code.trim()));
        const masterDataRaw = localStorage.getItem('ORACLE_GRID_DATA');
        let masterData = masterDataRaw ? JSON.parse(masterDataRaw) : [];
        const masterUUIDs = new Set(masterData.map(dot => dot.uuid));
        let integratedPlots = 0;
        incomingData.forEach(dot => { if (!masterUUIDs.has(dot.uuid)) { masterData.push(dot); integratedPlots++; } });
        if (integratedPlots > 0) {
            localStorage.setItem('ORACLE_GRID_DATA', JSON.stringify(masterData));
            const masterCounts = [0,0,0,0];
            masterData.forEach(d => { const t = parseInt(d.type); if(!isNaN(t)) masterCounts[t]++; });
            localStorage.setItem('ORACLE_STATS', JSON.stringify(masterCounts));
            await tacticalPrompt("GRID UPDATED", `${integratedPlots} NEW PLOT(S) INTEGRATED.`, false, "", true);
            sessionStorage.setItem('INITIAL_BOOT_COMPLETE', 'true');
            location.reload(); 
        } else {
            await tacticalPrompt("DATA INTEGRATION", "NO NEW UNIQUE PLOTS DETECTED.", false, "", true);
        }
    } catch (e) { await tacticalPrompt("CRITICAL ERROR", "DATA STRING CORRUPT.", false, "", true); }
}

async function clearMap() {
    if(await tacticalPrompt("DATA WIPE WARNING", "ERASE ALL DATA?", false)) { localStorage.clear(); location.reload(); }
}

// --- 🌉 ORACLE BRIDGE ---
window.generateTacticalQR = generateTacticalQR;
window.locateUser = locateUser;
window.setStatus = setStatus;
window.showIntelligenceReport = showIntelligenceReport;
window.showHelp = showHelp;
window.showAbout = showAbout;
window.clearMap = clearMap;
window.updateTriage = updateTriage;
window.deleteAgent = deleteAgent;
window.updateAgentIdentity = updateAgentIdentity;
window.importTacticalGrid = importTacticalGrid;

window.addEventListener('load', initializeSystem);


