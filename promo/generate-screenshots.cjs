const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 960, H = 540;

// Colors
const CYAN = '#00FFFF';
const PINK = '#FF0080';
const GOLD = '#FFD700';
const BG_TOP = '#252545';
const BG_BOTTOM = '#151525';

// Helper for rounded rect
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Draw robot
function drawRobot(ctx, x, y, scale, flipped = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, flipped ? -scale : scale);
  
  // Glow
  ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.fillStyle = '#66D9FF';
  roundRect(ctx, -15, -12, 30, 28, 5);
  ctx.fill();
  
  // Chest core
  ctx.fillStyle = CYAN;
  ctx.beginPath();
  ctx.arc(0, 4, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = '#77DDFF';
  roundRect(ctx, -14, -32, 28, 22, 5);
  ctx.fill();
  
  // Visor
  ctx.fillStyle = '#0a1520';
  roundRect(ctx, -11, -28, 22, 14, 3);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = CYAN;
  ctx.beginPath();
  ctx.arc(-5, -22, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, -21, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupils
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-4, -23, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -23, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Antenna
  ctx.fillStyle = '#888';
  ctx.fillRect(-2, -38, 4, 7);
  ctx.fillStyle = '#00FF00';
  ctx.beginPath();
  ctx.arc(0, -40, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Legs
  ctx.fillStyle = '#4a5a6a';
  ctx.fillRect(-10, 16, 6, 14);
  ctx.fillRect(4, 14, 6, 16);
  
  // Arms
  ctx.fillRect(-22, -5, 6, 16);
  ctx.fillRect(16, -2, 6, 14);
  
  ctx.restore();
}

// Draw gear collectible
function drawGear(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = GOLD;
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tx = x + Math.cos(angle) * size;
    const ty = y + Math.sin(angle) * size;
    ctx.fillRect(tx - 3, ty - 3, 6, 6);
  }
  ctx.fillStyle = '#FFA500';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

// Draw spike
function drawSpike(ctx, x, y, up = true) {
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  if (up) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + 15, y - 40);
    ctx.lineTo(x + 30, y);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + 15, y + 40);
    ctx.lineTo(x + 30, y);
  }
  ctx.fill();
}

// Draw UI
function drawUI(ctx, score, combo, phase, gears, time, shields = 0) {
  // Score
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(score.toString(), W / 2, 50);
  
  // Combo
  if (combo > 1) {
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = PINK;
    ctx.fillText(`${combo}x COMBO`, W / 2, 80);
  }
  
  // Phase
  ctx.font = '16px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = CYAN;
  ctx.fillText(phase, W - 20, 40);
  
  // Timer
  ctx.fillStyle = '#888';
  ctx.fillText(time, W - 20, 65);
  
  // Gears
  ctx.textAlign = 'left';
  ctx.fillStyle = GOLD;
  ctx.fillText(`⚙️ ${gears}`, 20, 40);
  
  // Shields
  if (shields > 0) {
    ctx.fillStyle = CYAN;
    ctx.fillText(`🛡️ ${shields}`, 20, 65);
  }
}

// Create screenshot
function createScreenshot(filename, config) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  
  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, BG_TOP);
  bgGrad.addColorStop(1, BG_BOTTOM);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);
  
  // Grid
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  
  // Floor
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(0, H - 50, W, 50);
  ctx.fillStyle = CYAN;
  ctx.fillRect(0, H - 50, W, 3);
  
  // Ceiling
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(0, 0, W, 50);
  ctx.fillStyle = PINK;
  ctx.fillRect(0, 47, W, 3);
  
  // Factory silhouettes
  ctx.fillStyle = 'rgba(30, 30, 50, 0.5)';
  for (let x = 0; x < W; x += 80) {
    const h = 60 + Math.random() * 100;
    ctx.fillRect(x, H - 50 - h, 50, h);
  }
  
  // Draw game elements based on config
  if (config.spikes) {
    config.spikes.forEach(s => drawSpike(ctx, s.x, s.y, s.up));
  }
  
  if (config.gears) {
    config.gears.forEach(g => drawGear(ctx, g.x, g.y, 15));
  }
  
  if (config.laser) {
    ctx.strokeStyle = PINK;
    ctx.lineWidth = 4;
    ctx.shadowColor = PINK;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(config.laser.x1, config.laser.y);
    ctx.lineTo(config.laser.x2, config.laser.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  // Robot
  drawRobot(ctx, config.robotX, config.robotY, 1.8, config.flipped);
  
  // Trail effect if moving
  if (config.trail) {
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = 0.2 - i * 0.05;
      drawRobot(ctx, config.robotX - i * 30, config.robotY, 1.8, config.flipped);
    }
    ctx.globalAlpha = 1;
  }
  
  // UI
  drawUI(ctx, config.score, config.combo, config.phase, config.gears_count, config.time, config.shields);
  
  // Phase announcement if provided
  if (config.announcement) {
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = PINK;
    ctx.shadowColor = PINK;
    ctx.shadowBlur = 20;
    ctx.fillText(config.announcement, W / 2, H / 3);
    ctx.shadowBlur = 0;
  }
  
  // Save
  const outPath = path.join(__dirname, filename);
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log(`✅ ${filename}`);
}

console.log('Generating gameplay screenshots...\n');

// Screenshot 1: Early game - Boot Sequence
createScreenshot('screenshot-1-bootsequence.png', {
  robotX: 200,
  robotY: H - 100,
  flipped: false,
  trail: true,
  score: 1250,
  combo: 1,
  phase: 'BOOT SEQUENCE',
  gears_count: 8,
  time: '00:12',
  shields: 1,
  spikes: [
    { x: 400, y: H - 50, up: true },
    { x: 440, y: H - 50, up: true },
  ],
  gears: [
    { x: 550, y: H - 150 },
    { x: 620, y: H - 180 },
    { x: 690, y: H - 150 },
  ]
});

// Screenshot 2: Mid game - Factory Floor with combo
createScreenshot('screenshot-2-combo.png', {
  robotX: 180,
  robotY: 120,
  flipped: true,
  trail: true,
  score: 15780,
  combo: 7,
  phase: 'FACTORY FLOOR',
  gears_count: 45,
  time: '00:52',
  shields: 0,
  spikes: [
    { x: 350, y: H - 50, up: true },
    { x: 390, y: H - 50, up: true },
    { x: 430, y: H - 50, up: true },
  ],
  gears: [
    { x: 300, y: 150 },
    { x: 370, y: 130 },
    { x: 440, y: 150 },
    { x: 510, y: 130 },
  ]
});

// Screenshot 3: Late game - Chaos Mode with laser
createScreenshot('screenshot-3-chaosmode.png', {
  robotX: 200,
  robotY: H - 130,
  flipped: false,
  trail: true,
  score: 89540,
  combo: 4,
  phase: 'CHAOS MODE',
  gears_count: 234,
  time: '02:15',
  shields: 0,
  announcement: '⚠️ CHAOS MODE ⚠️',
  spikes: [
    { x: 500, y: H - 50, up: true },
    { x: 540, y: H - 50, up: true },
    { x: 580, y: H - 50, up: true },
    { x: 500, y: 50, up: false },
    { x: 540, y: 50, up: false },
  ],
  laser: { x1: 650, x2: 960, y: 280 },
  gears: [
    { x: 750, y: 180 },
    { x: 820, y: 380 },
  ]
});

console.log('\nDone! Screenshots saved to promo/');
