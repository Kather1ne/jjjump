import Hamster from "../objects/Hamster.js";
import Platform from "../objects/Platform.js";
import {
  WIDTH,
  HEIGHT,
  CENTER_X,
  CHAR_Y,
  PLATFORM_HEIGHT,
  FALL_DURATION,
  CAMERA_FOLLOW_DURATION,
  DIFFICULTY_START,
  SPEED_INCREASE_PER_PLATFORM,
  MAX_SPEED_MULTIPLIER,
  PERFECT_ZONE,
  GOOD_ZONE,
  SAFE_LANDING_ZONE,
  MAX_STABILITY,
  STABILITY_START_PLATFORM,
  STABILITY_PERFECT_BONUS,
  STABILITY_GOOD_PENALTY,
  STABILITY_BAD_PENALTY,
  MAX_SWAY,
  SWAY_BEND_BLOCKS,
  BEST_SCORE_KEY,
  SESSIONS_KEY,
  COLORS,
} from "../config.js";
import { tuning } from "../debug/DebugPanel.js";

const LANDING_PREP_DURATION = 100;
const LANDING_HOLD_DURATION = 100;

const GRADES = {
  perfect: { label: "Perfect!", color: "#ffd76e" },
  good: { label: "Good", color: "#9be27a" },
  bad: { label: "Bad", color: "#ff9f5a" },
  miss: { label: "Miss", color: "#ff6b6b" },
  late: { label: "Too late!", color: "#ff6b6b" },
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, COLORS.background);

    this.score = 0;
    this.busy = false;
    this.airborne = false;
    this.gameOver = false;
    this.stability = MAX_STABILITY;
    this.topY = CHAR_Y; // world-local y of the topmost tower block
    this.swayAmplitude = 0; // px at the top, eases toward the target set by stability
    this.swayTarget = 0;
    this.swayPhase = 0;
    this.swayOffset = 0; // current x shift of the top block and hamster

    // world scrolls down as the tower grows; tower holds landed blocks + hamster
    this.world = this.add.container(0, 0);
    const ground = this.add.rectangle(
      CENTER_X,
      CHAR_Y + PLATFORM_HEIGHT / 2 + HEIGHT / 2,
      WIDTH,
      HEIGHT,
      COLORS.ground,
    );
    this.tower = this.add.container(0, 0);
    this.world.add([ground, this.tower]);

    const startPlatform = new Platform(this, CHAR_Y, 0, CENTER_X);
    startPlatform.baseX = CENTER_X;
    this.tower.add(startPlatform);
    this.blocks = [startPlatform]; // bottom to top

    this.hamster = new Hamster(this, CENTER_X, CHAR_Y - tuning.hamsterOffsetY);
    this.hamster.sprite.setDisplaySize(tuning.hamsterSize, tuning.hamsterSize);
    this.tower.add(this.hamster);

    this.scoreText = this.add
      .text(WIDTH / 2, 60, "0", {
        fontFamily: "Arial",
        fontSize: "48px",
        color: COLORS.textLight,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.hintText = this.add
      .text(WIDTH / 2, HEIGHT / 2 - 120, "Tap to jump", {
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

  // Sway is purely visual: landings and hits are judged at the tower centre,
  // not where the swaying hamster is drawn.
  hamsterWorldX() {
    return CENTER_X;
  }

  spawnNextPlatform() {
    this.nextPlatform = new Platform(
      this,
      this.topY - PLATFORM_HEIGHT,
      this.currentSpeed(),
    );
    this.world.addAt(this.nextPlatform, 1); // above the ground, below the tower
  }

  handleTap() {
    if (this.busy || this.gameOver) return;
    this.busy = true;
    this.airborne = true;

    const half = tuning.jumpDuration / 2;
    const standY = this.hamster.y;

    // ── Взлёт ──
    this.hamster.jump();
    this.tweens.add({
      targets: this.hamster,
      y: standY - tuning.jumpHeight,
      duration: half,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.time.delayedCall(half - LANDING_PREP_DURATION, () => {
          this.hamster.land();
        });

        // ── Спуск на уровень нового блока ──
        this.tweens.add({
          targets: this.hamster,
          y: standY - PLATFORM_HEIGHT,
          duration: half,
          ease: "Sine.easeIn",
          onComplete: () => this.resolveLanding(),
        });
      },
    });
  }

  resolveLanding() {
    this.airborne = false;
    const platform = this.nextPlatform;
    const offset = platform.offsetRatio(this.hamsterWorldX());

    if (offset > SAFE_LANDING_ZONE) {
      this.onMiss(platform);
      return;
    }

    const grade =
      offset <= PERFECT_ZONE ? "perfect" : offset <= GOOD_ZONE ? "good" : "bad";
    this.onJumpSuccess(platform, grade);
  }

  onJumpSuccess(platform, grade) {
    platform.freeze();
    // move the block into the tower as its new top, keeping its on-screen position
    platform.baseX = platform.x - this.swayOffset;
    this.tower.addAt(platform, this.tower.getIndex(this.hamster));
    this.blocks.push(platform);
    this.topY = platform.y;

    this.score += 1;

    if (this.score > STABILITY_START_PLATFORM) {
      if (grade === "perfect") {
        this.stability = Math.min(
          MAX_STABILITY,
          this.stability + STABILITY_PERFECT_BONUS,
        );
      } else if (grade === "good") {
        this.stability -= STABILITY_GOOD_PENALTY;
      } else {
        this.stability -= STABILITY_BAD_PENALTY;
      }
    }

    this.scoreText.setText(String(this.score));
    this.showFeedback(grade);

    // tutorial hint disappears after the first successful jump
    if (this.hintText.active) this.hintText.destroy();

    if (this.stability <= 0) {
      this.stability = 0;
      this.onTowerCollapse();
      return;
    }

    this.updateSway();

    // camera follows the tower up
    this.tweens.add({
      targets: this.world,
      y: this.world.y + PLATFORM_HEIGHT,
      duration: CAMERA_FOLLOW_DURATION,
      ease: "Sine.easeOut",
    });

    this.time.delayedCall(LANDING_HOLD_DURATION, () => {
      this.hamster.stand();
      this.busy = false;
      this.spawnNextPlatform();
    });
  }

  // Lower stability → wider, faster sway.
  updateSway() {
    this.swayTarget =
      ((MAX_STABILITY - this.stability) / MAX_STABILITY) * MAX_SWAY;
  }

  // The tower bends from a fixed base: the top SWAY_BEND_BLOCKS blocks curve out,
  // the top block and the hamster by the full sway offset, lower blocks stay still.
  applySway(delta) {
    this.swayAmplitude +=
      (this.swayTarget - this.swayAmplitude) * Math.min(1, delta / 300);
    if (this.swayAmplitude < 0.05) return;

    // stronger sway also swings faster: 1100 ms → 600 ms per side
    const halfPeriod = 1100 - (this.swayAmplitude / MAX_SWAY) * 500;
    this.swayPhase += (delta / halfPeriod) * Math.PI;
    this.swayOffset = Math.sin(this.swayPhase) * this.swayAmplitude;

    const topIndex = this.blocks.length - 1;
    const bendBlocks = Math.min(topIndex, SWAY_BEND_BLOCKS);
    this.blocks.forEach((block, i) => {
      const t = bendBlocks ? Math.max(0, 1 - (topIndex - i) / bendBlocks) : 0;
      block.x = block.baseX + this.swayOffset * t * t; // quadratic: reads as a bend, not a slide
    });
    this.hamster.x = CENTER_X + this.swayOffset;
  }

  showFeedback(grade) {
    const { label, color } = GRADES[grade];
    const text = this.add
      .text(CENTER_X, CHAR_Y - 110, label, {
        fontFamily: "Arial",
        fontSize: "24px",
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
    this.time.delayedCall(1000, () => this.finishGame());
  }

  // Tapped too early: the platform is too far away, the hamster falls past it.
  onMiss(platform) {
    this.showFeedback("miss");
    this.fall(platform.direction);
  }

  // Didn't tap in time: the platform hits the hamster and knocks it off the tower.
  onKnockedOff(platform) {
    this.busy = true;
    this.showFeedback("late");
    this.fall(platform.direction);
  }

  fall(direction) {
    this.gameOver = true;
    if (this.hintText.active) this.hintText.destroy();

    this.tweens.add({
      targets: this.hamster,
      x: this.hamster.x + direction * 120,
      y: this.hamster.y + HEIGHT,
      angle: direction * 220,
      duration: FALL_DURATION,
      ease: "Cubic.easeIn",
    });

    this.time.delayedCall(FALL_DURATION + 150, () => this.finishGame());
  }

  finishGame() {
    const sessions = Number(localStorage.getItem(SESSIONS_KEY) || 0) + 1;
    localStorage.setItem(SESSIONS_KEY, String(sessions));

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

    if (this.gameOver) return; // falls and the collapse animate on their own
    this.applySway(delta);

    if (this.airborne || !this.nextPlatform.moving) return;

    if (
      this.nextPlatform.touches(
        this.hamsterWorldX(),
        tuning.hamsterHitboxW / 2,
      )
    ) {
      this.onKnockedOff(this.nextPlatform);
    }
  }
}
