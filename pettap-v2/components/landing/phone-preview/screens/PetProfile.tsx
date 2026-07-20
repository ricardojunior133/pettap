"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import ProfileHeader from "./components/ProfileHeader";
import ContactActions from "./components/ContactActions";
import EmergencyCard from "./components/EmergencyCard";

export default function PetProfile() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[42px] bg-[#F5F5F7]">

      {/* HERO */}

      <motion.div
        className="relative h-[285px] flex-none overflow-hidden"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 1.2,
          ease: "easeOut",
        }}
      >
        <Image
          src="/images/pets/charlie.jpg"
          alt="Charlie"
          fill
          priority
          sizes="350px"
          className="object-cover object-center"
        />

        {/* Gradient */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badge */}

        <motion.div
          className="absolute right-5 top-5 rounded-full bg-emerald-500/95 px-4 py-2 shadow-xl backdrop-blur-md"
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.45,
          }}
        >
          <span className="text-[11px] font-semibold tracking-[0.18em] text-white">
            SAFE TO SCAN
          </span>
        </motion.div>

        {/* Header */}

        <motion.div
          className="absolute bottom-6 left-6 right-6"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
        >
          <ProfileHeader />
        </motion.div>
      </motion.div>

      {/* CONTENT */}

      <motion.div
        className="
          -mt-6
          flex-1
          rounded-t-[34px]
          bg-white
          px-6
          pt-6
          pb-8
          shadow-[0_-20px_40px_rgba(0,0,0,.08)]
        "
        initial={{
          y: 30,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          delay: 0.35,
          duration: 0.7,
        }}
      >
        <EmergencyCard />

        <div className="mt-5">
          <ContactActions />
        </div>
      </motion.div>

    </div>
  );
}