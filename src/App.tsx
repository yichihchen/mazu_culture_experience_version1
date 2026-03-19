

// import { useEffect, useRef } from "react";
// import { mountPhaser } from "./main";

// export default function App() {
//   const hostRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!hostRef.current) return;
//     const game = mountPhaser(hostRef.current);
//     return () => game.destroy(true);
//   }, []);

//   return (
//     <div style={{ width: "100vw", height: "100vh", display: "grid", placeItems: "center", background: "#070b10" }}>
//       <div
//         ref={hostRef}
//         style={{
//           width: "min(96vw, 960px)",
//           aspectRatio: "16/9",
//           borderRadius: 16,
//           overflow: "hidden",
//           border: "1px solid rgba(255,255,255,0.12)",
//         }}
//       />
//     </div>
//   );
// }

import PhaserGameCanvas from "./PhaserGameCanvas";

export default function App() {
  return (
    <div className="app">
      <div className="shell">
        <div className="header">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>宗教小遊戲（第一週可跑版）</div>
            <div className="hint">方向鍵移動｜收集功德｜避開業障｜按 R 重開</div>
          </div>
          <div className="hint">React + TS + Vite + Phaser</div>
        </div>

        <div className="card">
          <PhaserGameCanvas />
        </div>
      </div>
    </div>
  );
}



