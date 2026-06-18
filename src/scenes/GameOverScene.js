import { t } from '../i18n/i18n.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    this.audio = this.registry.get('audio');
    const W = this.scale.width;
    const H = this.scale.height;

    // Dark background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0000, 0x0a0000, 0x200808, 0x200808, 1);
    bg.fillRect(0, 0, W, H);

    // Smoke particles drifting up
    const smokeEmitter = this.add.particles(0, 0, 'particle_smoke', {
      x: { min: 0, max: W },
      y: H + 10,
      speedY: { min: -60, max: -30 },
      speedX: { min: -20, max: 20 },
      lifespan: { min: 3000, max: 5000 },
      scale: { start: 2, end: 0 },
      alpha: { start: 0.4, end: 0 },
      tint: [0x607d8b, 0x455a64],
      frequency: 200,
      quantity: 2
    });

    // Title
    const title = this.add.text(W / 2, H / 2 - 130, t('game_over'), {
      fontSize: '56px',
      fontFamily: 'monospace',
      color: '#ff5722',
      stroke: '#7f0000',
      strokeThickness: 5,
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: H / 2 - 120,
      duration: 800,
      ease: 'Power2'
    });

    // Subtitle
    const sub = this.add.text(W / 2, H / 2 - 60, t('game_over_sub'), {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#ef9a9a',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: sub, alpha: 1, duration: 600, delay: 500 });

    // Score
    const scoreText = this.add.text(W / 2, H / 2 + 10, `${t('score')}: ${this.finalScore}`, {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#ffd740',
      stroke: '#000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: scoreText, alpha: 1, duration: 600, delay: 900 });

    // Buttons
    const restartBtn = this._makeButton(W / 2, H / 2 + 100, t('restart'), '#ff5722', () => {
      this.audio.playButtonClick();
      this.scene.start('Game');
    });
    const menuBtn = this._makeButton(W / 2, H / 2 + 155, t('menu'), '#78909c', () => {
      this.audio.playButtonClick();
      this.scene.start('Menu');
    });

    [restartBtn, menuBtn].forEach((btn, i) => {
      btn.setAlpha(0);
      this.tweens.add({ targets: btn, alpha: 1, duration: 400, delay: 1200 + i * 150 });
    });

    // Keyboard shortcut
    this.input.keyboard.once('keydown-R', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-M', () => this.scene.start('Menu'));

    // Sad robot — tinted red
    const robot = this.add.image(W / 2 - 180, H / 2 + 20, 'robot')
      .setScale(3)
      .setTint(0xff5722)
      .setAlpha(0);
    this.tweens.add({ targets: robot, alpha: 0.7, duration: 800, delay: 400 });
    this.tweens.add({
      targets: robot, y: H / 2 + 28, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
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
