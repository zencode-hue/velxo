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
        <linearGradient id="vg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="vg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <polygon points="18,22 82,22 50,78" fill="url(#vg2)" opacity="0.5" transform="translate(6,4)" />
      <polygon points="18,22 82,22 50,78" fill="url(#vg1)" />
      <polygon points="30,30 70,30 50,65" fill="#0a0b0f" opacity="0.85" />
    </svg>
  );
}
