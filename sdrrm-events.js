/* 🏛️ CMSHS ORACLE: TACTICAL ENGINE V8.0
    Decentralized Emergency Mapping System
*/

console.log("ORACLE SYSTEM: ONLINE");

// --- INITIAL STATE ---
let currentType = 0;
let counts = [0, 0, 0, 0];
const colors = ['#00ff66', '#ffff00', '#ff3333', '#888888']; // Minor, Delayed, Immediate, Deceased

const map = document.getElementById('map-img');
const viewport = document.getElementById('viewport');
const needle = document.getElementById('needle');

// WORLD STATE
let mapPos = { x: -400, y: -300 };
let zoom = 1;
const ZOOM_SPEED = 0.08;
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let needleRot = 45;

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
    console.log("ORACLE: Tactical State Archived.");
}

function loadState() {
    const savedDots = JSON.parse(localStorage.getItem('ORACLE_GRID_DATA'));
    const savedCounts = JSON.parse(localStorage.getItem('ORACLE_STATS'));

    if (savedCounts) {
        counts = savedCounts;
        updateHUD();
    }
    if (savedDots) {
        savedDots.forEach(d => {
            createDot(d.x, d.y, d.type, d.agent, d.time, true);
        });
        console.log("ORACLE: Tactical Data Restored.");
    }
}

function updateHUD() {
    const ids = ['g-c', 'y-c', 'r-c', 'b-c'];
    ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if(el) el.innerText = counts[i];
    });
}

function setStatus(s) { 
    currentType = s; 
    console.log(`ORACLE: Mode set to ${["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"][s]}`);
}

function updateMapTransform() {
    map.style.transform = `translate(${mapPos.x}px, ${mapPos.y}px) scale(${zoom})`;
    map.style.setProperty('--zoom-level', zoom);
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

// 🏛️ CORE PLOTTING LOGIC
function createDot(x, y, type, agentData, timestamp, isSilent = false) {
    const typeInt = parseInt(type);
    
    const dotContainer = document.createElement('div');
    dotContainer.className = 'triage-dot'; 
    
    // Assign Tactical Class for CSS Animation (Blinking)
    const classMap = ['green', 'yellow', 'red', 'black'];
    dotContainer.classList.add(classMap[typeInt]);

    dotContainer.style.position = 'absolute';
    dotContainer.style.left = x;
    dotContainer.style.top = y;
    dotContainer.style.pointerEvents = 'auto'; 

    dotContainer.dataset.type = typeInt;
    dotContainer.dataset.agent = agentData;
    dotContainer.dataset.timestamp = timestamp;

    const dotInner = document.createElement('div');
    dotInner.style.width = '16px'; 
    dotInner.style.height = '16px';
    dotInner.style.borderRadius = '50%';
    dotInner.style.backgroundColor = colors[typeInt];
    dotInner.style.boxShadow = `0 0 15px ${colors[typeInt]}`;
    
    const triageStatus = ["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"][typeInt];
    
    // Intel Trigger
    dotInner.onclick = (e) => { 
        e.stopPropagation(); 
        showIntel(agentData, triageStatus, timestamp); 
    };

    dotContainer.appendChild(dotInner);

    const label = document.createElement('div');
    label.className = 'triage-label';
    label.innerText = agentData.split(' - ')[0]; // Show name only on map
    dotContainer.appendChild(label);

    map.appendChild(dotContainer);

    if (!isSilent) {
        counts[typeInt]++;
        updateHUD();
        saveState();
    }
}

// 🏛️ INTEL OVERLAY
const intelOverlay = document.createElement('div');
intelOverlay.id = 'intel-overlay';
document.body.appendChild(intelOverlay);

function showIntel(name, status, time) {
    intelOverlay.innerHTML = `
        <h3>AGENT PROFILE</h3>
        <p><strong>ID:</strong> ${name}</p>
        <p><strong>STATUS:</strong> <span style="color:${colors[["MINOR", "DELAYED", "IMMEDIATE", "DECEASED"].indexOf(status)]}">${status}</span></p>
        <p><strong>LAST SEEN:</strong> ${time}</p>
        <p><strong>SECTOR:</strong> CMSHS MAIN GRID</p>
        <div class="close-intel" onclick="this.parentElement.style.display='none'">[ DISMISS ]</div>
    `;
    intelOverlay.style.display = 'block';
}

// --- NAVIGATION & INTERACTION ---

viewport.addEventListener('dblclick', e => {
    const rect = viewport.getBoundingClientRect();
    let agentData = prompt("AGENT IDENTIFICATION\n(Name - Location/Room Number)");
    
    if (agentData === null) return; 
    if (agentData.trim() === "") agentData = "UNKNOWN AGENT";

    const mouseX = (e.clientX - rect.left - mapPos.x) / zoom;
    const mouseY = (e.clientY - rect.top - mapPos.y) / zoom;
    const timestamp = new Date().toLocaleTimeString();

    createDot((mouseX - 8) + 'px', (mouseY - 8) + 'px', currentType, agentData, timestamp);
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
    mapPos.x += dx; 
    mapPos.y += dy;
    updateMapTransform();
    
    // Compass logic
    needleRot += dx * 0.4;
    needle.style.transform = `rotate(${needleRot}deg)`;
    
    lastMouse = { x: e.clientX, y: e.clientY };
});

viewport.addEventListener('pointerup', () => {
    isDragging = false;
    viewport.style.cursor = 'crosshair';
});

// 📱 MOBILE PINCH-TO-ZOOM
viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
        initialDist = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );
        initialZoom = zoom;
    }
}, { passive: false });

viewport.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
        e.preventDefault(); 
        const currentDist = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );
        const scale = currentDist / initialDist;
        zoom = Math.min(Math.max(0.4, initialZoom * scale), 4);
        updateMapTransform();
    }
}, { passive: false });

// 🏛️ SYSTEM BOOT
window.addEventListener('load', () => {
    updateMapTransform();
    loadState();

    const bootText = document.querySelector('.boot-text');
    const message = "INITIALIZING CMSHS ORACLE...         CMSHS SECURE GRID";
    let charIndex = 0;
    if(bootText) {
        bootText.innerText = "";
        function typeWriter() {
            if (charIndex < message.length) {
                bootText.innerText += message.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 40); 
            }
        }
        typeWriter();
    }

    setTimeout(() => {
        const overlay = document.getElementById('boot-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 1000); 
        }
    }, 2800); 
});

// 🏛️ PWA PROTOCOL
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('ORACLE: Offline Protocol Active'))
      .catch(err => console.log('ORACLE: Offline Protocol Failed', err));
}
