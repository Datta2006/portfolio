/* The portfolio remains fully usable without WebGL. This static,
   non-interactive silhouette keeps a trace of the art direction
   without pretending the creature is live. */
export function WebGLFallback() {
  return (
    <div className="webgl-fallback" aria-hidden="true">
      <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fallback-snake" x1="90" y1="470" x2="760" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8d332d" stopOpacity="0" />
            <stop offset="0.35" stopColor="#5d6b3c" stopOpacity="0.55" />
            <stop offset="0.78" stopColor="#9fbe63" stopOpacity="0.32" />
            <stop offset="1" stopColor="#c7a36c" stopOpacity="0" />
          </linearGradient>
          <filter id="fallback-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <path
          d="M760 430C646 470 604 342 498 350C396 358 430 236 330 232C232 228 246 122 150 132C92 138 70 96 44 62"
          stroke="url(#fallback-snake)"
          strokeWidth="36"
          strokeLinecap="round"
          filter="url(#fallback-blur)"
          opacity="0.55"
        />
        <path
          d="M760 430C646 470 604 342 498 350C396 358 430 236 330 232C232 228 246 122 150 132C92 138 70 96 44 62"
          stroke="url(#fallback-snake)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="45" cy="62" r="4" fill="#c7a36c" opacity="0.6" />
      </svg>
    </div>
  );
}
