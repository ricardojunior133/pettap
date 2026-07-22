import { ReactNode } from "react";
import clsx from "clsx";

interface StudioSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function StudioSection({
  title,
  description,
  children,
  className,
}: StudioSectionProps) {
  return (
    <section
      className={clsx(
        "rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-neutral-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}