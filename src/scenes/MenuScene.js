import { t, setLang, getLang, getAvailableLangs } from '../i18n/i18n.js';
import AudioManager from '../AudioManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    if (!this.registry.get('audio')) {
      this.registry.set('audio', new AudioManager());
    }
    this.audio = this.registry.get('audio');

    const W = this.scale.width;
    const H = this.scale.height;

    // Animated background
    this._buildBackground(W, H);

    // Title
    this.titleText = this.add.text(W / 2, 120, t('title'), {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#76ff03',
      stroke: '#1b5e20',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.titleText,
      y: 115,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.subText = this.add.text(W / 2, 180, t('subtitle'), {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#b2dfdb',
      align: 'center'
    }).setOrigin(0.5);

    // Robot showcase
    this._buildShowcaseRobot(W, H);

    // Buttons
    this._playBtn = this._makeButton(W / 2, 320, t('play'), '#76ff03', '#1b5e20', () => {
      this.audio.playButtonClick();
      this.scene.start('Game');
    });

    this._creditsBtn = this._makeButton(W / 2, 390, t('credits'), '#4fc3f7', '#0277bd', () => {
      this.audio.playButtonClick();
      this.scene.start('Credits');
    });

    // Language selector
    this._buildLangSelector(W, H);

    // Controls hint
    this._buildControlsHint(W, H);

    // Floating particles
    this._spawnMenuParticles(W, H);

    this.audio.startAmbient();
  }

  _buildBackground(W, H) {
    // Gradient-like background via rectangles
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x102030, 0x102030, 1);
    bg.fillRect(0, 0, W, H);

    // Grid lines
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a3a4a, 0.4);
    for (let x = 0; x < W; x += 40) grid.lineBetween(x, 0, x, H);
    for (let y = 0; y < H; y += 40) grid.lineBetween(0, y, W, y);

    // Glow orb
    const orb = this.add.graphics();
    orb.fillStyle(0x1b5e20, 0.15);
    orb.fillCircle(W / 2, H / 2, 280);
    this.tweens.add({ targets: orb, alpha: 0.05, duration: 2500, yoyo: true, repeat: -1 });
  }

  _buildShowcaseRobot(W, H) {
    const robot = this.add.image(W / 2 - 200, 300, 'robot').setScale(3);
    this.tweens.add({
      targets: robot,
      x: W / 2 - 190,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Small decorative trees
    this.add.image(W / 2 + 180, 310, 'tree_3').setScale(2.2).setAlpha(0.8);
    this.add.image(W / 2 + 220, 320, 'tree_2').setScale(1.8).setAlpha(0.6);

    // Small pollution cloud floating
    const cloud = this.add.image(W - 120, 200, 'cloud_medium').setAlpha(0.5).setScale(1.5);
    this.tweens.add({
      targets: cloud,
      x: W - 110,
      y: 210,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  _makeButton(x, y, label, color, stroke, callback) {
    const btn = this.add.text(x, y, `[ ${label} ]`, {
      fontSize: '28px',
      fontFamily: 'monospace',
      color,
      stroke,
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btn.setScale(1.08);
      btn.setColor('#ffffff');
    });
    btn.on('pointerout', () => {
      btn.setScale(1);
      btn.setColor(color);
    });
    btn.on('pointerdown', callback);
    return btn;
  }

  _buildLangSelector(W, H) {
    const langs = getAvailableLangs();
    const labelY = H - 60;
    this.add.text(W / 2 - 80, labelY, `${t('language')}:`, {
      fontSize: '16px', fontFamily: 'monospace', color: '#90a4ae'
    }).setOrigin(0.5, 0.5);

    this._langBtns = [];
    langs.forEach((lang, i) => {
      const lx = W / 2 + (i * 70);
      const btn = this.add.text(lx, labelY, lang.toUpperCase(), {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: getLang() === lang ? '#76ff03' : '#546e7a',
        backgroundColor: getLang() === lang ? '#1b5e20' : '#1a1a2e',
        padding: { x: 10, y: 4 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.audio.playButtonClick();
        setLang(lang);
        this.scene.restart();
      });
      this._langBtns.push(btn);
    });
  }

  _buildControlsHint(W, H) {
    const lines = [
      t('controls_move'),
      t('controls_plant'),
      t('controls_build'),
      t('controls_restart')
    ];
    const box = this.add.graphics();
    box.lineStyle(1, 0x2e4057, 1);
    box.strokeRect(40, H - 160, 260, 90);
    box.fillStyle(0x0d1b2a, 0.6);
    box.fillRect(41, H - 159, 258, 88);

    this.add.text(50, H - 150, `⌨ ${t('controls_title')}`, {
      fontSize: '13px', fontFamily: 'monospace', color: '#4fc3f7'
    });
    lines.forEach((line, i) => {
      this.add.text(50, H - 130 + i * 18, line, {
        fontSize: '11px', fontFamily: 'monospace', color: '#78909c'
      });
    });
  }

  _spawnMenuParticles(W, H) {
    // Floating leaf particles
    for (let i = 0; i < 12; i++) {
      const leaf = this.add.image(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        'particle_leaf'
      ).setAlpha(Phaser.Math.FloatBetween(0.3, 0.8)).setScale(Phaser.Math.FloatBetween(1, 2));

      this.tweens.add({
        targets: leaf,
        x: leaf.x + Phaser.Math.Between(-60, 60),
        y: leaf.y - Phaser.Math.Between(100, 300),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 7000),
        delay: Phaser.Math.Between(0, 3000),
        onComplete: () => {
          leaf.setPosition(Phaser.Math.Between(0, W), H + 10).setAlpha(0.6);
          this.tweens.add({
            targets: leaf,
            y: -20, alpha: 0, duration: Phaser.Math.Between(5000, 9000), repeat: -1
          });
        }
      });
    }
  }

  shutdown() {
    this.audio.stopAmbient();
  }
}
