/* ------------------------------------------------------------
   Procedural scale material for the placeholder creature.

   This is deliberately generated at runtime: the repository has no
   licensed, rigged, photorealistic snake GLB. The texture gives the
   tube body believable scale breakup and a bump response so the
   placeholder reads as a living surface rather than flat primitives.
   Replace it with the real asset's material when one is supplied.
   ------------------------------------------------------------ */

import * as THREE from "three";

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return [canvas, ctx];
}

function scalePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y);
  ctx.bezierCurveTo(x + w * 1.04, y + h * 0.28, x + w * 0.86, y + h * 0.88, x + w * 0.5, y + h);
  ctx.bezierCurveTo(x + w * 0.14, y + h * 0.88, x - w * 0.04, y + h * 0.28, x + w * 0.5, y);
  ctx.closePath();
}

export type SnakeTextures = {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  dispose: () => void;
};

export function createSnakeTextures(): SnakeTextures {
  const size = 512;
  const [colorCanvas, color] = makeCanvas(size);
  const [bumpCanvas, bump] = makeCanvas(size);
  const rng = mulberry32(0x5eed);

  color.fillStyle = "#1a2016";
  color.fillRect(0, 0, size, size);

  bump.fillStyle = "#3b3b3b";
  bump.fillRect(0, 0, size, size);

  // Broad olive/brown mottling under the scales.
  for (let i = 0; i < 90; i += 1) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 18 + rng() * 70;
    const gradient = color.createRadialGradient(x, y, 0, x, y, r);
    const hue = rng();
    if (hue < 0.45) {
      gradient.addColorStop(0, "rgba(92, 108, 62, 0.16)");
      gradient.addColorStop(1, "rgba(92, 108, 62, 0)");
    } else if (hue < 0.78) {
      gradient.addColorStop(0, "rgba(54, 47, 31, 0.2)");
      gradient.addColorStop(1, "rgba(54, 47, 31, 0)");
    } else {
      gradient.addColorStop(0, "rgba(118, 74, 48, 0.12)");
      gradient.addColorStop(1, "rgba(118, 74, 48, 0)");
    }
    color.fillStyle = gradient;
    color.beginPath();
    color.arc(x, y, r, 0, Math.PI * 2);
    color.fill();
  }

  const scaleW = 34;
  const scaleH = 22;
  const rows = Math.ceil(size / (scaleH * 0.62)) + 2;
  const cols = Math.ceil(size / scaleW) + 2;

  for (let row = -1; row < rows; row += 1) {
    const y = row * scaleH * 0.62 - scaleH * 0.2;
    const offset = row % 2 === 0 ? 0 : scaleW * 0.5;

    for (let col = -1; col < cols; col += 1) {
      const x = col * scaleW + offset - scaleW * 0.5;
      const lightness = 0.9 + rng() * 0.2;

      color.save();
      scalePath(color, x, y, scaleW, scaleH);
      const gradient = color.createLinearGradient(x, y, x + scaleW, y + scaleH);
      const shade = Math.round(33 * lightness);
      gradient.addColorStop(0, `rgba(${shade + 12}, ${shade + 20}, ${shade + 5}, 0.96)`);
      gradient.addColorStop(0.5, `rgba(${shade + 24}, ${shade + 34}, ${shade + 11}, 0.96)`);
      gradient.addColorStop(1, `rgba(${Math.round(shade * 0.52)}, ${Math.round(shade * 0.64)}, ${Math.round(shade * 0.33)}, 0.98)`);
      color.fillStyle = gradient;
      color.fill();
      color.lineWidth = 1;
      color.strokeStyle = `rgba(184, 198, 144, ${0.16 + rng() * 0.12})`;
      color.stroke();

      color.beginPath();
      color.moveTo(x + scaleW * 0.5, y + scaleH * 0.2);
      color.quadraticCurveTo(
        x + scaleW * 0.58,
        y + scaleH * 0.55,
        x + scaleW * 0.5,
        y + scaleH * 0.82,
      );
      color.strokeStyle = "rgba(216, 226, 184, 0.14)";
      color.stroke();
      color.restore();

      bump.save();
      scalePath(bump, x, y, scaleW, scaleH);
      const bumpGradient = bump.createLinearGradient(x, y, x, y + scaleH);
      bumpGradient.addColorStop(0, "#6d6d6d");
      bumpGradient.addColorStop(0.7, "#5a5a5a");
      bumpGradient.addColorStop(1, "#3e3e3e");
      bump.fillStyle = bumpGradient;
      bump.fill();
      bump.lineWidth = 1.4;
      bump.strokeStyle = "#cfcfcf";
      bump.stroke();
      bump.restore();
    }
  }

  // Fine pores / dust.
  for (let i = 0; i < 4200; i += 1) {
    const x = rng() * size;
    const y = rng() * size;
    const r = rng() < 0.85 ? 0.5 : 1.2;
    color.fillStyle = `rgba(210, 214, 176, ${rng() * 0.075})`;
    color.beginPath();
    color.arc(x, y, r, 0, Math.PI * 2);
    color.fill();
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2.4, 13);
  map.anisotropy = 4;
  map.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2.4, 13);
  bumpMap.anisotropy = 4;
  bumpMap.needsUpdate = true;

  return {
    map,
    bumpMap,
    dispose: () => {
      map.dispose();
      bumpMap.dispose();
      colorCanvas.width = 1;
      colorCanvas.height = 1;
      bumpCanvas.width = 1;
      bumpCanvas.height = 1;
    },
  };
}
