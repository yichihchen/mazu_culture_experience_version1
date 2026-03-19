import Phaser from "phaser";
import {
  // KARMA_SPAWN_MS,
  // MERIT_SPAWN_MS,
  PLAYER_SPEED,
  START_HP,
} from "../config/constants";

type HudRefs = {
  scoreText: Phaser.GameObjects.Text;
  hpText: Phaser.GameObjects.Text;
  hintText: Phaser.GameObjects.Text;
};

type FacingDirection = "up" | "down" | "left" | "right";
type AreaName = "harbor" | "temple" | "beach" | "cave" | null;

export default class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Physics.Arcade.Sprite;

  private merits!: Phaser.Physics.Arcade.Group;
  private karmas!: Phaser.Physics.Arcade.Group;

  private score = 0;
  private hp = START_HP;
  private isGameOver = false;

  private hud!: HudRefs;

  private worldWidth = 0;
  private worldHeight = 0;

  private facing: FacingDirection = "up";
  private isMoving = false;
  private walkFrameIndex = 0;
  private walkFrameTimer = 0;
  private readonly WALK_FRAME_INTERVAL = 140;

  private moveTarget: Phaser.Math.Vector2 | null = null;
  private readonly POINTER_STOP_DISTANCE = 10;

  private currentArea: AreaName = null;

  // 角色影子
  private playerShadow!: Phaser.GameObjects.Ellipse;

  constructor() {
    super("MainScene");
  }

  create() {
    this.isGameOver = false;
    this.score = 0;
    this.hp = START_HP;
    this.facing = "up";
    this.isMoving = false;
    this.walkFrameIndex = 0;
    this.walkFrameTimer = 0;
    this.moveTarget = null;
    this.currentArea = null;

    const { width, height } = this.scale;

    this.cursors = this.input.keyboard!.createCursorKeys();

    // ==================================================
    // 背景地圖
    // ==================================================
    const bg = this.add.image(0, 0, "temple_map").setOrigin(0, 0).setDepth(-10);

    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);

    this.worldWidth = bg.displayWidth;
    this.worldHeight = bg.displayHeight;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // ==================================================
    // 玩家（載入時背面朝向玩家）
    // ==================================================
    this.player = this.physics.add.sprite(
      this.worldWidth / 2,
      this.worldHeight * 0.78,
      "up-idle"
    );

    this.player.setScale(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(900, 900);
    this.player.setDepth(10);

    // ==================================================
    // 影子（建立在玩家後面）
    // ==================================================
    this.playerShadow = this.add.ellipse(
      this.player.x,
      this.player.y + 12,
      18,
      7,
      0x000000,
      0.8
    );
    this.playerShadow.setDepth(5);

    // ==================================================
    // Camera
    // ==================================================
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // ==================================================
    // 群組
    // ==================================================
    this.merits = this.physics.add.group({ allowGravity: false });
    this.karmas = this.physics.add.group({ allowGravity: false });

    // ==================================================
    // HUD
    // ==================================================
    this.hud = this.createHUD();
    this.refreshHUD();

    // ==================================================
    // 計時生成
    // ==================================================
    // this.time.addEvent({
    //   delay: MERIT_SPAWN_MS,
    //   loop: true,
    //   callback: () => this.spawnMerit(),
    // });

    // this.time.addEvent({
    //   delay: KARMA_SPAWN_MS,
    //   loop: true,
    //   callback: () => this.spawnKarma(),
    // });

    // ==================================================
    // overlap
    // ==================================================
    // this.physics.add.overlap(this.player, this.merits, (_, obj) => {
    //   this.collectMerit(obj as Phaser.Physics.Arcade.Image);
    // });

    // this.physics.add.overlap(this.player, this.karmas, (_, obj) => {
    //   this.hitKarma(obj as Phaser.Physics.Arcade.Image);
    // });

    // ==================================================
    // R 重開
    // ==================================================
    const rKey = this.input.keyboard?.addKey("R");
    rKey?.on("down", () => {
      if (this.isGameOver) this.scene.restart();
    });

    // ==================================================
    // 點擊移動
    // ==================================================
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;

      this.moveTarget = new Phaser.Math.Vector2(
        Phaser.Math.Clamp(p.worldX, 24, this.worldWidth - 24),
        Phaser.Math.Clamp(p.worldY, 24, this.worldHeight - 24)
      );
    });

    // ==================================================
    // 初始生成
    // ==================================================
    // this.spawnMerit();
    // this.spawnMerit();
    // this.spawnKarma();

    this.checkAreaTrigger();

    // 開場先同步一次影子
    this.syncPlayerShadow();
  }

  update(_: number, dt: number) {
    if (this.isGameOver) {
      this.syncPlayerShadow();
      return;
    }

    if (!this.player.body) {
      this.syncPlayerShadow();
      return;
    }

    let vx = 0;
    let vy = 0;

    const left = this.cursors.left?.isDown;
    const right = this.cursors.right?.isDown;
    const up = this.cursors.up?.isDown;
    const down = this.cursors.down?.isDown;

    const isKeyboardMoving = !!(left || right || up || down);

    if (isKeyboardMoving) {
      this.moveTarget = null;

      if (left) vx = -PLAYER_SPEED;
      else if (right) vx = PLAYER_SPEED;

      if (up) vy = -PLAYER_SPEED;
      else if (down) vy = PLAYER_SPEED;
    } else if (this.moveTarget) {
      const dx = this.moveTarget.x - this.player.x;
      const dy = this.moveTarget.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= this.POINTER_STOP_DISTANCE) {
        this.moveTarget = null;
        vx = 0;
        vy = 0;
      } else {
        const angle = Math.atan2(dy, dx);
        vx = Math.cos(angle) * PLAYER_SPEED;
        vy = Math.sin(angle) * PLAYER_SPEED;

        if (Math.abs(dx) > Math.abs(dy)) {
          this.facing = dx > 0 ? "right" : "left";
        } else {
          this.facing = dy > 0 ? "down" : "up";
        }
      }
    }

    this.player.setVelocity(vx, vy);
    this.isMoving = vx !== 0 || vy !== 0;

    if (isKeyboardMoving) {
      if (up) this.facing = "up";
      else if (down) this.facing = "down";
      else if (left) this.facing = "left";
      else if (right) this.facing = "right";
    }

    this.updatePlayerAnimation(dt);
    this.cleanupObjects();
    this.checkAreaTrigger();

    // 每一幀同步影子位置
    this.syncPlayerShadow();
  }

  // ==================================================
  // 影子同步
  // ==================================================
  private syncPlayerShadow() {
    if (!this.player || !this.playerShadow) return;

    this.playerShadow.setPosition(this.player.x, this.player.y + 12);

    if (this.isMoving) {
      this.playerShadow.setSize(20, 8);
      this.playerShadow.setAlpha(0.8);
    } else {
      this.playerShadow.setSize(18, 7);
      this.playerShadow.setAlpha(0.8);
    }
  }

  // ==================================================
  // 區域觸發系統
  // ==================================================
  private checkAreaTrigger() {
    const x = this.player.x;
    const y = this.player.y;

    let nextArea: AreaName = null;

    if (
      x > this.worldWidth * 0.32 &&
      x < this.worldWidth * 0.68 &&
      y > this.worldHeight * 0.10 &&
      y < this.worldHeight * 0.38
    ) {
      nextArea = "temple";
    } else if (
      x > this.worldWidth * 0.05 &&
      x < this.worldWidth * 0.34 &&
      y > this.worldHeight * 0.55 &&
      y < this.worldHeight * 0.95
    ) {
      nextArea = "harbor";
    } else if (
      x > this.worldWidth * 0.66 &&
      x < this.worldWidth * 0.95 &&
      y > this.worldHeight * 0.55 &&
      y < this.worldHeight * 0.95
    ) {
      nextArea = "beach";
    } else if (
      x > this.worldWidth * 0.70 &&
      x < this.worldWidth * 0.95 &&
      y > this.worldHeight * 0.10 &&
      y < this.worldHeight * 0.42
    ) {
      nextArea = "cave";
    }

    if (nextArea === this.currentArea) return;

    this.currentArea = nextArea;

    switch (nextArea) {
      case "temple":
        this.showAreaBanner("媽祖廟", "香火鼎盛，請懷著敬意前行，點一支香吧!");
        break;
      case "harbor":
        this.showAreaBanner("海港", "漁民似乎有事想請你幫忙");
        break;
      case "beach":
        this.showAreaBanner("海邊沙灘", "海風中隱約夾帶不安的氣息");
        break;
      case "cave":
        this.showAreaBanner("海蝕洞", "洞內深處，似乎藏著未知試煉");
        break;
      default:
        break;
    }
  }

  private showAreaBanner(title: string, subtitle: string) {
    const { width } = this.scale;

    const panel = this.add
      .rectangle(width / 2, 90, 420, 90, 0x000000, 0.58)
      .setScrollFactor(0)
      .setDepth(2500)
      .setAlpha(0);

    const titleText = this.add
      .text(width / 2, 72, title, {
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        fontSize: "28px",
        color: "#ffeaa7",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2501)
      .setAlpha(0);

    const subtitleText = this.add
      .text(width / 2, 105, subtitle, {
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        fontSize: "16px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2501)
      .setAlpha(0);

    this.tweens.add({
      targets: [panel, titleText, subtitleText],
      alpha: 1,
      duration: 180,
      ease: "Sine.easeOut",
      yoyo: true,
      hold: 1200,
      onComplete: () => {
        panel.destroy();
        titleText.destroy();
        subtitleText.destroy();
      },
    });
  }

  // ==================================================
  // 玩家動畫
  // ==================================================
  private updatePlayerAnimation(dt: number) {
    if (this.isMoving) {
      this.playWalkAnimation(dt);
    } else {
      this.playIdleAnimation();
    }
  }

  private playWalkAnimation(dt: number) {
    this.walkFrameTimer += dt;

    if (this.walkFrameTimer >= this.WALK_FRAME_INTERVAL) {
      this.walkFrameTimer = 0;
      this.walkFrameIndex = this.walkFrameIndex === 0 ? 1 : 0;
    }

    const frameNumber = this.walkFrameIndex === 0 ? 1 : 2;
    const textureKey = `${this.facing}-walk-${frameNumber}`;
    this.player.setTexture(textureKey);
  }

  private playIdleAnimation() {
    this.walkFrameTimer = 0;
    this.walkFrameIndex = 0;

    const textureKey = `${this.facing}-idle`;
    this.player.setTexture(textureKey);
  }

  // ==================================================
  // HUD
  // ==================================================
  private createHUD(): HudRefs {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      fontSize: "18px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    };

    const scoreText = this.add
      .text(16, 12, "功德：0", style)
      .setDepth(1000)
      .setScrollFactor(0);

    const hpText = this.add
      .text(16, 38, "清淨：3", style)
      .setDepth(1000)
      .setScrollFactor(0);

    const hintText = this.add
      .text(16, 64, "方向鍵移動 / 點擊移動｜探索不同區域", {
        ...style,
        fontSize: "16px",
        color: "#ffeaa7",
      })
      .setDepth(1000)
      .setScrollFactor(0);

    return { scoreText, hpText, hintText };
  }

  private refreshHUD() {
    this.hud.scoreText.setText(`功德：${this.score}`);
    this.hud.hpText.setText(`清淨：${this.hp}`);
  }

  // ==================================================
  // Spawn
  // ==================================================
  // private spawnMerit() {
  //   if (this.isGameOver) return;

  //   const x = Phaser.Math.Between(40, this.worldWidth - 40);
  //   const y = Phaser.Math.Between(80, this.worldHeight - 120);

  //   const merit = this.physics.add.image(x, y, "merit");
  //   merit.setDepth(5);
  //   merit.setCircle(16);
  //   merit.setVelocity(0, 0);
  //   merit.setImmovable(true);

  //   this.merits.add(merit);
  // }

  // private spawnKarma() {
  //   if (this.isGameOver) return;

  //   const x = Phaser.Math.Between(40, this.worldWidth - 40);
  //   const y = Phaser.Math.Between(80, this.worldHeight - 120);

  //   const karma = this.physics.add.image(x, y, "karma");
  //   karma.setDepth(5);
  //   karma.setCircle(16);
  //   karma.setVelocity(0, 0);
  //   karma.setImmovable(true);

  //   this.karmas.add(karma);
  // }

  private cleanupObjects() {
    const killIfOut = (obj: Phaser.GameObjects.GameObject) => {
      const body = (obj as any).body as Phaser.Physics.Arcade.Body | undefined;
      if (!body) return;

      const x = body.x;
      const y = body.y;

      if (
        x < -100 ||
        x > this.worldWidth + 100 ||
        y < -100 ||
        y > this.worldHeight + 100
      ) {
        obj.destroy();
      }
    };

    this.merits.getChildren().forEach(killIfOut);
    this.karmas.getChildren().forEach(killIfOut);
  }

  // ==================================================
  // 碰撞結果
  // ==================================================
  // private collectMerit(merit: Phaser.Physics.Arcade.Image) {
  //   if (this.isGameOver) return;

  //   merit.disableBody(true, true);
  //   merit.destroy();

  //   this.score += 1;
  //   this.refreshHUD();
  //   this.cameras.main.shake(60, 0.002);

  //   if (this.score === 5) this.toast("功德初成 ✨");
  //   if (this.score === 12) this.toast("心更清明了 🙏");
  // }

  // private hitKarma(karma: Phaser.Physics.Arcade.Image) {
  //   if (this.isGameOver) return;

  //   karma.disableBody(true, true);
  //   karma.destroy();

  //   this.hp -= 1;
  //   this.refreshHUD();

  //   this.cameras.main.flash(120, 255, 80, 80);
  //   this.player.setTint(0xff6666);
  //   this.time.delayedCall(180, () => this.player.clearTint());

  //   if (this.hp <= 0) {
  //     this.gameOver();
  //   } else {
  //     this.toast("小心業障…");
  //   }
  // }

  // ==================================================
  // UI / UX
  // ==================================================
  // private toast(message: string) {
  //   const { width } = this.scale;

  //   const t = this.add
  //     .text(width / 2, 110, message, {
  //       fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  //       fontSize: "20px",
  //       color: "#ffffff",
  //       stroke: "#000000",
  //       strokeThickness: 5,
  //     })
  //     .setOrigin(0.5)
  //     .setDepth(2000)
  //     .setScrollFactor(0)
  //     .setAlpha(0);

  //   this.tweens.add({
  //     targets: t,
  //     alpha: 1,
  //     y: 100,
  //     duration: 160,
  //     ease: "Sine.easeOut",
  //     yoyo: true,
  //     hold: 650,
  //     onComplete: () => t.destroy(),
  //   });
  // }

  // private gameOver() {
  //   this.isGameOver = true;
  //   this.moveTarget = null;
  //   this.player.setVelocity(0, 0);
  //   this.isMoving = false;

  //   this.syncPlayerShadow();

  //   this.merits.clear(true, true);
  //   this.karmas.clear(true, true);

  //   const { width, height } = this.scale;

  //   const panel = this.add
  //     .rectangle(
  //       width / 2,
  //       height / 2,
  //       Math.min(520, width - 40),
  //       220,
  //       0x000000,
  //       0.68
  //     )
  //     .setDepth(3000)
  //     .setScrollFactor(0)
  //     .setAlpha(0);

  //   const title = this.add
  //     .text(width / 2, height / 2 - 70, "修行暫止", {
  //       fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  //       fontSize: "34px",
  //       color: "#ffffff",
  //       stroke: "#000000",
  //       strokeThickness: 6,
  //     })
  //     .setOrigin(0.5)
  //     .setDepth(3001)
  //     .setScrollFactor(0)
  //     .setAlpha(0);

  //   const info = this.add
  //     .text(
  //       width / 2,
  //       height / 2 - 10,
  //       `本回合功德：${this.score}\n按 R 或點擊畫面重新開始`,
  //       {
  //         fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  //         fontSize: "20px",
  //         color: "#ffeaa7",
  //         align: "center",
  //         stroke: "#000000",
  //         strokeThickness: 5,
  //       }
  //     )
  //     .setOrigin(0.5)
  //     .setDepth(3001)
  //     .setScrollFactor(0)
  //     .setAlpha(0);

  //   this.input.once("pointerdown", () => this.scene.restart());

  //   this.tweens.add({
  //     targets: [panel, title, info],
  //     alpha: 1,
  //     duration: 220,
  //     ease: "Sine.easeOut",
  //   });
  // }
}