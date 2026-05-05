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
        <linearGradient id="mg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <polygon points="18,22 82,22 50,78" fill="url(#mg2)" opacity="0.5" transform="translate(6,4)" />
      <polygon points="18,22 82,22 50,78" fill="url(#mg1)" />
      <polygon points="30,30 70,30 50,65" fill="#0a0b0f" opacity="0.85" />
    </svg>
  );
}
