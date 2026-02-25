/* 🏛️ CMSHS ORACLE: TACTICAL ENGINE V18.3 
    UI Cleanup & Plotting Persistence Fix
*/

console.log("ORACLE SYSTEM: ONLINE");

// --- INITIAL STATE ---
let currentType = 0;
let counts = [0, 0, 0, 0];
const colors = ['#00ff66', '#ffff00', '#ff3333', '#888888']; 

// Global element references
const map = document.getElementById('map-img');
const viewport = document.getElementById('viewport');

// WORLD STATE
let mapPos = { x: -400, y: -300 };
let zoom = 1;
const ZOOM_SPEED = 0.08;
let isDragging = false;
let lastMouse = { x: 0, y: 0 };

// MOBILE ZOOM STATE
let initialDist = 0;
let initialZoom = 1;

// --- PERSISTENCE ENGINE ---
function saveState() {
    const dots = [];
    document.querySelectorAll('.triage-dot').forEach(d => {
        dots.push({
            x: d.style.left,
            y: d.style.top,
            type: d.dataset.type,
            agent: d.dataset.agent,
            time: d.dataset.timestamp
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
                    if (d.x && d.y) createDot(d.x, d.y, d.type, d.agent, d.time, true);
                });
            }
        }
    } catch (err) {
        console.error("ORACLE: Cache Load Error", err);
    }
}

function updateHUD() {
    const countsMap = { 'g-c': 0, 'y-c': 1, 'r-c': 2, 'b-c': 3 };
    for (const [id, index] of Object.entries(countsMap)) {
        const el = document.getElementById(id);
        if (el) el.innerText = counts[index];
    }
}

function setStatus(s) { 
    currentType = s; 
    console.log(`ORACLE: Mode set to ${["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"][s]}`);
}

function updateMapTransform() {
    if (map) {
        map.style.transform = `translate(${mapPos.x}px, ${mapPos.y}px) scale(${zoom})`;
        map.style.setProperty('--zoom-level', zoom);
    }
}

function clearMap() {
    if(confirm("WIPE ALL OPERATIONAL DATA?")) {
        localStorage.removeItem('ORACLE_GRID_DATA');
        localStorage.removeItem('ORACLE_STATS');
        document.querySelectorAll('.triage-dot').forEach(dot => dot.remove());
        counts = [0, 0, 0, 0];
        updateHUD();
    }
}

// --- CORE PLOTTING LOGIC (FIXED POSITIONING) ---
function createDot(x, y, type, agentData, timestamp, isSilent = false) {
    const typeInt = (type === null || type === undefined) ? 0 : parseInt(type);
    const mapEl = document.getElementById('map-img'); // Re-fetching to ensure context
    
    if (!mapEl) return;

    const dotContainer = document.createElement('div');
    dotContainer.className = 'triage-dot'; 
    const classMap = ['green', 'yellow', 'red', 'black'];
    const safeType = isNaN(typeInt) ? 0 : Math.min(Math.max(0, typeInt), 3);
    
    dotContainer.classList.add(classMap[safeType]);
    dotContainer.style.position = 'absolute';
    dotContainer.style.left = x;
    dotContainer.style.top = y;

    dotContainer.dataset.type = safeType;
    dotContainer.dataset.agent = agentData || "UNKNOWN AGENT";
    dotContainer.dataset.timestamp = timestamp || new Date().toLocaleTimeString();

    const dotInner = document.createElement('div');
    dotInner.style.width = '16px'; 
    dotInner.style.height = '16px';
    dotInner.style.borderRadius = '50%';
    dotInner.style.backgroundColor = colors[safeType];
    dotInner.style.boxShadow = `0 0 15px ${colors[safeType]}`;
    
    const triageStatus = ["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"][safeType];
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
        counts[safeType]++;
        updateHUD();
        saveState();
    }
}

