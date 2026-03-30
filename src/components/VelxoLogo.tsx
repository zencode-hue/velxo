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
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#5865f2" />
        </linearGradient>
        <linearGradient id="vg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5865f2" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* Back layer — purple, offset right */}
      <polygon
        points="18,22 82,22 50,78"
        fill="url(#vg2)"
        opacity="0.6"
        transform="translate(6, 4)"
      />
      {/* Front layer — blue gradient */}
      <polygon
        points="18,22 82,22 50,78"
        fill="url(#vg1)"
      />
      {/* Inner cutout to create the layered V effect */}
      <polygon
        points="30,30 70,30 50,65"
        fill="#0e0f14"
        opacity="0.85"
      />
    </svg>
  );
}
