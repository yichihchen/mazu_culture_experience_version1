import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import BootScene from "../scenes/BootScene";
import PreloadScene from "../scenes/PreloadScene";
import MainScene from "../scenes/MainScene";

export function makeGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO, //自動選擇 WebGL 或 Canvas
    parent, //重要！把遊戲掛在這個 DOM 元素上
    width: GAME_WIDTH, //遊戲內部畫布尺寸,跟 CSS 大小不同
    height: GAME_HEIGHT,
    backgroundColor: "#0b1020", //畫布背景顏色
    physics: {
      default: "arcade", //鼠標(主角)
      arcade: {
        debug: false,
      },
    },
    scene: [BootScene, PreloadScene, MainScene], //遊戲啟動後的 Scene 流程

    //畫布縮放策略
    // scale: {
    //   mode: Phaser.Scale.FIT, //等比例縮放以填滿父容器
    //   autoCenter: Phaser.Scale.CENTER_BOTH, //水平 + 垂直置中
    // },

    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.NO_CENTER,
    },
    
    audio: {
      disableWebAudio: true, // ✅ 先用 HTML5 Audio，避開 AudioContext policy
    },
  };
}
