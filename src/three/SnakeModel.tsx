/* ------------------------------------------------------------
   Placeholder creature.

   IMPORTANT: this is a procedural, code-built snake, not a licensed
   photorealistic rigged asset. It exists so the full scroll path,
   state machine, camera, and attack choreography are real and
   testable. Its jaw, fangs, tongue, eyes, and neck are procedural.
   Swapping in a proper GLB requires replacing this component's body
   with a GLTF scene and mapping the clip names listed in
   SNAKE_ASSET_REQUIREMENTS.md. Nothing here should be described as
   a finished photorealistic snake.
   ------------------------------------------------------------ */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SnakeMachine, SnakeState } from "./snakeMachine";
import { scrollState } from "./scrollDriver";
import { samplePath, type PathSample } from "./snakePath";
import { createSnakeTextures } from "./snakeTextures";

const SPINE = 58;
const RADIAL = 12;
const SEGMENT = 0.152;
const CAMERA_Z = 10;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => t * t * (3 - 2 * t);

function radiusProfile(t: number): number {
  if (t < 0.08) return 0.112 + 0.028 * (t / 0.08);
  if (t < 0.38) {
    const u = (t - 0.08) / 0.3;
    return 0.14 + (0.224 - 0.14) * smooth(u);
  }
  const u = (t - 0.38) / 0.62;
  return 0.224 * Math.pow(1 - u, 0.9) + 0.007;
}

