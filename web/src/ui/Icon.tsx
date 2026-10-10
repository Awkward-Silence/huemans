import type { ReactNode } from "react";

/** Inline stroke icons. They draw in `currentColor`, so they follow the text colour. */
const PATHS = {
  arrowRight: (
    <>
      <path d="M5 12h13" />
      <path d="M12 5l7 7-7 7" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  clock: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2" />
    </>
  ),
  quote: (
    <>
      <path d="M7 11h3V7a4 4 0 0 0-4 4v6" />
      <path d="M16 11h3V7a4 4 0 0 0-4 4v6" />
    </>
  ),
  rotatePhone: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M7 3.5a6 6 0 0 1 10 0" />
    </>
  ),
} satisfies Record<string, ReactNode>;

type IconName = keyof typeof PATHS;

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

function Icon({ name, size = 20, strokeWidth = 2.2, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

export { Icon };
export type { IconName };
