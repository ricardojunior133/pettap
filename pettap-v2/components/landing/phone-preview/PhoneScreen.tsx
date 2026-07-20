"use client";

import { MotionValue, motion, useTransform } from "framer-motion";

import SplashScreen from "./screens/SplashScreen";
import DetectingScreen from "./screens/DetectingScreen";
import PetProfile from "./screens/PetProfile";
import SuccessScreen from "./screens/SuccessScreen";

interface PhoneScreenProps {
  progress: MotionValue<number>;
}

export default function PhoneScreen({
  progress,
}: PhoneScreenProps) {

  /* ---------------- SPLASH ---------------- */

  const splashOpacity = useTransform(
    progress,
    [0.18, 0.30],
    [1, 0]
  );

  const splashScale = useTransform(
    progress,
    [0.18, 0.30],
    [1, 1.05]
  );

  /* ---------------- DETECTING ---------------- */

  const detectingOpacity = useTransform(
    progress,
    [0.28, 0.38, 0.50],
    [0, 1, 0]
  );

  const detectingScale = useTransform(
    progress,
    [0.28, 0.38, 0.50],
    [0.96, 1, 1.02]
  );

  /* ---------------- PROFILE ---------------- */

  const profileOpacity = useTransform(
    progress,
    [0.48, 0.60, 0.84],
    [0, 1, 1]
  );

  const profileY = useTransform(
    progress,
    [0.48, 0.60],
    [30, 0]
  );

  const profileScale = useTransform(
    progress,
    [0.48, 0.60],
    [0.98, 1]
  );

  /* ---------------- SUCCESS ---------------- */

  const successOpacity = useTransform(
    progress,
    [0.86, 1],
    [0, 1]
  );

  const successScale = useTransform(
    progress,
    [0.86, 1],
    [0.96, 1]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[42px] bg-white">

      {/* Splash */}

      <motion.div
        className="absolute inset-0"
        style={{
          opacity: splashOpacity,
          scale: splashScale,
        }}
      >
        <SplashScreen />
      </motion.div>

      {/* Detecting */}

      <motion.div
        className="absolute inset-0"
        style={{
          opacity: detectingOpacity,
          scale: detectingScale,
        }}
      >
        <DetectingScreen />
      </motion.div>

      {/* Profile */}

      <motion.div
        className="absolute inset-0"
        style={{
          opacity: profileOpacity,
          y: profileY,
          scale: profileScale,
        }}
      >
        <PetProfile />
      </motion.div>

      {/* Success */}

      <motion.div
        className="absolute inset-0"
        style={{
          opacity: successOpacity,
          scale: successScale,
        }}
      >
        <SuccessScreen />
      </motion.div>

    </div>
  );
}