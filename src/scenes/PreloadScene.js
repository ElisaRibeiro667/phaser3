export default class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }

  preload() {
    // All assets are generated procedurally via canvas — no external files needed
    this._generateTextures();
    this._generateAudio();
  }

  _generateTextures() {
    const g = this.make.graphics({ add: false });

    // --- ROBOT (player) ---
    g.clear();
    // body
    g.fillStyle(0x4fc3f7); g.fillRect(10, 14, 20, 18);
    // head
    g.fillStyle(0x81d4fa); g.fillRect(12, 4, 16, 12);
    // eyes
    g.fillStyle(0x00e5ff); g.fillRect(14, 7, 4, 4); g.fillRect(22, 7, 4, 4);
    // legs
    g.fillStyle(0x0288d1); g.fillRect(11, 32, 7, 8); g.fillRect(22, 32, 7, 8);
    // arms
    g.fillStyle(0x0288d1); g.fillRect(4, 15, 6, 14); g.fillRect(30, 15, 6, 14);
    // antenna
    g.fillStyle(0xffd740); g.fillRect(18, 0, 4, 5);
    g.generateTexture('robot', 40, 40);

    // --- ROBOT WALK frames ---
    for (let f = 0; f < 4; f++) {
      g.clear();
      g.fillStyle(0x4fc3f7); g.fillRect(10, 14, 20, 18);
      g.fillStyle(0x81d4fa); g.fillRect(12, 4, 16, 12);
      g.fillStyle(0x00e5ff); g.fillRect(14, 7, 4, 4); g.fillRect(22, 7, 4, 4);
      // animated legs
      const lOff = f < 2 ? 0 : 4;
      const rOff = f < 2 ? 4 : 0;
      g.fillStyle(0x0288d1);
      g.fillRect(11, 32 + lOff, 7, 8);
      g.fillRect(22, 32 + rOff, 7, 8);
      g.fillStyle(0x0288d1); g.fillRect(4, 15, 6, 14); g.fillRect(30, 15, 6, 14);
      g.fillStyle(0xffd740); g.fillRect(18, 0, 4, 5);
      g.generateTexture(`robot_walk_${f}`, 40, 40);
    }

    // --- TREE stages (3 stages) ---
    // Stage 1: sapling
    g.clear();
    g.fillStyle(0x795548); g.fillRect(13, 22, 4, 14);
    g.fillStyle(0x388e3c); g.fillCircle(15, 18, 8);
    g.generateTexture('tree_1', 30, 36);

    // Stage 2: young tree
    g.clear();
    g.fillStyle(0x5d4037); g.fillRect(11, 24, 6, 16);
    g.fillStyle(0x43a047); g.fillCircle(14, 16, 10); g.fillCircle(20, 18, 8);
    g.generateTexture('tree_2', 34, 40);

    // Stage 3: full tree
    g.clear();
    g.fillStyle(0x4e342e); g.fillRect(10, 28, 8, 16);
    g.fillStyle(0x2e7d32); g.fillCircle(14, 18, 12); g.fillCircle(22, 20, 10); g.fillCircle(10, 22, 8);
    g.generateTexture('tree_3', 40, 44);

    // --- PURIFIER ---
    g.clear();
    g.fillStyle(0x37474f); g.fillRect(6, 16, 28, 20);
    g.fillStyle(0x546e7a); g.fillRect(10, 10, 20, 8);
    g.fillStyle(0x00e5ff); g.fillRect(12, 12, 16, 4);
    // chimney
    g.fillStyle(0x455a64); g.fillRect(14, 4, 6, 8); g.fillRect(20, 6, 5, 6);
    // light
    g.fillStyle(0x76ff03); g.fillCircle(20, 26, 4);
    g.generateTexture('purifier', 40, 36);

    // --- POLLUTION CLOUD (small) ---
    g.clear();
    g.fillStyle(0x607d8b, 0.85);
    g.fillCircle(16, 14, 10); g.fillCircle(26, 12, 8); g.fillCircle(8, 16, 7); g.fillCircle(22, 20, 9);
    g.generateTexture('cloud_small', 40, 32);

    // --- POLLUTION CLOUD (medium) ---
    g.clear();
    g.fillStyle(0x546e7a, 0.9);
    g.fillCircle(20, 18, 14); g.fillCircle(32, 14, 10); g.fillCircle(10, 16, 9); g.fillCircle(28, 26, 11);
    g.generateTexture('cloud_medium', 50, 38);

    // --- POLLUTION CLOUD (large) ---
    g.clear();
    g.fillStyle(0x455a64, 0.95);
    g.fillCircle(24, 22, 18); g.fillCircle(40, 16, 13); g.fillCircle(10, 18, 11); g.fillCircle(36, 32, 13);
    g.generateTexture('cloud_large', 64, 48);

    // --- DEBRIS (space junk) ---
    const debrisColors = [0x8d6e63, 0x78909c, 0xa1887f, 0x90a4ae];
    for (let i = 0; i < 4; i++) {
      g.clear();
      g.fillStyle(debrisColors[i]);
      g.fillRect(2, 8, 20, 10);
      g.fillRect(8, 2, 8, 22);
      g.fillStyle(0xbdbdbd); g.fillRect(4, 10, 4, 4);
      g.generateTexture(`debris_${i}`, 28, 28);
    }

    // --- PARTICLE: smoke dot ---
    g.clear();
    g.fillStyle(0x90a4ae, 0.6);
    g.fillCircle(6, 6, 6);
    g.generateTexture('particle_smoke', 12, 12);

    // --- PARTICLE: clean sparkle ---
    g.clear();
    g.fillStyle(0x76ff03, 0.9);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle_clean', 8, 8);

    // --- PARTICLE: leaf ---
    g.clear();
    g.fillStyle(0x66bb6a);
    g.fillEllipse(6, 6, 10, 6);
    g.generateTexture('particle_leaf', 12, 12);

    // --- HUD ICONS ---
    // Health icon
    g.clear();
    g.fillStyle(0x4caf50);
    g.fillRect(6, 0, 4, 16); g.fillRect(0, 6, 16, 4);
    g.generateTexture('icon_health', 16, 16);

    // Resource icon
    g.clear();
    g.fillStyle(0xffd740);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0xff8f00); g.fillCircle(8, 8, 4);
    g.generateTexture('icon_resource', 16, 16);

    // Score icon
    g.clear();
    g.fillStyle(0x29b6f6);
    g.beginPath();
