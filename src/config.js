export const WIDTH = 400;
export const HEIGHT = 800;

export const CENTER_X = WIDTH / 2;
export const CHAR_Y = 560; // fixed screen row where the top of the tower always sits

export const PLATFORM_WIDTH = 130;
export const PLATFORM_HEIGHT = 21; // blocks stack directly on top of each other

export const JUMP_HEIGHT = 90; // px above the current tower top
export const JUMP_DURATION = 660; // ms, whole hop: up + down
export const FALL_DURATION = 700; // ms, falling off after a miss
export const CAMERA_FOLLOW_DURATION = 150; // ms, tower scrolls down after each block

export const BASE_PLATFORM_SPEED = 160; // px/sec, platform flying in from the side
export const DIFFICULTY_START = 10; // no speed increase before this platform
export const SPEED_INCREASE_PER_PLATFORM = 0.01; // +1% of base per platform after DIFFICULTY_START
export const MAX_SPEED_MULTIPLIER = 2.0; // cap at 200% of base

// Landing offset from the platform centre, as a share of half the platform width
export const PERFECT_ZONE = 0.1; // up to 10% — Perfect
export const GOOD_ZONE = 0.4; // 11–40% — Good
export const SAFE_LANDING_ZONE = 0.8; // 41–80% — Bad, beyond — Miss

export const MAX_STABILITY = 100;
export const STABILITY_START_PLATFORM = 5; // stability (and sway) is untouched up to and including this platform
export const STABILITY_PERFECT_BONUS = 5;
export const STABILITY_GOOD_PENALTY = 5;
export const STABILITY_BAD_PENALTY = 15;
export const MAX_SWAY = 36; // px the tower top sways at zero stability; the base stays put
export const SWAY_BEND_BLOCKS = 12; // how many top blocks bend; lower ones stay still

export const MIN_LOADING_TIME = 600; // ms, so the loading screen doesn't just flash

export const BEST_SCORE_KEY = 'jjjamp_best_score';
export const SESSIONS_KEY = 'jjjamp_sessions';

export const COLORS = {
  background: 0x2b2130,
  backgroundAlt: 0x372a42,
  ground: 0x4a3a52,
  platform: 0x8a5a3b,
  platformTop: 0xa9764f,
  character: 0xe0a35c,
  characterEar: 0xc97f3f,
  characterFace: 0x3a2a1a,
  textLight: '#f7ecd8',
};
