import Hamster from "../objects/Hamster.js";
import Platform from "../objects/Platform.js";
import hamsterSpriteUrl from "../objects/assets/hamster-pose-set-transparent.png";
import {
  WIDTH,
  HEIGHT,
  CENTER_X,
  CHAR_Y,
  PLATFORM_GAP,
  JUMP_DURATION,
  FALL_DURATION,
  BASE_PLATFORM_SPEED,
  DIFFICULTY_START,
  SPEED_INCREASE_PER_PLATFORM,
  MAX_SPEED_MULTIPLIER,
  PLATFORM_TIME_LIMIT,
  PLATFORM_WIDTH,
  PERFECT_ZONE,
  MAX_STABILITY,
  STABILITY_WINDOW,
  BEST_SCORE_KEY,
  COLORS,
  PLATFORM_HEIGHT,
} from "../config.js";
import { tuning } from "../debug/DebugPanel.js";

const ASCENT_DURATION = 350;
const DESCENT_DURATION = 250;
const LANDING_PREP_DURATION = 100;
const LANDING_HOLD_DURATION = 100;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.spritesheet("hamster", hamsterSpriteUrl, {
      frameWidth: 724,
      frameHeight: 724,
    });
  }

  create() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.background);

    this.score = 0;
    this.level = 0;
    this.busy = false;
    this.gameOver = false;
    this.stability = MAX_STABILITY;
    this.jumpOffsets = [];

    this.world = this.add.container(0, 0);

    const startPlatform = new Platform(this, CHAR_Y, 0);
    startPlatform.freeze();
    startPlatform.x = CENTER_X;
    this.world.add(startPlatform);

    this.hamster = new Hamster(this, CENTER_X, CHAR_Y - tuning.hamsterOffsetY);
    this.hamster.sprite.setDisplaySize(tuning.hamsterSize, tuning.hamsterSize);

    this.scoreText = this.add
      .text(WIDTH / 2, 60, "0", {
        fontFamily: "Arial",
        fontSize: "48px",
        color: COLORS.textLight,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.hintText = this.add
      .text(WIDTH / 2, HEIGHT / 2 + 40, "Tap to jump", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: COLORS.textLight,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: this.hintText,
      alpha: 0.3,
      duration: 650,
      yoyo: true,
      repeat: -1,
    });

    this.spawnNextPlatform();

    this.input.on("pointerdown", this.handleTap, this);
  }

  currentSpeed() {
    const extra = Math.max(0, this.score - DIFFICULTY_START);
    const multiplier = Math.min(
      1 + extra * SPEED_INCREASE_PER_PLATFORM,
      MAX_SPEED_MULTIPLIER,
    );
    return tuning.platformSpeed * multiplier;
  }

  spawnNextPlatform() {
    const targetLocalY = CHAR_Y - (this.level + 1) * tuning.platformGap;
    this.nextPlatform = new Platform(this, targetLocalY, this.currentSpeed());
    this.world.add(this.nextPlatform);
    this.platformTimer = PLATFORM_TIME_LIMIT;
  }

  handleTap() {
    if (this.busy || this.gameOver) return;
    this.busy = true;

    if (this.hintText.active) {
      this.hintText.destroy();
    }

    const jumpHeight = tuning.platformGap + tuning.jumpExtra;
    const landHeight = 186;
    const dur = tuning.jumpDuration * 0.6;

    // ── Этап 1: ВЗЛЁТ ──
    this.hamster.jump();
    this.tweens.add({
      targets: this.hamster,
      y: this.hamster.y - jumpHeight,
      duration: dur,
      ease: "Sine.easeOut",
      onComplete: () => {
        const landingPoseDelay = DESCENT_DURATION - LANDING_PREP_DURATION;

        // На 500-й миллисекунде переключаемся на frame 2.
        this.time.delayedCall(landingPoseDelay, () => {
          this.hamster.land();
        });

        // ── Этап 2: ПИК — смена позы ──
        // this.hamster.land();

        // ── Этап 3: СПУСК + скролл мира одновременно ──
        this.tweens.add({
          targets: this.hamster,
          y: this.hamster.y + landHeight,
          duration: dur,
          ease: "Sine.easeIn",
          onComplete: () => {
            // ── Этап 4: ПРИЗЕМЛЕНИЕ ──
            const platform = this.nextPlatform;
            platform.freeze();
            const success = platform.overlapsX(
              CENTER_X,
              tuning.hamsterHitboxW / 2,
            );

            if (success) {
              this.onJumpSuccess(platform);
            } else {
              this.onJumpFail(platform);
            }
          },
        });

        this.tweens.add({
          targets: this.world,
          y: this.world.y + tuning.platformGap,
          duration: dur,
          ease: "Sine.easeIn",
        });
      },
    });
  }

  onJumpSuccess(platform) {
    const offset = Math.abs(platform.x - CENTER_X);
    const maxOffset = tuning.platformWidth / 2;
    const isPerfect = offset <= PERFECT_ZONE;

    const stabilityPenalty = isPerfect ? 0 : (offset / maxOffset) * 25;
    this.jumpOffsets.push(stabilityPenalty);
    if (this.jumpOffsets.length > STABILITY_WINDOW) {
      this.jumpOffsets.shift();
    }
    this.stability =
      MAX_STABILITY - this.jumpOffsets.reduce((sum, v) => sum + v, 0);

    this.score += 1;
    this.level += 1;
    this.scoreText.setText(String(this.score));

    this.showLandingFeedback(isPerfect, offset);

    if (this.stability <= 0) {
      this.stability = 0;
      this.onTowerCollapse();
      return;
    }

    this.time.delayedCall(LANDING_HOLD_DURATION, () => {
      this.hamster.stand();
      this.busy = false;
      this.spawnNextPlatform();
    });
  }

  showLandingFeedback(isPerfect, offset) {
    const label = isPerfect
      ? "Perfect!"
      : offset > tuning.platformWidth * 0.3
        ? "Shaky..."
        : "";
    if (!label) return;
    const color = isPerfect ? "#ffd76e" : "#ff6b6b";
    const text = this.add
      .text(CENTER_X, CHAR_Y - 80, label, {
        fontFamily: "Arial",
        fontSize: "22px",
        color,
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 800,
      ease: "Sine.easeOut",
      onComplete: () => text.destroy(),
    });
  }

  onTowerCollapse() {
    this.gameOver = true;
    this.cameras.main.shake(400, 0.015);
    this.tweens.add({
      targets: this.world,
      y: this.world.y + HEIGHT,
      angle: Phaser.Math.Between(-8, 8),
      duration: 900,
      ease: "Cubic.easeIn",
    });
    this.tweens.add({
      targets: this.hamster,
      y: this.hamster.y + HEIGHT,
      duration: 900,
      ease: "Cubic.easeIn",
    });
    this.time.delayedCall(1000, () => this.finishGame());
  }

  onJumpFail(platform) {
    this.gameOver = true;

    this.tweens.add({
      targets: this.hamster,
      y: this.hamster.y + HEIGHT,
      angle: Phaser.Math.Between(0, 1) === 0 ? -220 : 220,
      duration: FALL_DURATION,
      ease: "Cubic.easeIn",
    });

    this.time.delayedCall(FALL_DURATION + 150, () => this.finishGame());
  }

  finishGame() {
    const best = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
    const isNewBest = this.score > best;
    if (isNewBest) {
      localStorage.setItem(BEST_SCORE_KEY, String(this.score));
    }

    this.scene.launch("Result", {
      score: this.score,
      best: isNewBest ? this.score : best,
      isNewBest,
    });
  }

  update(time, delta) {
    if (!this.nextPlatform) return;
    this.nextPlatform.update(delta);

    if (this.busy || this.gameOver) return;

    this.platformTimer -= delta;
    if (this.platformTimer <= 0) {
      this.busy = true;
      this.gameOver = true;
      if (this.hintText.active) this.hintText.destroy();
      this.nextPlatform.freeze();
      this.onJumpFail(this.nextPlatform);
    }
  }
}
