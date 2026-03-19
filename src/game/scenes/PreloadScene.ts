import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        // 第一週：先用 Graphics 生成紋理，避免你卡在素材準備
        // 背景：用 tile sprite 不一定必要，這裡只準備玩家/功德/業障

        // up 載入角色資源
        // idle must changes
        this.load.image("up-idle", "/assets/images/up_walk_1.png");
        this.load.image("up-walk-1", "/assets/images/up_walk_1.png");
        this.load.image("up-walk-2", "/assets/images/up_walk_2.png");

        // down
        this.load.image("down-idle", "/assets/images/down_walk_idle.png");
        this.load.image("down-walk-1", "/assets/images/down_walk_1.png");
        this.load.image("down-walk-2", "/assets/images/down_walk_2.png");

        // left
        this.load.image("left-idle", "/assets/images/left_walk_1.png");
        this.load.image("left-walk-1", "/assets/images/left_walk_1.png");
        this.load.image("left-walk-2", "/assets/images/left_walk_2.png");

        // right
        this.load.image("right-idle", "/assets/images/right_walk_1.png");
        this.load.image("right-walk-1", "/assets/images/right_walk_1.png");
        this.load.image("right-walk-2", "/assets/images/right_walk_2.png");

        //temple-background
        this.load.image("temple_map", "/assets/images/temple_beach.png");

        // 可以加一個簡單 loading 字
        this.add
            .text(this.scale.width / 2, this.scale.height / 2, "Loading...", {
                fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
                fontSize: "20px",
                color: "#ffffff",
            })
            .setOrigin(0.5);

    }

    create() {

        const g = this.add.graphics();

        // 功德：金色圓
        g.clear();
        g.fillStyle(0xf9d65c, 1);
        g.fillCircle(16, 16, 16);
        g.generateTexture("merit", 32, 32);

        // 業障：紅色菱形
        g.clear();
        g.fillStyle(0xff6b6b, 1);
        g.beginPath();
        g.moveTo(18, 0);
        g.lineTo(36, 18);
        g.lineTo(18, 36);
        g.lineTo(0, 18);
        g.closePath();
        g.fillPath();
        g.generateTexture("karma", 36, 36);

        // g.destroy();

        console.log("loaded textures:", this.textures.getTextureKeys());

        this.scene.start("MainScene");
    }
}
