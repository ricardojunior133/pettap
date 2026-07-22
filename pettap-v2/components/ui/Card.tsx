import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-neutral-200
        bg-white
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}