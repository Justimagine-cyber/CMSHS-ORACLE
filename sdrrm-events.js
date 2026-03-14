/* 🏛️ CMSHS ORACLE: TACTICAL ENGINE V22.8 - MASTER COMPILATION */

console.log("ORACLE SYSTEM: ONLINE - ALL MODULES INTEGRATED");

// --- INITIAL STATE ---
let currentType = 0;
let counts = [0, 0, 0, 0];
let currentSelectedAgentId = null; 
const colors = ['#00ff66', '#ffff00', '#ff3333', '#888888']; 

const map = document.getElementById('map-img');
const viewport = document.getElementById('viewport');

let mapPos = { x: 0, y: 0 };
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

// --- 🚨 NAVIGATION STATE ---
let currentMarkerId = null;   // The ArUco ID currently locked
let lastDetectedNode = null;  // For the "Path Blocked" logic
let activeHazards = new Set();

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

    let pctY = (mapConfig.topLat - lat) / (mapConfig.topLat - mapConfig.bottomLat);
    let pctX = (lng - mapConfig.leftLong) / (mapConfig.rightLong - mapConfig.leftLong);
    
    pctX = 1 - pctX; 

    pctX = Math.max(0, Math.min(1, pctX));
    pctY = Math.max(0, Math.min(1, pctY));

    const mapImg = document.getElementById('map-img');
    const pixelX = Math.round(mapImg.offsetWidth * pctX);
    const pixelY = Math.round(mapImg.offsetHeight * pctY);
    
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
    if (!viewport) return;
    const vWidth = viewport.offsetWidth / 2;
    const vHeight = viewport.offsetHeight / 2;
    mapPos.x = vWidth - (x * zoom);
    mapPos.y = (vHeight - 100) - (y * zoom); 
    updateMapTransform();
}

// --- 📱 TOUCH ENGINE (SYNCED WITH mapPos) ---
viewport.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && !wasPinching) {
        const touch = e.touches[0];
        const moveDist = Math.hypot(touch.clientX - touchStartPos.x, touch.clientY - touchStartPos.y);
        
        if (moveDist > 5) isDraggingMobile = true;

        // 🎯 FIXED: Use mapPos instead of offset
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

// --- 🖱️ POINTER ENGINE (SYNCED WITH mapPos) ---
viewport.addEventListener('pointermove', e => {
    if (!isDragging) return;
    
    // 🎯 FIXED: Use mapPos instead of offset
    mapPos.x += e.clientX - lastMouse.x;
    mapPos.y += e.clientY - lastMouse.y;
    
    updateMapTransform();
    lastMouse = { x: e.clientX, y: e.clientY };
});

// --- 🏛️ CORE PLOTTING LOGIC (Refined) ---
async function handlePlotting(clientX, clientY) {
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    
    // 🎯 Use 'offset' consistently to match updateMapTransform
    const mouseX = (clientX - rect.left - offset.x) / zoom;
    const mouseY = (clientY - rect.top - offset.y) / zoom;

    if (currentHazardMode) {
        // createHazardMarker should append to #map-container
        createHazardMarker(`${mouseX}px`, `${mouseY}px`, currentHazardMode);
        currentHazardMode = null; 
        const status = document.getElementById('hazard-status');
        if(status) status.innerText = "WAITING FOR SELECTION";
        return; 
    }

    let agentData = await tacticalPrompt("AGENT IDENTIFICATION", "ENTER NAME & SECTOR", true, "e.g. JUAN - GYM");
    if (agentData === null) return;

    const now = new Date();
    const time = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ", " + now.toLocaleTimeString();
    
    // Center the dot by offsetting half its width (8px)
    createDot(`${mouseX - 8}px`, `${mouseY - 8}px`, currentType, agentData, time);
}

function updateMapTransform() {
    const container = document.getElementById('map-container');
    if (!container) return;
    
    // Using mapPos instead of offset
    container.style.transform = `translate(${mapPos.x}px, ${mapPos.y}px) scale(${zoom})`;
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

/* 🏛️ ORACLE SPATIAL ATLAS: COORDINATE DICTIONARY */
const CMSHS_SPATIAL_INDEX = {
    0: { name: "MAIN GATE / DEPOT", x: 200, y: 1500 },
    1: { name: "CMSHS GYMNASIUM", x: 1200, y: 850 },
    2: { name: "SCIENCE LAB", x: 450, y: 320 },
    3: { name: "COMPUTER LAB", x: 2100, y: 400 },
    4: { name: "ADMINISTRATION BLDG", x: 1800, y: 1200 }
};

/* 🏛️ CAMPUS CONNECTIVITY GRAPH (Nodes & Edges) */
const CAMPUS_GRAPH = {
    "0": ["1"],           // Main Gate connects to Gym
    "1": ["0", "2", "4"], // Gym connects to Gate, Science Lab, Admin
    "2": ["1", "3"],      // Science Lab connects to Gym, Comp Lab
    "3": ["2"],           // Comp Lab connects to Science Lab
    "4": ["1"]            // Admin connects to Gym
};

/* ⚠️ ACTIVE HAZARD REGISTRY */
let activeHazards = new Set(); // Stores IDs of rooms that are blocked/unsafe
let currentMarkerId = null; 

/* 🏛️ VISION ENGINE INITIALIZER */
let stream = null;

async function initiateGhostTag() {
    const modal = document.getElementById('ghost-modal');
    if (!modal) return console.error("ORACLE: Ghost Modal DOM missing.");
    
    // Show the UI
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    try {
        // Request Camera Access (Optimized for S10/Redmi Pad)
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment", 
                width: { ideal: 640 }, 
                height: { ideal: 480 } 
            } 
        });
        
        const videoElement = document.getElementById('scanner-video');
        if (videoElement) {
            videoElement.srcObject = stream;
            // Start the ArUco scanning loop
            startVisionLoop();
        }
    } catch (err) {
        console.error("ORACLE: Optical hardware access denied.", err);
        const status = document.getElementById('scanner-status');
        if (status) status.innerText = "CAMERA ERROR: CHECK PERMISSIONS";
    }
}

