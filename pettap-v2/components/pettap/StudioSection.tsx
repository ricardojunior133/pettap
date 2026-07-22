import { ReactNode } from "react";
import Card from "@/components/ui/Card";

interface StudioSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function StudioSection({
  title,
  description,
  children,
}: StudioSectionProps) {
  return (
    <Card className="scroll-mt-28 border-black/[0.06] p-6 shadow-[0_12px_40px_rgba(17,17,17,0.025)] transition-shadow duration-300 hover:shadow-[0_16px_50px_rgba(17,17,17,0.045)] sm:p-8">
      <div className="mb-6 border-b border-black/[0.06] pb-5">
        <h3 className="text-lg font-semibold tracking-[-0.025em] text-neutral-950 sm:text-xl">
          {title}
        </h3>

        {description && (
          <p className="mt-1.5 text-sm leading-6 text-neutral-500">
            {description}
          </p>
        )}
      </div>
      {children}
    </Card>
  );
}
