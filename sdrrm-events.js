/* 🏛️ CMSHS ORACLE: TACTICAL ENGINE V22.8 - MASTER COMPILATION */

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

/* 🏛️ ORACLE SYSTEM INITIALIZATION & BOOT PROTECTOR */
let bootInitiated = false;

function initializeSystem() {
    // 1. PREVENT DOUBLE-BOOT LOCK
    if (bootInitiated) return;
    bootInitiated = true;

    console.log("ORACLE: Commencing System Boot...");

    // 🚀 IMMEDIATE RECOVERY: Load data before the animation starts
    // This fixes the "Disappearing Hazard" bug by injecting them into the DOM early.
    if (typeof loadHazards === 'function') loadHazards(); 
    if (typeof restoreSidebarState === 'function') restoreSidebarState();

    const bootOverlay = document.getElementById('boot-overlay');
    const bootText = document.getElementById('boot-text') || document.querySelector('.boot-text');
    const isSessionActive = sessionStorage.getItem('INITIAL_BOOT_COMPLETE');

    // 2. BYPASS BOOT IF ALREADY INITIALIZED IN THIS SESSION
    if (isSessionActive) {
        if (bootOverlay) bootOverlay.style.display = 'none';
        loadState(); 
        if (typeof loadHazards === 'function') loadHazards(); 
        if (typeof restoreSidebarState === 'function') restoreSidebarState();
        updateMapTransform();
        return;
    }

    // 3. THE CLEAN TYPEWRITER PROTOCOL
    const fullText = "INITIALIZING CMSHS GRID...\nACCESSING CMSHS ORACLE...\nSUCCESSFUL INITIALIZATION!";
    let i = 0;
    if (bootText) bootText.innerHTML = ""; 

    function typeWriter() {
        if (bootText && i < fullText.length) {
            bootText.innerHTML += fullText.charAt(i);
            i++;
            setTimeout(typeWriter, 40); 
        }
    }

    typeWriter();

    // 4. THE SMOOTH DISMOUNT
    setTimeout(() => {
        if (!bootOverlay) return;

        bootOverlay.style.opacity = '0';
        bootOverlay.style.pointerEvents = 'none';

        setTimeout(() => {
            bootOverlay.style.display = 'none';
            sessionStorage.setItem('INITIAL_BOOT_COMPLETE', 'true');

            // Final Sync to ensure nothing was missed during the fade
            loadState();
            loadHazards();
            updateMapTransform();

            requestAnimationFrame(() => {
                restoreSidebarState();
            });
        }, 800); 
    }, 3800); 
}

// --- 📡 GLOBAL LISTENERS ---
window.addEventListener('load', initializeSystem);

// Fallback for Service Worker re-renders
document.addEventListener('DOMContentLoaded', () => {
    if (!bootInitiated) initializeSystem();
});

// --- 🛰️ ORACLE GEOSPATIAL ENGINE: CALIBRATED HYBRID ---
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
    const mapImg = document.getElementById('map-img');

    // 🛡️ GUARD: Don't start if the map asset isn't ready
    if (!mapImg || mapImg.offsetWidth === 0) {
        console.warn("ORACLE: Map not ready. Aborting simulation.");
        tacticalPrompt("SYSTEM ERROR", "MAP ASSET NOT DETECTED. CANNOT INITIATE ROAMING.", false, "", true);
        return;
    }

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
        console.log(`📡 ORACLE: New Target Acquired [${movements}/${MAX_MOVEMENTS}]`);
    }

    pickNewTarget();

    mockInterval = setInterval(() => {
        const step = 0.000015;
        
        // 🛡️ GUARD: Ensure we have valid numbers before moving
        if (isNaN(currentLat) || isNaN(currentLng)) {
            clearInterval(mockInterval);
            console.error("ORACLE: Coordinate corruption detected. Stopping.");
            return;
        }

        if (Math.abs(currentLat - targetLat) > step) {
            currentLat += currentLat < targetLat ? step : -step;
        }
        if (Math.abs(currentLng - targetLng) > step) {
            currentLng += currentLng < targetLng ? step : -step;
        }

        // Call the processing engine
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
    const mapImg = document.getElementById('map-img');
    
    // 🛡️ SECURITY CHECK: Prevent crash if map isn't ready
    if (!mapImg || mapImg.offsetWidth === 0 || mapImg.offsetHeight === 0) {
        console.warn("ORACLE: Map not rendered yet. Postponing coordinate sync.");
        return; 
    }

    const mapConfig = { 
        topLat: CMSHS_CONFIG.centerLat + (CMSHS_CONFIG.latSpan / 2), 
        bottomLat: CMSHS_CONFIG.centerLat - (CMSHS_CONFIG.latSpan / 2), 
        leftLong: CMSHS_CONFIG.centerLng - (CMSHS_CONFIG.lngSpan / 2), 
        rightLong: CMSHS_CONFIG.centerLng + (CMSHS_CONFIG.lngSpan / 2) 
    };

    let pctY = (mapConfig.topLat - lat) / (mapConfig.topLat - mapConfig.bottomLat);
    let pctX = (lng - mapConfig.leftLong) / (mapConfig.rightLong - mapConfig.leftLong);
    
    pctX = 1 - pctX; 

    pctX = Math.max(0, Math.min(1, pctX));
    pctY = Math.max(0, Math.min(1, pctY));

    // Using clientWidth/Height is safer for layout calculations
    const pixelX = Math.round(mapImg.offsetWidth * pctX);
    const pixelY = Math.round(mapImg.offsetHeight * pctY);
    
    drawUserMarker(pixelX, pixelY);
    if (typeof focusOnUser === 'function') focusOnUser(pixelX, pixelY);
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

function updateMapTransform() {
    if(map) {
        // GPU Accelerated transform for PC/Mobile
        map.style.transform = `translate(${mapPos.x}px, ${mapPos.y}px) scale(${zoom})`;
    }
}

// --- 🖱️ PC MOUSE & POINTER CONTROLS ---
viewport.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    zoom = Math.min(Math.max(0.4, zoom + delta), 4);
    updateMapTransform();
}, { passive: false });

viewport.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
});

viewport.addEventListener('pointermove', e => {
    if (!isDragging || e.pointerType === 'touch') return; 
    mapPos.x += e.clientX - lastMouse.x;
    mapPos.y += e.clientY - lastMouse.y;
    updateMapTransform();
    lastMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('pointerup', () => { isDragging = false; });

// 🖥️ PC DOUBLE CLICK LISTENER
viewport.addEventListener('dblclick', e => {
    // Only trigger if not on a mobile device (mobile handled by touchend)
    if (window.matchMedia("(pointer: fine)").matches) {
        handlePlotting(e.clientX, e.clientY);
    }
});

// --- 📱 TOUCH ENGINE (OPTIMIZED FOR ALL MOBILE) ---
viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
        isDraggingMobile = false;
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
        wasPinching = true; 
        initialPinchDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
    }
}, { passive: true });

