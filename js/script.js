const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');
const terminal = document.getElementById('logTerminal');

// Resize canvas to fit container
function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// System State
let packets = [];
let aiQueue = [];
let aiProcessingTime = 0;
let frames = 0;

// Constants & Dimensions
const MAX_QUEUE = 50;
const ZONES = {
    spawnX: 0,
    firewallX: 0,
    aiX: 0,
};

class Packet {
    constructor(type, x, y) {
        this.x = x !== undefined ? x : 0;
        this.y = y !== undefined ? y : Math.random() * (canvas.height - 40) + 20;
        this.speed = Math.random() * 2 + 2;
        this.type = type; // 'normal', 'obvious', 'stealth'
        this.state = 'moving'; // moving, blocked, queued, processing, done
        this.radius = 4;
        this.alpha = 1;
        
        if (this.type === 'normal') this.color = '#34d399'; // emerald-400
        else if (this.type === 'obvious') this.color = '#ef4444'; // red-500
        else this.color = '#fbbf24'; // amber-400
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        if (this.state === 'moving') {
            this.x += this.speed;
            
            // Collision with Firewall
            if (this.x > ZONES.firewallX && this.x < ZONES.firewallX + 40) {
                if (this.type === 'obvious') {
                    this.state = 'blocked';
                    createParticles(this.x, this.y, this.color);
                    logEvent('FIREWALL: Blocked obvious signature (SQLi/XSS)', 'text-red-500');
                } else if (this.type === 'stealth') {
                    this.state = 'queued';
                    if (aiQueue.length < MAX_QUEUE) {
                        aiQueue.push(this);
                    } else {
                        this.state = 'dropped'; // Gargalo!
                        logEvent('SYSTEM: Dropped packet. AI Queue FULL! (GARGALO)', 'text-amber-500 font-bold');
                    }
                }
            }
            
            // Normal passes through and fades
            if (this.x > canvas.width) {
                this.state = 'done';
            }
        } else if (this.state === 'blocked' || this.state === 'dropped') {
            this.alpha -= 0.05;
            if (this.alpha <= 0) this.state = 'done';
        }
    }
}

let particles = [];
function createParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            color: color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 2, 2);
            ctx.restore();
        }
    }
}

