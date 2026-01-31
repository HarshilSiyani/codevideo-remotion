import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

interface ZoomTransitionProps {
  children: React.ReactNode;
  duration?: number;
  direction?: "in" | "out";
}

export const ZoomTransition: React.FC<ZoomTransitionProps> = ({
  children,
  duration = 0.5,
  direction = "in",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const transitionFrames = duration * fps;

  let scale = 1;
  let opacity = 1;

  // Entry animation
  if (frame < transitionFrames) {
    const fromScale = direction === "in" ? 0.5 : 1.5;
    scale = interpolate(frame, [0, transitionFrames], [fromScale, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    opacity = interpolate(frame, [0, transitionFrames], [0, 1], {
      extrapolateRight: "clamp",
    });
  }

  // Exit animation
  if (frame > durationInFrames - transitionFrames) {
    const exitFrame = frame - (durationInFrames - transitionFrames);
    const toScale = direction === "in" ? 1.5 : 0.5;
    scale = interpolate(exitFrame, [0, transitionFrames], [1, toScale], {
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    });
    opacity = interpolate(exitFrame, [0, transitionFrames], [1, 0], {
      extrapolateRight: "clamp",
    });
  }

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {children}
    </div>
  );
};
