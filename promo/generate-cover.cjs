const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1920, H = 1080;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Colors
const CYAN = '#00FFFF';
const PINK = '#FF0080';
const GOLD = '#FFD700';
const BG_TOP = '#252545';
const BG_BOTTOM = '#0D0D1A';

console.log('Generating ARAN cover image...');

// Background gradient
const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
bgGrad.addColorStop(0, BG_TOP);
bgGrad.addColorStop(1, BG_BOTTOM);
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, W, H);

// Grid lines (subtle)
ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
ctx.lineWidth = 1;
for (let x = 0; x < W; x += 60) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, H);
  ctx.stroke();
}
for (let y = 0; y < H; y += 60) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(W, y);
  ctx.stroke();
}

// Factory silhouette at bottom
ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
const rand = (min, max) => min + Math.random() * (max - min);
for (let x = 0; x < W; x += rand(80, 140)) {
  const bh = rand(100, 300);
  ctx.fillRect(x, H - bh, rand(50, 90), bh);
}

// Floor with neon edge
ctx.fillStyle = '#3a3a5a';
ctx.fillRect(0, H - 80, W, 80);
const floorGrad = ctx.createLinearGradient(0, H - 80, 0, H - 72);
floorGrad.addColorStop(0, CYAN);
floorGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
ctx.fillStyle = floorGrad;
ctx.fillRect(0, H - 80, W, 8);

// Ceiling with neon edge
ctx.fillStyle = '#3a3a5a';
ctx.fillRect(0, 0, W, 80);
const ceilGrad = ctx.createLinearGradient(0, 72, 0, 80);
ceilGrad.addColorStop(0, 'rgba(255, 0, 128, 0)');
ceilGrad.addColorStop(1, PINK);
ctx.fillStyle = ceilGrad;
ctx.fillRect(0, 72, W, 8);

// Background gears (decorative)
function drawGear(x, y, r, teeth, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const tx = x + Math.cos(angle) * r;
    const ty = y + Math.sin(angle) * r;
    ctx.fillRect(tx - 8, ty - 8, 16, 16);
  }
  ctx.beginPath();
  ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = BG_BOTTOM;
  ctx.fill();
  ctx.restore();
}

drawGear(200, 200, 80, 10, '#4a4a6a', 0.3);
drawGear(1750, 300, 100, 12, '#4a4a6a', 0.25);
drawGear(300, 800, 60, 8, '#4a4a6a', 0.2);
drawGear(1600, 850, 70, 9, '#4a4a6a', 0.25);

// Spikes on floor (left side)
ctx.fillStyle = GOLD;
for (let i = 0; i < 4; i++) {
  const sx = 100 + i * 50;
  ctx.beginPath();
  ctx.moveTo(sx, H - 80);
  ctx.lineTo(sx + 20, H - 140);
  ctx.lineTo(sx + 40, H - 80);
  ctx.fill();
}

// Spikes on ceiling (right side)
for (let i = 0; i < 3; i++) {
  const sx = 1550 + i * 50;
  ctx.beginPath();
  ctx.moveTo(sx, 80);
  ctx.lineTo(sx + 20, 140);
  ctx.lineTo(sx + 40, 80);
  ctx.fill();
}

// Laser beam (horizontal)
ctx.strokeStyle = PINK;
ctx.lineWidth = 4;
ctx.shadowColor = PINK;
ctx.shadowBlur = 20;
ctx.beginPath();
ctx.moveTo(1200, 400);
ctx.lineTo(1800, 400);
ctx.stroke();
ctx.shadowBlur = 0;

// Collectible gears (gold, floating)
function drawCollectibleGear(x, y, size) {
  ctx.save();
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 15;
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tx = x + Math.cos(angle) * size;
    const ty = y + Math.sin(angle) * size;
    ctx.fillRect(tx - 5, ty - 5, 10, 10);
  }
  ctx.fillStyle = '#FFA500';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

drawCollectibleGear(600, 350, 25);
drawCollectibleGear(750, 550, 20);
drawCollectibleGear(500, 700, 22);

