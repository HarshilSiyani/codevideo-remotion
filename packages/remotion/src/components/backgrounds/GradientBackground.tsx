import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface GradientBackgroundProps {
  colors?: string[];
  animated?: boolean;
  angle?: number;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  colors = ["#667eea", "#764ba2"],
  animated = true,
  angle = 135,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const animatedAngle = animated
    ? interpolate(frame, [0, durationInFrames], [angle, angle + 360], {
        extrapolateRight: "clamp",
      })
    : angle;

  const gradient = `linear-gradient(${animatedAngle}deg, ${colors.join(", ")})`;

  return (
    <AbsoluteFill
      style={{
        background: gradient,
      }}
    />
  );
};
