import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn(sizes[size], className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" />
      
      {/* Currency symbol with modern design */}
      <path
        d="M32 18 L32 46 M24 24 L40 24 M24 40 L40 40"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Chart line indicating growth */}
      <path
        d="M20 38 L26 32 L32 28 L38 24 L44 20"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      
      {/* Data points */}
      <circle cx="26" cy="32" r="2" fill="white" />
      <circle cx="32" cy="28" r="2" fill="white" />
      <circle cx="38" cy="24" r="2" fill="white" />
      <circle cx="44" cy="20" r="2" fill="white" />
    </svg>
  );
}
