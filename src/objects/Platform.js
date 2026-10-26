import { COLORS, PLATFORM_WIDTH, PLATFORM_HEIGHT, WIDTH, CENTER_X } from '../config.js';

const SPAWN_DISTANCE = WIDTH / 2 + PLATFORM_WIDTH / 2 + 10; // just off-screen

// A block that flies in from the side and slides toward the tower.
// It settles on the tower centre at the latest; a landing freezes it wherever it is.
// Pass `x` to create a static block (the first one of the tower).
export default class Platform extends Phaser.GameObjects.Container {
  constructor(scene, y, speed, x = null) {
    const fromLeft = Math.random() < 0.5;
    const startX = x ?? (fromLeft ? CENTER_X - SPAWN_DISTANCE : CENTER_X + SPAWN_DISTANCE);

    super(scene, startX, y);

    const shadow = scene.add.rectangle(0, PLATFORM_HEIGHT / 2 + 3, PLATFORM_WIDTH, 6, 0x000000, 0.2);
    const base = scene.add.rectangle(0, 0, PLATFORM_WIDTH, PLATFORM_HEIGHT, COLORS.platform);
    const top = scene.add.rectangle(0, -PLATFORM_HEIGHT / 2 + 5, PLATFORM_WIDTH - 10, 8, COLORS.platformTop);

    this.add([shadow, base, top]);
    this.setSize(PLATFORM_WIDTH, PLATFORM_HEIGHT);

    this.speed = speed;
    this.direction = fromLeft ? 1 : -1;
    this.moving = x === null;

    scene.add.existing(this);
  }

  update(deltaMs) {
    if (!this.moving) return;

    this.x += this.direction * this.speed * (deltaMs / 1000);

    const reachedCenter = this.direction > 0 ? this.x >= CENTER_X : this.x <= CENTER_X;
    if (reachedCenter) {
      this.x = CENTER_X;
      this.moving = false;
    }
  }

  freeze() {
    this.moving = false;
  }

  // Landing offset from targetX as a share of half the platform width (0 = dead centre).
  offsetRatio(targetX) {
    return Math.abs(this.x - targetX) / (PLATFORM_WIDTH / 2);
  }

  // True once the leading edge reaches a character standing at targetX.
  touches(targetX, halfCharWidth) {
    return Math.abs(this.x - targetX) <= PLATFORM_WIDTH / 2 + halfCharWidth;
  }
}
