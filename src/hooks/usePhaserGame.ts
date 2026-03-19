import { useEffect } from "react";
import type { RefObject } from "react";
import { createGame } from "../game/game";

// 這才是 Hook
export default function usePhaserGame(containerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const game = createGame(el);

    return () => {
      // React unmount 時銷毀 Phaser，避免記憶體/事件殘留
      game.destroy(true);
    };
  }, [containerRef]);
}
