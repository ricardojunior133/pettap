"use client";

import { motion } from "framer-motion";
import {
  ChevronRight,
  LucideIcon,
} from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const styles = {
  Phone: {
    bg: "from-emerald-500 to-green-600",
    glow: "bg-emerald-400/25",
  },
  MessageCircle: {
    bg: "from-sky-500 to-blue-600",
    glow: "bg-sky-400/25",
  },
  Navigation: {
    bg: "from-orange-400 to-amber-500",
    glow: "bg-orange-300/25",
  },
  HeartPulse: {
    bg: "from-rose-500 to-red-500",
    glow: "bg-rose-400/25",
  },
} as const;

export default function ActionButton({
  icon: Icon,
  title,
  subtitle,
}: Props) {
  const variant =
    styles[Icon.name as keyof typeof styles] ??
    styles.MessageCircle;

  return (
    <motion.button
      whileHover={{
        y: -3,
        scale: 1.015,
      }}
      whileTap={{
        scale: 0.985,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className="
        group
        relative
        flex
        w-full
        items-center
        gap-4
        overflow-hidden
        rounded-[26px]
        border
        border-neutral-200
        bg-white
        px-5
        py-4
        text-left
        shadow-[0_8px_25px_rgba(0,0,0,.06)]
        transition-all
        hover:border-sky-200
        hover:shadow-[0_20px_40px_rgba(0,0,0,.10)]
      "
    >
      {/* Background Highlight */}

      <div
        className="
          absolute
          inset-0
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
          bg-gradient-to-r
          from-sky-50
          via-transparent
          to-transparent
        "
      />

      {/* Icon */}

      <div className="relative">

        <motion.div
          className={`
            absolute
            inset-0
            rounded-2xl
            blur-xl
            ${variant.glow}
          `}
          animate={{
            opacity: [0.25, 0.5, 0.25],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          whileHover={{
            rotate: -6,
            scale: 1.06,
          }}
          className={`
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            ${variant.bg}
            shadow-lg
          `}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>

      </div>

      {/* Text */}

      <div className="relative flex-1">

        <h3 className="text-[16px] font-semibold tracking-tight text-neutral-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-neutral-500">
          {subtitle}
        </p>

      </div>

      {/* Arrow */}

      <motion.div
        whileHover={{
          x: 3,
        }}
        className="relative"
      >
        <ChevronRight
          className="
            h-5
            w-5
            text-neutral-400
            transition-colors
            duration-300
            group-hover:text-sky-500
          "
        />
      </motion.div>

    </motion.button>
  );
}
