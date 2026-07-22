import type { EngravingFont, EngravingIcon } from "@/src/lib/domain/tag";

export function getEngravingFont(font: EngravingFont) {
  return {
    classic: "Georgia, serif",
    rounded: "Arial Rounded MT Bold, Arial, sans-serif",
    modern: "Inter, Arial, sans-serif",
    editorial: "Georgia, Times New Roman, serif",
    monogram: "Times New Roman, Georgia, serif",
  }[font];
}

export function getEngravingFontSize(diameter: number, name: string) {
  if (name.length > 10) return diameter * 0.068;
  if (name.length > 7) return diameter * 0.082;
  return diameter * 0.1;
}

interface EngravingIconProps {
  icon: EngravingIcon;
  diameter: number;
  y: number;
  colour: string;
}

export function EngravingIconMark({ icon, diameter, y, colour }: EngravingIconProps) {
  if (icon === "none") return null;

  const size = diameter * 0.055;
  const x = diameter / 2;

  if (icon === "heart") return <path d={`M ${x} ${y + size} C ${x - size * 2} ${y - size}, ${x - size * 2.2} ${y + size * 1.6}, ${x} ${y + size * 3.2} C ${x + size * 2.2} ${y + size * 1.6}, ${x + size * 2} ${y - size}, ${x} ${y + size} Z`} fill={colour} opacity="0.55" />;
  if (icon === "star") return <path d={`M ${x} ${y} L ${x + size * 0.7} ${y + size * 1.5} L ${x + size * 2.3} ${y + size * 1.7} L ${x + size * 1.1} ${y + size * 2.8} L ${x + size * 1.4} ${y + size * 4.4} L ${x} ${y + size * 3.5} L ${x - size * 1.4} ${y + size * 4.4} L ${x - size * 1.1} ${y + size * 2.8} L ${x - size * 2.3} ${y + size * 1.7} L ${x - size * 0.7} ${y + size * 1.5} Z`} fill={colour} opacity="0.55" />;
  if (icon === "bone") return <path d={`M ${x - size * 2.2} ${y + size} C ${x - size * 3.1} ${y}, ${x - size * 4} ${y + size * 1.2}, ${x - size * 3} ${y + size * 2.1} L ${x + size * 3} ${y + size * 2.1} C ${x + size * 4} ${y + size * 1.2}, ${x + size * 3.1} ${y}, ${x + size * 2.2} ${y + size} C ${x + size * 1.7} ${y + size * 1.5}, ${x + size * 1.7} ${y + size * 2.1}, ${x + size * 2.2} ${y + size * 2.7} C ${x + size * 3.1} ${y + size * 3.6}, ${x + size * 4} ${y + size * 2.4}, ${x + size * 3} ${y + size * 1.5} L ${x - size * 3} ${y + size * 1.5} C ${x - size * 4} ${y + size * 2.4}, ${x - size * 3.1} ${y + size * 3.6}, ${x - size * 2.2} ${y + size * 2.7} C ${x - size * 1.7} ${y + size * 2.1}, ${x - size * 1.7} ${y + size * 1.5}, ${x - size * 2.2} ${y + size} Z`} fill={colour} opacity="0.55" />;
  if (icon === "fish") return <path d={`M ${x - size * 2.2} ${y + size * 1.8} C ${x - size} ${y + size * 0.4}, ${x + size} ${y + size * 0.4}, ${x + size * 2} ${y + size * 1.8} C ${x + size} ${y + size * 3.2}, ${x - size} ${y + size * 3.2}, ${x - size * 2.2} ${y + size * 1.8} L ${x - size * 3.8} ${y + size * 0.5} L ${x - size * 3.8} ${y + size * 3.1} Z`} fill={colour} opacity="0.55" />;
  if (icon === "leaf") return <path d={`M ${x} ${y + size * 4} C ${x - size * 3} ${y + size * 2.8}, ${x - size * 2.5} ${y - size}, ${x + size * 2.8} ${y} C ${x + size * 2} ${y + size * 3.3}, ${x} ${y + size * 4}, ${x} ${y + size * 4} Z M ${x - size * 1.4} ${y + size * 2.4} L ${x + size * 1.5} ${y + size * .8}`} fill={colour} opacity="0.55" />;
  if (icon === "moon") return <path d={`M ${x + size} ${y} A ${size * 2.3} ${size * 2.3} 0 1 0 ${x + size} ${y + size * 4.6} A ${size * 1.7} ${size * 1.7} 0 1 1 ${x + size} ${y} Z`} fill={colour} opacity="0.55" />;
  if (icon === "crown") return <path d={`M ${x - size * 2.7} ${y + size} L ${x - size} ${y + size * 2.5} L ${x} ${y} L ${x + size} ${y + size * 2.5} L ${x + size * 2.7} ${y + size} L ${x + size * 2.2} ${y + size * 3.6} H ${x - size * 2.2} Z`} fill={colour} opacity="0.55" />;
  if (icon === "diamond") return <path d={`M ${x} ${y} L ${x + size * 2.4} ${y + size * 2} L ${x} ${y + size * 4} L ${x - size * 2.4} ${y + size * 2} Z`} fill={colour} opacity="0.55" />;
  if (icon === "cat") return <path d={`M ${x - size * 2} ${y + size} L ${x - size * 2} ${y + size * 4} Q ${x} ${y + size * 5.4} ${x + size * 2} ${y + size * 4} L ${x + size * 2} ${y + size} L ${x + size * .8} ${y + size * 1.5} L ${x} ${y} L ${x - size * .8} ${y + size * 1.5} Z`} fill={colour} opacity="0.55" />;
  if (icon === "flower") return <g fill={colour} opacity="0.55"><circle cx={x} cy={y + size * .9} r={size * .9}/><circle cx={x + size * 1.4} cy={y + size * 2.2} r={size * .9}/><circle cx={x + size * .8} cy={y + size * 3.8} r={size * .9}/><circle cx={x - size * .8} cy={y + size * 3.8} r={size * .9}/><circle cx={x - size * 1.4} cy={y + size * 2.2} r={size * .9}/><circle cx={x} cy={y + size * 2.3} r={size * .75} fill="#fff" opacity=".45"/></g>;

  return <g fill={colour} opacity="0.55"><circle cx={x} cy={y + size * 2.3} r={size * 1.1} /><circle cx={x - size * 1.25} cy={y + size * 0.8} r={size * 0.75} /><circle cx={x + size * 1.25} cy={y + size * 0.8} r={size * 0.75} /><circle cx={x - size * 1.8} cy={y + size * 2.1} r={size * 0.65} /><circle cx={x + size * 1.8} cy={y + size * 2.1} r={size * 0.65} /></g>;
}