viewport.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && !wasPinching) {
        const touch = e.touches[0];
        const moveDist = Math.hypot(touch.clientX - touchStartPos.x, touch.clientY - touchStartPos.y);
        if (moveDist > 10) isDraggingMobile = true;
        
        mapPos.x += touch.clientX - lastMouse.x;
        mapPos.y += touch.clientY - lastMouse.y;
        updateMapTransform();
        lastMouse = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
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

viewport.addEventListener('touchend', (e) => {
    if (wasPinching && e.touches.length === 0) {
        setTimeout(() => { wasPinching = false; }, 200);
        initialPinchDist = -1;
        return;
    }
    
    if (!isDraggingMobile && !wasPinching && e.changedTouches.length > 0) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault(); 
            handlePlotting(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
        lastTap = currentTime;
    }
});

// --- 🏛️ CORE PLOTTING LOGIC (The ROOT Fix) ---
async function handlePlotting(clientX, clientY) {
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    
    // Calculate precise coordinates relative to the zoomed/panned map
    const mouseX = (clientX - rect.left - mapPos.x) / zoom;
    const mouseY = (clientY - rect.top - mapPos.y) / zoom;

    if (currentHazardMode) {
        createHazardMarker(`${mouseX}px`, `${mouseY}px`, currentHazardMode);
        currentHazardMode = null; 
        document.getElementById('hazard-status').innerText = "WAITING FOR SELECTION";
        return; 
    }

    let agentData = await tacticalPrompt("AGENT IDENTIFICATION", "ENTER NAME & SECTOR", true, "e.g. JUAN - GYM");
    if (agentData === null) return;

    const now = new Date();
    const time = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ", " + now.toLocaleTimeString();
    
    createDot(`${mouseX - 8}px`, `${mouseY - 8}px`, currentType, agentData, time);
}

// --- 💾 PERSISTENCE & DATA ---
function saveState() {
    const dots = [];
    const newCounts = [0, 0, 0, 0];
    document.querySelectorAll('.triage-dot').forEach(d => {
        if (d.id === 'intel-overlay') return;
        const type = parseInt(d.dataset.type);
        dots.push({ 
            x: d.style.left, 
            y: d.style.top, 
            type, 
            agent: d.dataset.agent, 
            time: d.dataset.timestamp, 
            uuid: d.dataset.uuid 
        });
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
        showIntel(dot.dataset.uuid, dot.dataset.timestamp);
    };
    
    const lbl = document.createElement('div');
    lbl.className = 'triage-label';
    lbl.innerText = (agentData || "UNKNOWN").split(' - ')[0];
    
    dot.appendChild(inner); dot.appendChild(lbl);
    document.getElementById('map-img').appendChild(dot);
    if (!isSilent) { counts[typeInt]++; updateHUD(); saveState(); }
}

// --- DYNAMIC AGENT MANAGEMENT ---
function showIntel(id, time) { // Only pass ID and Time
    currentSelectedAgentId = id; 
    const overlay = document.getElementById('intel-overlay');
    const targetDot = document.querySelector(`[data-uuid="${id}"]`);

    if (!targetDot) return;

    // 🔥 THE FIX: Always pull the LATEST data from the dot's dataset
    const statusNames = ["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"];
    const colorsList = ['#0f6', '#ff0', '#f33', '#888'];
    
    const currentType = parseInt(targetDot.dataset.type) || 0;
    const currentName = targetDot.dataset.agent || "UNKNOWN";
    const currentStatus = statusNames[currentType];
    const currentColor = colorsList[currentType];

    overlay.className = 'speech-bubble'; 
    document.getElementById('map-img').appendChild(overlay);
    overlay.style.left = targetDot.style.left;
    overlay.style.top = targetDot.style.top;
    overlay.style.display = 'block';
    
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#0f6; margin-bottom:10px; letter-spacing:2px; font-size:1rem; text-align:center;">AGENT PROFILE</h3>
        <div style="margin-bottom:15px;">
            <label style="font-size:0.6rem; color:#888; display:block; margin-bottom:5px; letter-spacing:1px;">IDENTIFICATION</label>
            <input type="text" 
       id="edit-agent-name" 
       value="${currentName || ''}" 
       placeholder="e.g. JUAN - GYM" 
       oninput="this.value = this.value.toUpperCase()" 
       style="width:100%; background:rgba(0,0,0,0.5); border:1px solid #333; color:#0f6; padding:8px; font-family:'Montserrat', sans-serif; font-size:0.8rem; outline:none; text-transform: uppercase;">
        </div>
        <p style="text-align:left; font-size:0.75em; line-height:1.4; margin-bottom:10px;">
            <span style="color:#888;">STATUS:</span> 
            <span id="status-display" style="color:${currentColor}; font-weight:bold; text-transform:uppercase;">${currentStatus}</span><br>
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
        <button onclick="deleteAgent()" class="btn-delete" style="...">DELETE AGENT</button>
    `;
}

function updateTriage(newType) {
    if (!currentSelectedAgentId) return;

    const colorsList = ['#00ff66', '#ffff00', '#ff3333', '#888888'];
    const classNames = ['green', 'yellow', 'red', 'black'];
    
    const newColor = colorsList[newType];
    const newClass = classNames[newType];

    const dotContainer = document.querySelector(`[data-uuid="${currentSelectedAgentId}"]`);
    
    if (dotContainer) {
        dotContainer.className = `triage-dot ${newClass}`;
        dotContainer.dataset.type = newType;

        const dotInner = dotContainer.querySelector('div');
        const dotLabel = dotContainer.querySelector('.triage-label');
        
        if (dotInner) {
            // 1. FORCE THE COLOR & BG
            dotInner.style.backgroundColor = newColor;
            dotInner.style.color = newColor; 

            // 2. 🔥 THE "GLOW KILLER" FIX: 
            // We manually overwrite the shadow to ensure it fades to the NEW color.
            // This bypasses the 'currentColor' bug entirely.
            dotInner.style.boxShadow = `0 0 15px ${newColor}, 0 0 30px ${newColor}`;

            if (dotLabel) {
                dotLabel.style.backgroundColor = newColor;
                
                // 🏷️ IMMEDIATE = BLACK TEXT (Your request)
                // MINOR & DELAYED = BLACK TEXT (High Visibility)
                if (newType === 2 || newType === 1 || newType === 0) {
                    dotLabel.style.color = '#000'; 
                } else {
                    dotLabel.style.color = '#fff'; // White for Deceased
                }
            }
        }
    }

    // Standard UI Updates
    const statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
        const statusNames = ["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"];
        statusDisplay.innerText = statusNames[newType];
        statusDisplay.style.color = newColor;
    }

    saveState();
    
    setTimeout(() => { 
        const overlay = document.getElementById('intel-overlay');
        if (overlay) overlay.style.display = 'none'; 
    }, 500);
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

/* ==========================================================
   CMSHS ORACLE: THE OMNIBUS BUILD (V3.0 - THE CLOSER)
   ========================================================== */

const CMSHS_SPATIAL_INDEX = {
    0: { name: "MAIN ENTRANCE/EXIT", x: 2245, y: 1590, type: "entry" },
    1: { name: "CMSHS GYMNASIUM", x: 1127, y: 895, type: "landmark" },
    2: { name: "CMSHS STAGE", x: 1880, y: 948, type: "stage" },
    7: { name: "SHS ROOM 7", x: 1647, y: 1502, type: "room" },
    10: { name: "SHS HALLWAY WEST", x: 850, y: 1100, type: "hallway" },
    11: { name: "SHS ROOM 1", x: 1363, y: 1138, type: "room" },
    12: { name: "SHS ROOM 2", x: 1140, y: 1150, type: "room" },
    13: { name: "SHS ROOM 3", x: 925, y: 1155, type: "room" },
    20: { name: "JHS CORRIDOR WEST", x: 229, y: 644, type: "hallway" },
    21: { name: "JHS CORRIDOR MID", x: 1001, y: 638, type: "hallway" },
    22: { name: "JHS CORRIDOR EAST", x: 2457, y: 643, type: "hallway" },
    25: { name: "CONFERENCE ROOM", x: 2005, y: 570, type: "room" },
    30: { name: "BIOLOGY LAB", x: 125, y: 285, type: "lab" },
    31: { name: "CANTEEN", x: 422, y: 1146, type: "facility" },
    40: { name: "SHS EAST STAIRS", x: 1850, y: 1155, type: "stairs" },
    41: { name: "SHS WEST STAIRS", x: 623, y: 1193, type: "stairs" },
};

/* ================================
   1. GLOBAL TACTICAL STATE
================================ */
window.HAZARDS = window.HAZARDS || new Set();
window.currentUserNode = window.currentUserNode || null;

window.CMSHS_GRAPH = {
    7: [40, 12], 
    40: [0, 2, 22, 11, 7], 
    41: [11, 13, 0, 1, 2], 
    2: [40, 41, 0], 
    11: [12, 41, 40], 
    12: [11, 13], 
    13: [12, 41],
    20: [21, 30], 
    21: [20, 22, 1, 25], 
    22: [21, 40], 
    25: [21], 
    30: [20, 31], 
    31: [30],
    1: [21, 41], 
    0: [40, 41, 2] 
};

/* ==========================================================
   2. ORACLE_SIM: ENCAPSULATED SIMULATION MODULE
   ========================================================== */
const ORACLE_SIM = (function() {
    const _blockedEdges = new Set();
    const _getEdgeKey = (a, b) => [a, b].sort((x, y) => x - y).join("-");

    const SCENARIOS = {
        "EARTHQUAKE_ALPHA": {
            startNode: 7,
            hazards: [{ node: 40, type: "COLLAPSE" }, { node: 12, type: "FIRE" }],
            blockedEdges: [[7, 40], [11, 40]],
            casualties: [{ node: 11, status: "TRAPPED", count: 2 }]
        }
    };

    return {
        isEdgeBlocked: (a, b) => _blockedEdges.has(_getEdgeKey(a, b)),
        clear: function() {
            _blockedEdges.clear();
            window.HAZARDS.clear();
            document.querySelectorAll('.sim-layer').forEach(el => el.remove());
        },
        start: function(name) {
            const scenario = SCENARIOS[name];
            if (!scenario) return;
            this.clear();
            const mapWrapper = document.getElementById('map-img').parentElement;
            const fragment = document.createDocumentFragment();

            scenario.blockedEdges.forEach(e => _blockedEdges.add(_getEdgeKey(e[0], e[1])));
            scenario.hazards.forEach(h => {
                window.HAZARDS.add(Number(h.node));
                const p = CMSHS_SPATIAL_INDEX[h.node];
                const el = document.createElement('div');
                el.className = "sim-layer hazard-marker pulse-critical";
                el.style.cssText = `position:absolute; left:${p.x}px; top:${p.y}px; transform:translate(-50%,-50%); z-index:100;`;
                el.innerHTML = `<div style="font-size:20px;">⚠️</div><small>${h.type}</small>`;
                fragment.appendChild(el);
            });
            scenario.casualties.forEach(c => {
                const p = CMSHS_SPATIAL_INDEX[c.node];
                const el = document.createElement('div');
                el.className = "sim-layer casualty-marker";
                el.style.cssText = `position:absolute; left:${p.x}px; top:${p.y}px; transform:translate(-50%,-150%); z-index:101; background:#ffcc00; padding:2px 5px; border-radius:4px; font-weight:bold; font-size:10px;`;
                el.innerHTML = `🆘 ${c.status} (${c.count})`;
                fragment.appendChild(el);
            });
            mapWrapper.appendChild(fragment);
            executeIndoorLocalization(scenario.startNode);
        }
    };
})();