// --- TACTICAL SYNC & QR ---
function generateTacticalQR() {
    const data = localStorage.getItem('ORACLE_GRID_DATA');
    if (!data || data === "[]") {
        alert("PROTOCOL ERROR: NO DATA TO ENCODE");
        return;
    }
    const b64Data = btoa(data);
    const qr = qrcode(0, 'L');
    qr.addData(b64Data);
    qr.make();
    
    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#0f6;">TACTICAL SYNC</h3>
        <div style="background:white; padding:10px; display:inline-block; margin-bottom:10px;">
            ${qr.createImgTag(4)}
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
            <button onclick="copyToClipboard('${b64Data}')" class="close-intel" style="border-color:#00aaff; color:#00aaff;">[ COPY DATA STRING ]</button>
            <button onclick="importTacticalGrid()" class="close-intel" style="border-color:#ffa500; color:#ffa500;">[ IMPORT DATA STRING ]</button>
            <button onclick="document.getElementById('intel-overlay').style.display='none'" class="close-intel">[ DISMISS ]</button>
        </div>
    `;
    overlay.style.display = 'block';
}

function copyToClipboard(str) {
    navigator.clipboard.writeText(str).then(() => alert("DATA COPIED"))
    .catch(() => {
        const el = document.createElement('textarea');
        el.value = str; document.body.appendChild(el);
        el.select(); document.execCommand('copy');
        document.body.removeChild(el);
        alert("DATA COPIED (FALLBACK)");
    });
}

function importTacticalGrid() {
    const code = prompt("INPUT TACTICAL SYNC CODE:");
    if (!code) return;
    try {
        localStorage.setItem('ORACLE_GRID_DATA', atob(code));
        sessionStorage.setItem('FAST_BOOT', 'true');
        location.reload(); 
    } catch (e) { alert("ERROR: INVALID DATA"); }
}

// Updated: Removed Import Button from here
function showIntelligenceReport() {
    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#0f6;">ORACLE INTEL REPORT</h3>
        <div style="text-align:left; font-size:0.8em; font-family:'Montserrat', sans-serif;">
            <p><b>[v18.3]</b> Plotting Positioning Fix deployed.</p>
            <p><b>[v18.3]</b> Import moved to Share menu for security.</p>
            <p><b>[v18.1]</b> Unstoppable Boot sequence active.</p>
        </div>
        <div class="close-intel" onclick="this.parentElement.style.display='none'">[ DISMISS ]</div>
    `;
    overlay.style.display = 'block';
}

function showIntel(name, status, time) {
    const overlay = document.getElementById('intel-overlay');
    overlay.innerHTML = `
        <h3 style="font-family:'Cinzel', serif; color:#00ff66; margin-bottom:15px; border-bottom:1px solid #00ff66; padding-bottom:5px;">AGENT PROFILE</h3>
        <div style="text-align:left; font-family:'Montserrat', sans-serif; font-size:0.9em;">
            <p><strong>ID:</strong> ${name}</p>
            <p><strong>STATUS:</strong> <span style="color:${colors[["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"].indexOf(status)]}; font-weight:900;">${status}</span></p>
            <p><strong>TIME:</strong> ${time}</p>
        </div>
        <div class="close-intel" onclick="document.getElementById('intel-overlay').style.display='none'">[ DISMISS ]</div>
    `;
    overlay.style.display = 'block';
}

// --- INTERACTION HANDLERS ---
viewport.addEventListener('dblclick', e => {
    const rect = viewport.getBoundingClientRect();
    let agentData = prompt("AGENT IDENTIFICATION\n(Name - Location/Room Number)");
    if (!agentData) return; 

    const mouseX = (e.clientX - rect.left - mapPos.x) / zoom;
    const mouseY = (e.clientY - rect.top - mapPos.y) / zoom;
    createDot((mouseX - 8) + 'px', (mouseY - 8) + 'px', currentType, agentData, new Date().toLocaleTimeString());
});

viewport.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    zoom = Math.min(Math.max(0.4, zoom + delta), 4);
    updateMapTransform();
}, { passive: false });

viewport.addEventListener('pointerdown', e => {
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    viewport.style.cursor = 'grabbing';
});

viewport.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    mapPos.x += dx; mapPos.y += dy;
    updateMapTransform();
    lastMouse = { x: e.clientX, y: e.clientY };
});

viewport.addEventListener('pointerup', () => {
    isDragging = false;
    viewport.style.cursor = 'crosshair';
});

// --- SYSTEM BOOT ---
window.addEventListener('load', () => {
    updateMapTransform();
    loadState();
    
    const overlay = document.getElementById('boot-overlay');
    if (!overlay) return;

    if (sessionStorage.getItem('FAST_BOOT') === 'true') {
        overlay.remove();
        sessionStorage.removeItem('FAST_BOOT');
    } else {
        const bootText = document.querySelector('.boot-text');
        const message = "INITIALIZING CMSHS ORACLE...";
        let charIndex = 0;
        if (bootText) {
            bootText.innerText = "";
            function typeWriter() {
                if (charIndex < message.length) {
                    bootText.innerText += message.charAt(charIndex++);
                    setTimeout(typeWriter, 35); 
                } else { setTimeout(terminateOverlay, 800); }
            }
            typeWriter();
        } else { terminateOverlay(); }
    }

    function terminateOverlay() {
        overlay.style.opacity = '0';
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 1000);
    }
});

window.addEventListener('click', (e) => {
    const overlay = document.getElementById('intel-overlay');
    if (e.target === overlay) overlay.style.display = 'none';
});