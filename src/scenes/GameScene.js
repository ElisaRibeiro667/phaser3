import { t, getLang } from '../i18n/i18n.js';
import AudioManager from '../AudioManager.js';

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────
const GAME_W = 960;
const GAME_H = 640;
const HUD_H = 60;
const PLAY_H = GAME_H - HUD_H;

const PLAYER_SPEED = 200;
const TREE_COST = 2;
const PURIFIER_COST = 5;
const START_RESOURCES = 15;
const MAX_RESOURCES = 30;
const RESOURCE_REGEN_MS = 1000;

const WAVE_CONFIGS = [
  { clouds: 3, debris: 2, interval: 6000, speedMult: 0.8 },
  { clouds: 5, debris: 3, interval: 5000, speedMult: 1.0 },
  { clouds: 7, debris: 4, interval: 4000, speedMult: 1.2 },
  { clouds: 9, debris: 5, interval: 3500, speedMult: 1.4 },
  { clouds: 12, debris: 6, interval: 3000, speedMult: 1.6 }
];

const POLLUTION_WIN_THRESHOLD = 15;
const POLLUTION_LOSE_THRESHOLD = 100;

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  // ──────────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────────
  create() {
    this.audio = this.registry.get('audio');

    // State
    this.score = 0;
    this.resources = START_RESOURCES;
    this.pollution = 50;          // 0–100
    this.planetHealth = 100;      // 0–100
    this.waveIndex = 0;
    this.paused = false;
    this.gameEnded = false;
    this.treeCount = 0;
    this.purifierCount = 0;

    // Camera tint tracker
    this._lastPollutionTint = -1;

    // Build world
    this._buildBackground();
    this._createGroups();
    this._createPlayer();
    this._createHUD();
    this._createParticleEmitters();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    // Physics collisions & overlaps
    this._setupPhysics();

    // Timers
    this._startWaveTimer();
    this._startResourceTimer();
    this._startTreeAbsorbTimer();
    this._startPurifierTimer();

    // Start ambient sound
    this.audio.startAmbient();

    // Tooltip text
    this._tooltipText = this.add.text(10, GAME_H - 24, '', {
      fontSize: '11px', fontFamily: 'monospace', color: '#b2dfdb'
    }).setDepth(20);
  }

  // ──────────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────────
  update(time, delta) {
    if (this.gameEnded) return;

    // Pause
    if (Phaser.Input.Keyboard.JustDown(this.keyP)) this._togglePause();
    if (this.paused) return;

    // Menu shortcut
    if (Phaser.Input.Keyboard.JustDown(this.keyM)) {
      this.audio.stopAmbient();
      this.scene.start('Menu');
      return;
    }

    this._handlePlayerMovement();
    this._handleActions();
    this._updateCameraTint();
    this._updateHUD();
    this._checkWinLose();
  }

  // ──────────────────────────────────────────────
  // BACKGROUND
  // ──────────────────────────────────────────────
  _buildBackground() {
    // Base fill
    const bg = this.add.graphics();
    bg.fillStyle(0x0d1117);
    bg.fillRect(0, HUD_H, GAME_W, PLAY_H);

    // Tile the ground
    for (let x = 0; x < GAME_W; x += 32) {
      for (let y = HUD_H; y < GAME_H; y += 32) {
        const tile = this.add.image(x, y, 'ground_tile').setOrigin(0).setAlpha(0.4).setDepth(0);
      }
    }

    // HUD background
    this._hudBg = this.add.graphics();
    this._hudBg.fillStyle(0x0a0a14, 0.95);
    this._hudBg.fillRect(0, 0, GAME_W, HUD_H);
    this._hudBg.setDepth(15);

    // Colour overlay (pollution tint) — starts grey
    this._colorOverlay = this.add.graphics();
    this._colorOverlay.setDepth(1).setAlpha(0);
    this._drawColorOverlay();
  }

  _drawColorOverlay() {
    const p = this.pollution / 100;  // 0 = clean, 1 = polluted
    this._colorOverlay.clear();
    // Polluted: grey-brown tint; clean: no overlay
    if (p > 0.1) {
      const alpha = Math.min((p - 0.1) * 0.5, 0.45);
      this._colorOverlay.fillStyle(0x37474f, alpha);
      this._colorOverlay.fillRect(0, HUD_H, GAME_W, PLAY_H);
    }
  }

  // ──────────────────────────────────────────────
  // GROUPS
  // ──────────────────────────────────────────────
  _createGroups() {
    this.trees = this.physics.add.staticGroup();
    this.purifiers = this.physics.add.staticGroup();
    this.pollutionClouds = this.physics.add.group();
    this.debrisGroup = this.physics.add.group();
    this.resourcePickups = this.physics.add.group();
  }

  // ──────────────────────────────────────────────
  // PLAYER
  // ──────────────────────────────────────────────
  _createPlayer() {
    this.player = this.physics.add.image(GAME_W / 2, GAME_H / 2, 'robot')
      .setDepth(10)
      .setCollideWorldBounds(true)
      .setScale(1.4);

    // Adjust world bounds to exclude HUD
    this.physics.world.setBounds(0, HUD_H, GAME_W, PLAY_H);

    // Walking animation frames
    this.anims.create({
      key: 'walk',
      frames: [
        { key: 'robot_walk_0' }, { key: 'robot_walk_1' },
        { key: 'robot_walk_2' }, { key: 'robot_walk_3' }
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({ key: 'idle', frames: [{ key: 'robot' }], frameRate: 1, repeat: -1 });
  }

  // ──────────────────────────────────────────────
  // PHYSICS SETUP
  // ──────────────────────────────────────────────
  _setupPhysics() {
    // Player ↔ pollution cloud → take damage
    this.physics.add.overlap(this.player, this.pollutionClouds, (player, cloud) => {
      if (cloud.active) this._playerHitCloud(cloud);
    });

    // Player ↔ debris → take heavy damage
    this.physics.add.overlap(this.player, this.debrisGroup, (player, debris) => {
      if (debris.active) this._playerHitDebris(debris);
    });

    // Player ↔ resource pickups
    this.physics.add.overlap(this.player, this.resourcePickups, (player, res) => {
      if (res.active) this._collectResource(res);
    });

    // Purifier ↔ cloud
    this.physics.add.overlap(this.purifiers, this.pollutionClouds, (purifier, cloud) => {
      if (cloud.active) this._purifierDestroyCloud(cloud, purifier);
    });
  }

  // ──────────────────────────────────────────────
  // PARTICLE EMITTERS
  // ──────────────────────────────────────────────
  _createParticleEmitters() {
    // Smoke emitter (pollution)
    this._smokeEmitter = this.add.particles(0, 0, 'particle_smoke', {
      speed: { min: 20, max: 60 },
      angle: { min: -30, max: 30 },
      lifespan: { min: 600, max: 1200 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      gravityY: -30,
      tint: [0x607d8b, 0x78909c, 0x546e7a],
      frequency: -1,
      quantity: 8,
      emitting: false
    }).setDepth(5);

    // Clean burst emitter
    this._cleanEmitter = this.add.particles(0, 0, 'particle_clean', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      lifespan: { min: 400, max: 800 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0x76ff03, 0xb2ff59, 0xccff90],
      frequency: -1,
      quantity: 15,
      emitting: false
    }).setDepth(8);

    // Leaf emitter (tree planting)
    this._leafEmitter = this.add.particles(0, 0, 'particle_leaf', {
      speed: { min: 40, max: 120 },
      angle: { min: -60, max: 60 },
      lifespan: { min: 500, max: 1000 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.9, end: 0 },
      gravityY: 80,
      tint: [0x66bb6a, 0x43a047, 0x81c784],
      frequency: -1,
      quantity: 12,
      emitting: false
    }).setDepth(8);
  }

  // ──────────────────────────────────────────────
  // HUD
  // ──────────────────────────────────────────────
  _createHUD() {
    const style = { fontSize: '14px', fontFamily: 'monospace', color: '#b2dfdb' };
    const bold = { fontSize: '14px', fontFamily: 'monospace', color: '#76ff03', fontStyle: 'bold' };

    this._scoreLabel = this.add.text(10, 8, '', style).setDepth(16);
    this._scoreVal = this.add.text(10, 24, '0', bold).setDepth(16);

    this._healthLabel = this.add.text(140, 8, '', style).setDepth(16);
    this._healthBar = this._makeHUDBar(140, 26, 100, 10, 0x4caf50);

    this._pollutionLabel = this.add.text(290, 8, '', style).setDepth(16);
    this._pollutionBar = this._makeHUDBar(290, 26, 100, 10, 0xff5722);

    this._resourceLabel = this.add.text(440, 8, '', style).setDepth(16);
    this._resourceVal = this.add.text(440, 24, '0', { ...bold, color: '#ffd740' }).setDepth(16);

    this._waveLabel = this.add.text(590, 8, '', style).setDepth(16);
    this._waveVal = this.add.text(590, 24, '1', bold).setDepth(16);

    this._treeLabel = this.add.text(700, 8, '', { ...style, fontSize: '12px' }).setDepth(16);
    this._purLabel = this.add.text(820, 8, '', { ...style, fontSize: '12px' }).setDepth(16);

    this._pauseOverlay = this.add.text(GAME_W / 2, GAME_H / 2, '', {
      fontSize: '48px', fontFamily: 'monospace', color: '#76ff03',
      stroke: '#000', strokeThickness: 6, align: 'center'
    }).setOrigin(0.5).setDepth(50).setVisible(false);

    // Notification text
    this._notifText = this.add.text(GAME_W / 2, 80, '', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffeb3b',
      stroke: '#000', strokeThickness: 3, align: 'center'
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this._updateHUD();
  }

  _makeHUDBar(x, y, w, h, color) {
    const bg = this.add.graphics().setDepth(16);
    bg.fillStyle(0x1a2a1a); bg.fillRect(x, y, w, h);
    const bar = this.add.graphics().setDepth(17);
    return { bg, bar, x, y, w, h, color, value: 100 };
  }

  _setBarValue(barObj, value, max = 100) {
    barObj.value = Phaser.Math.Clamp(value, 0, max);
    barObj.bar.clear();
    const pct = barObj.value / max;
    const w = Math.floor(barObj.w * pct);
    if (w > 0) {
      barObj.bar.fillStyle(barObj.color);
      barObj.bar.fillRect(barObj.x, barObj.y, w, barObj.h);
    }
  }

  _updateHUD() {
    this._scoreLabel.setText(t('score'));
    this._scoreVal.setText(String(this.score));
    this._healthLabel.setText(t('health'));
    this._setBarValue(this._healthBar, this.planetHealth);
    this._pollutionLabel.setText(t('pollution'));
    this._setBarValue(this._pollutionBar, this.pollution);
    this._resourceLabel.setText(t('resources'));
    this._resourceVal.setText(`${this.resources}/${MAX_RESOURCES}`);
    this._waveLabel.setText(t('wave'));
    this._waveVal.setText(`${this.waveIndex + 1}/${WAVE_CONFIGS.length}`);
    this._treeLabel.setText(`🌳 ${t('trees')}: ${this.treeCount}`);
    this._purLabel.setText(`⚙ ${t('purifiers')}: ${this.purifierCount}`);
  }

  _showNotif(msg, color = '#ffeb3b') {
    this._notifText.setText(msg).setColor(color).setAlpha(1).setY(80);
    this.tweens.killTweensOf(this._notifText);
    this.tweens.add({
      targets: this._notifText,
      y: 60, alpha: 0, duration: 2000, delay: 800, ease: 'Power2'
    });
  }

  // ──────────────────────────────────────────────
  // PLAYER MOVEMENT & ACTIONS
  // ──────────────────────────────────────────────
  _handlePlayerMovement() {
    const p = this.player;
    let vx = 0, vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -PLAYER_SPEED;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = PLAYER_SPEED;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -PLAYER_SPEED;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = PLAYER_SPEED;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707; vy *= 0.707;
    }

    p.setVelocity(vx, vy);
    if (vx !== 0 || vy !== 0) {
      p.setFlipX(vx < 0);
    }
  }

  _handleActions() {
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) this._plantTree();
    if (Phaser.Input.Keyboard.JustDown(this.keyQ)) this._buildPurifier();
    if (Phaser.Input.Keyboard.JustDown(this.keyR)) this._restartGame();
  }

  _plantTree() {
    if (this.resources < TREE_COST) {
      this._showNotif(t('no_resources'), '#ff5722');
      return;
    }
    const px = this.player.x + Phaser.Math.Between(-30, 30);
    const py = this.player.y + 30;
    const tree = this.trees.create(px, py, 'tree_1').setDepth(6).setScale(1.2);
    tree.refreshBody();
    tree.growStage = 1;
    tree.absorbTimer = 0;

    this.resources -= TREE_COST;
    this.score += 5;
    this.treeCount++;
    this.audio.playPlantTree();
    this._leafEmitter.explode(12, px, py);
    this._showNotif(t('plant_tree'), '#76ff03');

    // Grow tree over time
    this.time.addEvent({
      delay: 8000, callback: () => this._growTree(tree)
    });
  }

  _growTree(tree) {
    if (!tree.active) return;
    if (tree.growStage < 3) {
      tree.growStage++;
      tree.setTexture(`tree_${tree.growStage}`);
      tree.refreshBody();
      this._leafEmitter.explode(6, tree.x, tree.y);
      if (tree.growStage < 3) {
        this.time.addEvent({ delay: 10000, callback: () => this._growTree(tree) });
      }
    }
  }

  _buildPurifier() {
    if (this.resources < PURIFIER_COST) {
      this._showNotif(t('no_resources'), '#ff5722');
      return;
    }
    const px = this.player.x + Phaser.Math.Between(-20, 20);
    const py = this.player.y + 20;
    const pur = this.purifiers.create(px, py, 'purifier').setDepth(7).setScale(1.3);
    pur.refreshBody();

    // Pulsing light effect
    this.tweens.add({
      targets: pur, alpha: 0.75, duration: 800, yoyo: true, repeat: -1
    });

    this.resources -= PURIFIER_COST;
    this.score += 10;
    this.purifierCount++;
    this.audio.playBuildPurifier();
    this._cleanEmitter.explode(8, px, py);
    this._showNotif(t('build_purifier'), '#4fc3f7');
  }

  // ──────────────────────────────────────────────
  // WAVES
  // ──────────────────────────────────────────────
  _startWaveTimer() {
    this._spawnWave();
  }

  _spawnWave() {
    if (this.gameEnded) return;
    const cfg = WAVE_CONFIGS[Math.min(this.waveIndex, WAVE_CONFIGS.length - 1)];

    for (let i = 0; i < cfg.clouds; i++) {
      this.time.addEvent({
        delay: i * (cfg.interval / cfg.clouds),
        callback: () => this._spawnCloud(cfg.speedMult)
      });
    }
    for (let i = 0; i < cfg.debris; i++) {
      this.time.addEvent({
        delay: i * (cfg.interval / cfg.debris) + 1500,
        callback: () => this._spawnDebris(cfg.speedMult)
      });
    }

    // Next wave
    this.time.addEvent({
      delay: cfg.interval + 2000,
      callback: () => {
        if (!this.gameEnded) {
          this.waveIndex = Math.min(this.waveIndex + 1, WAVE_CONFIGS.length - 1);
          this._spawnWave();
        }
      }
    });
  }

  _spawnCloud(speedMult = 1) {
    if (this.gameEnded) return;
    const types = ['cloud_small', 'cloud_medium', 'cloud_large'];
    const sizes = [0.8, 1.2, 1.0];
    const idx = Phaser.Math.Between(0, 2);
    const x = Phaser.Math.Between(60, GAME_W - 60);

    const cloud = this.pollutionClouds.create(x, HUD_H - 10, types[idx])
      .setScale(sizes[idx])
      .setDepth(4)
      .setAlpha(0.85);

    cloud.setVelocity(
      Phaser.Math.Between(-40, 40) * speedMult,
      Phaser.Math.Between(50, 120) * speedMult
    );
    cloud.pollutionDmg = idx + 1;  // bigger = more damage
    cloud.lastHitTime = 0;

    // Smoke particles trailing
    this.time.addEvent({
      delay: 300, loop: true, callback: () => {
        if (cloud.active) this._smokeEmitter.explode(3, cloud.x, cloud.y);
      }
    });
  }

  _spawnDebris(speedMult = 1) {
    if (this.gameEnded) return;
    const idx = Phaser.Math.Between(0, 3);
    const x = Phaser.Math.Between(40, GAME_W - 40);
    const debris = this.debrisGroup.create(x, HUD_H - 10, `debris_${idx}`)
      .setScale(1.2)
      .setDepth(5);

    debris.setVelocity(
      Phaser.Math.Between(-60, 60) * speedMult,
      Phaser.Math.Between(140, 240) * speedMult
    );
    debris.setAngularVelocity(Phaser.Math.Between(-120, 120));
    debris.lastHitTime = 0;
  }

  // ──────────────────────────────────────────────
  // INTERACTIONS
  // ──────────────────────────────────────────────
  _playerHitCloud(cloud) {
    const now = this.time.now;
    if (now - cloud.lastHitTime < 1200) return;
    cloud.lastHitTime = now;

    this.pollution = Math.min(POLLUTION_LOSE_THRESHOLD, this.pollution + 2);
    this.planetHealth = Math.max(0, this.planetHealth - 3);
    this.audio.playPollutionHit();
    this.cameras.main.shake(120, 0.006);
    this._smokeEmitter.explode(10, this.player.x, this.player.y);

    // Flash player red
    this.player.setTint(0xff5722);
    this.time.delayedCall(250, () => this.player.clearTint());
  }

  _playerHitDebris(debris) {
    const now = this.time.now;
    if (now - debris.lastHitTime < 1500) return;
    debris.lastHitTime = now;

    this.pollution = Math.min(POLLUTION_LOSE_THRESHOLD, this.pollution + 5);
    this.planetHealth = Math.max(0, this.planetHealth - 8);
    this.audio.playDebrisLand();
    this.cameras.main.shake(250, 0.012);

    debris.destroy();
    this._smokeEmitter.explode(20, debris.x, debris.y);

    this.player.setTint(0xff1744);
    this.time.delayedCall(300, () => this.player.clearTint());

    // Spawn resource pickup sometimes
    if (Math.random() < 0.4) this._spawnResource(debris.x, debris.y);
  }

  _purifierDestroyCloud(cloud, purifier) {
    if (!cloud.active) return;
    cloud.active = false;
    this.pollution = Math.max(0, this.pollution - 4);
    this.score += 8;
    this.audio.playCleanBurst();
    this._cleanEmitter.explode(20, cloud.x, cloud.y);
    this.cameras.main.flash(100, 0, 255, 100, false);
    cloud.destroy();
  }

  _collectResource(res) {
    res.destroy();
    this.resources = Math.min(MAX_RESOURCES, this.resources + 3);
    this.score += 2;
    this.audio.playResourcePickup();
  }

  _spawnResource(x, y) {
    const res = this.resourcePickups.create(x, y, 'icon_resource')
      .setScale(1.5).setDepth(9);
    this.tweens.add({
      targets: res,
      y: y - 40,
      duration: 1000,
      ease: 'Bounce.easeOut'
    });
    // Auto-destroy after 8s if not collected
    this.time.delayedCall(8000, () => { if (res.active) res.destroy(); });
  }

  // ──────────────────────────────────────────────
  // TIMERS
  // ──────────────────────────────────────────────
  _startResourceTimer() {
    this.time.addEvent({
      delay: RESOURCE_REGEN_MS,
      loop: true,
      callback: () => {
        if (!this.paused && !this.gameEnded) {
          this.resources = Math.min(MAX_RESOURCES, this.resources + 1);
        }
      }
    });
  }

  _startTreeAbsorbTimer() {
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        if (this.paused || this.gameEnded) return;
        this.trees.getChildren().forEach(tree => {
          const absorb = tree.growStage; // 1–3 pollution absorbed per tick
          this.pollution = Math.max(0, this.pollution - absorb * 0.5);
          this.score += 1;
          // Occasionally emit leaves
          if (Math.random() < 0.3) this._leafEmitter.explode(3, tree.x, tree.y - 20);
        });
      }
    });
  }

  _startPurifierTimer() {
    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        if (this.paused || this.gameEnded) return;
        // Purifiers passively clean pollution
        this.purifiers.getChildren().forEach(() => {
          this.pollution = Math.max(0, this.pollution - 1);
          this.score += 1;
        });
      }
    });
  }

  // ──────────────────────────────────────────────
  // CAMERA / VISUAL TINT
  // ──────────────────────────────────────────────
  _updateCameraTint() {
    const p = Math.round(this.pollution);
    if (p === this._lastPollutionTint) return;
    this._lastPollutionTint = p;
    this._drawColorOverlay();

    // Camera tint shifts from grey-green (polluted) to vivid green (clean)
    const r = Math.floor(Phaser.Math.Linear(100, 20, p / 100));
    const g = Math.floor(Phaser.Math.Linear(160, 60, p / 100));
    const b = Math.floor(Phaser.Math.Linear(100, 80, p / 100));
  }

  // ──────────────────────────────────────────────
  // WIN / LOSE
  // ──────────────────────────────────────────────
  _checkWinLose() {
    // Clean up out-of-bounds objects
    this.pollutionClouds.getChildren().forEach(c => {
      if (c.y > GAME_H + 60) {
        this.pollution = Math.min(100, this.pollution + 3);
        this.planetHealth = Math.max(0, this.planetHealth - 2);
        c.destroy();
      }
    });
    this.debrisGroup.getChildren().forEach(d => {
      if (d.y > GAME_H + 60) {
        this.pollution = Math.min(100, this.pollution + 5);
        this.planetHealth = Math.max(0, this.planetHealth - 4);
        d.destroy();
      }
    });

    if (this.planetHealth <= 0) {
      this._endGame(false);
    } else if (this.pollution <= POLLUTION_WIN_THRESHOLD && this.waveIndex >= WAVE_CONFIGS.length - 1) {
      this._endGame(true);
    }
  }

  _endGame(won) {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.audio.stopAmbient();

    this.player.setVelocity(0, 0);

    if (won) {
      this.audio.playVictory();
      this.cameras.main.flash(500, 0, 255, 0);
      this._cleanEmitter.explode(50, this.player.x, this.player.y);
      this.time.delayedCall(1200, () => {
        this.scene.start('Victory', { score: this.score });
      });
    } else {
      this.audio.playGameOver();
      this.cameras.main.flash(500, 255, 0, 0);
      this._smokeEmitter.explode(40, this.player.x, this.player.y);
      this.time.delayedCall(1200, () => {
        this.scene.start('GameOver', { score: this.score });
      });
    }
  }

  // ──────────────────────────────────────────────
  // PAUSE
  // ──────────────────────────────────────────────
  _togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.player.setVelocity(0, 0);
      this.physics.pause();
      this._pauseOverlay.setText(t('paused')).setVisible(true);
    } else {
      this.physics.resume();
      this._pauseOverlay.setVisible(false);
    }
  }

  _restartGame() {
    this.audio.stopAmbient();
    this.scene.restart();
  }

  shutdown() {
    this.audio.stopAmbient();
  }
}