/* ==========================================================
   3. CORE TACTICAL LOGIC & ROUTING
   ========================================================== */

function severConnection(nodeA, nodeB) {
    if (window.CMSHS_GRAPH[nodeA]) window.CMSHS_GRAPH[nodeA] = window.CMSHS_GRAPH[nodeA].filter(n => n !== nodeB);
    if (window.CMSHS_GRAPH[nodeB]) window.CMSHS_GRAPH[nodeB] = window.CMSHS_GRAPH[nodeB].filter(n => n !== nodeA);
    console.log(`🏗️ ORACLE: Connection severed between ${nodeA} and ${nodeB}`);
    rerouteUsers();
}

function bridgeNodes(nodeA, nodeB) {
    if (!window.CMSHS_GRAPH[nodeA]) window.CMSHS_GRAPH[nodeA] = [];
    if (!window.CMSHS_GRAPH[nodeB]) window.CMSHS_GRAPH[nodeB] = [];
    if (!window.CMSHS_GRAPH[nodeA].includes(nodeB)) window.CMSHS_GRAPH[nodeA].push(nodeB);
    if (!window.CMSHS_GRAPH[nodeB].includes(nodeA)) window.CMSHS_GRAPH[nodeB].push(nodeA);
    console.log(`🔗 ORACLE: New tactical bridge between ${nodeA} and ${nodeB}`);
    rerouteUsers();
}

function reportHazard(nodeId) {
    window.HAZARDS.add(Number(nodeId));
    console.log(`⚠️ AUTOMATION: Sector ${nodeId} compromised. Recalculating...`);
    rerouteUsers();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

function findShortestPath(start, goal) {
    const graph = window.CMSHS_GRAPH;
    let distances = {};
    let prev = {};
    let pq = Object.keys(graph);

    pq.forEach(node => {
        distances[node] = Infinity;
        prev[node] = null;
    });

    distances[start] = 0;

    while (pq.length > 0) {
        pq.sort((a, b) => distances[a] - distances[b]);
        let curr = pq.shift();

        if (distances[curr] === Infinity || curr == goal) break;

        for (let next of graph[curr] || []) {
            // 🛡️ MODULAR GUARD: Check Simulation Blocked Edges
            if (ORACLE_SIM.isEdgeBlocked(curr, next)) continue;

            let weight = window.HAZARDS.has(Number(next)) ? 999 : 1;
            let alt = distances[curr] + weight;

            if (alt < distances[next]) {
                distances[next] = alt;
                prev[next] = curr;
            }
        }
    }

    let path = [];
    let u = goal;
    while (u !== null) {
        path.unshift(Number(u));
        u = prev[u];
    }
    return (path[0] === start) ? path : [];
}

function executeIndoorLocalization(markerId) {
    const id = Number(markerId);
    const landmark = CMSHS_SPATIAL_INDEX[id];
    if (!landmark) return;

    window.currentUserNode = id;
    if (typeof drawUserMarker === 'function') drawUserMarker(landmark.x, landmark.y);
    
    const dynamicRoute = findShortestPath(id, 0);
    if (dynamicRoute && dynamicRoute.length > 0) {
        drawEvacuationPathWithEdges(dynamicRoute);
    }
    
    if (typeof closeGhostModal === 'function') closeGhostModal();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

function rerouteUsers() {
    if (window.currentUserNode !== null) {
        const dynamicRoute = findShortestPath(window.currentUserNode, 0);
        if (!dynamicRoute || dynamicRoute.length === 0) {
            console.error("🚨 CRITICAL: No evacuation route possible!");
            if (typeof drawEvacuationPathWithEdges === 'function') drawEvacuationPathWithEdges([]);
            return;
        }
        if (typeof drawEvacuationPathWithEdges === 'function') drawEvacuationPathWithEdges(dynamicRoute);
    }
}

function reportSafe() {
    if (window.currentUserNode !== 0) {
        console.warn("⚠️ REPORT_DENIED: User is not at the Extraction Point (ID 0).");
        return "DENIED_LOCATION"; 
    }
    const safeData = {
        node: window.currentUserNode,
        time: new Date().toLocaleTimeString(),
        id: `SECURE-${Math.floor(Math.random() * 9000) + 1000}`
    };
    window.SAFE_USERS = window.SAFE_USERS || [];
    window.SAFE_USERS.push(safeData);
    if (typeof clearRoute === 'function') clearRoute();
    return "SUCCESS";
}

/* ==========================================================
   ORACLE TACTICAL BRIDGE: SIMULATION + HAZARD COMMAND
   ========================================================== */

const ORACLE_KINETIC = (function() {
    let _walkInterval = null;

    return {
        // 🎲 GENERATE RANDOM CHAOS (Merged with Hazard Command)
        generateRandomScenario: function() {
            // 1. Clear previous simulation and manual hazards
            this.resetSystem();
            
            const allNodes = Object.keys(CMSHS_SPATIAL_INDEX).map(Number);
            // Exclude Exit (0) and potential start rooms from being blocked
            const potentialNodes = allNodes.filter(n => ![0, 7, 25, 30].includes(n));
            
            // Randomly select 3 nodes to "hit"
            const hits = potentialNodes.sort(() => 0.5 - Math.random()).slice(0, 3);
            const hazardTypes = ['fire', 'structure', 'electric', 'bio'];

            console.log("🎲 ORACLE: Deploying Simulated Hazards...");

            hits.forEach((nodeId, index) => {
                const node = CMSHS_SPATIAL_INDEX[nodeId];
                const type = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
                
                // 🌉 THE BRIDGE: Using your existing Command Engine function
                // We pass 'true' for isSilent to avoid redundant saves during the loop
                createHazardMarker(
                    `${node.x}px`, 
                    `${node.y}px`, 
                    type, 
                    `SIM-HAZARD-${nodeId}`, 
                    true 
                );
                
                console.log(`⚠️ SIM: Sector ${node.name} (${nodeId}) compromised by ${type.toUpperCase()}`);
            });

            // Set a random start for the demo
            const starts = [7, 25, 30];
            const randomStart = starts[Math.floor(Math.random() * starts.length)];
            
            // Update HUD and Trigger Reroute
            document.getElementById('hazard-status').innerText = "SIM: RANDOM DISASTER";
            executeIndoorLocalization(randomStart);
            
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        },

        // 🚶 GUIDED EXTRACTION WALK
        startExtractionWalk: function() {
            if (!window.currentUserNode) return;
            const path = findShortestPath(window.currentUserNode, 0);
            
            if (!path || path.length < 2) {
                tacticalPrompt("PATH BLOCKED", "No safe route found. Simulation aborted.", false, "", true);
                return;
            }

            let step = 0;
            if (_walkInterval) clearInterval(_walkInterval);

            _walkInterval = setInterval(() => {
                if (step >= path.length - 1) {
                    clearInterval(_walkInterval);
                    if (window.currentUserNode === 0) reportSafe();
                    return;
                }

                step++;
                executeIndoorLocalization(path[step]);
                if (navigator.vibrate) navigator.vibrate(40);
            }, 1200);
        },

        // 🔄 FULL RESET
        resetSystem: function() {
            if (_walkInterval) clearInterval(_walkInterval);
            
            // Clear the Set
            window.HAZARDS.clear();
            
            // Remove all visual hazard markers (Manual & Sim)
            document.querySelectorAll('.hazard-marker').forEach(m => m.remove());
            
            // Reset Sidebar Status
            const status = document.getElementById('hazard-status');
            if (status) status.innerText = "SYSTEM: STANDBY";
            
            console.log("🔄 ORACLE: Tactical reset complete.");
        }
    };
})();

/* ================================
   EVACUATION PATH RENDERING
================================ */

function drawEvacuationPath(route){
clearRoute()
route.forEach(node=>{
const point=CMSHS_SPATIAL_INDEX[node]
const dot=document.createElement("div")

dot.style.position="absolute"
dot.style.left=point.x+"px"
dot.style.top=point.y+"px"
dot.style.width="12px"
dot.style.height="12px"
dot.style.background="cyan"
dot.style.borderRadius="50%"
dot.style.boxShadow="0 0 10px cyan"
dot.className="evac-node"
document.getElementById("evac-layer").appendChild(dot)
    })
}

/* ================================
    REFINED CORE SYSTEMS
================================ */

function executeIndoorLocalization(markerId) {
    const id = Number(markerId);
    const landmark = CMSHS_SPATIAL_INDEX[id];
    if (!landmark) return;

    currentUserNode = id; 

    // 1. Move Blue Dot & Pan Camera
    drawUserMarker(landmark.x, landmark.y);
    if (typeof focusOnUser === 'function') focusOnUser(landmark.x, landmark.y);

    // 2. 🔥 DYNAMIC ROUTING
    const escapeRoute = findShortestPath(currentUserNode, 0);
    drawEvacuationPathWithEdges(escapeRoute);

    // 3. Update HUD
    const statusSpan = document.getElementById('hazard-status');
    if (statusSpan) statusSpan.innerText = `LOCATED: ${landmark.name}`;

    // 4. 🛰️ TACTICAL HANDSHAKE (The "YOU ARE HERE" Label)
    // We wait 100ms so the camera pan finishes before the label appears
    setTimeout(() => {
        showYouAreHere(id);
    }, 100);

    // 5. Cleanup & Haptics
    closeGhostModal();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    
    console.log(`🛡️ ORACLE: Sector ${id} Handshake Complete.`);
}

// 2. THE UI HANDLER (The "Announcer")
function userSafeButton() {
    const overlay = document.getElementById('safe-overlay');
    const statusText = document.getElementById('overlay-status-text');

    if (!overlay) {
        console.error("❌ ORACLE: Overlay element not found in DOM!");
        return;
    }

    // 🛡️ FIRST GUARD: Check for the Blue Dot (Localization)
    if (window.currentUserNode === null || window.currentUserNode === undefined) {
        // 🚨 NO SCAN AT ALL - Trigger Red Error immediately
        overlay.style.display = 'flex';
        overlay.classList.add('active');
        overlay.style.backgroundColor = "rgba(54, 1, 1, 0.95)"; // Deep Crimson
        
        if (statusText) statusText.innerText = "ERROR: SCAN LOCATION TAG FIRST";
        if (navigator.vibrate) navigator.vibrate(500);

        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.classList.remove('active');
        }, 3000);
        
        return; // 🛑 STOP! Don't proceed to reportSafe()
    }

    // 🛰️ SECOND STEP: If localized, check the actual safety status
    const status = reportSafe();
    overlay.style.display = 'flex';
    overlay.classList.add('active');

    if (status === "SUCCESS") {
        // ✅ EXTRACTION COMPLETE
        overlay.style.backgroundColor = "rgba(0, 20, 20, 0.95)"; // Cyber Teal
        if (statusText) statusText.innerText = "MISSION SECURED: SECTOR CLEAR";
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } 
    else if (status === "DENIED_LOCATION") {
        // ❌ WRONG LOCATION
        overlay.style.backgroundColor = "rgba(40, 20, 0, 0.95)"; // Amber Warning
        if (statusText) statusText.innerText = "ERROR: NOT AT EXIT POINT";
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }

    // Auto-hide for Success/Denied states
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.classList.remove('active');
    }, 3000);
}

