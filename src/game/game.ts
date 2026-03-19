import Phaser from "phaser";
import { makeGameConfig } from "./config/gameConfig";

export function createGame(parent: HTMLElement) {
  const config = makeGameConfig(parent);
  return new Phaser.Game(config);
}
