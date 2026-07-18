import { WIDTH, HEIGHT, CENTER_X, COLORS } from '../config.js';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  init(data) {
    this.score = data.score;
    this.best = data.best;
    this.isNewBest = data.isNewBest;
  }

  create() {
    this.add.rectangle(CENTER_X, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.55);

    const panel = this.add.rectangle(CENTER_X, HEIGHT / 2, 320, 360, COLORS.backgroundAlt, 1)
      .setStrokeStyle(3, 0xffffff, 0.15);

    this.add.text(CENTER_X, panel.y - 130, 'Game Over', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: COLORS.textLight,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(CENTER_X, panel.y - 60, `Score: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: COLORS.textLight,
    }).setOrigin(0.5);

    this.add.text(CENTER_X, panel.y - 20, `Best: ${this.best}`, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#c9b896',
    }).setOrigin(0.5);

    if (this.isNewBest) {
      this.add.text(CENTER_X, panel.y + 20, 'New record!', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffd76e',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    const button = this.add.rectangle(CENTER_X, panel.y + 110, 220, 64, COLORS.character)
      .setInteractive({ useHandCursor: true });
    this.add.text(CENTER_X, panel.y + 110, 'Play Again', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#3a2a1a',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.on('pointerdown', () => this.restart());
    button.on('pointerover', () => button.setScale(1.05));
    button.on('pointerout', () => button.setScale(1));
  }

  restart() {
    this.scene.get('Game').scene.restart();
    this.scene.stop();
  }
}
