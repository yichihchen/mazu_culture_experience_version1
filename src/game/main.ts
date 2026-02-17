import Phaser from "phaser";

class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2, "Mazu project started", {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5, 0.5);
  }
}

export function mountPhaser(parent: HTMLDivElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    backgroundColor: "#0b0f14",
    scene: [BootScene],
  });
}