function drawZones() {
    ZONES.firewallX = canvas.width * 0.4;
    ZONES.aiX = canvas.width * 0.8;

    // Draw Firewall Line
    ctx.fillStyle = 'rgba(71, 85, 105, 0.5)'; // slate
    ctx.fillRect(ZONES.firewallX, 0, 40, canvas.height);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter';
    ctx.fillText('FIREWALL', ZONES.firewallX - 10, 20);
    ctx.fillText('(Regras)', ZONES.firewallX - 5, 35);

    // Draw AI Server Box
    ctx.fillStyle = 'rgba(192, 38, 211, 0.2)'; // fuchsia
    ctx.fillRect(ZONES.aiX, canvas.height/2 - 60, 80, 120);
    ctx.strokeStyle = '#d946ef';
    ctx.lineWidth = 2;
    ctx.strokeRect(ZONES.aiX, canvas.height/2 - 60, 80, 120);
    ctx.fillStyle = '#e879f9';
    ctx.fillText('LLM LOCAL', ZONES.aiX + 10, canvas.height/2 - 70);

    // Draw Queue Area
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.strokeRect(ZONES.firewallX + 60, canvas.height/2 - 40, ZONES.aiX - ZONES.firewallX - 80, 80);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Fila de Análise (Logs)', ZONES.firewallX + 60, canvas.height/2 - 50);

    // Draw Queued Packets
    aiQueue.forEach((p, index) => {
        let spacing = (ZONES.aiX - ZONES.firewallX - 100) / MAX_QUEUE;
        let queueX = ZONES.firewallX + 70 + (index * spacing);
        let queueY = canvas.height/2;
        
        ctx.beginPath();
        ctx.arc(queueX, queueY, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.fill();
    });
}

function logEvent(msg, colorClass = 'text-slate-300') {
    const time = new Date().toISOString().split('T')[1].slice(0, -1);
    const div = document.createElement('div');
    div.className = colorClass;
    div.innerHTML = `[${time}] ${msg}`;
    terminal.appendChild(div);
    if (terminal.childElementCount > 50) terminal.removeChild(terminal.firstChild);
    terminal.scrollTop = terminal.scrollHeight;
}

function processAI() {
    const speedSlider = document.getElementById('aiSpeed').value;
    // Map slider (10-200) to processing delay (frames). Lower is faster.
    const processingDelay = Math.max(5, 210 - speedSlider); 

    if (aiQueue.length > 0) {
        aiProcessingTime++;
        
        // Show processing visual cue
        ctx.fillStyle = 'rgba(217, 70, 239, 0.5)';
        ctx.fillRect(ZONES.aiX, canvas.height/2 - 60, 80, 120);

        if (aiProcessingTime >= processingDelay) {
            const packet = aiQueue.shift();
            aiProcessingTime = 0;
            packet.state = 'done';
            
            // Simulate JSON Response
            const jsonStr = `{\n  "threat": "CRITICAL",\n  "type": "Brute Force",\n  "action": "BLOCK_IP"\n}`;
            logEvent(`LLM_OUTPUT: <pre class="text-fuchsia-400 mt-1 pl-4 border-l border-fuchsia-900">${jsonStr}</pre>`, 'text-fuchsia-300');
            logEvent(`-> ACTION: Telegram Alert Sent & IP Banned.`, 'text-sky-400 font-bold');
        }
    } else {
        aiProcessingTime = 0;
    }
}

function updateUI() {
    const queuePct = (aiQueue.length / MAX_QUEUE) * 100;
    const queueBar = document.getElementById('queueBar');
    queueBar.style.width = queuePct + '%';
    if(queuePct > 80) queueBar.className = "bg-red-500 h-2.5 rounded-full transition-all duration-300";
    else queueBar.className = "bg-fuchsia-500 h-2.5 rounded-full transition-all duration-300";
    document.getElementById('queueText').innerText = `${aiQueue.length} / ${MAX_QUEUE}`;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frames++;

    // Ambient Spawning based on traffic volume
    const volume = document.getElementById('trafficVolume').value;
    if (volume > 0 && frames % Math.max(1, Math.floor(100 / volume)) === 0) {
        // 90% normal, 10% obvious
        let type = Math.random() > 0.1 ? 'normal' : 'obvious';
        packets.push(new Packet(type, -10));
    }

    drawZones();
    updateParticles();

    // Update and draw packets
    for (let i = packets.length - 1; i >= 0; i--) {
        packets[i].update();
        if (packets[i].state !== 'queued' && packets[i].state !== 'dropped') {
            packets[i].draw();
        }
        if (packets[i].state === 'done') {
            packets.splice(i, 1);
        }
    }

    processAI();
    
    if (frames % 10 === 0) updateUI();

    requestAnimationFrame(animate);
}

document.getElementById('btnNormal').addEventListener('click', () => {
    for(let i=0; i<10; i++) packets.push(new Packet('normal', -10, Math.random() * canvas.height));
    logEvent('Injetando lote de tráfego legítimo...', 'text-slate-400');
});

document.getElementById('btnObvious').addEventListener('click', () => {
    for(let i=0; i<5; i++) packets.push(new Packet('obvious', -10, Math.random() * canvas.height));
    logEvent('Injetando ataque de negação/SQLi (Óbvio)...', 'text-slate-400');
});

document.getElementById('btnStealth').addEventListener('click', () => {
    for(let i=0; i<8; i++) packets.push(new Packet('stealth', -10, (canvas.height/2 - 20) + Math.random() * 40));
    logEvent('Injetando ataque de força bruta lento (Furtivo)...', 'text-amber-400');
});

// Start Simulator
logEvent('SYSTEM: Initializing SOC Simulator...');
logEvent('SYSTEM: Loading local LLM weights into memory...');
logEvent('SYSTEM: Pipeline is active. Listening on eth0.');
animate();
