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

// ARAN Robot (center-left, large)
function drawRobot(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Glow
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 40;
  ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Body
  ctx.fillStyle = '#66D9FF';
  ctx.beginPath();
  roundRect(ctx, -40, -35, 80, 70, 12);
  ctx.fill();

  // Body highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(-35, -30, 70, 12);

  // Antenna
  ctx.fillStyle = '#AAAAAA';
  ctx.fillRect(-5, -55, 10, 22);

  // Antenna light
  ctx.shadowColor = '#00FF00';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#00FF00';
  ctx.beginPath();
  ctx.arc(0, -60, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Visor
  ctx.fillStyle = '#112233';
  ctx.beginPath();
  roundRect(ctx, -35, -20, 70, 28, 6);
  ctx.fill();

  // Eyes
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 10;
  ctx.fillStyle = CYAN;
  ctx.beginPath();
  ctx.arc(-15, -6, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(15, -6, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Eye shine
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-18, -10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, -10, 4, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.fillStyle = '#334455';
  ctx.fillRect(-20, 15, 40, 12);

  // Bolts
  ctx.fillStyle = '#CCCCCC';
  ctx.beginPath();
  ctx.arc(-35, -28, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(35, -28, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

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

drawRobot(450, 540, 3);

// Gravity arrows (up and down)
ctx.save();
ctx.strokeStyle = CYAN;
ctx.lineWidth = 6;
ctx.shadowColor = CYAN;
ctx.shadowBlur = 15;

// Up arrow
ctx.beginPath();
ctx.moveTo(580, 480);
ctx.lineTo(580, 380);
ctx.moveTo(580, 380);
ctx.lineTo(560, 400);
ctx.moveTo(580, 380);
ctx.lineTo(600, 400);
ctx.stroke();

// Down arrow
ctx.strokeStyle = PINK;
ctx.shadowColor = PINK;
ctx.beginPath();
ctx.moveTo(580, 600);
ctx.lineTo(580, 700);
ctx.moveTo(580, 700);
ctx.lineTo(560, 680);
ctx.moveTo(580, 700);
ctx.lineTo(600, 680);
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
