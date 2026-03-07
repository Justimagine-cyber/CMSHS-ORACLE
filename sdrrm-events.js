/* 🏛️ CMSHS ORACLE: TACTICAL ENGINE V22.8 - MASTER COMPILATION
    - Full Merge: Persistence (V18.7) + GPS/Hybrid (V20.1) + Unified Touch
    - Integrated: Agent Dossier CRUD, QR Generator, & True Merge Logic
    - Resolved: Boot Sequence Case-Sensitivity & Reference Errors
*/

console.log("ORACLE SYSTEM: V22.8 ONLINE - ALL MODULES INTEGRATED");

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

// --- 🛰️ GEOSPATIAL CONFIGURATION ---
const CMSHS_BOUNDS = { 
    topLat: 14.569300, 
    bottomLat: 14.568200, 
    leftLong: 121.034800, 
    rightLong: 121.036200 
};

// --- 🛰️ CORE TRACKING LOGIC ---
async function locateUser() {
    const btnText = document.getElementById('gps-text');
    
    // Toggle: Stop if already tracking
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
            tacticalPrompt("HARDWARE ERROR", "GPS SENSOR NOT DETECTED.", false, "", true);
            return;
        }

        if(btnText) btnText.innerText = "LINKING...";

        gpsWatcher = navigator.geolocation.watchPosition((pos) => {
            processCoords(pos.coords.latitude, pos.coords.longitude);
            if(btnText) btnText.innerText = "📡 LIVE";
        }, (err) => {
            tacticalPrompt("SIGNAL LOST", "SATELLITE LINK FAILED.", false, "", true);
            stopTracking();
        }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    }
}

function processCoords(lat, lng) {
    // Uses the Recalibrated CMSHS Boundaries
    const pctY = (CMSHS_BOUNDS.topLat - lat) / (CMSHS_BOUNDS.topLat - CMSHS_BOUNDS.bottomLat);
    const pctX = (lng - CMSHS_BOUNDS.leftLong) / (CMSHS_BOUNDS.rightLong - CMSHS_BOUNDS.leftLong);
    
    const mapImg = document.getElementById('map-img');
    if (!mapImg) return;

    const pixelX = mapImg.offsetWidth * pctX;
    const pixelY = mapImg.offsetHeight * pctY;
    
    drawUserMarker(pixelX, pixelY);
    focusOnUser(pixelX, pixelY);
}