// Helper for rounded rect
function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
}

// ARAN Robot - DETAILED WITH LIFE!
function drawRobot(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Outer glow (larger, softer)
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 60;
  ctx.fillStyle = 'rgba(0, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.arc(0, 10, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === LEGS ===
  ctx.fillStyle = '#4a5a6a';
  // Left leg
  ctx.fillRect(-28, 40, 14, 30);
  ctx.fillRect(-32, 65, 20, 10);
  // Right leg (slightly forward - walking pose)
  ctx.save();
  ctx.translate(14, 40);
  ctx.rotate(-0.15);
  ctx.fillRect(0, 0, 14, 28);
  ctx.fillRect(-4, 23, 20, 10);
  ctx.restore();
  
  // Leg highlights
  ctx.fillStyle = '#6a7a8a';
  ctx.fillRect(-26, 42, 5, 25);
  ctx.fillRect(16, 42, 5, 23);
  
  // Knee joints
  ctx.fillStyle = '#3a4a5a';
  ctx.beginPath();
  ctx.arc(-21, 55, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(21, 53, 6, 0, Math.PI * 2);
  ctx.fill();

  // === ARMS ===
  // Left arm - RAISED AND WAVING!
  ctx.save();
  ctx.translate(-48, -10);
  ctx.rotate(-0.8); // Arm raised high
  
  // Upper arm
  ctx.fillStyle = '#4a5a6a';
  ctx.fillRect(-6, -35, 14, 35);
  
  // Elbow joint
  ctx.fillStyle = '#3a4a5a';
  ctx.beginPath();
  ctx.arc(1, -35, 7, 0, Math.PI * 2);
  ctx.fill();
  
  // Forearm (waving)
  ctx.save();
  ctx.translate(1, -35);
  ctx.rotate(-0.6);
  ctx.fillStyle = '#4a5a6a';
  ctx.fillRect(-5, -25, 12, 25);
  
  // Hand
  ctx.fillStyle = '#66D9FF';
  ctx.beginPath();
  ctx.arc(1, -30, 11, 0, Math.PI * 2);
  ctx.fill();
  // Fingers spread (waving hello!)
  ctx.fillRect(-8, -45, 4, 12);
  ctx.fillRect(-2, -47, 4, 14);
  ctx.fillRect(4, -45, 4, 12);
  ctx.restore();
  ctx.restore();
  
  // Right arm - relaxed at side
  ctx.save();
  ctx.translate(48, -5);
  ctx.rotate(0.3);
  ctx.fillStyle = '#4a5a6a';
  ctx.fillRect(-6, -5, 14, 35);
  // Elbow
  ctx.fillStyle = '#3a4a5a';
  ctx.beginPath();
  ctx.arc(1, 15, 6, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillRect(-5, 15, 12, 25);
  // Hand
  ctx.fillStyle = '#66D9FF';
  ctx.beginPath();
  ctx.arc(1, 42, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === BODY ===
  // Body shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  roundRect(ctx, -38, -30, 76, 72, 12);
  ctx.fill();

  // Main body with gradient
  const bodyGrad = ctx.createLinearGradient(-40, -32, 40, 40);
  bodyGrad.addColorStop(0, '#88EEFF');
  bodyGrad.addColorStop(0.3, '#66D9FF');
  bodyGrad.addColorStop(1, '#44AACC');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  roundRect(ctx, -40, -32, 80, 72, 14);
  ctx.fill();

  // Body panel lines
  ctx.strokeStyle = 'rgba(0, 40, 60, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-28, -32);
  ctx.lineTo(-28, 40);
  ctx.moveTo(28, -32);
  ctx.lineTo(28, 40);
  ctx.stroke();

  // Chest power core (glowing!)
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 25;
  ctx.fillStyle = CYAN;
  ctx.beginPath();
  ctx.arc(0, 12, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-4, 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Body highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  roundRect(ctx, -35, -28, 70, 18, 8);
  ctx.fill();

  // === NECK ===
  ctx.fillStyle = '#3a4a5a';
  ctx.fillRect(-10, -42, 20, 12);

  // === HEAD ===
  ctx.save();
  ctx.rotate(0.08); // Slight curious tilt
  
  // Head shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  roundRect(ctx, -38, -95, 76, 58, 14);
  ctx.fill();
  
  // Main head with gradient
  const headGrad = ctx.createLinearGradient(-38, -95, 38, -37);
  headGrad.addColorStop(0, '#99EEFF');
  headGrad.addColorStop(0.4, '#66D9FF');
  headGrad.addColorStop(1, '#44BBDD');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  roundRect(ctx, -38, -97, 76, 60, 14);
  ctx.fill();

  // Head highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  roundRect(ctx, -32, -93, 64, 14, 6);
  ctx.fill();

  // === ANTENNA ===
  ctx.fillStyle = '#777777';
  ctx.fillRect(-4, -115, 8, 20);
  
  // Antenna ball (glowing green)
  ctx.shadowColor = '#00FF00';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#00FF00';
  ctx.beginPath();
  ctx.arc(0, -120, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#AAFFAA';
  ctx.beginPath();
  ctx.arc(-4, -124, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === VISOR/FACE ===
  ctx.fillStyle = '#0a1822';
  ctx.beginPath();
  roundRect(ctx, -32, -85, 64, 38, 10);
  ctx.fill();
  
  // Visor reflection
  ctx.fillStyle = 'rgba(0, 200, 255, 0.08)';
  ctx.beginPath();
  roundRect(ctx, -28, -82, 56, 12, 5);
  ctx.fill();

  // === EYES - EXPRESSIVE! ===
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 20;
  
  // Left eye (looking up-right with excitement)
  ctx.fillStyle = CYAN;
  ctx.beginPath();
  ctx.ellipse(-13, -66, 13, 16, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Left pupil (white, looking up-right)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-9, -70, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Sparkle
  ctx.beginPath();
  ctx.arc(-11, -74, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Right eye (slightly bigger = excitement!)
  ctx.fillStyle = CYAN;
  ctx.beginPath();
  ctx.ellipse(13, -66, 14, 17, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Right pupil
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(17, -70, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Sparkle
  ctx.beginPath();
  ctx.arc(14, -74, 3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;

  // Eyebrow accents (determined/excited)
  ctx.strokeStyle = '#44AACC';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-25, -86);
  ctx.lineTo(-5, -88);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5, -88);
  ctx.lineTo(25, -86);
  ctx.stroke();

  // Cheek blush lights
  ctx.fillStyle = 'rgba(255, 100, 150, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-24, -56, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(24, -56, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth - BIG HAPPY SMILE!
  ctx.strokeStyle = '#225566';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -52, 12, 0.3, Math.PI - 0.3);
  ctx.stroke();
  // Smile highlights
  ctx.strokeStyle = '#446677';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -52, 8, 0.5, Math.PI - 0.5);
  ctx.stroke();

  ctx.restore(); // End head tilt

  // === EAR PIECES ===
  ctx.fillStyle = '#4a6080';
  ctx.beginPath();
  ctx.ellipse(-42, -72, 10, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(42, -72, 10, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ear lights
  ctx.shadowColor = PINK;
  ctx.shadowBlur = 10;
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.arc(-42, -72, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(42, -72, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === BODY BOLTS ===
  ctx.fillStyle = '#AABBCC';
  const boltPositions = [[-34, -22], [34, -22], [-34, 30], [34, 30]];
  boltPositions.forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#DDEEFF';
    ctx.beginPath();
    ctx.arc(bx - 1, by - 1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#AABBCC';
  });

  ctx.restore();
}

drawRobot(400, 500, 2.6);

// Gravity arrows (up and down)
ctx.save();
ctx.strokeStyle = CYAN;
ctx.lineWidth = 6;
ctx.shadowColor = CYAN;
ctx.shadowBlur = 15;

// Up arrow
ctx.beginPath();
ctx.moveTo(560, 480);
ctx.lineTo(560, 380);
ctx.moveTo(560, 380);
ctx.lineTo(540, 400);
ctx.moveTo(560, 380);
ctx.lineTo(580, 400);
ctx.stroke();

// Down arrow
ctx.strokeStyle = PINK;
ctx.shadowColor = PINK;
ctx.beginPath();
ctx.moveTo(560, 580);
ctx.lineTo(560, 680);
ctx.moveTo(560, 680);
ctx.lineTo(540, 660);
ctx.moveTo(560, 680);
ctx.lineTo(580, 660);
ctx.stroke();

ctx.restore();

// Title: ARAN
ctx.save();
ctx.font = 'bold 220px monospace';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Glow
ctx.shadowColor = CYAN;
ctx.shadowBlur = 50;
ctx.fillStyle = CYAN;
ctx.fillText('ARAN', W / 2 + 200, H / 2 - 80);

// Main text
ctx.shadowBlur = 0;
ctx.strokeStyle = '#003333';
ctx.lineWidth = 12;
ctx.strokeText('ARAN', W / 2 + 200, H / 2 - 80);
ctx.fillStyle = CYAN;
ctx.fillText('ARAN', W / 2 + 200, H / 2 - 80);
ctx.restore();

// Subtitle
ctx.save();
ctx.font = 'bold 48px monospace';
ctx.textAlign = 'center';
ctx.fillStyle = PINK;
ctx.shadowColor = PINK;
ctx.shadowBlur = 10;
ctx.fillText('FACTORY ESCAPE', W / 2 + 200, H / 2 + 40);
ctx.restore();

// Tagline
ctx.save();
ctx.font = '28px monospace';
ctx.textAlign = 'center';
ctx.fillStyle = '#888888';
ctx.fillText('ONE BUTTON  •  FLIP GRAVITY  •  SURVIVE', W / 2 + 200, H / 2 + 110);
ctx.restore();

// Jam badge
ctx.save();
ctx.font = '20px monospace';
ctx.textAlign = 'center';
ctx.fillStyle = '#555555';
ctx.fillText('GAMEDEV.JS JAM 2026  •  THEME: MACHINES', W / 2 + 200, H / 2 + 170);
ctx.restore();

// Corner accents
ctx.strokeStyle = CYAN;
ctx.lineWidth = 3;
// Top-left
ctx.beginPath();
ctx.moveTo(30, 120);
ctx.lineTo(30, 30);
ctx.lineTo(120, 30);
ctx.stroke();
// Top-right
ctx.beginPath();
ctx.moveTo(W - 30, 120);
ctx.lineTo(W - 30, 30);
ctx.lineTo(W - 120, 30);
ctx.stroke();
// Bottom-left
ctx.strokeStyle = PINK;
ctx.beginPath();
ctx.moveTo(30, H - 120);
ctx.lineTo(30, H - 30);
ctx.lineTo(120, H - 30);
ctx.stroke();
// Bottom-right
ctx.beginPath();
ctx.moveTo(W - 30, H - 120);
ctx.lineTo(W - 30, H - 30);
ctx.lineTo(W - 120, H - 30);
ctx.stroke();

// Vignette
const vignette = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.7);
vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
ctx.fillStyle = vignette;
ctx.fillRect(0, 0, W, H);

// Save to file
const outPath = path.join(__dirname, 'cover-1920x1080.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);
console.log(`✅ Cover image saved to: ${outPath}`);

// Also generate 630x500 for itch.io thumbnail
const thumbCanvas = createCanvas(630, 500);
const thumbCtx = thumbCanvas.getContext('2d');
thumbCtx.drawImage(canvas, 0, 0, 1920, 1080, 0, 0, 630, 500);
const thumbPath = path.join(__dirname, 'cover-630x500.png');
fs.writeFileSync(thumbPath, thumbCanvas.toBuffer('image/png'));
console.log(`✅ Thumbnail saved to: ${thumbPath}`);
