import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SnakeModel } from "./SnakeModel";
import { acquireScrollDriver } from "./scrollDriver";
import type { SnakeMachine } from "./snakeMachine";

function CameraRig({ machine }: { machine: SnakeMachine }) {
  const camera = useThree((state) => state.camera);

  useFrame((state) => {
    const now = performance.now();
    const attack = machine.getAttackFrame(now);
    const t = state.clock.elapsedTime;
    const shake = attack.shake * 0.045;

    camera.position.x = Math.sin(t * 11.3) * shake + Math.sin(t * 0.16) * 0.055;
    camera.position.y = Math.cos(t * 13.7) * shake * 0.7 + Math.cos(t * 0.13) * 0.035;
    camera.position.z = 10 - attack.cameraPush;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function DustMotes() {
  const ref = useRef<THREE.Points>(null);
  const count = useMemo(
    () => (window.matchMedia("(max-width: 768px)").matches ? 55 : 110),
    [],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 2] = -7 + Math.random() * 10;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.008;
    ref.current.position.y = Math.sin(t * 0.06) * 0.22;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color={0xc7a36c}
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function SnakeScene({ machine }: { machine: SnakeMachine }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const release = acquireScrollDriver();

    const previousToneMapping = gl.toneMapping;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.92;
    gl.setClearColor(0x000000, 0);

    const previousBackground = scene.background;
    const previousFog = scene.fog;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x050706, 0.045);

    return () => {
      release();
      gl.toneMapping = previousToneMapping;
      scene.background = previousBackground;
      scene.fog = previousFog;
    };
  }, [gl, scene]);

  return (
    <>
      <hemisphereLight args={[0x9fb37a, 0x1a0806, 0.55]} />
      <ambientLight intensity={0.32} color={0x76806a} />
      <directionalLight position={[5, 7, 6]} intensity={2.5} color={0xe8efd6} />
      <directionalLight position={[-7, 3, -4]} intensity={1.65} color={0x8d332d} />
      <directionalLight position={[3, 2, 8]} intensity={1.35} color={0xd8e5c0} />
      <pointLight position={[3, -2, 4.5]} intensity={2.4} distance={18} decay={2} color={0xc7a36c} />

      <SnakeModel machine={machine} />
      <CameraRig machine={machine} />
      <DustMotes />
    </>
  );
}