function startRandomMockRoaming() {
    const btnText = document.getElementById('gps-text');
    if(btnText) btnText.innerText = "📡 ROAMING";

    let currentLat = 14.568768; // Start at center point
    let currentLng = 121.035510;
    let targetLat, targetLng;
    let movements = 0;
    const MAX_MOVEMENTS = 5;

    function pickNewTarget() {
        targetLat = CMSHS_BOUNDS.bottomLat + Math.random() * (CMSHS_BOUNDS.topLat - CMSHS_BOUNDS.bottomLat);
        targetLng = CMSHS_BOUNDS.leftLong + Math.random() * (CMSHS_BOUNDS.rightLong - CMSHS_BOUNDS.leftLong);
        movements++;
    }

    pickNewTarget();

    mockInterval = setInterval(() => {
        const step = 0.000012; 
        
        if (Math.abs(currentLat - targetLat) > step) currentLat += currentLat < targetLat ? step : -step;
        if (Math.abs(currentLng - targetLng) > step) currentLng += currentLng < targetLng ? step : -step;

        processCoords(currentLat, currentLng);

        if (Math.abs(currentLat - targetLat) <= step && Math.abs(currentLng - targetLng) <= step) {
            if (movements >= MAX_MOVEMENTS) {
                tacticalPrompt("SIMULATION END", "UNIT RETURNED TO BASE.", false, "", true);
                stopTracking();
            } else {
                pickNewTarget();
            }
        }
    }, 250); 
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

function drawUserMarker(x, y) {
    let marker = document.getElementById('user-location-marker');
    const mapImg = document.getElementById('map-img');
    
    if (!marker && mapImg) {
        marker = document.createElement('div');
        marker.id = 'user-location-marker';
        marker.style.cssText = `
            width:24px; height:24px; background:#0096ff; border:3px solid white; 
            border-radius:50%; position:absolute; z-index:9999; 
            box-shadow:0 0 20px #0096ff; pointer-events:none;
            transition: left 0.3s linear, top 0.3s linear;
        `;
        mapImg.appendChild(marker);
    }
    if (marker) {
        marker.style.left = `${x - 12}px`;
        marker.style.top = `${y - 12}px`;
        marker.style.display = 'block';
    }
}

function focusOnUser(x, y) {
    if (!viewport) return;
    const vWidth = viewport.offsetWidth / 2;
    const vHeight = viewport.offsetHeight / 2;
    mapPos.x = vWidth - (x * zoom);
    mapPos.y = vHeight - (y * zoom);
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
    const rect = viewport.getBoundingClientRect();
    let agentData = await tacticalPrompt("AGENT IDENTIFICATION", "ENTER NAME & SECTOR", true, "e.g. JUAN - GYM");
    if (agentData === null) return;
    if (agentData.trim() === "") { agentData = "Unnamed Agent"; }

    const mouseX = (clientX - rect.left - mapPos.x) / zoom;
    const mouseY = (clientY - rect.top - mapPos.y) / zoom;
    const tacticalTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    createDot(`${mouseX - 8}px`, `${mouseY - 8}px`, currentType, agentData, tacticalTimestamp);
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
            <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.4; max-height:380px; overflow-y:auto; padding-right:5px; color:#ccc;">
                <p style="font-size:0.8rem; margin-bottom:15px;">CMSHS ORACLE Tactical PWA S.Y. 2025-2026.</p>
                <p style="color:#0f6; font-weight:bold; font-size:0.75rem;">DEVELOPED BY:</p>
                <p style="font-size:0.7rem; margin:0;">Mark Justin L. Castillo, 12 - Planck</p>
                <p style="font-style:italic; font-size:0.8rem; border-left: 2px solid #ffa500; padding-left:10px; margin-top:10px;">
                    "Objective judgment, now at this very moment..." — Marcus Aurelius
                </p>
            </div>
        `;

    } else if (type === 'HELP') {
        content = `
            <h3 style="font-family:'Cinzel', serif; color:#ffa500; text-align:center; border-bottom:1px solid #ffa500; padding-bottom:5px;">ORACLE MANUAL</h3>
            <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.4; max-height:350px; overflow-y:auto; padding-right:5px; color:#ccc;">
                <p style="color:#0f6; font-weight:bold; margin-top:10px;">USAGE</p>
                <ul style="padding-left:15px; margin-bottom:10px;">
                    <li><b>Plot Incident:</b> Double-tap map.</li>
                    <li><b>Change Triage:</b> Use footer HUD.</li>
                    <li><b>Zoom:</b> Pinch or scroll.</li>
                </ul>
            </div>

        `;
    } else if (type === 'UPDATES') {
        content = `
            <h3 style="font-family:'Cinzel'; color:#0f6; text-align:center; border-bottom:1px solid #0f6; padding-bottom:5px;">SYSTEM LOG</h3>
            <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.6; color:#ccc; margin-top:10px;">
                <p><b style="color:#0f6;">[v22.8]</b> MASTER COMPILATION ACTIVE.</p>
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
            await tacticalPrompt("GRID UPDATED", `${integratedPlots} NEW PLOTS INTEGRATED.`, false, "", true);
            sessionStorage.setItem('INITIAL_BOOT_COMPLETE', 'true');
            location.reload(); 

        } else {
            await tacticalPrompt("DATA INTEGRATION", "NO NEW UNIQUE PLOTS DETECTED.", false, "", true);
        }
   } catch (e) { await tacticalPrompt("CRITICAL ERROR", "DATA STRING CORRUPT.", false, "", true); }

}

async function clearMap() {
    if(await tacticalPrompt("WIPE", "ERASE ALL DATA?", false)) { localStorage.clear(); location.reload(); }
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
