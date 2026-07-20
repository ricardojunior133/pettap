"use client";

import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Navigation,
  HeartPulse,
} from "lucide-react";

import ActionButton from "./ActionButton";

const actions = [
  {
    icon: Phone,
    title: "Call Owner",
    subtitle: "Available now",
  },
  {
    icon: MessageCircle,
    title: "Send WhatsApp",
    subtitle: "Fastest way to reach",
  },
  {
    icon: Navigation,
    title: "Navigate Home",
    subtitle: "Open in Maps",
  },
  {
    icon: HeartPulse,
    title: "Medical Information",
    subtitle: "Allergies & emergency notes",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
};

export default function ContactActions() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {actions.map((action) => (
        <motion.div
          key={action.title}
          variants={item}
        >
          <ActionButton
            icon={action.icon}
            title={action.title}
            subtitle={action.subtitle}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}