/* ================================
   YOU ARE HERE MARKER
================================ */

function showYouAreHere(node) {
    const p = CMSHS_SPATIAL_INDEX[node];
    const map = document.getElementById("map-img");
    
    if (!p || !map) {
        console.error("ORACLE: Cannot find Node or Map Container");
        return;
    }

    // 1. CLEAR PREVIOUS
    const oldLabel = document.getElementById("localization-label");
    if (oldLabel) oldLabel.remove();

    // 2. CREATE THE LABEL
    const label = document.createElement("div");
    label.id = "localization-label";
    
    label.innerHTML = `
        <div style="font-size: 0.6em; letter-spacing: 1px; opacity: 0.8;">LOCATION ACQUIRED</div>
        <div style="font-weight: bold;">YOU ARE HERE</div>
        <div style="font-size: 0.5em; margin-top: 2px;">NODE: ${node}</div>
    `;

    // 3. APPLY STYLES (Enforced - Hyphens removed)
    Object.assign(label.style, {
        position: "absolute",
        left: `${p.x}px`,
        top: `${p.y - 45}px`,
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 20, 30, 0.95)",
        color: "#00ffff",
        padding: "8px 12px",
        borderRadius: "4px",
        border: "1px solid #00ffff",
        fontFamily: "'Courier New', monospace",
        fontSize: "14px",
        whiteSpace: "nowrap", // FIXED: Hyphen removed
        zIndex: "9999",
        pointerEvents: "none",
        textAlign: "center",
        boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
        transition: "opacity 1s ease"
    });

    // 4. ATTACH TO MAP
    map.appendChild(label);
    console.log(`📍 UI: Localization Label deployed at Node ${node}`);

    // 5. AUTO-DESTRUCT AFTER 8 SECONDS
    setTimeout(() => {
        const currentLabel = document.getElementById("localization-label");
        if (currentLabel) {
            currentLabel.style.opacity = "0";
            setTimeout(() => currentLabel.remove(), 1000);
        }
    }, 8000);
}

/* ================================
   ARUCO CAMERA HOOK
================================ */

function handleManualAruco(markerId) {
    const id = Number(markerId);

    // Validate the marker ID
    if (isNaN(id) || !(id in CMSHS_SPATIAL_INDEX)) {
        console.warn("Invalid marker ID entered:", markerId);
        return;
    }
    console.log("📍 Manual Aruco Input Detected:", id, CMSHS_SPATIAL_INDEX[id].name);
    executeIndoorLocalization(markerId);  // Uses your existing routing + "You Are Here" logic
}

/* ================================
   UI BUTTONS
================================ */

document.getElementById("safeBtn")?.addEventListener("click",userSafeButton)

function drawEvacuationPathWithEdges(route) {
    clearRoute(); 
    if (!route || route.length === 0) return;

    const map = document.getElementById("map-img");
    let svg = document.getElementById("evac-layer-svg");
    
    if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("id", "evac-layer-svg");
        svg.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index: 5;";
        map.appendChild(svg);
    } else {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
    }

    route.forEach((nodeId, i) => {
        const point = CMSHS_SPATIAL_INDEX[nodeId];
        if (!point) return;

        let segmentColor = "#00ffff"; 
        let isCaution = false;
        let statusLabel = "OPTIMAL";
        let intelText = "Path is clear and verified.";

        if (i < route.length - 1) {
            const nextNodeId = route[i + 1];
            
            if (window.HAZARDS.has(Number(nodeId)) || window.HAZARDS.has(Number(nextNodeId))) {
                segmentColor = "#ff003c"; 
                statusLabel = "CRITICAL";
                intelText = "Hazard directly on path. Reroute required.";
            } else {
                const neighborsA = window.CMSHS_GRAPH[nodeId] || [];
                const neighborsB = window.CMSHS_GRAPH[nextNodeId] || [];
                const combined = [...new Set([...neighborsA, ...neighborsB])];
                
                if (combined.some(n => window.HAZARDS.has(Number(n)))) {
                    segmentColor = "#ffcc00"; 
                    isCaution = true;
                    statusLabel = "CAUTION";
                    intelText = "Hazard detected in adjacent sector. Move with care.";
                }
            }
        }

        // 2. CREATE DOT
        const dot = document.createElement("div");
        dot.className = "evac-node" + (isCaution ? " caution-pulse" : "");
        dot.style.cssText = `position:absolute; left:${point.x}px; top:${point.y}px; width:12px; height:12px; background:${segmentColor}; border-radius:50%; box-shadow:0 0 15px ${segmentColor}; transform:translate(-50%, -50%); z-index: 6;`;
        map.appendChild(dot);

        // 3. DRAW LINE (Now with Popups!)
        if (i < route.length - 1) {
            const next = CMSHS_SPATIAL_INDEX[route[i + 1]];
            if (next) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", point.x);
                line.setAttribute("y1", point.y);
                line.setAttribute("x2", next.x);
                line.setAttribute("y2", next.y);
                line.setAttribute("stroke", segmentColor);
                line.setAttribute("stroke-width", isCaution ? "7" : "5");

                // Enable Interaction
                line.style.pointerEvents = "auto"; 
                line.style.cursor = "pointer";

                if (segmentColor === "#00ffff") line.setAttribute("class", "path-moving");
                else if (segmentColor === "#ffcc00") line.setAttribute("class", "path-moving-fast");
                else line.setAttribute("stroke-dasharray", "none");

                // CLICK EVENT FOR INTEL
                line.onclick = (e) => {
                    e.stopPropagation();
                    // Using your existing Tactical Overlay logic
                    showTacticalIntel(statusLabel, nodeId, route[i+1], intelText, segmentColor);
                };
                
                line.style.filter = `drop-shadow(0 0 8px ${segmentColor})`;
                svg.appendChild(line);
            }
        }
    });
}

