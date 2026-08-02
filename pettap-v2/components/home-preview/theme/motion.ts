export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const motionTokens = {
  duration: {
    fast: 0.24,
    standard: 0.5,
    reveal: 0.65,
    float: 7,
  },
  stagger: 0.08,
  hover: "transition duration-300 hover:-translate-y-0.5 motion-reduce:transition-none",
  fadeUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
} as const;
