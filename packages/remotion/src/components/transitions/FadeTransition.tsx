import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface FadeTransitionProps {
  children: React.ReactNode;
  duration?: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  duration = 0.5,
  fadeIn = true,
  fadeOut = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeFrames = duration * fps;

  let opacity = 1;

  if (fadeIn && frame < fadeFrames) {
    opacity = interpolate(frame, [0, fadeFrames], [0, 1], {
      extrapolateRight: "clamp",
    });
  }

  if (fadeOut && frame > durationInFrames - fadeFrames) {
    opacity = interpolate(
      frame,
      [durationInFrames - fadeFrames, durationInFrames],
      [1, 0],
      { extrapolateLeft: "clamp" }
    );
  }

  return <div style={{ opacity }}>{children}</div>;
};
