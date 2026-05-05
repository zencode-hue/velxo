interface MetraMartLogoProps {
  size?: number;
  className?: string;
}

export default function MetraMartLogo({ size = 32, className = "" }: MetraMartLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="mg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="mg2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#92400e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {/* Rounded background */}
      <rect x="4" y="4" width="92" height="92" rx="22" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.25)" strokeWidth="1.5" />
      {/* M letterform */}
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="62"
        fill="url(#mg1)"
        letterSpacing="-2"
      >
        M
      </text>
    </svg>
  );
}
