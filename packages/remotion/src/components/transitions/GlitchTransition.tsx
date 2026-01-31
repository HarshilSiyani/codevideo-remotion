import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, random } from "remotion";

interface GlitchTransitionProps {
  children: React.ReactNode;
  duration?: number;
}

export const GlitchTransition: React.FC<GlitchTransitionProps> = ({
  children,
  duration = 0.3,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const transitionFrames = duration * fps;
  const isEntering = frame < transitionFrames;
  const isExiting = frame > durationInFrames - transitionFrames;
  const isTransitioning = isEntering || isExiting;

  let opacity = 1;
  let transform = "";
  let filter = "";

  if (isEntering) {
    const progress = frame / transitionFrames;
    opacity = interpolate(frame, [0, transitionFrames], [0, 1]);

    if (random(`glitch-${frame}`) > 0.5) {
      const offsetX = random(`x-${frame}`) * 20 * (1 - progress);
      const skew = random(`skew-${frame}`) * 10 * (1 - progress);
      transform = `translateX(${offsetX}px) skewX(${skew}deg)`;
    }
  }

  if (isExiting) {
    const exitFrame = frame - (durationInFrames - transitionFrames);
    const progress = exitFrame / transitionFrames;
    opacity = interpolate(exitFrame, [0, transitionFrames], [1, 0]);

    if (random(`glitch-exit-${frame}`) > 0.5) {
      const offsetX = random(`x-exit-${frame}`) * 20 * progress;
      const skew = random(`skew-exit-${frame}`) * 10 * progress;
      transform = `translateX(${offsetX}px) skewX(${skew}deg)`;
    }
  }

  if (isTransitioning && random(`rgb-${frame}`) > 0.6) {
    const rgbShift = random(`rgb-amount-${frame}`) * 5;
    filter = `drop-shadow(${rgbShift}px 0 0 rgba(255,0,0,0.5)) drop-shadow(${-rgbShift}px 0 0 rgba(0,0,255,0.5))`;
  }

  return (
    <div style={{ opacity, transform, filter }}>
      {children}
    </div>
  );
};
