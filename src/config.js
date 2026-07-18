export const WIDTH = 400;
export const HEIGHT = 800;

export const CENTER_X = WIDTH / 2;
export const CHAR_Y = 560; // fixed screen row where the character always stands

export const PLATFORM_GAP = 150; // vertical distance between consecutive platforms
export const PLATFORM_WIDTH = 130;
export const PLATFORM_HEIGHT = 28;
export const LANDING_TOLERANCE = 8; // px of forgiveness on top of geometric overlap

export const JUMP_DURATION = 550;//420; // ms, straight-up hop to the next platform
export const FALL_DURATION = 700; // ms, falling off after a miss

export const BASE_PLATFORM_SPEED = 90; // px/sec, horizontal oscillation speed
export const DIFFICULTY_START = 10; // no speed increase before this platform
export const SPEED_INCREASE_PER_PLATFORM = 0.01; // +1% of base per platform after DIFFICULTY_START
export const MAX_SPEED_MULTIPLIER = 2.0; // cap at 200% of base

export const PLATFORM_TIME_LIMIT = 4000; // ms before auto-fail if player doesn't tap

export const PERFECT_ZONE = 10; // px offset from center for Perfect landing
export const MAX_STABILITY = 100;
export const STABILITY_WINDOW = 10; // only last N jumps affect stability

export const BEST_SCORE_KEY = 'jjjamp_best_score';

export const COLORS = {
  background: 0x2b2130,
  backgroundAlt: 0x372a42,
  platform: 0x8a5a3b,
  platformTop: 0xa9764f,
  character: 0xe0a35c,
  characterEar: 0xc97f3f,
  characterFace: 0x3a2a1a,
  textLight: '#f7ecd8',
};
