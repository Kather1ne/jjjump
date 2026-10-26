import hamsterSpriteUrl from '../objects/assets/hamster-pose-set-transparent.png';
import { WIDTH, HEIGHT, CENTER_X, COLORS, MIN_LOADING_TIME } from '../config.js';

const BAR_WIDTH = 240;
const BAR_HEIGHT = 16;

// Loading screen: loads every asset once, then opens the main menu.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.add.rectangle(CENTER_X, HEIGHT / 2, WIDTH, HEIGHT, COLORS.background);

    this.add.text(CENTER_X, HEIGHT * 0.4, 'J-j-jump!', {
      fontFamily: 'Arial',
      fontSize: '44px',
      color: COLORS.textLight,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const barY = HEIGHT * 0.52;
    this.add.rectangle(CENTER_X, barY, BAR_WIDTH + 6, BAR_HEIGHT + 6)
      .setStrokeStyle(2, 0xffffff, 0.3);
    const fill = this.add.rectangle(CENTER_X - BAR_WIDTH / 2, barY, 0, BAR_HEIGHT, COLORS.character)
      .setOrigin(0, 0.5);

    this.add.text(CENTER_X, barY + 36, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#c9b896',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      fill.width = BAR_WIDTH * value;
    });

    this.load.spritesheet('hamster', hamsterSpriteUrl, {
      frameWidth: 724,
      frameHeight: 724,
    });
  }

  create() {
    this.time.delayedCall(MIN_LOADING_TIME, () => this.scene.start('Menu'));
  }
}
