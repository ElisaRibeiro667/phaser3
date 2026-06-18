import { t } from '../i18n/i18n.js';

export default class CreditsScene extends Phaser.Scene {
  constructor() { super('Credits'); }

  create() {
    this.audio = this.registry.get('audio');
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0d1b2a, 0x0d1b2a, 1);
    bg.fillRect(0, 0, W, H);

    // Grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a3a4a, 0.3);
    for (let x = 0; x < W; x += 40) grid.lineBetween(x, 0, x, H);
    for (let y = 0; y < H; y += 40) grid.lineBetween(0, y, W, y);

    // Title
    this.add.text(W / 2, 60, t('credits'), {
      fontSize: '40px', fontFamily: 'monospace', color: '#76ff03',
      stroke: '#1b5e20', strokeThickness: 4
    }).setOrigin(0.5);

    // Credits content
    const lines = [
      { text: '─────────────────────────────', color: '#37474f' },
      { text: 'ECO-TYCOON: PLANET RESCUE', color: '#76ff03', size: '22px' },
      { text: 'Trabalho Prático 2 — Phaser 3', color: '#90a4ae' },
      { text: 'Tecnologias Multimédia 2025/2026', color: '#78909c' },
      { text: '' },
      { text: '─── Motor ───', color: '#4fc3f7' },
      { text: 'Phaser 3.80.1 (CDN)', color: '#b2dfdb' },
      { text: 'phaser.io', color: '#4fc3f7' },
      { text: '' },
      { text: '─── Tecnologias ───', color: '#4fc3f7' },
      { text: 'JavaScript ES6+', color: '#b2dfdb' },
      { text: 'Web Audio API (sons procedurais)', color: '#b2dfdb' },
      { text: 'Phaser Graphics API (arte procedural)', color: '#b2dfdb' },
      { text: '' },
      { text: '─── Idiomas ───', color: '#4fc3f7' },
      { text: 'Português (PT)', color: '#b2dfdb' },
      { text: 'English (EN)', color: '#b2dfdb' },
      { text: '' },
      { text: '─── Assets ───', color: '#4fc3f7' },
      { text: 'Sprites: gerados via Phaser Graphics', color: '#b2dfdb' },
      { text: 'Sons: gerados via Web Audio API', color: '#b2dfdb' },
      { text: 'Sem assets externos de terceiros', color: '#b2dfdb' },
      { text: '' },
      { text: '─────────────────────────────', color: '#37474f' },
    ];

    let startY = 130;
    lines.forEach((line, i) => {
      const txt = this.add.text(W / 2, startY + i * 20, line.text, {
        fontSize: line.size || '15px',
        fontFamily: 'monospace',
        color: line.color || '#90a4ae',
        align: 'center'
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: txt,
        alpha: 1,
        duration: 300,
        delay: i * 60
      });
    });

    // Back button
    const backBtn = this.add.text(W / 2, H - 55, `[ ${t('back')} ]`, {
      fontSize: '24px', fontFamily: 'monospace', color: '#78909c',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setScale(1.08).setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setScale(1).setColor('#78909c'));
    backBtn.on('pointerdown', () => {
      this.audio.playButtonClick();
      this.scene.start('Menu');
    });

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Menu'));
    this.input.keyboard.once('keydown-BACK_SLASH', () => this.scene.start('Menu'));

    // Small decorative robot
    const robot = this.add.image(W - 80, H - 80, 'robot').setScale(2).setAlpha(0.4).setTint(0x4fc3f7);
    this.tweens.add({ targets: robot, y: H - 72, duration: 1500, yoyo: true, repeat: -1 });
  }
}
