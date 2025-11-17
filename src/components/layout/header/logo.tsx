import Link from "next/link";

type LogoSize = "sm" | "md" | "lg";

interface HeaderLogoProps {
  size?: LogoSize;
  className?: string;
}

const SIZE_CLASSES = {
  sm: {
    container: "h-10 w-10 rounded-sm",
    icon: "h-6 w-6",
    text: "text-xl font-bold uppercase text-text-50",
    gap: "gap-2",
  },
  md: {
    container: "h-10 w-10 rounded-sm",
    icon: "h-6 w-6",
    text: "text-xl font-bold uppercase text-text-50",
    gap: "gap-2",
  },
  lg: {
    container: "h-10 w-10 rounded-sm",
    icon: "h-6 w-6",
    text: "text-xl font-bold uppercase lg:text-2xl text-text-50 lg:text-text-50",
    gap: "gap-3",
  },
} as const;

export const HeaderLogo = ({
  size = "lg",
  className = "",
}: HeaderLogoProps) => {
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <Link
      href="/"
      className={`flex items-center ${sizeClasses.gap} ${className}`}
    >
      <div
        className={`flex flex-shrink-0 items-center justify-center ${sizeClasses.container} bg-button-primary`}
      >
        <svg
          className={`${sizeClasses.icon} text-text-50`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.3 1.046A1 1 0 0010 2v5H4a1 1 0 00-.82 1.573l7 10A1 1 0 0011 18v-5h6a1 1 0 00.82-1.573l-7-10a1 1 0 00-.68-.381z"
          />
        </svg>
      </div>
      <span className={`font-brand ${sizeClasses.text} text-text-50`}>
        Juara
      </span>
    </Link>
  );
};
