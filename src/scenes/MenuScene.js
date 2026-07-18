import Hamster from '../objects/Hamster.js';
import hamsterSpriteUrl from '../objects/assets/hamster-pose-set-transparent.png';
import { WIDTH, HEIGHT, CENTER_X, COLORS, BEST_SCORE_KEY } from '../config.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  preload() {
    this.load.spritesheet('hamster', hamsterSpriteUrl, {
      frameWidth: 724,
      frameHeight: 724,
    });
  }

  create() {
    this.add.rectangle(CENTER_X, HEIGHT / 2, WIDTH, HEIGHT, COLORS.background);

    this.add.text(CENTER_X, HEIGHT * 0.28, 'J-j-jump!', {
      fontFamily: 'Arial',
      fontSize: '44px',
      color: COLORS.textLight,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const hamster = new Hamster(this, CENTER_X, HEIGHT * 0.42);
    this.tweens.add({
      targets: hamster,
      y: hamster.y - 14,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const best = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
    this.add.text(CENTER_X, HEIGHT * 0.42 + 70, `Best: ${best}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#c9b896',
    }).setOrigin(0.5);

    const button = this.add.rectangle(CENTER_X, HEIGHT * 0.62, 220, 68, COLORS.character)
      .setInteractive({ useHandCursor: true });
    this.add.text(CENTER_X, HEIGHT * 0.62, 'Start', {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#3a2a1a',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.on('pointerdown', () => this.scene.start('Game'));
    button.on('pointerover', () => button.setScale(1.05));
    button.on('pointerout', () => button.setScale(1));
  }
}
