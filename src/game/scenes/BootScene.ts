import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
    console.log('BootScene create');
  }

  create() {
    // 第一週：Boot 只做流程切換（未來可放裝置適配、語系、設定讀取）
    this.scene.start("PreloadScene");
  }
}