// 4. THE INTEL DISPLAY FUNCTION
function showTacticalIntel(status, from, to, msg, color) {
    const overlay = document.getElementById('safe-overlay');
    const statusText = document.getElementById('overlay-status-text');
    if (!overlay || !statusText) return;

    overlay.style.display = 'flex';
    overlay.style.backgroundColor = "rgba(0, 10, 15, 0.95)";
    overlay.classList.add('active');

    statusText.innerHTML = `
        <div style="font-size: 0.5em; opacity: 0.6; margin-bottom: 5px;">SEGMENT: ${from} ➔ ${to}</div>
        <div style="color: ${color}; text-shadow: 0 0 10px ${color};">${status}</div>
        <div style="font-size: 0.4em; font-weight: normal; margin-top: 10px; color: #fff;">${msg}</div>
    `;

    if (navigator.vibrate) navigator.vibrate(50);

    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.classList.remove('active');
    }, 2500);
}

function clearRoute(){
    document.querySelectorAll(".evac-node").forEach(n=>n.remove());
    const oldSvg=document.getElementById("evac-layer-svg");
    if(oldSvg) oldSvg.remove();
}

/* 🏛️ VISION ENGINE (Integrated) */
let stream = null;

async function initiateGhostTag() {
    const modal = document.getElementById('ghost-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", width: 640, height: 480 } 
        });
        document.getElementById('scanner-video').srcObject = stream;
        startVisionLoop();
    } catch (err) {
        document.getElementById('scanner-status').innerText = "HARDWARE BLOCKED";
    }
}
function startVisionLoop() {
    if (typeof AR === 'undefined') {
        console.error("ORACLE: Aruco.js not loaded!");
        return;
    }
    
    const detector = new AR.Detector();
    const video = document.getElementById("scanner-video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let isDetected = false;

    function capture() {
        // Stop loop if modal closed or tag already found
        const modal = document.getElementById('ghost-modal');
        if (!stream || isDetected || (modal && modal.style.display === 'none')) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = 640; 
            canvas.height = 480;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // 🔎 THE DETECTION CORE
            const imageData = context.getImageData(0, 0, 640, 480);
            const markers = detector.detect(imageData);

            if (markers.length > 0) {
                isDetected = true; 
                const detectedID = Number(markers[0].id);
                
                // 1. Run the core logic first
                executeIndoorLocalization(detectedID);

                // 2. Add a tiny delay (50ms) to ensure the DOM is ready
                // then fire the "YOU ARE HERE" label
                setTimeout(() => {
                    showYouAreHere(detectedID);
                }, 50);

                // 3. Close the scanner
                setTimeout(() => {
                    closeGhostScanner();
                }, 1000);
            }
        }
        requestAnimationFrame(capture);
    }
    capture();
}

function closeGhostModal() {
    // 📳 Tactical Haptic Feedback
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]); 
    
    console.log("ORACLE: Terminating Vision Link...");
    
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    
    const modal = document.getElementById('ghost-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
}

// --- ⚠️ HAZARD COMMAND ENGINE ---
let currentHazardMode = null;

// 1. TACTICAL SIDEBAR REGISTRY
// Initialize the state at the top of your script
let isOracleOpen = false; 

window.toggleSidebar = function() {
    const sidebar = document.getElementById('hazard-sidebar');
    const tab = document.getElementById('sidebar-tab');

    if (!sidebar || !tab) return;

    if (isOracleOpen) {
        // --- RETREAT COMMAND (Close) ---
        sidebar.style.transform = 'translateX(100%)';
        
        // Bring the Tab back to the edge
        tab.style.transform = 'translateX(0%)'; 
        tab.style.opacity = "1";
        tab.style.pointerEvents = "auto";
        
        isOracleOpen = false;
        console.log("🛰️ HUD: RETREATED");
    } else {
        // --- DEPLOY COMMAND (Open) ---
        sidebar.style.transform = 'translateX(0%)';
        
        // Push the Tab out with the sidebar
        tab.style.transform = 'translateX(100%)';
        tab.style.opacity = "0";
        tab.style.pointerEvents = "none";
        
        isOracleOpen = true;
        console.log("🛰️ HUD: DEPLOYED");
    }
};

// 🛰️ GLOBAL CLICK LISTENER FOR AUTO-RETREAT
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('hazard-sidebar');
    const tab = document.getElementById('sidebar-tab');

    // Only run if the sidebar is currently open
    if (isOracleOpen) {
        // Check if the click was OUTSIDE the sidebar AND OUTSIDE the toggle tab
        const clickedInsideSidebar = sidebar.contains(event.target);
        const clickedInsideTab = tab.contains(event.target);

        if (!clickedInsideSidebar && !clickedInsideTab) {
            console.log("🗺️ MAP CLICK DETECTED: RETREATING ORACLE...");
            toggleSidebar(); // This re-uses your working function to close it!
        }
    }
});

// 2. OFFLINE PERSISTENCE RESTORE
function restoreSidebarState() {
    const sidebar = document.getElementById('hazard-sidebar');
    const savedStatus = localStorage.getItem('ORACLE_SIDEBAR_STATUS');

    if (sidebar && savedStatus === 'true') {
        // 1. Immediate Force-Show
        applySidebarOpenStyles(sidebar);

        // 2. The "Stoic Watchdog": Check again after the boot animation finishes
        // This catches any scripts that try to hide it during the transition.
        setTimeout(() => {
            applySidebarOpenStyles(sidebar);
            console.log("ORACLE: Watchdog confirmed Sidebar position.");
        }, 4000); 
    }
}

// Helper function to keep the logic clean
function applySidebarOpenStyles(el) {
    el.classList.add('active');
    el.style.setProperty('right', '0px', 'important');
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('transform', 'translateX(0)', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
}

// 3. HAZARD DEPLOYMENT MODE
function setHazardType(type) {
    // If the user taps the same type twice, "Disarm" the mode (Stoic Toggle)
    if (currentHazardMode === type) {
        currentHazardMode = null;
        document.getElementById('hazard-status').innerText = "SYSTEM: STANDBY";
        tacticalPrompt("MODE DISARMED", "Hazard plotting disabled.", false, "", true);
    } else {
        currentHazardMode = type;
        document.getElementById('hazard-status').innerText = `READY: ${type.toUpperCase()}`;
        
        // Haptic feedback for S10
        if (navigator.vibrate) navigator.vibrate([30, 50]); 
        
        tacticalPrompt("HAZARD READY", `PLOTTING: ${type.toUpperCase()}\nDouble-tap the map to deploy marker.`, false, "", true);
    }
    
    // Auto-close sidebar after selection to clear the view for plotting
    toggleSidebar();
}

// CREATE & READ (Integrated into existing dot logic)
function createHazardMarker(x, y, type, id = null, isSilent = false) {
    const hazardId = id || `HAZARD-${Date.now()}`;
    
    // 1. DUPLICATE CHECK: If this ID already exists on the map, don't add it again.
    if (document.getElementById(hazardId)) return;

    const hazard = document.createElement('div');
    hazard.className = `hazard-marker hazard-${type}`;
    hazard.id = hazardId;
    hazard.style.left = x;
    hazard.style.top = y;
    hazard.dataset.type = type;

    const icons = { fire: '🔥', flood: '🌊', bio: '☣️', structure: '🏗️', electric: '⚡' };
    hazard.innerHTML = `<div class="hazard-icon">${icons[type]}</div>`;

    hazard.onclick = (e) => {
        e.stopPropagation();
        showHazardIntel(hazardId, type);
    };

    // Link to node for Dijkstra
    const nodeId = findNearestNode(parseInt(x), parseInt(y));
    if (nodeId !== null) {
        hazard.dataset.nodeId = nodeId;
        window.HAZARDS.add(Number(nodeId));
    }

    document.getElementById('map-img').appendChild(hazard);
    
    // 🛡️ THE CRITICAL GUARD: Only save if this is a NEW manual plot, not a reload.
    if (!isSilent) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        saveOperationalData(); 
        rerouteUsers();
    }
}

