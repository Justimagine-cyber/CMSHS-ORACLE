let currentType = 0;
let counts = [0, 0, 0, 0];
const colors = ['#0f0', '#ff0', '#f44', '#888'];
const map = document.getElementById('map-img');
const viewport = document.getElementById('viewport');
const needle = document.getElementById('needle');

// WORLD STATE
let mapPos = { x: -400, y: -300 };
let zoom = 1;
const ZOOM_SPEED = 0.08; // Slightly snappier zoom
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let needleRot = 45;

function setStatus(s) { currentType = s; }

// CENTRAL TRANSFORM ENGINE
function updateMapTransform() {
    map.style.transform = `translate(${mapPos.x}px, ${mapPos.y}px) scale(${zoom})`;
    map.style.setProperty('--zoom-level', zoom);
}

function clearMap() {
    if(confirm("WIPE ALL OPERATIONAL DATA?")) {
        const dots = map.querySelectorAll('.triage-dot');
        dots.forEach(dot => dot.remove());
        counts = [0, 0, 0, 0];
        const ids = ['g-c', 'y-c', 'r-c', 'b-c'];
        ids.forEach((id) => {
            document.getElementById(id).innerText = "0";
        });
    }
}

// 🏛️ ZOOM LOGIC (MOUSE WHEEL)
viewport.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    zoom = Math.min(Math.max(0.4, zoom + delta), 4); // Limits: 0.4x to 4x
    updateMapTransform();
}, { passive: false });

// NAVIGATION (DRAG TO PAN)
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
    
    // COMPASS SYNC
    needleRot += dx * 0.4;
    needle.style.transform = `rotate(${needleRot}deg)`;
    lastMouse = { x: e.clientX, y: e.clientY };
});

viewport.addEventListener('pointerup', () => {
    isDragging = false;
    viewport.style.cursor = 'crosshair';
});

// Add this near the top with your other constants
const intelOverlay = document.createElement('div');
intelOverlay.id = 'intel-overlay';
document.body.appendChild(intelOverlay);

// 🏛️ PLOTTING WITH OPTIONAL IDENTITY
viewport.addEventListener('dblclick', e => {
    const rect = viewport.getBoundingClientRect();
    
    // Identity is now optional (defaults to Unknown)
    let agentData = prompt("AGENT IDENTIFICATION (Optional)\nInput name & location of incident (e.g. D. Cruz - 42)");
    if (agentData === null) return; // Only cancel if they hit "Cancel"
    if (agentData.trim() === "") agentData = "UNKNOWN AGENT";

    const mouseX = (e.clientX - rect.left - mapPos.x) / zoom;
    const mouseY = (e.clientY - rect.top - mapPos.y) / zoom;

    const dotContainer = document.createElement('div');
    dotContainer.className = 'triage-dot'; 
    dotContainer.style.position = 'absolute';
    dotContainer.style.left = (mouseX - 8) + 'px';
    dotContainer.style.top = (mouseY - 8) + 'px';
    // Allow clicks on the dot for the new feature
    dotContainer.style.pointerEvents = 'auto'; 

    const dot = document.createElement('div');
    dot.style.width = '16px'; 
    dot.style.height = '16px';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = colors[currentType];
    dot.style.boxShadow = `0 0 15px ${colors[currentType]}`;
    dot.style.cursor = 'pointer';
    
    // Store data for the popup
    const timestamp = new Date().toLocaleTimeString();
    const triageStatus = ["MINIMAL", "DELAYED", "IMMEDIATE", "EXPECTANT"][currentType];

    // Show Intel on click
    dot.onclick = (event) => {
        event.stopPropagation();
        showIntel(agentData, triageStatus, timestamp);
    };

    if (currentType === 2) dot.style.animation = 'blink 0.8s infinite';
    dotContainer.appendChild(dot);

    const label = document.createElement('div');
    label.className = 'triage-label';
    label.innerText = agentData.split('-')[0]; // Short version for label
    dotContainer.appendChild(label);

    map.appendChild(dotContainer);

    // Update Counter HUD
    counts[currentType]++;
    const ids = ['g-c', 'y-c', 'r-c', 'b-c'];
    document.getElementById(ids[currentType]).innerText = counts[currentType];
});

// 🏛️ COMPREHENSIVE INTEL POPUP
function showIntel(name, status, time) {
    intelOverlay.innerHTML = `
        <h3>AGENT PROFILE</h3>
        <p><strong>ID:</strong> ${name}</p>
        <p><strong>STATUS:</strong> <span style="color:${status === 'IMMEDIATE' ? '#f44' : '#00ff66'}">${status}</span></p>
        <p><strong>LAST SEEN:</strong> ${time}</p>
        <p><strong>SECTOR:</strong> CMSHS MAIN GRID</p>
        <div class="close-intel" onclick="this.parentElement.style.display='none'">[ DISMISS ]</div>
    `;
    intelOverlay.style.display = 'block';
}

// 🏛️ BOOT SEQUENCE (OUTSIDE ALL OTHER FUNCTIONS)
window.addEventListener('load', () => {
    const bootText = document.querySelector('.boot-text');
    const message = "INITIALIZING  ORACLE  SYSTEM... ACCESSING  CMSHS  SECURE  GRID...";
    let charIndex = 0;
    bootText.innerText = "";

    function typeWriter() {
        if (charIndex < message.length) {
            bootText.innerText += message.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 40); // Typing speed
        }
    }
    
    typeWriter();

    // Hide overlay after text finishes + small delay
    setTimeout(() => {
        const overlay = document.getElementById('boot-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 1000); 
        }
    }, 2800); 
});

// Register Service Worker for Offline Capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('ORACLE: Offline Protocol Active'))
      .catch(err => console.log('ORACLE: Offline Protocol Failed', err));
  });
}

// Initialize
updateMapTransform();