for (let i = 0; i < 5; i++) {
  const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
  const innerAngle = outerAngle + (2 * Math.PI) / 10;
  const ox = 8 + 7 * Math.cos(outerAngle);
  const oy = 8 + 7 * Math.sin(outerAngle);
  const ix = 8 + 3 * Math.cos(innerAngle);
  const iy = 8 + 3 * Math.sin(innerAngle);
  if (i === 0) g.moveTo(ox, oy); else g.lineTo(ox, oy);
  g.lineTo(ix, iy);
}
g.closePath();
g.fillPath();
    g.generateTexture('icon_score', 16, 16);

    // --- BACKGROUND TILE ---
    g.clear();
    g.fillStyle(0x1a1a2e); g.fillRect(0, 0, 64, 64);
    // grid pattern
    g.lineStyle(1, 0x16213e, 1);
    g.strokeRect(0, 0, 64, 64);
    g.generateTexture('bg_tile', 64, 64);

    // --- GROUND TILE ---
    g.clear();
    g.fillStyle(0x3e2723); g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x4e342e); g.fillRect(2, 2, 28, 28);
    // cracks
    g.lineStyle(1, 0x3e2723);
    g.strokeRect(4, 8, 10, 10); g.strokeRect(18, 16, 8, 8);
    g.generateTexture('ground_tile', 32, 32);

    g.destroy();
  }

  _generateAudio() {
    // Generate simple beep-like sounds using the Web Audio API stored as base64
    // We'll create AudioContext sounds in-game since Phaser can handle that
    // For now, we generate silent placeholder keys and override in GameScene
  }

  create() {
    this.scene.start('Menu');
  }
}