// THE NEAREST NODE HELPER
function findNearestNode(pixelX, pixelY) {
    let closestNode = null;
    let minDistance = 100; // Only snap if within 100 pixels

    for (let id in CMSHS_SPATIAL_INDEX) {
        const node = CMSHS_SPATIAL_INDEX[id];
        const dist = Math.hypot(node.x - pixelX, node.y - pixelY);
        if (dist < minDistance) {
            minDistance = dist;
            closestNode = id;
        }
    }
    return closestNode;
}

// --- 🛠️ HAZARD INTEL: UPDATE & DELETE LOGIC ---
async function showHazardIntel(id, type) {
    const el = document.getElementById(id);
    if (!el) return;

    // 1. INITIAL ACTION PROMPT
    const action = await tacticalPrompt(
        "HAZARD INTEL", 
        `CURRENT: ${type.toUpperCase()}\n\n[DELETE] - PURGE MARKER\n[UPDATE] - CHANGE TYPE`, 
        true, 
        "TYPE 'DELETE' OR 'UPDATE'"
    );
    
    if (!action) return;

    // 🗑️ DELETE BRANCH
    if (action.toUpperCase() === 'DELETE') {
    const nodeId = el.dataset.nodeId;
    if (nodeId) {
        HAZARDS.delete(Number(nodeId)); // 🔓 UNBLOCKS THE PATH
        rerouteUsers(); // Recalculate the clear path
    }
    el.remove();
    saveOperationalData();
    return;
    }

    // 🔄 UPDATE BRANCH
    if (action.toUpperCase() === 'UPDATE') {
        const newType = await tacticalPrompt(
            "RECLASSIFY HAZARD",
            "SELECT NEW TYPE:\nFIRE, FLOOD, BIO, STRUCTURE, ELECTRIC",
            true,
            "ENTER NEW TYPE"
        );

        if (newType) {
            const val = newType.toLowerCase();
            const valid = ['fire', 'flood', 'bio', 'structure', 'electric'];
            
            if (valid.includes(val)) {
                // Update Element Properties
                el.className = `hazard-marker hazard-${val}`;
                el.dataset.type = val;
                
                // Update Icon
                const icons = { fire: '🔥', flood: '🌊', bio: '☣️', structure: '🏗️', electric: '⚡' };
                el.querySelector('.hazard-icon').innerHTML = icons[val];
                
                // Update the onclick to pass the NEW type for next time
                el.onclick = (e) => {
                    e.stopPropagation();
                    showHazardIntel(id, val);
                };

                saveOperationalData();
                if (navigator.vibrate) navigator.vibrate([40, 40]);
            } else {
                tacticalPrompt("ERROR", "INVALID TYPE - RECLASSIFICATION FAILED", false, "", true);
            }
        }
    }
}

// DATA PERSISTENCE (Wraps your existing saveState)
function saveOperationalData() {
    // Call your original saveState for triage dots
    saveState(); 

    // Now save Hazards separately
    const hazards = [];
    document.querySelectorAll('.hazard-marker').forEach(h => {
        hazards.push({ x: h.style.left, y: h.style.top, type: h.dataset.type, id: h.id });
    });
    localStorage.setItem('ORACLE_HAZARD_DATA', JSON.stringify(hazards));
}

// LOAD HAZARDS (Run this in your initializeSystem or loadState)
function loadHazards() {
    try {
        const rawData = localStorage.getItem('ORACLE_HAZARD_DATA');
        if (!rawData) return;

        const savedHazards = JSON.parse(rawData);
        
        // Use a Set to ensure we aren't processing duplicate IDs from a messy storage
        const uniqueHazards = Array.from(new Set(savedHazards.map(h => h.id)))
            .map(id => savedHazards.find(h => h.id === id));

        uniqueHazards.forEach(h => {
            // Passing 'true' for isSilent prevents the save-loop and multiple reroutes
            createHazardMarker(h.x, h.y, h.type, h.id, true);
        });

        // Final single reroute once all are placed
        rerouteUsers();
        console.log("🛡️ ORACLE: Hazards restored without duplication.");
    } catch (e) { 
        console.error("Hazard Load Failed", e); 
    }
}

// --- 🛑 MODIFIED RESET OPERATIONAL DATA ---
// Update your existing clearMap() or replace the button onclick
function clearMap() {
    tacticalPrompt("NUCLEAR OPTION", "THIS WILL PURGE ALL TRIAGE AND HAZARD DATA. PROCEED?", true, "TYPE 'CONFIRM'")
    .then(res => {
        if(res && res.toUpperCase() === 'CONFIRM') {
            // Clear Triage Dots
            document.querySelectorAll('.triage-dot').forEach(d => d.remove());
            // Clear Hazards
            document.querySelectorAll('.hazard-marker').forEach(h => h.remove());
            
            // Clear Storage
            localStorage.removeItem('ORACLE_GRID_DATA');
            localStorage.removeItem('ORACLE_STATS');
            localStorage.removeItem('ORACLE_HAZARD_DATA');
            
            counts = [0, 0, 0, 0];
            updateHUD();
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    });
}

// --- 💾 ORACLE PERSISTENCE LAYER ---
let localOracleArchive = JSON.parse(localStorage.getItem('oracle_archive')) || [];

// 🚀 1. GLOBAL STATE (CRITICAL: Moved to top so all functions see it)
window.activeConnections = []; 

window.renderOracleArchive = function() {
    const container = document.getElementById('chat-container');
    if (!container || localOracleArchive.length === 0) return;
    container.innerHTML = `<div style="color: #444; font-size: 0.6rem;">[ARCHIVE LOADED] RECOVERING RECENT INTEL...</div>`;
    localOracleArchive.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = "margin-bottom: 12px; padding: 5px; border-left: 2px solid " + (msg.type === 'text' ? "#ff8000" : "#00ffff");
        if (msg.type === 'text') {
            msgDiv.innerHTML = `<span style="color: #00ff66; font-weight: bold; font-size: 0.6rem;">[${msg.user}]</span><br><span style="color: #ddd;">${msg.content}</span>`;
        } else {
            msgDiv.innerHTML = `<span style="color: #00ffff; font-weight: bold; font-size: 0.6rem;">[${msg.user}] SENT AN ATTACHMENT:</span><br><div style="margin-top: 5px; border: 1px solid #333; border-radius: 4px; overflow: hidden; background: #000; min-height: 50px; display: flex; align-items: center; justify-content: center;"><img src="${msg.content}" style="max-width: 100%; display: block; height: auto; max-height: 400px; object-fit: contain;"></div>`;
        }
        container.appendChild(msgDiv);
    });
    container.scrollTop = container.scrollHeight;
};

// 📡 0. IDENTITY GENERATOR (Keep this at the top)
const callsigns = ["GHOST", "SPECTRE", "PHANTOM", "VIPER", "TITAN", "ECHO", "COBALT", "RAVEN", "ONYX"];
if (!sessionStorage.getItem('oracle_user')) {
    const randomCallsign = callsigns[Math.floor(Math.random() * callsigns.length)];
    const randomID = Math.floor(100 + Math.random() * 899);
    sessionStorage.setItem('oracle_user', `${randomCallsign}-${randomID}`);
}
const currentUser = sessionStorage.getItem('oracle_user');

// 🚀 1. Update the UI immediately so they know their ID while waiting
document.addEventListener('DOMContentLoaded', () => {
    const idDisplay = document.getElementById('agent-id-display');
    if (idDisplay) {
        idDisplay.innerHTML = `📡 SYSTEM: <span style="color: #ff8000;">INITIALIZING...</span> | ID: <span style="color: #fff;">${currentUser}</span>`;
    }
});

