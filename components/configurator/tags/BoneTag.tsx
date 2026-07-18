"use client";

import { colors } from "../../../lib/data/colors";

interface BoneTagProps {
  petName: string;
  color: string;
}

export default function BoneTag({
  petName,
  color,
}: BoneTagProps) {
  const selectedColor =
    colors.find((c) => c.id === color)?.hex ?? "#FFFFFF";

  return (
    <div className="flex justify-center items-center p-8">
      <svg
        width="320"
        height="220"
        viewBox="0 0 320 220"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow */}
        <ellipse
          cx="160"
          cy="190"
          rx="95"
          ry="18"
          fill="#00000020"
        />

        {/* Bone */}
        <path
          d="
            M55 85
            C35 60 35 30 60 30
            C75 30 85 40 92 52
            C100 45 112 40 125 40
            L195 40
            C208 40 220 45 228 52
            C235 40 245 30 260 30
            C285 30 285 60 265 85
            C285 110 285 140 260 140
            C245 140 235 130 228 118
            C220 125 208 130 195 130
            L125 130
            C112 130 100 125 92 118
            C85 130 75 140 60 140
            C35 140 35 110 55 85
            Z
          "
          fill={selectedColor}
          stroke="#D1D5DB"
          strokeWidth="3"
        />

        {/* Hole */}
        <circle
          cx="90"
          cy="85"
          r="9"
          fill="#F3F4F6"
          stroke="#D1D5DB"
          strokeWidth="2"
        />

        {/* Pet Name */}
        <text
          x="160"
          y="92"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="22"
          fontWeight="700"
          fill="#1F2937"
          fontFamily="Arial, sans-serif"
        >
          {petName || "Your Pet"}
        </text>
      </svg>
    </div>
  );
}