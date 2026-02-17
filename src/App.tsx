// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


import { useEffect, useRef } from "react";
import { mountPhaser } from "./game/main";

export default function App() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const game = mountPhaser(hostRef.current);
    return () => game.destroy(true);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "grid", placeItems: "center", background: "#070b10" }}>
      <div
        ref={hostRef}
        style={{
          width: "min(96vw, 960px)",
          aspectRatio: "16/9",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      />
    </div>
  );
}
