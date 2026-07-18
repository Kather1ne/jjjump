import { COLORS, PLATFORM_WIDTH, PLATFORM_HEIGHT, WIDTH, LANDING_TOLERANCE } from '../config.js';

const MARGIN = 0;
const MIN_X = MARGIN + PLATFORM_WIDTH / 2;
const MAX_X = WIDTH - MARGIN - PLATFORM_WIDTH / 2;

// A block that swings left/right until the player taps to jump onto it.
// Once landed it freezes and becomes a static tower block.
export default class Platform extends Phaser.GameObjects.Container {
  constructor(scene, y, speed) {
    const startFromLeft = Math.random() < 0.5;
    const x = startFromLeft ? MIN_X : MAX_X;

    super(scene, x, y);

    const shadow = scene.add.rectangle(0, PLATFORM_HEIGHT / 2 + 3, PLATFORM_WIDTH, 6, 0x000000, 0.2);
    const base = scene.add.rectangle(0, 0, PLATFORM_WIDTH, PLATFORM_HEIGHT, COLORS.platform);
    const top = scene.add.rectangle(0, -PLATFORM_HEIGHT / 2 + 5, PLATFORM_WIDTH - 10, 8, COLORS.platformTop);

    this.add([shadow, base, top]);
    this.setSize(PLATFORM_WIDTH, PLATFORM_HEIGHT);

    this.speed = speed;
    this.direction = startFromLeft ? 1 : -1;
    this.moving = true;

    scene.add.existing(this);
  }

  update(deltaMs) {
    if (!this.moving) return;

    this.x += this.direction * this.speed * (deltaMs / 1000);

    if (this.x >= MAX_X) {
      this.x = MAX_X;
      this.direction = -1;
    } else if (this.x <= MIN_X) {
      this.x = MIN_X;
      this.direction = 1;
    }
  }

  freeze() {
    this.moving = false;
  }

  overlapsX(targetX, halfCharWidth) {
    const halfPlatform = PLATFORM_WIDTH / 2;
    const allowedOffset = halfPlatform - halfCharWidth + LANDING_TOLERANCE;
    return Math.abs(this.x - targetX) <= allowedOffset;
  }
}