/* 🏛️ OPTICAL SHUTDOWN */
function closeGhostModal() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    const modal = document.getElementById('ghost-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
}

/* 👁 VISION ENGINE */
function startVisionLoop() {
    // 🛡️ Ensure the ArUco library (aruco.js) is loaded
    if (typeof AR === 'undefined') {
        console.error("ORACLE: ArUco Library not found! Check js/ folder.");
        return;
    }

    const detector = new AR.Detector();
    const video = document.getElementById("scanner-video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    function capture() {
        // Only run if the modal is actually open
        if (document.getElementById('ghost-modal').style.display === 'none') return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = 480; // Lower res = Faster scanning on S10
            canvas.height = 360;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // 🔎 THE CORE ENGINE CALL
            const markers = detector.detect(context.getImageData(0, 0, canvas.width, canvas.height));

            if (markers.length > 0) {
                const detectedID = markers[0].id;
                
                // 🏛️ TRIGGER THE SPATIAL HANDSHAKE
                executeIndoorLocalization(detectedID);
                
                // Auto-close after successful lock to save battery
                closeGhostModal();
                return; 
            }
        }
        requestAnimationFrame(capture);
    }
    capture();
}

/**
 * 🏛️ CORE LOCALIZATION & ROUTING ENGINE
 * Merged & Refined for CMSHS ORACLE
 */
function executeIndoorLocalization(markerId) {
    const landmark = CMSHS_SPATIAL_INDEX[markerId];
    if (!landmark) return;

    // 1. UPDATE STATE
    currentMarkerId = markerId;
    lastDetectedNode = markerId.toString(); // 🎯 FIX: Define this for the Reroute button

    // 2. SNAP CAMERA
    // Using mapPos to match the touch engine
    mapPos.x = (window.innerWidth / 2) - (landmark.x * zoom);
    mapPos.y = (window.innerHeight / 2) - (landmark.y * zoom);
    
    updateMapTransform();

    // 3. ROUTE
    const path = findSafestRoute(lastDetectedNode, "0");
    renderEvacuationPath(path);

    // 4. UI CLEANUP
    closeGhostModal();
    const status = document.getElementById('hazard-status');
    if (status) status.innerText = `LOCATED: ${landmark.name}`;
}
 
/**
 * 🧠 PATHFINDING ALGORITHM: Breadth-First Search (BFS)
 */
function findSafestRoute(startNode, endNode) {
    let queue = [[startNode]];
    let visited = new Set([startNode]);

    while (queue.length > 0) {
        let path = queue.shift();
        let node = path[path.length - 1];

        if (node === endNode) return path;

        const neighbors = CAMPUS_GRAPH[node] || [];
        for (let neighbor of neighbors) {
            // 🛑 CRITICAL: Algorithm "sees" hazards as walls and skips them
            if (!visited.has(neighbor) && !activeHazards.has(neighbor)) {
                visited.add(neighbor);
                queue.push([...path, neighbor]);
            }
        }
    }
    return null; // No safe path possible
}

/**
 * 🖌️ RENDER PATH TO SVG LAYER
 */
