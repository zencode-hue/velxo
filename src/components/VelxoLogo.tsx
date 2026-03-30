interface VelxoLogoProps {
  size?: number;
  className?: string;
}

export default function VelxoLogo({ size = 32, className = "" }: VelxoLogoProps) {
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
        <linearGradient id="vg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="vg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#9a3412" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* Back shadow layer */}
      <polygon points="18,22 82,22 50,78" fill="url(#vg2)" opacity="0.5" transform="translate(6,4)" />
      {/* Front layer */}
      <polygon points="18,22 82,22 50,78" fill="url(#vg1)" />
      {/* Inner cutout */}
      <polygon points="30,30 70,30 50,65" fill="#0d0a07" opacity="0.85" />
    </svg>
  );
}
