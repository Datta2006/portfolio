import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type * as THREE from "three";
import { SnakeScene } from "./SnakeScene";
import type { SnakeMachine } from "./snakeMachine";

type Props = {
  machine: SnakeMachine;
  onContextLost: () => void;
};

export default function SnakeCanvas({ machine, onContextLost }: Props) {
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const [ready, setReady] = useState(false);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const lostRef = useRef(onContextLost);
  lostRef.current = onContextLost;

  const mobile = useMemo(
    () =>
      window.matchMedia("(max-width: 768px)").matches ||
      (navigator.hardwareConcurrency ?? 8) <= 4,
    [],
  );

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const canvas = glRef.current?.domElement;
    if (!canvas) return;
    const onLost = (event: Event) => {
      event.preventDefault();
      lostRef.current();
    };
    canvas.addEventListener("webglcontextlost", onLost, false);
    return () => canvas.removeEventListener("webglcontextlost", onLost, false);
  }, [ready]);

  return (
    <Canvas
      dpr={mobile ? [1, 1] : [1, 1.5]}
      frameloop={tabVisible ? "always" : "never"}
      gl={{
        alpha: true,
        antialias: !mobile,
        powerPreference: "high-performance",
        premultipliedAlpha: true,
      }}
      camera={{ position: [0, 0, 10], fov: 42, near: 0.1, far: 60 }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl, scene }) => {
        glRef.current = gl;
        gl.setClearColor(0x000000, 0);
        scene.background = null;
        setReady(true);
      }}
    >
      <SnakeScene machine={machine} />
    </Canvas>
  );
}
