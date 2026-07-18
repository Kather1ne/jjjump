import {
  PLATFORM_GAP,
  PLATFORM_WIDTH,
  PLATFORM_HEIGHT,
  BASE_PLATFORM_SPEED,
  JUMP_DURATION,
  CHAR_Y,
} from '../config.js';

const DEFAULTS = {
  hamsterOffsetY: 36,
  hamsterSize: 72,
  hamsterHitboxW: 52,
  jumpExtra: 36,
  jumpDuration: JUMP_DURATION,
  descentPx: 28,
  platformWidth: PLATFORM_WIDTH,
  platformHeight: PLATFORM_HEIGHT,
  platformSpeed: BASE_PLATFORM_SPEED,
  platformGap: PLATFORM_GAP,
};

const CONTROLS = [
  { key: 'hamsterOffsetY',  label: 'Hamster Y offset',    min: 0,   max: 80,  step: 1 },
  { key: 'hamsterSize',     label: 'Hamster sprite size',  min: 32,  max: 140, step: 2 },
  { key: 'hamsterHitboxW',  label: 'Hamster hitbox W',     min: 20,  max: 100, step: 2 },
  { key: 'jumpExtra',       label: 'Jump extra (above gap)', min: 0, max: 100, step: 2 },
  { key: 'jumpDuration',    label: 'Jump duration ms',     min: 200, max: 1200, step: 10 },
  { key: 'descentPx',       label: 'Descent px',           min: 0,   max: 100, step: 1 },
  { key: 'platformWidth',   label: 'Platform width',       min: 60,  max: 250, step: 5 },
  { key: 'platformHeight',  label: 'Platform height',      min: 10,  max: 60,  step: 2 },
  { key: 'platformSpeed',   label: 'Platform speed px/s',  min: 20,  max: 300, step: 5 },
  { key: 'platformGap',     label: 'Platform gap',         min: 60,  max: 300, step: 5 },
];

export const tuning = { ...DEFAULTS };

export function createDebugPanel() {
  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  panel.innerHTML = `
    <style>
      #debug-panel {
        position: fixed;
        top: 8px;
        right: 8px;
        z-index: 9999;
        background: rgba(20, 15, 25, 0.92);
        border: 1px solid #555;
        border-radius: 8px;
        padding: 0;
        font-family: monospace;
        font-size: 11px;
        color: #ddd;
        width: 260px;
        max-height: 90vh;
        overflow-y: auto;
        user-select: none;
        pointer-events: auto;
      }
      #debug-panel .dp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
        cursor: pointer;
        background: rgba(60, 40, 80, 0.6);
        border-radius: 8px 8px 0 0;
      }
      #debug-panel .dp-header:hover { background: rgba(80, 55, 110, 0.6); }
      #debug-panel.collapsed .dp-body { display: none; }
      #debug-panel.collapsed .dp-header { border-radius: 8px; }
      #debug-panel .dp-body { padding: 6px 10px 10px; }
      #debug-panel .dp-row {
        display: flex;
        flex-direction: column;
        margin-bottom: 6px;
      }
      #debug-panel .dp-row label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
      }
      #debug-panel .dp-row label span.val {
        color: #ffd76e;
        min-width: 36px;
        text-align: right;
      }
      #debug-panel input[type=range] {
        width: 100%;
        height: 14px;
        accent-color: #a975d0;
      }
      #debug-panel .dp-btns {
        display: flex;
        gap: 6px;
        margin-top: 8px;
      }
      #debug-panel .dp-btns button {
        flex: 1;
        padding: 4px;
        font-family: monospace;
        font-size: 10px;
        border: 1px solid #666;
        border-radius: 4px;
        background: #2a2035;
        color: #ddd;
        cursor: pointer;
      }
      #debug-panel .dp-btns button:hover { background: #3a2a50; }
    </style>
    <div class="dp-header">
      <span>🎛 Debug</span>
      <span class="dp-toggle">▼</span>
    </div>
    <div class="dp-body"></div>
  `;

  const header = panel.querySelector('.dp-header');
  const toggle = panel.querySelector('.dp-toggle');
  header.addEventListener('click', () => {
    panel.classList.toggle('collapsed');
    toggle.textContent = panel.classList.contains('collapsed') ? '▶' : '▼';
  });

  const body = panel.querySelector('.dp-body');

  for (const ctrl of CONTROLS) {
    const row = document.createElement('div');
    row.className = 'dp-row';

    const label = document.createElement('label');
    label.innerHTML = `${ctrl.label} <span class="val">${tuning[ctrl.key]}</span>`;

    const input = document.createElement('input');
    input.type = 'range';
    input.min = ctrl.min;
    input.max = ctrl.max;
    input.step = ctrl.step;
    input.value = tuning[ctrl.key];

    const valSpan = label.querySelector('.val');
    input.addEventListener('input', () => {
      const v = Number(input.value);
      tuning[ctrl.key] = v;
      valSpan.textContent = v;
    });

    row.appendChild(label);
    row.appendChild(input);
    body.appendChild(row);
  }

  const btns = document.createElement('div');
  btns.className = 'dp-btns';

  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset all';
  resetBtn.addEventListener('click', () => {
    Object.assign(tuning, DEFAULTS);
    body.querySelectorAll('.dp-row').forEach((row, i) => {
      const ctrl = CONTROLS[i];
      const input = row.querySelector('input');
      const val = row.querySelector('.val');
      input.value = DEFAULTS[ctrl.key];
      val.textContent = DEFAULTS[ctrl.key];
    });
  });

  const logBtn = document.createElement('button');
  logBtn.textContent = 'Log values';
  logBtn.addEventListener('click', () => {
    console.table({ ...tuning });
  });

  const restartBtn = document.createElement('button');
  restartBtn.textContent = 'Restart';
  restartBtn.addEventListener('click', () => {
    const game = window.__game;
    if (game) game.scene.start('Game');
  });

  btns.appendChild(resetBtn);
  btns.appendChild(logBtn);
  btns.appendChild(restartBtn);
  body.appendChild(btns);

  document.body.appendChild(panel);
}
