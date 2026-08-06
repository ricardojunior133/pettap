"use client";

import { Radio } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { ProductAccentColour, ProductName, ProductPrimaryColour, ProductShape, ProductSide, ProductSize } from "./productShowcaseOptions";
import { productAccentColours, productPrimaryColours } from "./productShowcaseOptions";

interface ProductPreviewProps {
  name: ProductName;
  shape: ProductShape;
  primaryColour: ProductPrimaryColour;
  accentColour: ProductAccentColour;
  size: ProductSize;
  side: ProductSide;
}

const shapeClasses: Record<ProductShape, string> = {
  Round: "rounded-full",
  Bone: "rounded-[44%_44%_38%_38%/30%_30%_45%_45%]",
  Heart: "[clip-path:polygon(50%_91%,12%_58%,3%_36%,8%_18%,25%_11%,39%_16%,50%_30%,61%_16%,75%_11%,92%_18%,97%_36%,88%_58%)]",
  Paw: "rounded-[46%_46%_42%_42%/36%_36%_50%_50%]",
  Shield: "[clip-path:polygon(50%_96%,12%_72%,12%_19%,50%_5%,88%_19%,88%_72%)]",
  Star: "[clip-path:polygon(50%_4%,61%_34%,94%_35%,67%_55%,77%_89%,50%_70%,23%_89%,33%_55%,6%_35%,39%_34%)]",
};

const sizeClasses: Record<ProductSize, string> = { Petite: "scale-[0.77]", Classic: "scale-100", Explorer: "scale-[1.14]" };

export default function ProductPreview({ name, shape, primaryColour, accentColour, size, side }: ProductPreviewProps) {
  const reducedMotion = useReducedMotion();
  const selectedPrimaryColour = productPrimaryColours.find((option) => option.id === primaryColour) ?? productPrimaryColours[0];
  const selectedAccentColour = productAccentColours.find((option) => option.id === accentColour) ?? productAccentColours[0];
  const key = `${name}-${shape}-${primaryColour}-${accentColour}-${size}-${side}`;

  return <div className="relative mx-auto flex aspect-square w-full max-w-[34rem] items-center justify-center overflow-hidden rounded-[2.25rem] border border-white/90 bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#f3f2ef_68%)] shadow-[0_30px_80px_rgba(17,17,17,0.09)] sm:rounded-[3rem]">
    <div aria-hidden="true" className="absolute inset-[16%] rounded-full bg-slate-300/30 blur-3xl" />
    <div aria-hidden="true" className="absolute bottom-[16%] h-10 w-[44%] rounded-full bg-black/20 blur-2xl" />
    <div className="relative size-[67%] [perspective:1000px]" role="img" aria-label={`PetTap ${shape} tag with ${selectedPrimaryColour.label} primary colour and ${selectedAccentColour.label} accents, ${size} size, showing the ${side} with ${side === "front" ? name : "NFC tap guidance"}.`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={key} initial={reducedMotion ? false : { opacity: 0, rotateY: side === "back" ? -22 : 22, filter: "blur(3px)" }} animate={{ opacity: 1, rotateY: 0, filter: "blur(0px)" }} exit={reducedMotion ? undefined : { opacity: 0, rotateY: side === "back" ? 18 : -18, filter: "blur(2px)" }} transition={{ duration: reducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }} className={`absolute inset-0 ${sizeClasses[size]} transition-transform duration-300 motion-reduce:transition-none`}>
          <div className={`relative flex size-full flex-col items-center justify-center border border-white/35 shadow-[inset_0_2px_3px_rgba(255,255,255,0.34),inset_0_-7px_12px_rgba(0,0,0,0.12),0_18px_25px_rgba(17,17,17,0.26)] ${shapeClasses[shape]}`} style={{ backgroundColor: selectedPrimaryColour.value }}>
            <span aria-hidden="true" className="absolute left-1/2 top-[6%] size-[13%] -translate-x-1/2 rounded-full border-[5px] border-black/20 bg-[#f1f0ec] shadow-inner" />
            <span aria-hidden="true" className="absolute inset-x-[9%] top-[8%] h-[23%] rounded-full bg-white/10 blur-xl" />
            {side === "front" ? <FrontFace name={name} accentColour={selectedAccentColour.value} /> : <BackFace accentColour={selectedAccentColour.value} />}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>;
}

function FrontFace({ name, accentColour }: { name: ProductName; accentColour: string }) {
  return <div className="relative z-10 flex flex-col items-center text-center" style={{ color: accentColour }}><span className="text-[10px] font-semibold tracking-[0.16em] opacity-75">PETTAP</span><span className="mt-3 max-w-[11rem] text-balance text-[clamp(1.55rem,5vw,2.8rem)] font-semibold tracking-[-0.06em] drop-shadow-sm">{name}</span><span className="mt-4 flex size-8 items-center justify-center rounded-full border border-current/35 bg-white/10 text-xs">✦</span></div>;
}

function BackFace({ accentColour }: { accentColour: string }) {
  return <div className="relative z-10 flex flex-col items-center text-center" style={{ color: accentColour }}><Radio className="size-10 opacity-90" aria-hidden="true" /><span className="mt-4 text-[10px] font-semibold tracking-[0.14em] opacity-90">NFC</span><span className="mt-1 text-[9px] font-medium tracking-[0.12em] opacity-80">TAP TO SCAN</span><span className="mt-1 text-[8px] tracking-[0.12em] opacity-65">PETTAP.CO.UK</span></div>;
}
