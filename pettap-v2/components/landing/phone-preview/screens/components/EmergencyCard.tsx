"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  HeartPulse,
  PhoneCall,
  Shield,
  ChevronRight,
} from "lucide-react";

const items = [
  {
    icon: BadgeCheck,
    title: "Microchip Verified",
    subtitle: "Identity successfully confirmed",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    icon: HeartPulse,
    title: "No Known Allergies",
    subtitle: "No medical alerts provided",
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
  {
    icon: PhoneCall,
    title: "Emergency Contact",
    subtitle: "Owner information available",
    color: "text-sky-600",
    bg: "bg-sky-100",
  },
];

export default function EmergencyCard() {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.2,
        duration: 0.55,
      }}
      className="
        overflow-hidden
        rounded-[30px]
        border
        border-neutral-200
        bg-white
        shadow-[0_15px_35px_rgba(0,0,0,.06)]
      "
    >
      {/* Header */}

      <div className="border-b border-neutral-100 px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100">
            <Shield className="h-5 w-5 text-sky-600" />
          </div>

          <div>
            <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
              Emergency Information
            </h3>

            <p className="mt-1 text-sm text-neutral-500">
              Shared instantly after scanning.
            </p>
          </div>

        </div>

      </div>

      {/* Items */}

      <div className="divide-y divide-neutral-100">

        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{
                opacity: 0,
                x: -12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.3 + index * 0.08,
              }}
              className="
                flex
                items-center
                justify-between
                px-6
                py-4
              "
            >
              <div className="flex items-center gap-4">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg}`}
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>

                <div>

                  <p className="font-semibold text-neutral-900">
                    {item.title}
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">
                    {item.subtitle}
                  </p>

                </div>

              </div>

              <ChevronRight className="h-5 w-5 text-neutral-300" />

            </motion.div>
          );
        })}

      </div>

      {/* Footer */}

      <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-4">

        <div className="flex items-center justify-between">

          <span className="text-sm text-neutral-500">
            Protected by PetTap
          </span>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Verified
          </span>

        </div>

      </div>

    </motion.section>
  );
}