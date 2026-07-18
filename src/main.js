import Phaser from 'phaser';
import { WIDTH, HEIGHT, COLORS } from './config.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import ResultScene from './scenes/ResultScene.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: COLORS.background,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MenuScene, GameScene, ResultScene],
});

if (import.meta.env.DEV) {
  window.__game = game;
  // import('./debug/DebugPanel.js').then(({ createDebugPanel }) => createDebugPanel());
}
