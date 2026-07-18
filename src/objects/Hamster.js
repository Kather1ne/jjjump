const FRAME = {
  JUMP: 0,
  STAND: 1,
  LAND: 2,
};

export default class Hamster extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.sprite = scene.add.sprite(0, 0, 'hamster', FRAME.STAND);

    // Каждый исходный кадр — 724×724.
    // На экране отображаем его размером 96×96.
    this.sprite.setDisplaySize(72, 72);

    // Размер персонажа для игровой логики.
    this.setSize(52, 60);

    this.add(this.sprite);
    scene.add.existing(this);
  }

  stand() {
    this.sprite.setFrame(FRAME.STAND);
  }

  jump() {
    this.sprite.setFrame(FRAME.JUMP);
  }

  land() {
    this.sprite.setFrame(FRAME.LAND);
  }
}