import { useEffect, useRef } from "react";

/* ------------------------------------------------------------
   CursorOrb: a restrained orbital instrument that trails the
   pointer. Desktop precision pointers only, never under reduced
   motion. The dot tracks exactly; the ring eases behind it with a
   single rAF loop that stops when it has caught up. No state.
   ------------------------------------------------------------ */
export function CursorOrb() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!root || !ring || !dot) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    let tx = -100;
    let ty = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let visible = false;

    const render = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf =
        Math.abs(tx - rx) > 0.1 || Math.abs(ty - ry) > 0.1
          ? requestAnimationFrame(render)
          : 0;
    };

    const onMove = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;

      if (!visible) {
        visible = true;
        rx = tx;
        ry = ty;
        root.classList.add("is-visible");
      }

      const target = event.target as Element | null;
      root.classList.toggle(
        "is-interactive",
        Boolean(target?.closest?.("a, button")),
      );

      if (!raf) raf = requestAnimationFrame(render);
    };

    const onLeave = () => {
      visible = false;
      root.classList.remove("is-visible", "is-interactive");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="cursor-orb" ref={rootRef} aria-hidden="true">
      <span className="cursor-orb-ring" ref={ringRef}>
        <span className="cursor-orb-sat" />
      </span>
      <span className="cursor-orb-dot" ref={dotRef} />
    </div>
  );
}
