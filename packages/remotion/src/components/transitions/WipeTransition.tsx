import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

interface WipeTransitionProps {
  children: React.ReactNode;
  duration?: number;
  direction?: "left" | "right" | "up" | "down";
}

export const WipeTransition: React.FC<WipeTransitionProps> = ({
  children,
  duration = 0.5,
  direction = "left",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const transitionFrames = duration * fps;

  let clipPath = "inset(0)";

  // Entry animation
  if (frame < transitionFrames) {
    const progress = interpolate(frame, [0, transitionFrames], [0, 100], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

    switch (direction) {
      case "left":
        clipPath = `inset(0 ${100 - progress}% 0 0)`;
        break;
      case "right":
        clipPath = `inset(0 0 0 ${100 - progress}%)`;
        break;
      case "up":
        clipPath = `inset(0 0 ${100 - progress}% 0)`;
        break;
      case "down":
        clipPath = `inset(${100 - progress}% 0 0 0)`;
        break;
    }
  }

  // Exit animation
  if (frame > durationInFrames - transitionFrames) {
    const exitFrame = frame - (durationInFrames - transitionFrames);
    const progress = interpolate(exitFrame, [0, transitionFrames], [0, 100], {
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    });

    switch (direction) {
      case "left":
        clipPath = `inset(0 0 0 ${progress}%)`;
        break;
      case "right":
        clipPath = `inset(0 ${progress}% 0 0)`;
        break;
      case "up":
        clipPath = `inset(${progress}% 0 0 0)`;
        break;
      case "down":
        clipPath = `inset(0 0 ${progress}% 0)`;
        break;
    }
  }

  return <div style={{ clipPath }}>{children}</div>;
};