// 📡 2. INITIALIZE PEER
const peer = new Peer(currentUser, {
    debug: 2, 
    config: {
        'iceServers': [
            { url: 'stun:stun.l.google.com:19302' },
            { url: 'stun:stun1.l.google.com:19302' }
        ]
    }
});

// --- ✍️ SENDING TEXT ---
window.sendText = function() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const val = input.value.trim();
    if (val === "") return;

    const msg = { user: currentUser, type: 'text', content: val };
    
    // Safety check for active connections
    window.activeConnections.forEach(conn => {
        if(conn.open) conn.send(msg);
    });
    
    handleIncomingIntel(msg);
    input.value = "";
};

// --- 📸 SENDING IMAGES ---
window.handleImage = function(input) {
    const file = input.files[0];
    if (!file) return;

    const label = input.parentElement;
    const originalText = label.innerHTML;
    label.style.opacity = "0.5";

    const reader = new FileReader();
    reader.onloadend = function() {
        if (reader.result) {
            const msg = { user: currentUser, type: 'image', content: reader.result };
            window.activeConnections.forEach(conn => {
                if(conn.open) conn.send(msg);
            });
            handleIncomingIntel(msg);
            label.innerHTML = originalText;
            label.style.opacity = "1";
        }
    };
    reader.readAsDataURL(file);
};

// 📡 2. MONITOR P2P CONNECTION STATUS (REINFORCED)
peer.on('open', (id) => {
    console.log("📡 SYSTEM: MESH ONLINE. ID:", id);
    
    // 🏛️ UPDATE THE UI IDENTITY BADGE
    const idDisplay = document.getElementById('agent-id-display');
    if (idDisplay) {
        idDisplay.innerHTML = `📡 SYSTEM: <span style="color: #00ff66;">MESH ONLINE</span>. ID: <span style="color: #fff; font-weight: bold; border-bottom: 1px solid #00ff66;">${id}</span>`;
        idDisplay.style.borderColor = "#00ff66";
        idDisplay.style.boxShadow = "0 0 10px rgba(0, 255, 102, 0.1)";
    }

    // Update the inner chat log
    const container = document.getElementById('chat-container');
    if (container) {
        const statusDiv = document.createElement('div');
        statusDiv.style.cssText = "color: #00ffff; border-bottom: 1px solid #222; margin-bottom: 10px; font-size: 0.65rem; padding-bottom: 5px;";
        statusDiv.innerHTML = `[SYSTEM] P2P TUNNEL ESTABLISHED // AGENT_${id}`;
        container.prepend(statusDiv); 
    }
});

// 📡 MONITOR BROKER CONNECTION (The "Heartbeat")
peer.on('disconnected', () => {
    const idDisplay = document.getElementById('agent-id-display');
    if (idDisplay) {
        idDisplay.innerHTML = `📡 <span style="color: #ff3333;">SYSTEM: OFFLINE</span> [RE-LINKING...]`;
        idDisplay.style.borderColor = "#ff3333";
    }
    console.warn("🛰️ ORACLE: BROKER LINK LOST. ATTEMPTING RECOVERY...");
    
    // Attempt to jump back on the mesh automatically
    peer.reconnect();
});

// ❌ HANDLE CONNECTION FAILURES (The "Initializing" Killer)
peer.on('error', (err) => {
    console.error("❌ P2P ERROR:", err);
    const idDisplay = document.getElementById('agent-id-display');
    
    if (idDisplay) {
        idDisplay.style.borderColor = "#ff3333";
        idDisplay.style.color = "#ff3333";
        
        if (err.type === 'browser-incompatible') {
            idDisplay.innerHTML = `📡 SYSTEM: <span style="font-weight:bold;">INCOMPATIBLE BROWSER</span>`;
        } else if (err.type === 'network') {
            idDisplay.innerHTML = `📡 SYSTEM: <span style="font-weight:bold;">OFFLINE / NO SIGNAL</span>`;
        } else if (err.type === 'id-taken') {
            idDisplay.innerHTML = `📡 SYSTEM: <span style="font-weight:bold;">ID CONFLICT / ACTIVE</span>`;
        } else {
            idDisplay.innerHTML = `📡 SYSTEM: <span style="font-weight:bold;">MESH ERROR [${err.type}]</span>`;
        }
    }
});

// 📥 3. RECEIVING INTEL
peer.on('connection', (conn) => {
    conn.on('open', () => {
        if (!window.activeConnections.find(c => c.peer === conn.peer)) {
            window.activeConnections.push(conn);
        }
        setupDataListener(conn);
    });
});

function setupDataListener(conn) {
    conn.on('data', (data) => {
        handleIncomingIntel(data);
    });
}

// 🚀 IMPROVED LINK FUNCTION
window.connectToAgent = function() {
    if (peer.disconnected) {
        peer.reconnect();
        setTimeout(() => window.connectToAgent(), 1000);
        return;
    }

    const targetID = prompt("ENTER REMOTE AGENT ID:");
    if (!targetID || targetID === currentUser) return;

    console.log(`📡 DIALING: ${targetID}...`);

    try {
        const conn = peer.connect(targetID);
        if (conn) {
            conn.on('open', () => {
                console.log("🛰️ LINK ESTABLISHED WITH " + targetID);
                if (!window.activeConnections.find(c => c.peer === conn.peer)) {
                    window.activeConnections.push(conn);
                }
                
                conn.on('data', (data) => {
                    handleIncomingIntel(data);
                });
            });

            conn.on('error', (err) => {
                console.error("❌ LINK FAILED:", err);
            });
        }
    } catch (err) {
        console.error("❌ CRITICAL DIAL ERROR:", err);
    }
};

// Function to JUST show the UI (Used for Auto-Open)
window.showInterface = function() {
    const gate = document.getElementById('mesh-gatekeeper');
    const interface = document.getElementById('mesh-interface');
    if (gate && interface) {
        gate.style.display = 'none';
        interface.style.display = 'flex';
        window.renderOracleArchive();
    }
};

// --- 📟 ORACLE DIALPAD LOGIC ---
window.showDialPad = function() {
    document.getElementById('gate-start-view').style.display = 'none';
    document.getElementById('gate-dial-view').style.display = 'block';
    document.getElementById('dial-id-input').focus();
};

window.resetGate = function() {
    document.getElementById('gate-start-view').style.display = 'block';
    document.getElementById('gate-dial-view').style.display = 'none';
    document.getElementById('dial-error-msg').style.display = 'none';
    document.getElementById('dial-id-input').value = "";
};

window.deployComms = function() {
    const input = document.getElementById('dial-id-input');
    const error = document.getElementById('dial-error-msg');
    const targetID = input.value.trim();

    // 🛡️ VALIDATION LOGIC
    if (targetID && targetID !== "" && targetID !== currentUser) {
        
        // 1. Dial through the P2P Mesh
        console.log(`📡 DIALING: ${targetID}...`);
        const conn = peer.connect(targetID);

        // 2. UNLOCK INTERFACE
        document.getElementById('mesh-gatekeeper').style.display = 'none';
        document.getElementById('mesh-interface').style.display = 'flex';
        window.renderOracleArchive();

        // 3. Connect listeners
        conn.on('open', () => {
            if (!window.activeConnections.find(c => c.peer === conn.peer)) {
                window.activeConnections.push(conn);
            }
            conn.on('data', (data) => handleIncomingIntel(data));
        });

    } else {
        // ❌ SHOW ACCESS DENIED IN UI
        error.style.display = 'block';
        input.style.borderColor = "#ff3333";
        input.value = "";
        
        // Shake animation effect (Optional but cool)
        input.parentElement.animate([
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' }
        ], { duration: 100, iterations: 3 });
    }
};

// Add Enter Key support for the Dial Pad
document.addEventListener('DOMContentLoaded', () => {
    const dialInput = document.getElementById('dial-id-input');
    if (dialInput) {
        dialInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') window.deployComms();
        });
    }
});

