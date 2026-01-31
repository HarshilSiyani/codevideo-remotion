import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";

interface KineticTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  style?: "bounce" | "wave" | "pop" | "slam";
  staggerDelay?: number;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  fontSize = 72,
  color = "#ffffff",
  fontFamily = "system-ui, -apple-system, sans-serif",
  style = "bounce",
  staggerDelay = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: fontSize * 0.3,
      }}
    >
      {words.map((word, wordIndex) => {
        const delay = wordIndex * staggerDelay;
        const localFrame = Math.max(0, frame - delay);

        let transform = "";
        let opacity = 1;

        switch (style) {
          case "bounce": {
            const springValue = spring({
              frame: localFrame,
              fps,
              config: { damping: 8, stiffness: 100 },
            });
            const y = interpolate(springValue, [0, 1], [100, 0]);
            opacity = interpolate(springValue, [0, 0.5], [0, 1], {
              extrapolateRight: "clamp",
            });
            transform = `translateY(${y}px)`;
            break;
          }

          case "wave": {
            const waveOffset = Math.sin((frame / fps) * 4 + wordIndex * 0.5) * 10;
            opacity = interpolate(localFrame, [0, 15], [0, 1], {
              extrapolateRight: "clamp",
            });
            transform = `translateY(${waveOffset}px)`;
            break;
          }

          case "pop": {
            const popSpring = spring({
              frame: localFrame,
              fps,
              config: { damping: 10, stiffness: 200 },
            });
            const scale = interpolate(popSpring, [0, 1], [0, 1]);
            opacity = popSpring;
            transform = `scale(${scale})`;
            break;
          }

          case "slam": {
            const slamProgress = interpolate(localFrame, [0, 10], [0, 1], {
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            const y = interpolate(slamProgress, [0, 1], [-200, 0]);
            const scale = interpolate(slamProgress, [0.8, 1], [1.2, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            opacity = slamProgress;
            transform = `translateY(${y}px) scale(${scale})`;
            break;
          }
        }

        return (
          <span
            key={wordIndex}
            style={{
              fontSize,
              fontFamily,
              fontWeight: 700,
              color,
              opacity,
              transform,
              display: "inline-block",
              textShadow: `0 4px 30px ${color}40`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
