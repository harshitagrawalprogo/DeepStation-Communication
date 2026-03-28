import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showText?: boolean;
  href?: string;
  className?: string;
  textClassName?: string;
}

// SVG Logo Component
export const LogoIcon = ({
  size = 30,
  className,
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient
          id="deepstation-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style={{ stopColor: "#0f766e", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#d97706", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <g fill="url(#deepstation-gradient)">
        <rect
          x="15"
          y="15"
          width="55"
          height="55"
          rx="18"
          ry="18"
          opacity="0.85"
        />
        <rect
          x="35"
          y="35"
          width="55"
          height="55"
          rx="18"
          ry="18"
          opacity="0.85"
        />
        <path d="M50 28l18 10.5v21L50 70 32 59.5v-21L50 28z" opacity="0.92" />
        <circle cx="50" cy="49" r="8.5" fill="white" opacity="0.95" />
      </g>
    </svg>
  );
};

export const Logo = ({
  size = 30,
  showText = true,
  href = "/",
  className,
  textClassName,
}: LogoProps) => {
  const content = (
    <div
      className={cn(
        "hover:opacity-75 transition items-center gap-x-2 flex",
        className
      )}
    >
      <LogoIcon size={size} />
      {showText && (
        <p
          className={cn(
            "text-lg text-neomorphic-text font-semibold pb-1",
            textClassName
          )}
        >
          DeepStation RIT
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
