import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, random } from "remotion";

interface GlitchTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  glitchIntensity?: number;
  fontFamily?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  fontSize = 80,
  color = "#ffffff",
  glitchIntensity = 1,
  fontFamily = "system-ui, -apple-system, sans-serif",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const entranceProgress = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Random glitch offsets that change every few frames
  const glitchSeed = Math.floor(frame / 3);
  const offsetX = random(`x-${glitchSeed}`) * 10 * glitchIntensity;
  const offsetY = random(`y-${glitchSeed}`) * 5 * glitchIntensity;
  const skewX = random(`skew-${glitchSeed}`) * 5 * glitchIntensity;

  // Periodic intense glitch
  const isGlitching = random(`glitch-${Math.floor(frame / 10)}`) > 0.7;
  const glitchScale = isGlitching ? 1 + random(`scale-${frame}`) * 0.05 : 1;

  // Chromatic aberration
  const redOffset = isGlitching ? random(`red-${frame}`) * 4 : 0;
  const blueOffset = isGlitching ? random(`blue-${frame}`) * 4 : 0;

  const baseStyle: React.CSSProperties = {
    fontSize,
    fontFamily,
    fontWeight: 700,
    margin: 0,
    textAlign: "center" as const,
    position: "absolute" as const,
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: entranceProgress,
        transform: `scale(${glitchScale}) skewX(${skewX}deg)`,
      }}
    >
      {/* Red layer (chromatic aberration) */}
      <h1
        style={{
          ...baseStyle,
          color: "#ff0000",
          opacity: isGlitching ? 0.8 : 0,
          transform: `translate(${-redOffset}px, 0)`,
          mixBlendMode: "screen",
        }}
      >
        {text}
      </h1>

      {/* Blue layer (chromatic aberration) */}
      <h1
        style={{
          ...baseStyle,
          color: "#0000ff",
          opacity: isGlitching ? 0.8 : 0,
          transform: `translate(${blueOffset}px, 0)`,
          mixBlendMode: "screen",
        }}
      >
        {text}
      </h1>

      {/* Main text */}
      <h1
        style={{
          ...baseStyle,
          color,
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          textShadow: isGlitching
            ? `${redOffset}px 0 #ff0000, ${-blueOffset}px 0 #0000ff`
            : `0 0 20px ${color}60`,
          position: "relative",
        }}
      >
        {text}
      </h1>
    </div>
  );
};
