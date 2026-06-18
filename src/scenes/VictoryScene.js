import { t } from '../i18n/i18n.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() { super('Victory'); }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    this.audio = this.registry.get('audio');
    const W = this.scale.width;
    const H = this.scale.height;

    // Bright green/nature background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d2b0d, 0x0d2b0d, 0x1b5e20, 0x1b5e20, 1);
    bg.fillRect(0, 0, W, H);

    // Leaf shower particles
    const leafEmitter = this.add.particles(0, 0, 'particle_leaf', {
      x: { min: 0, max: W },
      y: -10,
      speedY: { min: 60, max: 140 },
      speedX: { min: -40, max: 40 },
      lifespan: { min: 3000, max: 5000 },
      scale: { start: 2, end: 0.5 },
      alpha: { start: 0.9, end: 0 },
      tint: [0x66bb6a, 0xa5d6a7, 0x81c784, 0xc8e6c9],
      frequency: 80,
      quantity: 3
    });

    // Clean sparkles
    const sparkEmitter = this.add.particles(0, 0, 'particle_clean', {
      x: { min: 0, max: W },
      y: { min: 0, max: H },
      speedX: { min: -60, max: 60 },
      speedY: { min: -60, max: 60 },
      lifespan: { min: 800, max: 1600 },
      scale: { start: 1.5, end: 0 },
      frequency: 120,
      quantity: 2
    });

    // Title
    const title = this.add.text(W / 2, H / 2 - 130, t('victory'), {
      fontSize: '60px',
      fontFamily: 'monospace',
      color: '#76ff03',
      stroke: '#1b5e20',
      strokeThickness: 5,
      align: 'center'
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);

    this.tweens.add({
      targets: title,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 700,
      ease: 'Back.easeOut'
    });

    // Subtitle
    const sub = this.add.text(W / 2, H / 2 - 58, t('victory_sub'), {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#b9f6ca',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: sub, alpha: 1, duration: 600, delay: 600 });

    // Score
    const scoreText = this.add.text(W / 2, H / 2 + 10, `${t('score')}: ${this.finalScore}`, {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: '#ffd740',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: scoreText, alpha: 1, duration: 600, delay: 1000 });

    // Buttons
    const restartBtn = this._makeButton(W / 2, H / 2 + 100, t('restart'), '#76ff03', () => {
      this.audio.playButtonClick();
      this.scene.start('Game');
    });
    const menuBtn = this._makeButton(W / 2, H / 2 + 155, t('menu'), '#4fc3f7', () => {
      this.audio.playButtonClick();
      this.scene.start('Menu');
    });

    [restartBtn, menuBtn].forEach((btn, i) => {
      btn.setAlpha(0);
      this.tweens.add({ targets: btn, alpha: 1, duration: 400, delay: 1400 + i * 150 });
    });

    // Happy robot with trees
    const robot = this.add.image(W / 2 - 200, H / 2 + 20, 'robot')
      .setScale(3.5)
      .setTint(0x76ff03)
      .setAlpha(0);
    this.tweens.add({ targets: robot, alpha: 1, duration: 800, delay: 300 });
    this.tweens.add({
      targets: robot,
      y: H / 2 + 8,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Decorative trees
    [
      [W / 2 + 100, H / 2 + 30, 'tree_3', 2.5],
      [W / 2 + 170, H / 2 + 40, 'tree_2', 2],
      [W / 2 + 230, H / 2 + 30, 'tree_3', 2.2]
    ].forEach(([x, y, key, scale], i) => {
      const tree = this.add.image(x, y, key).setScale(scale).setAlpha(0);
      this.tweens.add({ targets: tree, alpha: 1, y: y - 10, duration: 600, delay: 800 + i * 200 });
    });

    this.input.keyboard.once('keydown-R', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-M', () => this.scene.start('Menu'));
  }

  _makeButton(x, y, label, color, callback) {
    const btn = this.add.text(x, y, `[ ${label} ]`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color,
      stroke: '#000',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setScale(1.08).setColor('#ffffff'));
    btn.on('pointerout', () => btn.setScale(1).setColor(color));
    btn.on('pointerdown', callback);
    return btn;
  }
}