function renderEvacuationPath(path) {
    const svg = document.getElementById('route-layer');
    if (!svg) return;
    svg.innerHTML = ""; 

    if (!path) {
        console.error("ORACLE: NO SAFE EVACUATION ROUTE FOUND!");
        return;
    }

    let points = path.map(id => {
        const coord = CMSHS_SPATIAL_INDEX[id];
        return `${coord.x},${coord.y}`;
    }).join(" ");

    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", points);
    polyline.setAttribute("stroke", "#00ff66");
    polyline.setAttribute("stroke-width", "10");
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke-dasharray", "20,10"); // Tactical dashed line
    polyline.style.filter = "drop-shadow(0 0 8px #00ff66)";
    
    svg.appendChild(polyline);
}

/** 🟢 MISSION COMPLETE LOGIC */
function confirmSafety() {
    const svg = document.getElementById('route-layer');
    const dot = document.getElementById('user-dot');
    const status = document.getElementById('hazard-status');

    if (svg) svg.innerHTML = "";
    if (dot) dot.style.display = "none";
    
    // Safety check for the innerText error
    if (status) {
        status.innerText = "STATUS: USER SECURED";
        status.style.color = "#00ff66";
    }

    currentMarkerId = null; // Reset location state
    console.log("ORACLE: Evacuation Success confirmed.");
    if (navigator.vibrate) navigator.vibrate([100, 50, 500]);
}

/** 🟠 DYNAMIC REROUTE LOGIC */
function reportBlockedPath() {
    // 🛡️ Guard: Don't reroute if we aren't even located yet
    if (currentMarkerId === null) {
        console.warn("ORACLE: Reroute failed - No active location.");
        return; 
    }

    console.warn(`ORACLE: Rerouting from marker ${currentMarkerId}...`);
    
    // Logic: Find the first node in the current path that ISN'T the user's current node
    // For now, let's just assume the Gym (ID 1) is blocked for the demo
    activeHazards.add("1"); 
    
    // Re-run the localization to find a new path
    executeIndoorLocalization(currentMarkerId);
}

// --- ⚠️ HAZARD COMMAND ENGINE ---
let currentHazardMode = null;

// 1. TACTICAL SIDEBAR REGISTRY
function toggleSidebar() {
    const sidebar = document.getElementById('hazard-sidebar');
    if (!sidebar) return; // Safety check
    
    const isActive = sidebar.classList.toggle('active');
    
    // Save state for offline persistence
    localStorage.setItem('ORACLE_SIDEBAR_STATUS', isActive ? "true" : "false");
    
    if (navigator.vibrate) navigator.vibrate(40);
}

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
    const hazard = document.createElement('div');
    hazard.className = `hazard-marker hazard-${type}`;
    hazard.id = hazardId;
    hazard.style.left = x;
    hazard.style.top = y;
    hazard.dataset.type = type;

    const icons = { fire: '🔥', flood: '🌊', bio: '☣️', structure: '🏗️', electric: '⚡' };
    hazard.innerHTML = `<div class="hazard-icon">${icons[type]}</div>`;

    // UPDATE & DELETE (The CRUD menu for Hazards)
    hazard.onclick = (e) => {
        e.stopPropagation();
        showHazardIntel(hazardId, type);
    };

    document.getElementById('map-img').appendChild(hazard);
    
    if (!isSilent) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        saveOperationalData(); // Custom save that includes hazards
    }
}

// --- 🛠️ HAZARD INTEL: UPDATE & DELETE LOGIC ---
async function showHazardIntel(id, type) {
    const el = document.getElementById(id);
    if (!el) return;

    // 1. INITIAL ACTION PROMPT
    const action = await tacticalPrompt(
        "HAZARD INTEL", 
        `CURRENT: ${type.toUpperCase()}\n\n[DELETE] - PURGE MARKER\n[UPDATE] - CHANGE TYPE\n[ANY] - EXIT`, 
        true, 
        "TYPE 'DELETE' OR 'UPDATE'"
    );
    
    if (!action) return;

    // 🗑️ DELETE BRANCH
    if (action.toUpperCase() === 'DELETE') {
        el.remove();
        saveOperationalData();
        if (navigator.vibrate) navigator.vibrate(100);
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
        const savedHazards = JSON.parse(localStorage.getItem('ORACLE_HAZARD_DATA') || "[]");
        savedHazards.forEach(h => createHazardMarker(h.x, h.y, h.type, h.id, true));
    } catch (e) { console.error("Hazard Load Failed", e); }
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

// Fallback for Service Worker re-renders
document.addEventListener('DOMContentLoaded', () => {
    if (!bootInitiated) initializeSystem();
});
