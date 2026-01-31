import React from "react";
import { AbsoluteFill } from "remotion";

interface SolidBackgroundProps {
  color?: string;
}

export const SolidBackground: React.FC<SolidBackgroundProps> = ({
  color = "#000000",
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
      }}
    />
  );
};