export function SnakeModel({ machine }: { machine: SnakeMachine }) {
  const viewport = useThree((state) => state.viewport);
  const camera = useThree((state) => state.camera);

  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);
  const tongueRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headLightRef = useRef<THREE.PointLight>(null);

  const textures = useMemo(() => createSnakeTextures(), []);

  const headMap = useMemo(() => {
    const map = textures.map.clone();
    map.repeat.set(1.15, 1.15);
    map.needsUpdate = true;
    return map;
  }, [textures]);

  const headBump = useMemo(() => {
    const map = textures.bumpMap.clone();
    map.repeat.set(1.15, 1.15);
    map.needsUpdate = true;
    return map;
  }, [textures]);

  const materials = useMemo(() => {
    const body = new THREE.MeshStandardMaterial({
      map: textures.map,
      bumpMap: textures.bumpMap,
      bumpScale: 0.048,
      color: 0xdfe4d2,
      roughness: 0.47,
      metalness: 0.21,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });

    const head = new THREE.MeshStandardMaterial({
      map: headMap,
      bumpMap: headBump,
      bumpScale: 0.036,
      color: 0xe4e8d6,
      roughness: 0.4,
      metalness: 0.24,
      transparent: true,
      opacity: 0,
    });

    const mouth = new THREE.MeshStandardMaterial({
      color: 0x240b09,
      roughness: 0.85,
      metalness: 0.02,
      transparent: true,
      opacity: 0,
    });

    const fang = new THREE.MeshStandardMaterial({
      color: 0xd9d1b7,
      roughness: 0.34,
      metalness: 0.06,
      transparent: true,
      opacity: 0,
    });

    const tongue = new THREE.MeshStandardMaterial({
      color: 0x6e211d,
      emissive: 0x250706,
      emissiveIntensity: 0.45,
      roughness: 0.52,
      transparent: true,
      opacity: 0,
    });

    const eye = new THREE.MeshStandardMaterial({
      color: 0x170f04,
      emissive: 0xd89a3e,
      emissiveIntensity: 2.1,
      roughness: 0.22,
      metalness: 0.08,
      transparent: true,
      opacity: 0,
    });

    const pupil = new THREE.MeshStandardMaterial({
      color: 0x030302,
      roughness: 0.18,
      metalness: 0,
      transparent: true,
      opacity: 0,
    });

    return { body, head, mouth, fang, tongue, eye, pupil };
  }, [textures, headMap, headBump]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(SPINE * RADIAL * 3);
    const uvs = new Float32Array(SPINE * RADIAL * 2);
    const indices: number[] = [];

    for (let i = 0; i < SPINE; i += 1) {
      const v = i / (SPINE - 1);
      for (let j = 0; j < RADIAL; j += 1) {
        const index = i * RADIAL + j;
        uvs[index * 2] = j / RADIAL;
        uvs[index * 2 + 1] = v;

        if (i < SPINE - 1) {
          const a = i * RADIAL + j;
          const b = i * RADIAL + ((j + 1) % RADIAL);
          const c = (i + 1) * RADIAL + j;
          const d = (i + 1) * RADIAL + ((j + 1) % RADIAL);
          indices.push(a, b, c, b, d, c);
        }
      }
    }

    const position = new THREE.BufferAttribute(positions, 3);
    position.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", position);
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    return geo;
  }, []);

  const spine = useMemo(() => {
    const points = Array.from({ length: SPINE }, () => new THREE.Vector3());
    for (let i = 0; i < SPINE; i += 1) {
      points[i]!.set(5.2 + i * SEGMENT, 0.6, 0);
    }
    return points;
  }, []);

  const display = useMemo(
    () => Array.from({ length: SPINE }, () => new THREE.Vector3()),
    [],
  );

  const headPos = useMemo(() => new THREE.Vector3(5.2, 0.6, 0), []);
  const targetWorld = useMemo(() => new THREE.Vector3(), []);
  const lungeWorld = useMemo(() => new THREE.Vector3(), []);
  const lookMatrix = useMemo(() => new THREE.Matrix4(), []);
  const lookQuat = useMemo(() => new THREE.Quaternion(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const zAxis = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  const v0 = useMemo(() => new THREE.Vector3(), []);
  const v1 = useMemo(() => new THREE.Vector3(), []);
  const v2 = useMemo(() => new THREE.Vector3(), []);
  const v3 = useMemo(() => new THREE.Vector3(), []);
  const v4 = useMemo(() => new THREE.Vector3(), []);

  const sample = useMemo<PathSample>(
    () => ({ x: 0.9, y: 0.5, z: 0, scale: 1, alpha: 0 }),
    [],
  );

  const alphaRef = useRef(0);
  const lungeBlend = useRef(0);
  const coilBlend = useRef(0);
  const attackSide = useRef<1 | -1>(1);
  const lastState = useRef<SnakeState>("IDLE");
  const lastProgress = useRef(scrollState.progress);
  const velocity = useRef(0);

  useEffect(() => {
    return () => {
      geometry.dispose();
      headMap.dispose();
      headBump.dispose();
      textures.dispose();
      Object.values(materials).forEach((material) => material.dispose());
    };
  }, [geometry, headMap, headBump, textures, materials]);

  useFrame((state, rawDelta) => {
    const group = groupRef.current;
    const head = headRef.current;
    const jaw = jawRef.current;
    const bodyMesh = bodyRef.current;
    if (!group || !head || !jaw || !bodyMesh) return;

    const dt = Math.min(0.05, Math.max(0.001, rawDelta));
    const now = performance.now();
    const t = state.clock.elapsedTime;

    samplePath(scrollState.waypoints, scrollState.progress, sample);

    const contactActive = scrollState.progress >= scrollState.contactProgress - 0.02;
    machine.update(now, {
      contactActive,
      tabVisible: !document.hidden,
      snakeVisible: sample.alpha > 0.3,
    });

    const attack = machine.getAttackFrame(now);

    if (attack.state !== lastState.current) {
      if (attack.state === "WINDUP") {
        attackSide.current = headPos.x >= 0 ? 1 : -1;
      }
      lastState.current = attack.state;
    }

    // Scroll velocity, smoothed and clamped. Used for slither energy
    // and a small lead/lag offset. It never becomes React state.
    const dp = scrollState.progress - lastProgress.current;
    lastProgress.current = scrollState.progress;
    const instantaneous = THREE.MathUtils.clamp(dp / dt, -1.2, 1.2);
    velocity.current += (instantaneous - velocity.current) * (1 - Math.exp(-5 * dt));

    const narrow = viewport.width < 6;
    const edgeX = narrow ? THREE.MathUtils.clamp(sample.x, 0.11, 0.89) : sample.x;

    const idleX = Math.sin(t * 0.36 + 0.8) * 0.16 + Math.sin(t * 0.13) * 0.1;
    const idleY = Math.cos(t * 0.28) * 0.1;
    const lead = THREE.MathUtils.clamp(-velocity.current * 1.2, -0.6, 0.6);

    targetWorld.set(
      (edgeX - 0.5) * viewport.width + idleX,
      (0.5 - sample.y) * viewport.height + idleY + lead,
      sample.z + Math.sin(t * 0.21) * 0.14,
    );

    // The coiled wind-up pulls the head back and slightly away before
    // the strike. The lunge blend is damped, so the transition into
    // and out of the strike never snaps to an old path position.
    const coilTarget = attack.state === "WINDUP" ? smooth(attack.phase) : 0;
    coilBlend.current += (coilTarget - coilBlend.current) * (1 - Math.exp(-9 * dt));

    if (coilBlend.current > 0.001) {
      v0.set(-attackSide.current * 0.75, -0.42, -0.7).multiplyScalar(coilBlend.current);
      targetWorld.add(v0);
    }

    const depth = 6.15;
    const depthFactor = (CAMERA_Z - depth) / CAMERA_Z;
    const lungeX = 0.5 + attackSide.current * 0.27;
    lungeWorld.set(
      (lungeX - 0.5) * viewport.width * depthFactor,
      (0.5 - 0.54) * viewport.height * depthFactor,
      depth,
    );

    lungeBlend.current += (attack.lunge - lungeBlend.current) * (1 - Math.exp(-13 * dt));
    if (lungeBlend.current > 0.001) {
      targetWorld.lerp(lungeWorld, clamp01(lungeBlend.current));
    }

    const speed = Math.min(1, Math.abs(velocity.current) * 9);
    let lambda = 1.8 + speed * 4.5;
    if (attack.state === "STRIKE") lambda = 22;
    else if (attack.state === "RETREAT") lambda = 6.5;
    else if (attack.state === "WINDUP") lambda = 4.2;

    headPos.lerp(targetWorld, 1 - Math.exp(-lambda * dt));

    // Body follows the head: each segment is pulled along when the
    // distance to its parent exceeds one segment length. This keeps
    // the chain stable at rest and produces natural drag in motion.
    spine[0]!.copy(headPos);
    for (let i = 1; i < SPINE; i += 1) {
      const parent = spine[i - 1]!;
      const point = spine[i]!;
      v0.subVectors(parent, point);
      const distance = v0.length();
      if (distance > SEGMENT) {
        v0.multiplyScalar((distance - SEGMENT) / distance);
        point.add(v0);
      }
    }

    const waveAmp = 0.075 + 0.03 * Math.sin(t * 0.27) + coilBlend.current * 0.08;
    const waveSpeed = 3.1 + speed * 1.6;

    for (let i = 0; i < SPINE; i += 1) {
      const point = spine[i]!;
      const prev = spine[Math.max(0, i - 1)]!;
      const next = spine[Math.min(SPINE - 1, i + 1)]!;
      v0.subVectors(prev, next);
      if (v0.lengthSq() < 1e-8) v0.set(1, 0, 0);
      v0.normalize();

      // Lateral slither, perpendicular to the spine in screen space.
      v1.set(-v0.y, v0.x, 0);
      if (v1.lengthSq() < 1e-8) v1.set(0, 0, 1);
      v1.normalize();

      const tail = i / (SPINE - 1);
      const taper = 0.35 + 0.65 * Math.sin(Math.min(1, tail * 1.08) * Math.PI);
      const lateral =
        Math.sin(i * 0.58 - t * waveSpeed) * waveAmp * taper +
        Math.sin(i * 0.31 + t * 1.7) * coilBlend.current * 0.11 * taper;

      display[i]!.copy(point).addScaledVector(v1, lateral);
    }

    // Write the tube rings.
    const position = geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = position.array as Float32Array;
    const radiusScale = sample.scale * (1 + lungeBlend.current * 0.12);
    const breath = 1 + Math.sin(t * 1.15) * 0.012;

    for (let i = 0; i < SPINE; i += 1) {
      const point = display[i]!;
      const prev = display[Math.max(0, i - 1)]!;
      const next = display[Math.min(SPINE - 1, i + 1)]!;
      v0.subVectors(prev, next);
      if (v0.lengthSq() < 1e-8) v0.set(1, 0, 0);
      v0.normalize();

      const reference = Math.abs(v0.y) > 0.92 ? zAxis : up;
      v1.crossVectors(v0, reference);
      if (v1.lengthSq() < 1e-8) v1.set(0, 0, 1);
      v1.normalize();
      v2.crossVectors(v0, v1).normalize();

      const radius = radiusProfile(i / (SPINE - 1)) * radiusScale * breath;

      for (let j = 0; j < RADIAL; j += 1) {
        const angle = (j / RADIAL) * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const offset = (i * RADIAL + j) * 3;

        array[offset] = point.x + (v1.x * cos + v2.x * sin) * radius;
        array[offset + 1] = point.y + (v1.y * cos + v2.y * sin) * radius;
        array[offset + 2] = point.z + (v1.z * cos + v2.z * sin) * radius;
      }
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();

    // Head transform and gaze.
    head.position.copy(display[0]!);
    head.scale.setScalar(sample.scale * (1 + lungeBlend.current * 0.12));

    v0.subVectors(display[0]!, display[2]!);
    if (v0.lengthSq() < 1e-8) v0.set(0, 0, 1);
    v0.normalize();
    v3.copy(display[0]!).add(v0);
    head.lookAt(v3);
    head.rotateY(Math.sin(t * 0.52) * 0.16);

    if (attack.stare > 0.01) {
      lookMatrix.lookAt(camera.position, display[0]!, up);
      lookQuat.setFromRotationMatrix(lookMatrix);
      head.quaternion.slerp(lookQuat, Math.min(0.92, attack.stare));
    }

    // Jaw, fangs, tongue.
    const jawOpen = Math.max(0, attack.jaw);
    jaw.rotation.x = 0.035 + jawOpen * 0.6;

    if (tongueRef.current) {
      const flickWindow = Math.max(0, Math.sin(t * 1.05) - 0.975) / 0.025;
      const flick = attack.active ? 1 : Math.min(1, flickWindow);
      tongueRef.current.scale.y = 0.2 + flick * 0.95;
      tongueRef.current.position.z = 0.23 + flick * 0.08;
    }

    // Opacity and emissive response.
    const targetAlpha = Math.max(
      sample.alpha,
      attack.active || attack.state === "STALKING" ? 0.9 : 0,
    );
    alphaRef.current += (targetAlpha - alphaRef.current) * (1 - Math.exp(-4.5 * dt));
    const alpha = clamp01(alphaRef.current);

    materials.body.opacity = alpha;
    materials.head.opacity = alpha;
    materials.mouth.opacity = alpha * 0.9;
    materials.fang.opacity = alpha;
    materials.tongue.opacity = alpha;
    materials.eye.opacity = alpha;
    materials.pupil.opacity = alpha;
    materials.eye.emissiveIntensity = 1.4 + alpha * 2.2 + attack.stare * 1.6;
    materials.tongue.emissiveIntensity = 0.35 + (attack.active ? 0.7 : 0);

    if (headLightRef.current) {
      headLightRef.current.position.copy(display[0]!);
      headLightRef.current.position.y += 0.55;
      headLightRef.current.position.z += 0.35;
      headLightRef.current.intensity =
        alpha * (1.7 + attack.stare * 2.4 + lungeBlend.current * 4.5);
    }

    group.visible = alpha > 0.012;

  });

  return (
    <group ref={groupRef} visible={false}>
      <pointLight
        ref={headLightRef}
        color={0xc7a36c}
        intensity={0}
        distance={5.5}
        decay={2}
      />
      <mesh ref={bodyRef} geometry={geometry} material={materials.body} frustumCulled={false} />

      <group ref={headRef} frustumCulled={false}>
        {/* skull */}
        <mesh material={materials.head} position={[0, 0.03, 0.05]} scale={[0.18, 0.137, 0.255]}>
          <sphereGeometry args={[1, 28, 22]} />
        </mesh>
        {/* snout */}
        <mesh material={materials.head} position={[0, 0.016, 0.235]} scale={[0.118, 0.086, 0.165]}>
          <sphereGeometry args={[1, 24, 18]} />
        </mesh>
        {/* brow ridges */}
        <mesh material={materials.head} position={[0.09, 0.085, 0.115]} scale={[0.06, 0.032, 0.12]}>
          <sphereGeometry args={[1, 14, 12]} />
        </mesh>
        <mesh material={materials.head} position={[-0.09, 0.085, 0.115]} scale={[0.06, 0.032, 0.12]}>
          <sphereGeometry args={[1, 14, 12]} />
        </mesh>

        {/* mouth interior, visible when the jaw opens */}
        <mesh material={materials.mouth} position={[0, -0.055, 0.225]} scale={[0.088, 0.035, 0.105]}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>

        {/* upper fangs */}
        <mesh material={materials.fang} position={[0.062, -0.055, 0.29]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.013, 0.085, 6]} />
        </mesh>
        <mesh material={materials.fang} position={[-0.062, -0.055, 0.29]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.013, 0.085, 6]} />
        </mesh>

        {/* lower jaw */}
        <group ref={jawRef} position={[0, -0.035, 0.02]}>
          <mesh material={materials.head} position={[0, -0.02, 0.19]} scale={[0.128, 0.052, 0.215]}>
            <sphereGeometry args={[1, 22, 16]} />
          </mesh>
          <mesh material={materials.fang} position={[0.052, 0.03, 0.335]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.009, 0.05, 5]} />
          </mesh>
          <mesh material={materials.fang} position={[-0.052, 0.03, 0.335]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.009, 0.05, 5]} />
          </mesh>
        </group>

        {/* forked-looking tongue */}
        <mesh ref={tongueRef} material={materials.tongue} position={[0, -0.035, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.005, 0.36, 5]} />
        </mesh>

        {/* eyes */}
        <mesh material={materials.eye} position={[0.1, 0.075, 0.135]} scale={[0.72, 1, 1]}>
          <sphereGeometry args={[0.029, 14, 12]} />
        </mesh>
        <mesh material={materials.eye} position={[-0.1, 0.075, 0.135]} scale={[0.72, 1, 1]}>
          <sphereGeometry args={[0.029, 14, 12]} />
        </mesh>
        <mesh material={materials.pupil} position={[0.114, 0.075, 0.152]} scale={[0.22, 1, 0.22]}>
          <sphereGeometry args={[0.021, 10, 10]} />
        </mesh>
        <mesh material={materials.pupil} position={[-0.114, 0.075, 0.152]} scale={[0.22, 1, 0.22]}>
          <sphereGeometry args={[0.021, 10, 10]} />
        </mesh>
      </group>
    </group>
  );
}
