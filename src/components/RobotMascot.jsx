export default function RobotMascot({ size = 320 }) {
  return (
    <div className="robot-wrap">
      <div className="robot-orb" />
      <svg
        className="robot-float"
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Animated robot mascot"
      >
        {/* antenna */}
        <g className="robot-antenna">
          <line x1="120" y1="38" x2="120" y2="14" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="120" cy="10" r="7" fill="var(--accent-2)" />
        </g>

        {/* head */}
        <rect x="60" y="38" width="120" height="88" rx="26" fill="var(--surface-strong)" stroke="var(--border)" strokeWidth="2" />
        <rect x="60" y="38" width="120" height="88" rx="26" fill="url(#headGrad)" opacity="0.5" />

        {/* visor */}
        <rect x="76" y="60" width="88" height="42" rx="16" fill="var(--bg)" opacity="0.6" />

        {/* eyes */}
        <g className="robot-eye">
          <circle cx="103" cy="81" r="9" fill="var(--accent)" />
          <circle cx="137" cy="81" r="9" fill="var(--accent-2)" />
        </g>

        {/* cheeks / glow */}
        <circle cx="88" cy="98" r="4" fill="var(--accent-3)" opacity="0.6" />
        <circle cx="152" cy="98" r="4" fill="var(--accent-3)" opacity="0.6" />

        {/* neck */}
        <rect x="110" y="126" width="20" height="12" fill="var(--surface-strong)" />

        {/* body */}
        <rect x="46" y="138" width="148" height="80" rx="22" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
        <circle cx="120" cy="178" r="26" fill="var(--bg)" opacity="0.5" />
        <circle cx="120" cy="178" r="18" fill="none" stroke="var(--accent)" strokeWidth="3" opacity="0.8" />
        <circle cx="120" cy="178" r="6" fill="var(--accent)" />

        {/* arms */}
        <rect x="20" y="150" width="20" height="46" rx="10" fill="var(--surface-strong)" stroke="var(--border)" strokeWidth="2" />
        <rect x="200" y="150" width="20" height="46" rx="10" fill="var(--surface-strong)" stroke="var(--border)" strokeWidth="2" />

        <defs>
          <linearGradient id="headGrad" x1="60" y1="38" x2="180" y2="126" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
