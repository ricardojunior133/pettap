import { Button } from "@/components/ui/button";

type StyleCardProps = {
  title: string;
  description: string;
};

export default function StyleCard({
  title,
  description,
}: StyleCardProps) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
      <div className="mb-6 flex aspect-square items-center justify-center rounded-2xl bg-muted">
        <span className="text-sm text-muted-foreground">
          Product Image
        </span>
      </div>

      <h3 className="font-heading text-2xl font-bold text-foreground">
        {title}
      </h3>

      <p className="mt-3 text-muted-foreground leading-relaxed">
        {description}
      </p>

      <Button
        className="mt-8 w-full rounded-2xl"
        size="lg"
      >
        Customize
      </Button>
    </div>
  );
}