function handleIncomingIntel(msg) {
    const container = document.getElementById('chat-container');
    if(!container) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = "margin-bottom: 12px; padding: 5px; border-left: 2px solid " + (msg.type === 'text' ? "#ff8000" : "#00ffff");

    if (msg.type === 'text') {
        msgDiv.innerHTML = `<span style="color: #00ff66; font-weight: bold; font-size: 0.6rem;">[${msg.user}]</span><br><span style="color: #ddd;">${msg.content}</span>`;
    } else {
        msgDiv.innerHTML = `<span style="color: #00ffff; font-weight: bold; font-size: 0.6rem;">[${msg.user}] SENT AN ATTACHMENT:</span><br><div style="margin-top: 5px; border: 1px solid #333; border-radius: 4px; overflow: hidden; background: #000; min-height: 50px; display: flex; align-items: center; justify-content: center;"><img src="${msg.content}" onload="this.parentElement.style.background='none'" style="max-width: 100%; display: block; height: auto; max-height: 400px; object-fit: contain; box-shadow: 0 0 15px rgba(0,255,255,0.2);"></div>`;
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;

    localOracleArchive.push(msg);
    if(localOracleArchive.length > 50) localOracleArchive.shift();
    localStorage.setItem('oracle_archive', JSON.stringify(localOracleArchive));
}

// ⚡️ 4. AUTO-ARM INPUT & AUTO-DEPLOY
document.addEventListener('DOMContentLoaded', () => {
    window.renderOracleArchive();

    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                window.sendText();
            }
        });
    }
});

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
                    <li><b>GPS Sync Fail:</b> Ensure "Precise Location" is enabled in App Info > Permissions. Ensure site is served over <b>HTTPS</b>.</li>
                    <li><b>System Drift:</b> If the map becomes unresponsive, refresh to recalibrate the viewport.</li>
                    <li><b>Data Wipe:</b> Perform RESET OPERATIONAL DATA function to clear the local grid for a new operation.</li>
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
}

/* ==========================================================
   ORACLE: BASE64 BYPASS EXPORT (V4.8)
   ========================================================== */
window.generateOracleSS = async function() {
    console.log("📸 ORACLE: Executing Base64 Bypass...");

    const mapImg = document.getElementById('map-img');
    const target = mapImg.parentElement;
    const scanner = document.getElementById('scanner-video');

    // 1. SILENCE TAINTED ELEMENTS
    if (scanner) scanner.style.display = 'none';

    // 2. THE "CLEANER" - Converts local file to a safe DataURL
    const getCleanDataUrl = (img) => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/png");
    };

    // Swap original for a "Clean" version
    const originalSrc = mapImg.src;
    try {
        mapImg.src = getCleanDataUrl(mapImg);
    } catch(e) {
        console.warn("⚠️ Snapshot might be blank due to file:/// restrictions.");
    }

    // 3. INJECT THE READINESS HEADER (Bottom Right)
    const reportOverlay = document.createElement('div');
    reportOverlay.id = "snap-overlay";
    reportOverlay.style.cssText = `
        position: absolute; bottom: 20px; right: 20px; z-index: 9999;
        background: rgba(0, 20, 10, 0.9); border-right: 4px solid #0f6;
        padding: 15px; display: flex; align-items: center; gap: 15px;
        font-family: 'Courier New', monospace; color: #0f6;
        box-shadow: -10px 0 20px rgba(0,0,0,0.5); border-radius: 5px 0 0 5px;
    `;
    
    reportOverlay.innerHTML = `
        <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 16px; letter-spacing: 2px;">CMSHS ORACLE</div>
            <div style="font-size: 11px; color: #fff; letter-spacing: 1px;">OPERATIONAL READINESS</div>
            <div style="font-size: 9px; opacity: 0.6; margin-top: 5px;">${new Date().toLocaleString()}</div>
        </div>
        <img src="CMSHS_LOGO.png" style="width: 45px; height: 45px; object-fit: contain;">
    `;
    target.appendChild(reportOverlay);

    try {
        const canvas = await html2canvas(target, {
            useCORS: false, 
            allowTaint: true, 
            backgroundColor: "#000",
            scale: 2,
            ignoreElements: (el) => el.id === 'scanner-video'
        });

        // 4. RESTORE SYSTEM STATE
        mapImg.src = originalSrc;
        reportOverlay.remove();
        if (scanner) scanner.style.display = 'block';

        // 5. DOWNLOAD
        const link = document.createElement('a');
        link.download = `ORACLE_INTEL_${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        console.log("✅ ORACLE: Intel Secure.");

    } catch (err) {
        mapImg.src = originalSrc;
        if(document.getElementById('snap-overlay')) reportOverlay.remove();
        if (scanner) scanner.style.display = 'block';
        console.error("📸 CRITICAL TAINT:", err);
        alert("VS Code Debugger is blocking the export. Try 'Live Server' extension!");
    }
};

/* ==========================================================
   ORACLE: TACTICAL FEEDBACK UI
   ========================================================== */

// 🏃 THE MISSION-AWARE EXTRACTION UI
async function commenceExtractionUI() {
    const btn = document.getElementById('btn-exit');
    const originalContent = `<span class="icon">🏃</span> <span class="btn-text">COMMENCE EXIT</span>`;
    
    // 1. ENTER "MISSION IN PROGRESS" STATE
    btn.disabled = true; 
    btn.innerHTML = `<span class="icon">🛰️</span> <span class="btn-text">COMMENCING...</span>`;
    btn.style.opacity = "0.6";
    btn.style.cursor = "wait";
    // Optional: add a pulsing orange glow to show it's active
    btn.style.boxShadow = "0 0 20px rgba(255, 128, 0, 0.5)";

    try {
        // 🚀 Start the actual pathfinding/walking logic
        await ORACLE_KINETIC.startExtractionWalk(); 

        // 2. THE NODE WATCHER (Polling for Arrival at Node 0)
        const missionWatcher = setInterval(() => {
            // Logic: Check if the user's current position is Node 0
            // Assuming your ORACLE_KINETIC or global state tracks 'currentUserNode'
            const currentNode = window.currentUserNode; 

            if (currentNode === 0) {
                console.log("🎯 TARGET REACHED: Node 0 Locked.");
                
                // 3. RESET TO READY STATE
                btn.disabled = false;
                btn.innerHTML = originalContent;
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
                btn.style.boxShadow = "none";
                
                // Kill the watcher
                clearInterval(missionWatcher);
                
                // Alert the user (Optional)
                console.log("SYSTEM: EXTRACTION COMPLETE. STANDING BY.");
            }
        }, 300); // Fast 300ms check for high-precision tracking

    } catch (error) {
        console.error("Critical Extraction Error:", error);
        // Emergency Reset
        btn.disabled = false;
        btn.innerHTML = originalContent;
        btn.style.opacity = "1";
    }
}

// 📲 GENERATE REPORT -> GENERATING...
async function generateReportUI() {
    const btn = document.getElementById('btn-report');
    btn.innerHTML = "📲 GENERATING...";
    btn.classList.add('pulse-green'); // Add a visual pulse if you have one

    // Trigger the Seamless V4.8 Snapshot
    await window.generateOracleSS();

    // Reset after export
    setTimeout(() => {
        btn.innerHTML = "📲 GENERATE REPORT";
        btn.classList.remove('pulse-green');
    }, 1500);
}

// 🔄 RESET -> RESETTING...
function resetSystemUI() {
    const btn = document.getElementById('btn-reset');
    btn.innerHTML = "🔄 RESETTING...";
    
    // Trigger existing reset
    ORACLE_KINETIC.resetSystem();

    setTimeout(() => {
        btn.innerHTML = "🔄 RESET";
    }, 1000);
}

/* ==========================================================
   ORACLE: UI STATE WRAPPER (NON-INVASIVE)
   ========================================================== */
// ⚡️ THE ACTION WRAPPER (Powering Simulation Control)
window.wrapAction = function(btnId, loadingText, callback) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    // 1. Save original state
    const originalText = btn.innerHTML;
    const originalColor = btn.style.color;

    // 2. Trigger "Armed/Loading" state
    btn.innerHTML = loadingText;
    btn.style.opacity = "0.7";
    btn.disabled = true; // Prevent double-tapping during disaster
    
    console.log(`📡 SYSTEM: TRIGGERING ${btnId}...`);

    // 3. Execute the mission logic
    try {
        if (typeof callback === 'function') {
            callback();
        }
    } catch (err) {
        console.error(`❌ MISSION FAILURE IN ${btnId}:`, err);
    }

    // 4. Reset the button after a short tactical delay (1.5s)
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.opacity = "1";
        btn.disabled = false;
    }, 1500);
};

// --- 🌉 ORACLE BRIDGE ---
window.generateTacticalQR = function() { window.generateOracleSS(); };
window.locateUser = locateUser;
window.setStatus = setStatus;
window.showIntelligenceReport = showIntelligenceReport;
window.showHelp = showHelp;
window.showAbout = showAbout;
window.clearMap = clearMap;
window.updateTriage = updateTriage;
window.deleteAgent = deleteAgent;
window.updateAgentIdentity = updateAgentIdentity;
window.addEventListener('load', initializeSystem);
