
import { useRef } from "react";
import usePhaserGame from "./hooks/usePhaserGame";
import { GAME_WIDTH, GAME_HEIGHT } from "./game/config/constants";

export default function PhaserGameCanvas() {

  const containerRef = useRef<HTMLDivElement | null>(null);

  // 自訂 Hook（Custom Hook），裡面有 Phaser 遊戲的邏輯
  usePhaserGame(containerRef);

  return (
    <div
      // 把DOM存進ref，讓Hook裡的Phaser能拿到這個元素來掛載遊戲
      ref={containerRef}
      style={{
        // width: "100%",
        // height: "560px",
        width: `${GAME_WIDTH}px`,
        height: `${GAME_HEIGHT}px`,
      }}
    />
  );
}