import { ReactNode } from "react";

const VARIANTS: Record<string, string> = {
  primary: "bg-forest text-white hover:bg-forest-dark",
  secondary: "bg-white border border-cream-dark text-zinc-700 hover:bg-cream",
  ghost: "text-zinc-500 hover:text-zinc-900",
  amber: "bg-amber text-white hover:bg-amber-light",
};

export function Btn({
  children,
  icon,
  variant = "primary",
  small,
  href,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "amber";
  small?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const classes = `inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors ${
    small ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm"
  } ${VARIANTS[variant]}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {icon}
      {children}
    </button>
  );
}
