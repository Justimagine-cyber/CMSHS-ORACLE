/* 🏛️ CMSHS ORACLE: TACTICAL ENGINE V18.4 
    - Cinematic Boot & Typing Animation Restored
    - Instant Data Wipe Protocol (Bypass Boot)
    - Pinch-to-Zoom (Redmi Pad/Mobile Optimized)
    - Smart Merge & Fingerprinting
*/

console.log("ORACLE SYSTEM: V18.4 ONLINE");

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

// --- 🛡️ BOOT SEQUENCE ---
function initializeSystem() {
    const bootText = document.getElementById('boot-text');
    const fullText = "INITIALIZING TACTICAL GRID...\nACCESSING CMSHS ORACLE...\nSTATUS: ONLINE";
    let i = 0;

    // Restored Typing Animation logic
    function typeWriter() {
        if (bootText && i < fullText.length) {
            bootText.innerHTML += fullText.charAt(i);
            i++;
            setTimeout(typeWriter, 40);
        }
    }

    if (bootText) {
        bootText.innerHTML = "";
        typeWriter();
    }
    
    const isFastBoot = sessionStorage.getItem('FAST_BOOT');
    const delay = isFastBoot ? 500 : 3500; 

    setTimeout(() => {
        const bootOverlay = document.getElementById('boot-overlay');
        if (bootOverlay) {
            bootOverlay.style.opacity = '0';
            setTimeout(() => {
                bootOverlay.remove();
                sessionStorage.removeItem('FAST_BOOT');
            }, 500);
        }
        loadState(); 
        updateMapTransform();
    }, delay);
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
    dotContainer.dataset.uuid = existingUUID || btoa(timestamp + agentData).substring(0, 12);

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

// --- TACTICAL SYNC & MERGE ---
function generateTacticalQR() {
    const data = localStorage.getItem('ORACLE_GRID_DATA');
    const hasData = data && data !== "[]";
    const b64Data = hasData ? btoa(data) : "";

    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#0f6;">TACTICAL SYNC</h3>
        ${hasData ? `
            <div style="background:white; padding:10px; display:inline-block; margin-bottom:10px;">
                <div id="qr-target"></div>
            </div>
            <button onclick="copyToClipboard('${b64Data}')" class="close-intel" style="border-color:#00aaff; color:#00aaff; margin-bottom:10px; width:100%;">[ COPY DATA STRING ]</button>
        ` : `<p style="font-size:0.8em; color:#888;">[ NO LOCAL DATA TO SHARE ]</p>`}
        
        <button onclick="importTacticalGrid()" class="close-intel" style="border-color:#ffa500; color:#ffa500; width:100%; margin-bottom:10px;">[ IMPORT SECTOR DATA ]</button>
        <button onclick="document.getElementById('intel-overlay').style.display='none'" class="close-intel" style="width:100%;">[ DISMISS ]</button>
    `;
    overlay.style.display = 'block';

    if (hasData) {
        const qr = qrcode(0, 'L');
        qr.addData(b64Data);
        qr.make();
        document.getElementById('qr-target').innerHTML = qr.createImgTag(4);
    }
}

function importTacticalGrid() {
    const code = prompt("INPUT TACTICAL SYNC CODE (SMART MERGE):");
    if (!code) return;
    try {
        const incomingData = JSON.parse(atob(code));
        const currentData = JSON.parse(localStorage.getItem('ORACLE_GRID_DATA') || "[]");
        const existingFingerprints = new Set(currentData.map(d => d.uuid));
        let mergedCount = 0;

        incomingData.forEach(remoteDot => {
            if (!existingFingerprints.has(remoteDot.uuid)) {
                currentData.push(remoteDot);
                mergedCount++;
            }
        });

        if (mergedCount === 0) {
            alert("SYNC: NO NEW DATA FOUND (DUPLICATES IGNORED)");
        } else {
            localStorage.setItem('ORACLE_GRID_DATA', JSON.stringify(currentData));
            const newCounts = [0,0,0,0];
            currentData.forEach(d => newCounts[parseInt(d.type)]++);
            localStorage.setItem('ORACLE_STATS', JSON.stringify(newCounts));
            
            sessionStorage.setItem('FAST_BOOT', 'true');
            location.reload(); 
        }
    } catch (e) { alert("ERROR: INVALID DATA STRING"); }
}

// --- SYSTEM OVERLAYS ---
function showAbout() {
    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#00aaff; border-bottom:1px solid #88ff00; padding-bottom:5px;">ABOUT CMSHS ORACLE</h3>
        <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.85em; line-height:1.5;">
            <p><strong>PHILOSOPHY:</strong> Developed under Stoic principles—composure under pressure.</p>
            <p><strong>PURPOSE:</strong> Offline-first tactical grid for CMSHS SDRRM. Zero reliance on external servers.</p>
            <p><strong>ENGINE:</strong> TACTICAL ENGINE V18.4 (Smart Merge Enabled).</p>
            <hr style="border:0; border-top:1px solid #333; margin:10px 0;">
            <p style="font-style:italic; color:#888; font-size:0.8em;">"We cannot control the disaster, but we can master our response."</p>
        </div>
        <div class="close-intel" onclick="this.parentElement.style.display='none'">[ DISMISS ]</div>
    `;
    overlay.style.display = 'block';
}

function showIntelligenceReport() {
    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#0f6;">SYSTEM UPDATES</h3>
        <div style="text-align:left; font-size:0.8em; font-family:'Montserrat', sans-serif;">
            <p><b>[v18.4]</b> Smart Merge Engine active.</p>
            <p><b>[v18.4]</b> Vertical Reporting Protocol enabled.</p>
            <p><b>[v18.3]</b> Plotting Positioning Fix verified.</p>
        </div>
        <div class="close-intel" onclick="this.parentElement.style.display='none'">[ DISMISS ]</div>
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
    if (map) map.style.transform = `translate(${mapPos.x}px, ${mapPos.y}px) scale(${zoom})`;
}
function copyToClipboard(str) {
    navigator.clipboard.writeText(str).then(() => alert("DATA COPIED TO CLIPBOARD"));
}

// Fixed Instant Data Wipe
function clearMap() {
    if(confirm("WIPE ALL OPERATIONAL DATA?")) {
        localStorage.clear();
        counts = [0, 0, 0, 0];
        document.querySelectorAll('.triage-dot').forEach(dot => dot.remove()); // Instant wipe
        updateHUD();
        // Removed location.reload() to bypass loading screen
    }
}

// --- INPUT HANDLERS ---
viewport.addEventListener('dblclick', e => {
    const rect = viewport.getBoundingClientRect();
    let agentData = prompt("AGENT IDENTIFICATION\n(Name - Location)");
    if (!agentData) return; 
    const mouseX = (e.clientX - rect.left - mapPos.x) / zoom;
    const mouseY = (e.clientY - rect.top - mapPos.y) / zoom;
    createDot((mouseX - 8) + 'px', (mouseY - 8) + 'px', currentType, agentData, new Date().toLocaleTimeString());
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
        <p style="text-align:left; font-size:0.9em;"><strong>ID:</strong> ${name}<br><strong>STATUS:</strong> ${status}<br><strong>TIME:</strong> ${time}</p>
        <div class="close-intel" onclick="document.getElementById('intel-overlay').style.display='none'">[ DISMISS ]</div>
    `;
    overlay.style.display = 'block';
}